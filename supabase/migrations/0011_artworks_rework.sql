-- 0011 — Rework `artworks` for the pivot, and add `artwork_images`.
--
-- Implements step 2–3 of the migration order in
-- docs/pivot-checklist/25-database-schema-plan.md.
--
-- The table was built for a public marketplace with prices, likes and an
-- unexplained "verified" badge. All three are on the do-not-build list
-- (17-do-not-build-guardrails.md), so they come out here.
--
-- Safe to re-run.

-- ── Helper: the caller's public.users row ────────────────────────────────
-- auth.uid() is the Supabase auth id, which is NOT public.users.id — the two
-- are joined by users.auth_user_id. Every policy below needs that hop, so it
-- lives in one place rather than being repeated as a subquery.
create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid()
$$;

comment on function public.current_user_id() is
  'The public.users.id for the currently authenticated Supabase user, or null.';

-- ── Ownership ────────────────────────────────────────────────────────────
alter table public.artworks add column if not exists artist_id uuid references public.users(id);
alter table public.artworks add column if not exists uploaded_by uuid references public.users(id);
alter table public.artworks add column if not exists artist_display_name text;

-- Keep the entrant's name before the free-text column goes away. Admin-run
-- competition uploads have no account to point `artist_id` at, so the name is
-- all we have — see decision 3 in the schema plan.
update public.artworks
   set artist_display_name = artist
 where artist_display_name is null
   and artist is not null;

alter table public.artworks alter column artist drop not null;

-- `uploaded_by` is left nullable on purpose. The plan calls for NOT NULL, but
-- the ~50 existing finalist rows have no uploader and there is no admin
-- account yet to attribute them to. Tighten this once that backfill is done.

-- ── Columns the brief deletes ────────────────────────────────────────────
-- Price is never set upfront; agreed terms are recorded in artwork_deals
-- (0012) once a negotiation actually closes.
alter table public.artworks drop column if exists price;
alter table public.artworks drop column if exists currency;
alter table public.artworks drop column if exists likes;
alter table public.artworks drop column if exists verified;
alter table public.artworks drop column if exists gradient;

-- ── Record fields (10-add-artwork.md) ────────────────────────────────────
alter table public.artworks add column if not exists year integer;
alter table public.artworks add column if not exists medium text;
alter table public.artworks add column if not exists dimensions text;
alter table public.artworks add column if not exists description text;
alter table public.artworks add column if not exists ownership_statement text;
alter table public.artworks add column if not exists rights_info text;

alter table public.artworks add column if not exists availability text not null default 'available';
alter table public.artworks drop constraint if exists artworks_availability_check;
alter table public.artworks add constraint artworks_availability_check
  check (availability in ('available', 'reserved', 'sold', 'licensing_available'));

-- A paid certificate issued only after evidence review — never automatic.
alter table public.artworks add column if not exists coa_status text not null default 'not_requested';
alter table public.artworks drop constraint if exists artworks_coa_status_check;
alter table public.artworks add constraint artworks_coa_status_check
  check (coa_status in ('not_requested', 'pending_review', 'issued'));

-- Permanent shareable URL for the Smart Artwork Link / QR.
alter table public.artworks add column if not exists smart_link_slug text;
create unique index if not exists artworks_smart_link_slug_key
  on public.artworks (smart_link_slug) where smart_link_slug is not null;

update public.artworks set smart_link_slug = id where smart_link_slug is null;

alter table public.artworks add column if not exists updated_at timestamptz not null default now();

-- ── Status: drop 'pending', add 'archived' ───────────────────────────────
update public.artworks set status = 'draft' where status = 'pending';
alter table public.artworks drop constraint if exists artworks_status_check;
alter table public.artworks add constraint artworks_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists artworks_artist_id_idx on public.artworks (artist_id);
create index if not exists artworks_status_idx on public.artworks (status);

-- ── artwork_images ───────────────────────────────────────────────────────
-- "Upload artwork images", plural — one column can't hold a gallery.
create table if not exists public.artwork_images (
  id          uuid primary key default gen_random_uuid(),
  artwork_id  text not null references public.artworks(id) on delete cascade,
  url         text not null,
  position    integer not null default 0,
  is_primary  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists artwork_images_artwork_id_idx on public.artwork_images (artwork_id);

-- Backfill from the single-image column.
insert into public.artwork_images (artwork_id, url, position, is_primary)
select a.id, a.image_url, 0, true
  from public.artworks a
 where a.image_url is not null
   and not exists (select 1 from public.artwork_images i where i.artwork_id = a.id);

-- NOTE: `artworks.image_url` is deliberately kept for now, even though the
-- plan drops it. src/data/artworksRepo.ts still selects it, and dropping it in
-- the same step would break the homepage marketplace preview the moment this
-- runs. Expand now, contract in a later migration once nothing reads it.
comment on column public.artworks.image_url is
  'DEPRECATED — superseded by public.artwork_images. Kept until readers migrate.';

-- ── Row level security ───────────────────────────────────────────────────
-- Everything before this migration was read-only: there was no insert or
-- update policy on any table, so nothing could ever be saved.
alter table public.artwork_images enable row level security;

drop policy if exists "Artists manage their own artworks" on public.artworks;
create policy "Artists manage their own artworks"
  on public.artworks for all
  using (artist_id = public.current_user_id() or uploaded_by = public.current_user_id())
  with check (artist_id = public.current_user_id() or uploaded_by = public.current_user_id());

drop policy if exists "Public read access on published artwork images" on public.artwork_images;
create policy "Public read access on published artwork images"
  on public.artwork_images for select
  using (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id and a.status = 'published'
    )
  );

drop policy if exists "Artists manage their own artwork images" on public.artwork_images;
create policy "Artists manage their own artwork images"
  on public.artwork_images for all
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

-- Artists need to write image files, not just rows.
drop policy if exists "Authenticated users can upload artwork images" on storage.objects;
create policy "Authenticated users can upload artwork images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'artwork-images');

drop policy if exists "Owners can update their artwork images" on storage.objects;
create policy "Owners can update their artwork images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'artwork-images' and owner = auth.uid());

drop policy if exists "Owners can delete their artwork images" on storage.objects;
create policy "Owners can delete their artwork images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'artwork-images' and owner = auth.uid());
