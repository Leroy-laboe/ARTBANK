-- ─────────────────────────────────────────────────────────────────────────
-- RUN THIS in the Supabase SQL editor.
--
-- A convenience concatenation of migrations 0017 → 0023. Every one is written
-- to be safe to re-run, so running this whole file again later is harmless —
-- if you already applied some of these, just run it again to pick up the rest.
--
-- Paste it on its own. Postgres runs the SQL editor's contents as a single
-- transaction, so one stray line anywhere rolls back everything.
--
-- Regenerate with:
--   cat supabase/migrations/00{17,18,19,20,21,22,23}_*.sql > supabase/run-pending.sql
-- ─────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════
-- 0017_add_artwork_fields.sql
-- ══════════════════════════════════════════════════════════════════

-- 0017 — Fields the Add Artwork form collects that the table didn't have.
--
-- Backs step 1 (Details) of docs/pivot-checklist/10-add-artwork.md. Nothing
-- here is auto-populated: the brief deletes AI-generated facts outright, so
-- every column is filled only by something the artist typed or chose.
--
-- Safe to re-run.

-- ── Classification ───────────────────────────────────────────────────────
alter table public.artworks add column if not exists category text;
alter table public.artworks add column if not exists tags text[] not null default '{}';
alter table public.artworks add column if not exists materials text[] not null default '{}';
alter table public.artworks add column if not exists collection text;

-- Original · Limited Edition · Open Edition. Edition size only means anything
-- for the latter two, so it stays nullable rather than defaulting to 1.
alter table public.artworks add column if not exists artwork_type text not null default 'original';
alter table public.artworks drop constraint if exists artworks_artwork_type_check;
alter table public.artworks add constraint artworks_artwork_type_check
  check (artwork_type in ('original', 'limited_edition', 'open_edition'));

alter table public.artworks add column if not exists edition_size integer;

-- ── Structured dimensions ────────────────────────────────────────────────
-- `dimensions` stays as the display string ("80 × 60 cm") because that is what
-- every screen shows. These carry the numbers so the values can be filtered
-- and converted later without re-parsing text.
alter table public.artworks add column if not exists height numeric;
alter table public.artworks add column if not exists width numeric;
alter table public.artworks add column if not exists depth numeric;
alter table public.artworks add column if not exists dimension_unit text not null default 'cm';
alter table public.artworks drop constraint if exists artworks_dimension_unit_check;
alter table public.artworks add constraint artworks_dimension_unit_check
  check (dimension_unit in ('cm', 'in'));

-- ── Provenance and authenticity ──────────────────────────────────────────
alter table public.artworks add column if not exists creation_location text;
alter table public.artworks add column if not exists date_created date;
alter table public.artworks add column if not exists is_signed boolean not null default false;

-- The artist stating they will supply a certificate. Distinct from
-- `coa_status`, which is where the review of that evidence has actually got
-- to — an intention is not a verification.
alter table public.artworks add column if not exists coa_promised boolean not null default false;

-- ── Ownership ────────────────────────────────────────────────────────────
-- The brief requires the record to state plainly that adding an artwork does
-- not transfer ownership, and says to have the wording checked rather than
-- improvised. Stored per-artwork so the text in force when a record was
-- created stays attached to it even if the standard wording changes later.
comment on column public.artworks.ownership_statement is
  'Artist-confirmed ownership declaration captured at creation. Adding a record never transfers ownership — see docs/pivot-checklist/10-add-artwork.md.';

-- ── Visibility (step 8 of the spec) ──────────────────────────────────────
-- Separate from `status`. Status is how finished the record is; visibility is
-- who may see it. Public/Private/Unlisted, per the spec's step 8.
alter table public.artworks add column if not exists visibility text not null default 'private';
alter table public.artworks drop constraint if exists artworks_visibility_check;
alter table public.artworks add constraint artworks_visibility_check
  check (visibility in ('public', 'private', 'unlisted'));

-- Existing published rows were public by definition.
update public.artworks set visibility = 'public' where status = 'published' and visibility = 'private';

create index if not exists artworks_category_idx on public.artworks (category);

-- ══════════════════════════════════════════════════════════════════
-- 0018_artwork_image_metadata.sql
-- ══════════════════════════════════════════════════════════════════

-- 0018 — Metadata the Add Artwork image step records for each file.
--
-- Backs step 2 (Images) of docs/pivot-checklist/10-add-artwork.md.
--
-- Safe to re-run.

