-- 0025 — Payment requests, and the two-sided handshake that settles them.
--
-- 0024 gave a deal two routes: `offline` (already settled, just record it) and
-- `gateway` (a card payment ArtBank has no way to take yet). Neither matches
-- how most art actually sells: the artist asks for the money, the buyer sends
-- it by transfer, and the artist confirms it arrived.
--
-- This adds that third route.
--
--     request:  awaiting_payment ──(buyer reports)──► still awaiting
--                                 ──(artist confirms)──► paid
--
-- ⚠️  WHAT IS AND IS NOT BEING RELAXED
--
--     0024's rule was "no client may ever write status = 'paid'". That rule
--     exists because a gateway payment is a claim about a THIRD PARTY's
--     system, and only a verified webhook can make it.
--
--     A `request` deal is different in kind. The money went directly to the
--     artist, and the artist saying "it arrived" is an assertion about their
--     own bank account — exactly the trust level the `offline` route has
--     always had. So the artist may mark a `request` deal paid, and may
--     still never mark a `gateway` one paid. The policy below draws that
--     line explicitly.
--
--     The BUYER may never write to the deal at all. What they can do is file
--     a report (public.payment_reports), which is a claim sitting beside the
--     deal rather than a change to it. "I sent it" and "I received it" are
--     different facts and are stored as different rows.
--
-- Safe to re-run.

-- ── The third route ──────────────────────────────────────────────────────
alter table public.artwork_deals drop constraint if exists artwork_deals_payment_route_check;
alter table public.artwork_deals add constraint artwork_deals_payment_route_check
  check (payment_route in ('offline', 'request', 'gateway'));

-- A request deal starts unpaid and ends paid, like a gateway one — it just
-- gets there by a human confirming rather than a webhook.
alter table public.artwork_deals drop constraint if exists artwork_deals_route_status_check;
alter table public.artwork_deals add constraint artwork_deals_route_status_check
  check (
    (payment_route = 'offline' and status in ('agreed', 'cancelled', 'refunded'))
    or
    (payment_route in ('request', 'gateway')
      and status in ('awaiting_payment', 'paid', 'cancelled', 'refunded'))
  );

-- ── Who may set what ─────────────────────────────────────────────────────
-- Replaces 0024's policy. The only change is the second branch: an artist may
-- land a deal on 'paid' when, and only when, the route is 'request'.
drop policy if exists "Artists update their own deals" on public.artwork_deals;
create policy "Artists update their own deals"
  on public.artwork_deals for update
  to authenticated
  using (artist_id = public.current_user_id())
  with check (
    artist_id = public.current_user_id()
    and (
      status in ('agreed', 'awaiting_payment', 'cancelled')
      or (status = 'paid' and payment_route = 'request')
    )
  );

-- ── payment_reports ──────────────────────────────────────────────────────
-- The buyer's half of the handshake: "I have sent this."
--
-- A separate table rather than a column on artwork_deals, for one reason that
-- matters: RLS grants apply to whole rows, not columns. Letting the buyer
-- update the deal so they could stamp one field would also let them rewrite
-- the amount. A row they own, beside a row they cannot touch, has no such
-- hole.
--
-- It is also honest about what it is. A report is a CLAIM, not a payment. The
-- artist confirming is what settles the deal; until then the interface says
-- "reported", never "paid".
create table if not exists public.payment_reports (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references public.artwork_deals(id) on delete cascade,
  reported_by uuid not null references public.users(id) on delete cascade,

  method      text not null default 'bank_transfer'
                check (method in ('bank_transfer', 'cash', 'other')),
  -- The transfer reference, so the artist can find it on their statement.
  reference   text,
  note        text,

  reported_at timestamptz not null default now()
);

create index if not exists payment_reports_deal_id_idx
  on public.payment_reports (deal_id, reported_at desc);

alter table public.payment_reports enable row level security;

-- Only the buyer on that deal may file one, and only as themselves.
drop policy if exists "Buyers report their own payments" on public.payment_reports;
create policy "Buyers report their own payments"
  on public.payment_reports for insert
  to authenticated
  with check (
    reported_by = public.current_user_id()
    and exists (
      select 1 from public.artwork_deals d
       where d.id = deal_id
         and d.buyer_id = public.current_user_id()
    )
  );

-- Both parties read it: the artist needs the reference to go and look, and
-- the buyer needs to see that their report landed.
drop policy if exists "Parties read payment reports" on public.payment_reports;
create policy "Parties read payment reports"
  on public.payment_reports for select
  to authenticated
  using (
    exists (
      select 1 from public.artwork_deals d
       where d.id = deal_id
         and (d.artist_id = public.current_user_id() or d.buyer_id = public.current_user_id())
    )
  );

-- Deliberately no update or delete policy. A report is a statement someone
-- made at a point in time; if it was wrong, the answer is another report or a
-- message, not quietly editing the first one.

comment on table public.payment_reports is
  'The buyer''s claim that they have sent payment for a deal. A claim, not a payment — only the artist marking the deal paid settles it. Insert-only, buyer-only; both parties can read.';
