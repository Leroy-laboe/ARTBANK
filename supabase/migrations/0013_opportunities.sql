-- 0013 — Opportunities, personalised matches, and applications.
--
-- Implements step 6 of the migration order in
-- docs/pivot-checklist/25-database-schema-plan.md.
--
-- Safe to re-run.

create table if not exists public.opportunities (
  id                 uuid primary key default gen_random_uuid(),
  title              text not null,
  organizer_name     text,
  organizer_verified boolean not null default false,
  location           text,
  summary            text,
  category           text,
  medium             text,
  deadline           date,
  budget_min         numeric,
  budget_max         numeric,
  budget_currency    text not null default 'USD',
  fee_amount         numeric,
  fee_currency       text not null default 'USD',
  is_published       boolean not null default true,
  created_at         timestamptz not null default now()
);

alter table public.opportunities enable row level security;

drop policy if exists "Published opportunities are readable" on public.opportunities;
create policy "Published opportunities are readable"
  on public.opportunities for select
  using (is_published = true);

-- ── opportunity_matches ──────────────────────────────────────────────────
-- The brief forbids unexplained recommendations, so `why_text` is NOT NULL:
-- a match that can't say why it matched has no business being shown.
create table if not exists public.opportunity_matches (
  opportunity_id       uuid not null references public.opportunities(id) on delete cascade,
  artist_id            uuid not null references public.users(id) on delete cascade,
  match_strength       text not null check (match_strength in ('strong', 'good', 'partial', 'weak')),
  match_score          integer check (match_score between 0 and 100),
  why_text             text not null,
  missing_requirements text[] not null default '{}',
  created_at           timestamptz not null default now(),
  primary key (opportunity_id, artist_id)
);

create index if not exists opportunity_matches_artist_id_idx on public.opportunity_matches (artist_id);

alter table public.opportunity_matches enable row level security;

drop policy if exists "Artists read their own matches" on public.opportunity_matches;
create policy "Artists read their own matches"
  on public.opportunity_matches for select
  using (artist_id = public.current_user_id());

-- ── opportunity_applications ─────────────────────────────────────────────
create table if not exists public.opportunity_applications (
  id             uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  artist_id      uuid not null references public.users(id) on delete cascade,
  status         text not null default 'draft' check (status in ('draft', 'submitted', 'withdrawn')),
  -- The artist themselves, or their guardian if they are a minor.
  approved_by    uuid references public.users(id),
  submitted_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (opportunity_id, artist_id)
);

create index if not exists opportunity_applications_artist_id_idx
  on public.opportunity_applications (artist_id);

-- HARD RULE (14-opportunities.md): nothing auto-submits on the artist's
-- behalf. A row can only reach 'submitted' with a human approver and a
-- timestamp attached, so an accidental bulk update can't quietly apply for
-- someone.
alter table public.opportunity_applications drop constraint if exists opportunity_applications_submit_check;
alter table public.opportunity_applications add constraint opportunity_applications_submit_check
  check (
    status <> 'submitted'
    or (approved_by is not null and submitted_at is not null)
  );

alter table public.opportunity_applications enable row level security;

drop policy if exists "Artists manage their own applications" on public.opportunity_applications;
create policy "Artists manage their own applications"
  on public.opportunity_applications for all
  using (artist_id = public.current_user_id())
  with check (artist_id = public.current_user_id());

-- A guardian can act on their minor's applications — this is what makes
-- "artist or guardian approves every submission" true for minors.
drop policy if exists "Guardians manage their minor's applications" on public.opportunity_applications;
create policy "Guardians manage their minor's applications"
  on public.opportunity_applications for all
  using (
    exists (
      select 1 from public.guardian_links g
       where g.minor_user_id = artist_id
         and g.guardian_user_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.guardian_links g
       where g.minor_user_id = artist_id
         and g.guardian_user_id = public.current_user_id()
    )
  );
