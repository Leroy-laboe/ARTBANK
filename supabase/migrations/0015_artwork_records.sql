-- 0015 — Passport evidence, the history timeline, and smart-link tracking.
--
-- Implements step 4 of the migration order in
-- docs/pivot-checklist/25-database-schema-plan.md. Ordered last here because
-- nothing on the six built screens reads these yet — they back the artwork
-- record (11) and the smart link (19).
--
-- Safe to re-run.

-- ── artwork_evidence_files ───────────────────────────────────────────────
-- Supporting documents behind a Passport: ownership proof, exhibition
-- history, condition reports.
create table if not exists public.artwork_evidence_files (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  text not null references public.artworks(id) on delete cascade,
  file_url    text not null,
  file_name   text,
  file_type   text,
  uploaded_at timestamptz not null default now()
);

create index if not exists artwork_evidence_files_artwork_id_idx
  on public.artwork_evidence_files (artwork_id);

alter table public.artwork_evidence_files enable row level security;

-- Evidence is private to the artist. It is the basis of a COA review, not
-- something to publish alongside the artwork.
drop policy if exists "Artists manage their own evidence files" on public.artwork_evidence_files;
create policy "Artists manage their own evidence files"
  on public.artwork_evidence_files for all
  using (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  )
  with check (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );

-- ── artwork_history_events ───────────────────────────────────────────────
-- Append-only provenance log behind the artwork record's History tab.
create table if not exists public.artwork_history_events (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  text not null references public.artworks(id) on delete cascade,
  event_type  text not null check (event_type in
                ('upload', 'evidence', 'exhibition', 'enquiry', 'licence', 'sale')),
  description text,
  occurred_at timestamptz not null default now()
);

create index if not exists artwork_history_events_artwork_id_idx
  on public.artwork_history_events (artwork_id, occurred_at);

alter table public.artwork_history_events enable row level security;

drop policy if exists "Artists read their own artwork history" on public.artwork_history_events;
create policy "Artists read their own artwork history"
  on public.artwork_history_events for select
  using (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );

-- Deliberately no update or delete policy: a provenance log that can be
-- rewritten is not provenance.
drop policy if exists "Artists append to their own artwork history" on public.artwork_history_events;
create policy "Artists append to their own artwork history"
  on public.artwork_history_events for insert
  to authenticated
  with check (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );

-- ── artwork_link_visits ──────────────────────────────────────────────────
-- Where a shared artwork link was opened from. viewer_id stays null unless
-- the visitor identifies themselves — the same anonymous/identified split the
-- Interest ledger enforces.
create table if not exists public.artwork_link_visits (
  id         uuid primary key default gen_random_uuid(),
  artwork_id text not null references public.artworks(id) on delete cascade,
  viewer_id  uuid references public.users(id) on delete set null,
  source     text not null default 'direct'
               check (source in ('instagram', 'threads', 'rednote', 'qr', 'direct')),
  visited_at timestamptz not null default now()
);

create index if not exists artwork_link_visits_artwork_id_idx
  on public.artwork_link_visits (artwork_id, visited_at);

alter table public.artwork_link_visits enable row level security;

-- Anyone may record a visit — that is the point of a public share link.
drop policy if exists "Anyone can record a link visit" on public.artwork_link_visits;
create policy "Anyone can record a link visit"
  on public.artwork_link_visits for insert
  with check (true);

-- Only the artist reads them back, and only in aggregate in the UI.
drop policy if exists "Artists read their own link visits" on public.artwork_link_visits;
create policy "Artists read their own link visits"
  on public.artwork_link_visits for select
  using (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );
