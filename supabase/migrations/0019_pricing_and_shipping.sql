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
