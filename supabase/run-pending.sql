-- ─────────────────────────────────────────────────────────────────────────
-- RUN THIS in the Supabase SQL editor.
--
-- A convenience concatenation of migrations 0017 → 0020, which have not been
-- applied yet. Every one is written to be safe to re-run, so running this
-- whole file again later is harmless.
--
-- Paste it on its own. Postgres runs the SQL editor's contents as a single
-- transaction, so one stray line anywhere rolls back everything — which is
-- exactly what happened last time.
--
-- Regenerate with:
--   cat supabase/migrations/00{17,18,19,20}_*.sql > supabase/run-pending.sql
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
