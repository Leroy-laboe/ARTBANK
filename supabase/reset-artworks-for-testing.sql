-- ─────────────────────────────────────────────────────────────────────────
-- RESET THE ARTIST'S ARTWORKS TO A FRESH PUBLISHED STATE
--
-- Strips every trace of activity off the artworks so they can be used as
-- clean test subjects: no interest, no deals, no earnings, no conversations,
-- no opportunity matches. The artworks themselves, their images and their
-- upload/publish history are kept — this resets what HAPPENED to them, not
-- the records.
--
-- Run in the Supabase SQL editor. DESTRUCTIVE and not undoable.
--
-- Every statement is self-contained and safe to re-run, so you can paste the
-- whole thing or run it a block at a time. Deleting rows that are already
-- gone is a no-op.
--
-- ⚠️  ORDER MATTERS. interest_entries.viewer_id is ON DELETE SET NULL, and
--     0012's identity CHECK refuses an identified row with no viewer. So the
--     entries must be deleted before any account they point at. Step 1 does
--     them first for exactly this reason.
--
-- NOTE  No temporary tables, and no reliance on session state. Supabase runs
--       the SQL editor through a transaction-mode pooler, so consecutive
--       statements can land on different connections — a temp table created
--       by one statement is invisible to the next. Every statement below
--       therefore repeats its own subquery.
--
-- To reset a different account, replace the email in every occurrence of
--   lower(u.email) = lower('mangwararaleroy@gmail.com')
-- ─────────────────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════════════════════
-- STEP 0 — Preview. Run this alone first.
-- ══════════════════════════════════════════════════════════════════

select 'artworks in scope' as what, count(*) as rows
  from public.artworks a
  join public.users u on u.id = a.artist_id
 where lower(u.email) = lower('mangwararaleroy@gmail.com')
union all
select 'interest entries', count(*)
  from public.interest_entries i
 where i.artwork_id in (select a.id from public.artworks a join public.users u on u.id = a.artist_id
                         where lower(u.email) = lower('mangwararaleroy@gmail.com'))
union all
select 'deals', count(*)
  from public.artwork_deals d
 where d.artist_id in (select id from public.users where lower(email) = lower('mangwararaleroy@gmail.com'))
union all
select 'conversations', count(*)
  from public.conversations c
 where c.artist_id in (select id from public.users where lower(email) = lower('mangwararaleroy@gmail.com'))
union all
select 'opportunity matches', count(*)
  from public.opportunity_matches m
 where m.artist_id in (select id from public.users where lower(email) = lower('mangwararaleroy@gmail.com'))
union all
select 'saved by buyers', count(*)
  from public.saved_artworks s
 where s.artwork_id in (select a.id from public.artworks a join public.users u on u.id = a.artist_id
                         where lower(u.email) = lower('mangwararaleroy@gmail.com'))
union all
select 'sale/enquiry history', count(*)
  from public.artwork_history_events e
 where e.event_type in ('sale', 'enquiry', 'licence')
   and e.artwork_id in (select a.id from public.artworks a join public.users u on u.id = a.artist_id
                         where lower(u.email) = lower('mangwararaleroy@gmail.com'));


-- ══════════════════════════════════════════════════════════════════
-- STEP 1 — Wipe the activity.
--          Run 1a → 1g in order. 1a must come before anything that
--          touches accounts.
-- ══════════════════════════════════════════════════════════════════

-- 1a. Interest first — see the ORDER MATTERS note. Empties the Interest
--     column in My Works and the Interest Ledger.
delete from public.interest_entries
 where artwork_id in (
         select a.id from public.artworks a
           join public.users u on u.id = a.artist_id
          where lower(u.email) = lower('mangwararaleroy@gmail.com'))
    or artist_id in (
         select id from public.users
          where lower(email) = lower('mangwararaleroy@gmail.com'));

-- 1b. Payments before deals — payments.deal_id cascades, but deleting them
--     explicitly keeps this readable and works whatever order you run it in.
delete from public.payments
 where deal_id in (
         select d.id from public.artwork_deals d
          where d.artist_id in (select id from public.users
                                 where lower(email) = lower('mangwararaleroy@gmail.com')));

-- 1c. Deals. This is the "financial statements" — earnings, recorded sales
--     and anything awaiting payment.
delete from public.artwork_deals
 where artist_id in (
         select id from public.users
          where lower(email) = lower('mangwararaleroy@gmail.com'));

