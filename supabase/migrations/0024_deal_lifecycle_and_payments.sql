-- 0024 — The deal lifecycle, and somewhere a payment can live.
--
-- 0012 modelled a deal as a single immutable fact: "this much was agreed, on
-- this date". That is the right shape for a sale settled between two people
-- offline, and it is the only shape the brief needed while payments were
-- deferred ("LATER — Full payment system", 17-do-not-build-guardrails.md).
--
-- It cannot hold a payment. A gateway needs a thing that MOVES:
--
--     offline:  agreed ─────────────────────────► (done)
--     gateway:  awaiting_payment ──► paid ──► (done)
--                     └──► cancelled    └──► refunded
--
-- ⚠️  THE SECURITY POINT OF THIS MIGRATION
--
--     No client may ever write status = 'paid'.
--
--     A browser can start a checkout; it cannot be trusted to say the money
--     arrived. Anyone holding the anon key could otherwise mark their own
--     order paid. Confirmation comes from one place only: a server that has
--     verified the provider's webhook signature, using the service-role key,
--     which bypasses RLS. The update policy below enforces that, and
--     public.payments has no write policy at all for the same reason.
--
-- Safe to re-run.

-- ── Lifecycle ────────────────────────────────────────────────────────────
alter table public.artwork_deals
  add column if not exists status text not null default 'agreed';

alter table public.artwork_deals drop constraint if exists artwork_deals_status_check;
alter table public.artwork_deals add constraint artwork_deals_status_check
  check (status in ('agreed', 'awaiting_payment', 'paid', 'cancelled', 'refunded'));

-- How the money moves. Kept separate from status because "paid in cash" and
-- "paid through Stripe" are the same outcome by different routes, and the
-- offline route must stay first-class — most art still sells that way.
alter table public.artwork_deals
  add column if not exists payment_route text not null default 'offline';

alter table public.artwork_deals drop constraint if exists artwork_deals_payment_route_check;
alter table public.artwork_deals add constraint artwork_deals_payment_route_check
  check (payment_route in ('offline', 'gateway'));

-- The two routes have genuinely different vocabularies, and mixing them is
-- how a deal ends up claiming to be both settled offline and awaiting a
-- card. An offline deal is agreed the moment it is recorded; a gateway deal
-- is never born already paid.
alter table public.artwork_deals drop constraint if exists artwork_deals_route_status_check;
alter table public.artwork_deals add constraint artwork_deals_route_status_check
  check (
    (payment_route = 'offline' and status in ('agreed', 'cancelled', 'refunded'))
    or
    (payment_route = 'gateway' and status in ('awaiting_payment', 'paid', 'cancelled', 'refunded'))
  );

-- When the money actually landed. Null until it does — and, like `status`,
-- only ever written by the server.
alter table public.artwork_deals add column if not exists settled_at timestamptz;

comment on column public.artwork_deals.status is
  'Lifecycle. Only ''agreed'' and ''paid'' count as earnings — see the earnings note in src/services/artwork.ts. No client may write ''paid'' or ''refunded''; those come from a verified webhook via the service-role key.';

create index if not exists artwork_deals_status_idx on public.artwork_deals (artist_id, status);
create index if not exists artwork_deals_buyer_idx on public.artwork_deals (buyer_id, agreed_at desc);

-- ── Who may change a deal ────────────────────────────────────────────────
-- 0012 gave this table no update policy at all, so nothing could edit a deal
-- once recorded. That was safe but too tight: an artist needs to be able to
-- cancel one they entered by mistake, or move an offline deal onto a gateway.
--
-- The WITH CHECK is the whole point. It constrains the row AFTER the update,
-- so an artist may move a deal between the states they legitimately control
-- and can never land it on 'paid' or 'refunded'.
drop policy if exists "Artists update their own deals" on public.artwork_deals;
create policy "Artists update their own deals"
  on public.artwork_deals for update
  to authenticated
  using (artist_id = public.current_user_id())
  with check (
    artist_id = public.current_user_id()
    and status in ('agreed', 'awaiting_payment', 'cancelled')
  );

-- ── payments ─────────────────────────────────────────────────────────────
-- One row per attempt at the gateway, not one per deal: a card is declined,
-- retried, and later refunded, and each of those is a separate event the
-- provider will tell us about.
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  deal_id             uuid not null references public.artwork_deals(id) on delete cascade,

  provider            text not null,
  -- The provider's own id for this attempt (a Stripe PaymentIntent, say).
  -- Null only for the brief moment between creating the row and the provider
  -- answering.
  provider_payment_id text,

  amount              numeric not null check (amount >= 0),
  currency            text not null,

  status              text not null default 'pending'
                        check (status in ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  failure_reason      text,

  created_at          timestamptz not null default now(),
  confirmed_at        timestamptz
);

create index if not exists payments_deal_id_idx on public.payments (deal_id, created_at desc);

-- Webhook idempotency, enforced by the database rather than by remembering to
-- check. Providers retry deliveries, and a retry must not become a second
-- payment row — the insert simply conflicts.
create unique index if not exists payments_provider_ref_key
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;

alter table public.payments enable row level security;

-- Read only, and only your own. There is deliberately NO insert, update or
-- delete policy: a payment record is the server's account of what the
-- provider said. A client that could write one could claim to have paid.
drop policy if exists "Parties read payments on their own deals" on public.payments;
create policy "Parties read payments on their own deals"
  on public.payments for select
  to authenticated
  using (
    exists (
      select 1 from public.artwork_deals d
       where d.id = deal_id
         and (d.artist_id = public.current_user_id() or d.buyer_id = public.current_user_id())
    )
  );

comment on table public.payments is
  'Gateway attempts against a deal. Written ONLY by the API using the service-role key, after verifying a provider webhook signature. RLS grants read to the two parties and nothing else.';

-- ── Existing rows ────────────────────────────────────────────────────────
-- Everything recorded before this migration was an offline agreement, which
-- is exactly what the defaults say, so no backfill is needed. Stated rather
-- than left to be inferred.