-- What the image shows. The first upload defaults to the cover; the rest are
-- labelled by the artist so a buyer can tell a detail shot from the front.
alter table public.artwork_images add column if not exists role text not null default 'detail';
alter table public.artwork_images drop constraint if exists artwork_images_role_check;
alter table public.artwork_images add constraint artwork_images_role_check
  check (role in ('cover', 'front', 'back', 'side', 'detail', 'framed', 'in_situ', 'signature'));

-- Kept so the artist recognises their own files in the list, and so an
-- orphaned storage object can be traced back to its row.
alter table public.artwork_images add column if not exists file_name text;
alter table public.artwork_images add column if not exists file_size bigint;

-- The object path inside the storage bucket. `url` is the public URL, which
-- is what gets rendered; this is what has to be removed on delete.
alter table public.artwork_images add column if not exists storage_path text;

create index if not exists artwork_images_position_idx
  on public.artwork_images (artwork_id, position);

-- Existing rows were mirrored from artworks.image_url and are the cover.
update public.artwork_images set role = 'cover' where is_primary and role = 'detail';

-- ══════════════════════════════════════════════════════════════════
-- 0019_pricing_and_shipping.sql
-- ══════════════════════════════════════════════════════════════════

-- 0019 — Pricing, availability and shipping for the Add Artwork flow.
--
-- ⚠️  DELIBERATE REVERSAL, made on the project owner's instruction.
--
-- Migration 0011 dropped `price` and `currency` because the pivot brief said
-- price is never set upfront and is negotiated inside the discussion flow
-- (see decision 4 in docs/pivot-checklist/25-database-schema-plan.md, and the
-- guardrails in 17-do-not-build-guardrails.md). The Add Artwork design for
-- step 3 asks for a full pricing screen — fixed price, price range, compare-at
-- price — so those columns come back here.
--
-- Nothing about the negotiated route is removed: `artwork_deals` is still what
-- "recorded earnings" reads from, and a listed price is not an earning. If the
-- brief's position is restored later, drop the price columns and keep the
-- shipping ones, which were never in dispute.
--
-- Safe to re-run.

-- ── Pricing ──────────────────────────────────────────────────────────────
alter table public.artworks add column if not exists price_type text not null default 'on_request';
alter table public.artworks drop constraint if exists artworks_price_type_check;
alter table public.artworks add constraint artworks_price_type_check
  check (price_type in ('fixed', 'range', 'on_request'));

alter table public.artworks add column if not exists price numeric;
alter table public.artworks add column if not exists price_max numeric;
alter table public.artworks add column if not exists compare_at_price numeric;
alter table public.artworks add column if not exists currency text not null default 'USD';

-- A price of zero is almost always a mistake rather than a gift.
alter table public.artworks drop constraint if exists artworks_price_positive_check;
alter table public.artworks add constraint artworks_price_positive_check
  check (
    (price is null or price > 0)
    and (price_max is null or price_max > 0)
    and (compare_at_price is null or compare_at_price > 0)
  );

-- A range needs both ends, and the top must be above the bottom.
alter table public.artworks drop constraint if exists artworks_price_range_check;
alter table public.artworks add constraint artworks_price_range_check
  check (price_type <> 'range' or (price is not null and price_max is not null and price_max >= price));

-- A fixed price needs a number to be fixed at.
alter table public.artworks drop constraint if exists artworks_fixed_price_check;
alter table public.artworks add constraint artworks_fixed_price_check
  check (price_type <> 'fixed' or price is not null);

-- ── Shipping and availability ────────────────────────────────────────────
alter table public.artworks add column if not exists ships_from text;
alter table public.artworks add column if not exists ready_to_ship_in text;
alter table public.artworks add column if not exists shipping_regions text[] not null default '{}';
alter table public.artworks add column if not exists allow_international_shipping boolean not null default true;

-- ── Listing options ──────────────────────────────────────────────────────
-- Separate from `coa_promised` on the record: that is the artist saying they
-- hold a certificate, this is the buyer receiving one with the work.
alter table public.artworks add column if not exists includes_coa boolean not null default false;

alter table public.artworks add column if not exists is_physical boolean not null default true;
alter table public.artworks add column if not exists allow_layaway boolean not null default false;

create index if not exists artworks_price_type_idx on public.artworks (price_type);

-- ══════════════════════════════════════════════════════════════════
-- 0020_documents_rights_publish.sql
-- ══════════════════════════════════════════════════════════════════

-- 0020 — Evidence documents, rights and permitted uses, and publishing.
--
-- Completes docs/pivot-checklist/10-add-artwork.md. Steps 1–5 of the spec's
-- nine were already covered by 0011/0017/0019; this backs the remaining four:
--
--   6. Rights and permitted uses   → artworks.permitted_uses / rights_note
--   7. Evidence and supporting files → artwork_evidence_files (extended below)
--   8. Visibility                  → artworks.visibility (added in 0017)
--   9. Review and publish          → artworks.published_at
--
-- Safe to re-run.

-- ── Rights and permitted uses ────────────────────────────────────────────
-- Permission-first: the default is an empty array, meaning nothing beyond
-- showing the record is permitted. A use only becomes allowed because the
-- artist ticked it, never because a default was left alone.
alter table public.artworks add column if not exists permitted_uses text[] not null default '{}';
alter table public.artworks add column if not exists rights_note text;

comment on column public.artworks.permitted_uses is
  'Uses the artist has explicitly allowed. Empty means no use is permitted beyond displaying the record — never treat an empty array as "anything goes".';

-- ── Publishing ───────────────────────────────────────────────────────────
-- Null until the artist publishes. Nothing sets this on their behalf: the
-- brief bans auto-submission and auto-publication alike.
alter table public.artworks add column if not exists published_at timestamptz;

-- ── Evidence files ───────────────────────────────────────────────────────
-- 0015 created the table with just a url and a name. Add what the Documents
-- step actually collects.
alter table public.artwork_evidence_files add column if not exists document_type text not null default 'other';
alter table public.artwork_evidence_files drop constraint if exists artwork_evidence_files_document_type_check;
alter table public.artwork_evidence_files add constraint artwork_evidence_files_document_type_check
  check (document_type in
    ('ownership', 'certificate', 'exhibition', 'condition', 'invoice', 'appraisal', 'other'));

-- storage_path is what lets a delete remove the file as well as the row.
alter table public.artwork_evidence_files add column if not exists storage_path text;
alter table public.artwork_evidence_files add column if not exists file_size bigint;

-- ── Storage: a private bucket ────────────────────────────────────────────
-- Deliberately not public, unlike artwork-images. These documents are the
-- basis of a COA review — ownership proof, invoices, appraisals — and 0015's
-- RLS already says they are private to the artist. A public bucket would make
-- that policy decorative, since anyone with the URL could read the file.
insert into storage.buckets (id, name, public)
values ('artwork-documents', 'artwork-documents', false)
on conflict (id) do nothing;

