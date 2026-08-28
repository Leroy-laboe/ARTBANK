-- ─────────────────────────────────────────────────────────────────────────
-- REMOVE THE DEMO DATA seeded by 0016_seed_test_artist.sql
--
-- Run this in the Supabase SQL editor. It is DESTRUCTIVE and cannot be undone
-- — re-running 0016 would bring the rows back, but anything you have since
-- attached to them (a real enquiry against a seeded artwork, say) is gone.
--
-- Run STEP 0 first and read the numbers before running anything else.
--
-- ⚠️  ORDER MATTERS, and not for the usual reason.
--     interest_entries.viewer_id is ON DELETE SET NULL, but 0012's identity
--     CHECK refuses any identified row without a viewer. So deleting the demo
--     accounts *first* fires the SET NULL, violates the CHECK, and the whole
--     statement errors. The entries have to go before the accounts.
-- ─────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════
-- STEP 0 — Preview. Read this before deleting anything.
-- ══════════════════════════════════════════════════════════════════

select 'demo artworks (seed-*)'      as what, count(*) as rows from public.artworks         where id like 'seed-%'
union all
select 'demo accounts',              count(*) from public.users             where jo1n_identity_id like 'seed:%'
union all
select 'interest entries to remove', count(*) from public.interest_entries
  where artwork_id like 'seed-%'
     or viewer_id in (select id from public.users where jo1n_identity_id like 'seed:%')
union all
select 'deals on demo artworks',     count(*) from public.artwork_deals     where artwork_id like 'seed-%'
union all
select 'demo conversations',         count(*) from public.conversations     where artwork_id like 'seed-%'
union all
select 'demo opportunities',         count(*) from public.opportunities     where id::text like '00000000-0000-4000-9000-%'
union all
select '── keep ──',                 null
union all
select 'YOUR real artworks',         count(*) from public.artworks
  where id not like 'seed-%' and id not like 'finalist-%' and id not like 'art-%'
union all
select 'competition finalists',      count(*) from public.artworks         where id like 'finalist-%'
union all
select 'original 4 demo artworks',   count(*) from public.artworks         where id like 'art-%';


-- ══════════════════════════════════════════════════════════════════
-- STEP 1 — The demo portfolio. This is what fills My Works, Interest,
--          Opportunities and Messages with people who do not exist.
-- ══════════════════════════════════════════════════════════════════

begin;

-- 1a. Interest entries first — see the ORDER MATTERS note above. Covers both
--     entries about a demo artwork and entries filed by a demo account.
delete from public.interest_entries
 where artwork_id like 'seed-%'
    or viewer_id in (select id from public.users where jo1n_identity_id like 'seed:%');

-- 1b. Deals on demo artworks. artwork_deals.artwork_id is ON DELETE SET NULL,
--     so these would otherwise survive as orphans still counted against you.
delete from public.artwork_deals where artwork_id like 'seed-%';

-- 1c. Demo opportunities. Cascades to opportunity_matches and
--     opportunity_applications, which is what empties the Opportunities column.
delete from public.opportunities where id::text like '00000000-0000-4000-9000-%';

-- 1d. The demo artworks. Cascades to artwork_images, artwork_evidence_files,
--     artwork_history_events, artwork_link_visits and saved_artworks.
delete from public.artworks where id like 'seed-%';

-- 1e. The demo accounts. Cascades to their conversations and messages.
--     Your own conversations are untouched: neither party in them is a demo
--     account, so nothing cascades to them.
delete from public.users where jo1n_identity_id like 'seed:%';

commit;


-- ══════════════════════════════════════════════════════════════════
-- STEP 2 — OPTIONAL. The four original demo artworks from 0001:
--          Mona Lisa, The Kiss, The Scream and a stock photograph.
--          They have no artist account, and they show in the buyer's
--          Discover feed as works nobody can be contacted about.
-- ══════════════════════════════════════════════════════════════════

-- delete from public.artworks where id in ('art-1', 'art-2', 'art-3', 'art-4');


-- ══════════════════════════════════════════════════════════════════
-- STEP 3 — OPTIONAL, AND THINK FIRST. The 50 competition finalist
--          entries from 0003.
--
--          These are real people's work, uploaded on their behalf, with
--          no account behind them. They are the bulk of what a buyer
--          currently sees on Discover. Removing them makes the feed
--          honest; it also throws away the only record of those entries
--          this database holds.
-- ══════════════════════════════════════════════════════════════════

-- delete from public.artworks where id like 'finalist-%';


-- ══════════════════════════════════════════════════════════════════
-- AFTERWARDS — the one thing that will surprise you
--
-- Several screens fall back to the demo arrays in src/data/ when a query
-- returns ZERO rows, so that a fresh clone with no database still renders:
--
--   listMyWorks()            → src/data/artspaceWorks.ts
--   listDiscoverArtworks()   → src/data/buyerContent.ts
--   loadInterest()           → src/data/artspaceInterest.ts
--   loadOpportunities()      → src/data/artspaceOpportunities.ts
--   loadMessages()           → src/data/artspaceMessages.ts
--
-- So emptying a table completely brings *fake* rows back on screen, labelled
-- as samples. Keeping at least one real artwork avoids this in My Works and
-- Discover. Interest, Opportunities and Messages will show samples again once
-- their tables are empty — that is the fallback working as designed, not the
-- delete having failed.
-- ══════════════════════════════════════════════════════════════════
