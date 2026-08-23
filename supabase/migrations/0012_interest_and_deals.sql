-- 0012 — Interest ledger, recorded deals, and the buyer save list.
--
-- Implements step 5 of the migration order in
-- docs/pivot-checklist/25-database-schema-plan.md.
--
-- Safe to re-run.

-- ── interest_entries ─────────────────────────────────────────────────────
-- Covers both the Interest Ledger (12) and the Buyer Intent Card (20) — the
-- intent card is just the form that fills in a ledger entry's detail fields.
create table if not exists public.interest_entries (
  id                       uuid primary key default gen_random_uuid(),
  artwork_id               text references public.artworks(id) on delete cascade,
  -- The artist whose ledger this belongs to. Denormalised from the artwork so
  -- the artist's own rows stay reachable if an artwork is later removed.
  artist_id                uuid not null references public.users(id) on delete cascade,

  -- null = anonymous traffic. See the hard rule at the bottom of this file.
  viewer_id                uuid references public.users(id) on delete set null,
  is_identified            boolean not null default false,

  purpose                  text check (purpose in ('purchase', 'licence', 'exhibit', 'commission', 'collaborate')),
  message                  text,
  organization             text,
  budget_range             text,
  intended_use             text,
  decision_timeline        text,
  identity_sharing_consent boolean not null default false,
  source                   text,

  next_action              text check (next_action in ('reply', 'invite', 'qualify', 'decline', 'block')),
  pipeline_stage           text not null default 'viewer'
                             check (pipeline_stage in
                               ('viewer', 'enquiry', 'qualified', 'viewing_room', 'negotiation', 'completed')),

  created_at               timestamptz not null default now()
);

create index if not exists interest_entries_artist_id_idx on public.interest_entries (artist_id);
create index if not exists interest_entries_artwork_id_idx on public.interest_entries (artwork_id);

-- An identified entry must actually have someone attached to it, and an
-- anonymous one must not. This is the hard rule from 12-interest-ledger.md
-- enforced as a constraint rather than left to the UI.
alter table public.interest_entries drop constraint if exists interest_entries_identity_check;
alter table public.interest_entries add constraint interest_entries_identity_check
  check (
    (is_identified = true  and viewer_id is not null and identity_sharing_consent = true) or
    (is_identified = false and viewer_id is null)
  );

alter table public.interest_entries enable row level security;

-- The artist reads their own ledger. Because anonymous rows carry no
-- viewer_id at all, there is no identity for this policy to leak.
drop policy if exists "Artists read their own interest entries" on public.interest_entries;
create policy "Artists read their own interest entries"
  on public.interest_entries for select
  using (artist_id = public.current_user_id());

drop policy if exists "Artists update their own interest entries" on public.interest_entries;
create policy "Artists update their own interest entries"
  on public.interest_entries for update
  using (artist_id = public.current_user_id())
  with check (artist_id = public.current_user_id());

-- Buyers create entries against someone else's artwork, and may only file
-- them under their own identity.
drop policy if exists "Viewers create their own interest entries" on public.interest_entries;
create policy "Viewers create their own interest entries"
  on public.interest_entries for insert
  to authenticated
  with check (viewer_id = public.current_user_id());

drop policy if exists "Viewers read their own interest entries" on public.interest_entries;
create policy "Viewers read their own interest entries"
  on public.interest_entries for select
  using (viewer_id = public.current_user_id());

-- ── artwork_deals ────────────────────────────────────────────────────────
-- What "recorded earnings" on Today actually reads from. No row means no
-- earnings — never an estimate, never a projection.
create table if not exists public.artwork_deals (
  id                uuid primary key default gen_random_uuid(),
  artwork_id        text references public.artworks(id) on delete set null,
  interest_entry_id uuid references public.interest_entries(id) on delete set null,
  artist_id         uuid not null references public.users(id) on delete cascade,
  buyer_id          uuid references public.users(id) on delete set null,
  deal_type         text not null check (deal_type in ('sale', 'licence', 'commission')),
  amount            numeric not null check (amount >= 0),
  currency          text not null default 'USD',
  agreed_at         timestamptz not null default now()
);

create index if not exists artwork_deals_artist_id_idx on public.artwork_deals (artist_id);

alter table public.artwork_deals enable row level security;

drop policy if exists "Artists read their own deals" on public.artwork_deals;
create policy "Artists read their own deals"
  on public.artwork_deals for select
  using (artist_id = public.current_user_id() or buyer_id = public.current_user_id());

drop policy if exists "Artists record their own deals" on public.artwork_deals;
create policy "Artists record their own deals"
  on public.artwork_deals for insert
  to authenticated
  with check (artist_id = public.current_user_id());

-- ── saved_artworks ───────────────────────────────────────────────────────
create table if not exists public.saved_artworks (
  buyer_user_id uuid not null references public.users(id) on delete cascade,
  artwork_id    text not null references public.artworks(id) on delete cascade,
  saved_at      timestamptz not null default now(),
  primary key (buyer_user_id, artwork_id)
);

alter table public.saved_artworks enable row level security;

drop policy if exists "Buyers manage their own save list" on public.saved_artworks;
create policy "Buyers manage their own save list"
  on public.saved_artworks for all
  using (buyer_user_id = public.current_user_id())
  with check (buyer_user_id = public.current_user_id());