-- Files are stored under {artwork_id}/..., so ownership of the first path
-- segment is what grants access.
drop policy if exists "Artists manage their own artwork documents" on storage.objects;
create policy "Artists manage their own artwork documents"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'artwork-documents'
    and exists (
      select 1 from public.artworks a
       where a.id = (storage.foldername(name))[1]
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  )
  with check (
    bucket_id = 'artwork-documents'
    and exists (
      select 1 from public.artworks a
       where a.id = (storage.foldername(name))[1]
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );

-- ── History ──────────────────────────────────────────────────────────────
-- Publishing is a provenance event, so the timeline needs a type for it.
alter table public.artwork_history_events drop constraint if exists artwork_history_events_event_type_check;
alter table public.artwork_history_events add constraint artwork_history_events_event_type_check
  check (event_type in
    ('upload', 'evidence', 'exhibition', 'enquiry', 'licence', 'sale', 'publish'));

-- ══════════════════════════════════════════════════════════════════
-- 0021_profile_fields.sql
-- ══════════════════════════════════════════════════════════════════

-- 0021 — The columns the profile editor collects.
--
-- Backs docs/pivot-checklist/16-public-profile-access.md. The editor asked for
-- an artist name, website, bio, nationality, statement, mediums, education,
-- awards, social links and visibility settings; public.users had none of them,
-- so most of that screen had nowhere to save to and quietly discarded what was
-- typed into it.
--
-- Safe to re-run.

-- ── Identity and presentation ────────────────────────────────────────────
-- Distinct from display_name: an artist may exhibit under a name that isn't
-- the one on their account.
alter table public.users add column if not exists artist_name text;
alter table public.users add column if not exists nationality text;
alter table public.users add column if not exists website text;

-- Separate from `email`, which is the account address and never public. This
-- is the address the artist chooses to publish, if any.
alter table public.users add column if not exists public_email text;

alter table public.users add column if not exists short_bio text;
alter table public.users add column if not exists artist_statement text;
alter table public.users add column if not exists cover_url text;

comment on column public.users.public_email is
  'Address the artist chose to show publicly. Never assume users.email may be displayed — that is the account address.';

-- ── Credentials ──────────────────────────────────────────────────────────
alter table public.users add column if not exists mediums text[] not null default '{}';
alter table public.users add column if not exists years_active text;
alter table public.users add column if not exists education text;
alter table public.users add column if not exists awards text;

-- ── Social links ─────────────────────────────────────────────────────────
-- One jsonb rather than a column per network: the set grows (the brief names
-- Instagram, Threads and RedNote for source tracking alone), and none of it is
-- ever queried — it is presentation only.
alter table public.users add column if not exists social_links jsonb not null default '{}'::jsonb;

comment on column public.users.social_links is
  'Presentation only, shape {platform_id: url}. Spec 16 orders the public profile Contact first, Follow second, social links third — these are the third rank.';

-- ── The public handle ────────────────────────────────────────────────────
-- What /artists/{handle} resolves to. Unique, but nullable so an account
-- without one is simply not reachable by a public URL yet.
alter table public.users add column if not exists profile_handle text;

create unique index if not exists users_profile_handle_key
  on public.users (lower(profile_handle))
  where profile_handle is not null;

-- ── Visibility ───────────────────────────────────────────────────────────
alter table public.users add column if not exists profile_visibility text not null default 'public';
alter table public.users drop constraint if exists users_profile_visibility_check;
alter table public.users add constraint users_profile_visibility_check
  check (profile_visibility in ('public', 'members', 'private'));

-- Publishing a contact address is opt-in, like every other disclosure in this
-- system. Enquiries default on because reaching the artist is the point of the
-- platform, and they arrive through ARTBANK rather than exposing an address.
alter table public.users add column if not exists show_contact_information boolean not null default false;
alter table public.users add column if not exists allow_enquiries boolean not null default true;
alter table public.users add column if not exists show_artwork_prices boolean not null default false;

-- ── Featured artworks ────────────────────────────────────────────────────
-- Position rather than a boolean, so the artist controls the order. null means
-- not featured.
alter table public.artworks add column if not exists featured_position integer;

create index if not exists artworks_featured_idx
  on public.artworks (artist_id, featured_position)
  where featured_position is not null;

-- ── Reading someone else's public profile ────────────────────────────────
-- 0008 let a user read only their own row. A public profile nobody else can
-- read is not public, so allow reading the rows that opted into it.
--
-- This is a row-level grant: it exposes the whole row to anyone. The columns
-- above are all artist-authored public presentation, but `email`, `role` and
-- `is_minor` are not — so the public profile page must select only the public
-- columns explicitly, and the app does. Tightening this to column-level grants
-- is the follow-up if this table ever gains something more sensitive.
drop policy if exists "Anyone can read public profiles" on public.users;
create policy "Anyone can read public profiles"
  on public.users for select
  using (profile_visibility = 'public');

-- ── Storage: profile images ──────────────────────────────────────────────
-- Public, like artwork-images: an avatar that only its owner can load is not
-- an avatar. Writes are scoped to the owner's own folder, {user_id}/...
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access on profile-images" on storage.objects;
create policy "Public read access on profile-images"
  on storage.objects for select
  using (bucket_id = 'profile-images');

drop policy if exists "Users manage their own profile images" on storage.objects;
create policy "Users manage their own profile images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  );

-- ── Following an artist ──────────────────────────────────────────────────
-- Spec 16 orders the public profile Contact first, Follow second. There was
-- no table behind "Follow" anywhere — the Interest ledger's Followers tab is
-- still reading a demo array, and this is what will replace it.
--
-- Following is an identified act by design: there is no anonymous follow, so
-- an artist always knows who is on this list.
create table if not exists public.profile_follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  artist_id   uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, artist_id),
  -- Following yourself is not a thing.
  constraint profile_follows_not_self check (follower_id <> artist_id)
);

create index if not exists profile_follows_artist_idx
  on public.profile_follows (artist_id, created_at);

alter table public.profile_follows enable row level security;

