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