-- 1d. Conversations. Cascades to their messages, so every negotiation
--     thread goes with them.
delete from public.conversations
 where artist_id in (
         select id from public.users
          where lower(email) = lower('mangwararaleroy@gmail.com'))
    or artwork_id in (
         select a.id from public.artworks a
           join public.users u on u.id = a.artist_id
          where lower(u.email) = lower('mangwararaleroy@gmail.com'));

-- 1e. Opportunity applications, then matches. Empties the Opportunities
--     column.
delete from public.opportunity_applications
 where artist_id in (
         select id from public.users
          where lower(email) = lower('mangwararaleroy@gmail.com'));

delete from public.opportunity_matches
 where artist_id in (
         select id from public.users
          where lower(email) = lower('mangwararaleroy@gmail.com'));

-- 1f. Save-list entries pointing at these works, so a buyer's Saved Works
--     starts empty too.
delete from public.saved_artworks
 where artwork_id in (
         select a.id from public.artworks a
           join public.users u on u.id = a.artist_id
          where lower(u.email) = lower('mangwararaleroy@gmail.com'));

-- 1g. History and link visits. Upload and publish events are KEPT — they are
--     the record's own provenance and did happen. Only activity events go.
delete from public.artwork_history_events
 where event_type in ('sale', 'enquiry', 'licence')
   and artwork_id in (
         select a.id from public.artworks a
           join public.users u on u.id = a.artist_id
          where lower(u.email) = lower('mangwararaleroy@gmail.com'));

delete from public.artwork_link_visits
 where artwork_id in (
         select a.id from public.artworks a
           join public.users u on u.id = a.artist_id
          where lower(u.email) = lower('mangwararaleroy@gmail.com'));


-- ══════════════════════════════════════════════════════════════════
-- STEP 2 — Reset the artworks themselves.
--          Published, public, available, unreserved, unsold. Title,
--          images, medium, dimensions, price and rights are untouched.
-- ══════════════════════════════════════════════════════════════════

update public.artworks a
   set status            = 'published',
       visibility        = 'public',
       availability      = 'available',
       availability_note = null,
       updated_at        = now()
  from public.users u
 where u.id = a.artist_id
   and lower(u.email) = lower('mangwararaleroy@gmail.com');


-- ══════════════════════════════════════════════════════════════════
-- STEP 3 — Confirm. interest, deals and threads should all be 0.
-- ══════════════════════════════════════════════════════════════════

select a.title, a.status, a.availability, a.visibility,
       (select count(*) from public.interest_entries i where i.artwork_id = a.id) as interest,
       (select count(*) from public.artwork_deals   d where d.artwork_id = a.id) as deals,
       (select count(*) from public.conversations   c where c.artwork_id = a.id) as threads
  from public.artworks a
  join public.users u on u.id = a.artist_id
 where lower(u.email) = lower('mangwararaleroy@gmail.com')
 order by a.title;


-- ══════════════════════════════════════════════════════════════════
-- STEP 4 — OPTIONAL. The ~20 demo buyer accounts from 0016.
--
--          The "Hotelier Gallery", "Blue Arc Advisory", "Sophie Laurent"
--          cast. After step 1 nothing points at them and they appear
--          nowhere, but they are still rows in public.users.
--
--          Safe only AFTER step 1 — the interest entries pointing at them
--          must be gone first, or this fails on the identity CHECK.
-- ══════════════════════════════════════════════════════════════════

-- delete from public.users where jo1n_identity_id like 'seed:%';


-- ══════════════════════════════════════════════════════════════════
-- AFTERWARDS — READ THIS, or you will think the reset failed
--
-- Several screens fall back to the sample arrays in src/data/ when a query
-- returns ZERO rows, so a fresh clone still renders something:
--
--   Interest        → demo enquiries reappear   (src/data/artspaceInterest.ts)
--   Opportunities   → demo opportunities reappear
--   Messages        → a demo conversation reappears
--
-- That is the fallback working as designed. The tell is that those screens
-- label themselves as samples, and the names will be the 0016 cast rather
-- than anyone you have talked to.
--
-- My Works and Discover will NOT fall back, because the artworks still exist.
-- They should show every work as Published · Available with Interest 0,
-- Opportunities 0 and "No earnings".
--
-- The moment a real buyer files one enquiry, the real data takes over again.
-- ══════════════════════════════════════════════════════════════════