drop policy if exists "Users manage their own follows" on public.profile_follows;
create policy "Users manage their own follows"
  on public.profile_follows for all
  to authenticated
  using (follower_id = public.current_user_id())
  with check (follower_id = public.current_user_id());

-- The artist sees who follows them. Read-only: they cannot remove a follower
-- through this policy, only the follower can unfollow.
drop policy if exists "Artists read their own followers" on public.profile_follows;
create policy "Artists read their own followers"
  on public.profile_follows for select
  to authenticated
  using (artist_id = public.current_user_id());

-- ══════════════════════════════════════════════════════════════════
-- 0022_country_code.sql
-- ══════════════════════════════════════════════════════════════════

-- 0022 — A real country code behind the flag on public profiles.
--
-- users.country has always been free text (the "Location" field took
-- anything typed, e.g. "Kuala Lumpur, Malaysia"), so nothing could reliably
-- show a flag next to it — a flag needs a known ISO code, not a guess parsed
-- out of a sentence. This adds that code, set only when the artist picks a
-- country from a real list (src/data/countries.ts) in Profile Details.
--
-- Safe to re-run.

alter table public.users add column if not exists country_code text;

-- ISO 3166-1 alpha-2, lowercase to match flagcdn.com's URL convention
-- directly with no case conversion at render time.
alter table public.users drop constraint if exists users_country_code_check;
alter table public.users add constraint users_country_code_check
  check (country_code is null or country_code ~ '^[a-z]{2}$');

-- ══════════════════════════════════════════════════════════════════
-- 0023_buyer_workspace.sql
-- ══════════════════════════════════════════════════════════════════

-- 0023 — What the buyer workspace needs the database to guarantee.
--
-- The buyer side (/collect) is the first surface that reads *other people's*
-- artworks in bulk, so the read rule that has been decorative until now
-- suddenly matters. Everything else the workspace uses already exists:
-- saved_artworks and interest_entries (0012), conversations and messages
-- (0014), public profiles (0021).
--
-- Safe to re-run.

-- ── Published no longer means visible ────────────────────────────────────
-- 0002 wrote "Public read access on published artworks" when `status` was the
-- only thing gating a row. 0017 then added `visibility` — "status is how
-- finished the record is; visibility is who may see it" — but left the policy
-- alone, so an artist who publishes a record and later sets it back to
-- Private (setArtworkVisibility in src/services/artwork.ts lets them, and
-- does not touch status) still has that row readable by anyone with the anon
-- key. The Discover feed filters on visibility in its query; that filter is
-- app-level and an artwork fetched by id would bypass it.
--
-- `unlisted` stays readable on purpose: that is the whole point of the Smart
-- Artwork Link (docs/pivot-checklist/19-feature-smart-artwork-link-qr.md) —
-- reachable by the link, absent from every listing. Keeping it out of the
-- listings is the query's job, not this policy's.
drop policy if exists "Public read access on published artworks" on public.artworks;
create policy "Public read access on published artworks"
  on public.artworks for select
  using (status = 'published' and visibility in ('public', 'unlisted'));

-- ── The one field the Buyer Intent Card asks for that 0012 has no column for ──
-- docs/pivot-checklist/20-feature-buyer-intent-card.md lists Role as required,
-- and 13-buyer-card.md repeats it as part of the identity an artist receives.
-- Name and Country come from the buyer's own public.users row; Organization,
-- Purpose, Budget, Intended use and Decision timeline all landed in 0012.
-- Role did not, so an enquiry could never say "Independent Collector" — the
-- exact phrasing the spec's own worked example uses.
alter table public.interest_entries add column if not exists viewer_role text;

comment on column public.interest_entries.viewer_role is
  'How the viewer described themselves when they filed this enquiry, e.g. "Independent Collector". Captured per enquiry rather than on the account, because the same person may write in as a curator one week and a private buyer the next.';

-- ── Reading a save list in one query ─────────────────────────────────────
-- Saved Works reads by buyer and orders by when it was saved; the primary key
-- leads with buyer_user_id, so the lookup is covered but the sort is not.
create index if not exists saved_artworks_buyer_saved_at_idx
  on public.saved_artworks (buyer_user_id, saved_at desc);

-- My Enquiries reads the same shape from the other table.
create index if not exists interest_entries_viewer_id_idx
  on public.interest_entries (viewer_id, created_at desc);
