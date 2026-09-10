-- 0034 — count the artist's catalogue in Postgres instead of in the browser.
--
-- The Today dashboard shows a handful of whole-catalogue figures: what share
-- of works carry dimensions, what share carry a certificate, completed and
-- pending earnings, how many licences have settled. To produce them the app
-- read *every* artwork and *every* deal the artist has and reduced the arrays
-- in JavaScript.
--
-- That is the one read that cannot simply be capped. Capping a list truncates
-- a list; capping this would compute "82% of your works have dimensions" from
-- a 50-work sample of a 400-work catalogue and present it as fact — the same
-- class of error as showing sample figures for real ones. So the counting
-- moves to where the rows already are.
--
-- Payload goes from "the whole catalogue" to one row, and stops growing with
-- the artist's success.
--
-- security invoker on purpose: RLS still applies, so this can only ever count
-- rows the caller could already read. The explicit artist filter mirrors what
-- listMyWorks() asks for (owned *or* uploaded) and keeps the index in play.
--
-- Safe to re-run.

create or replace function public.dashboard_summary()
returns table (
  works_total            int,
  works_with_dimensions  int,
  works_with_passport    int,
  settled_total          numeric,
  settled_count          int,
  pending_total          numeric,
  pending_count          int,
  settled_licence_count  int,
  currency               text
)
language sql
stable
security invoker
set search_path = public
as $$
  with works as (
    select
      count(*)::int as total,
      -- Mirrors the app's "dimensions !== '—'": the em dash is what the
      -- mapper substitutes for a null, so blank and null both count as
      -- missing here.
      count(*) filter (
        where dimensions is not null and btrim(dimensions) <> ''
      )::int as with_dimensions,
      -- coa_status 'issued' is what the UI labels "Verified".
      count(*) filter (where coa_status = 'issued')::int as with_passport
    from public.artworks
    where artist_id = (select public.current_user_id())
       or uploaded_by = (select public.current_user_id())
  ),
  deals as (
    select
      -- 'agreed' and 'paid' are the only two states that are money the artist
      -- actually has; 'awaiting_payment' is a promise. Kept in step with
      -- SETTLED_STATUSES in src/services/deals.ts.
      coalesce(sum(amount) filter (where status in ('agreed', 'paid')), 0) as settled_total,
      count(*) filter (where status in ('agreed', 'paid'))::int            as settled_count,
      coalesce(sum(amount) filter (where status = 'awaiting_payment'), 0)  as pending_total,
      count(*) filter (where status = 'awaiting_payment')::int             as pending_count,
      count(*) filter (
        where status in ('agreed', 'paid') and deal_type = 'licence'
      )::int as settled_licence_count,
      -- The app labels every total in one currency and takes it from the most
      -- recent deal. Mixed-currency catalogues are a real gap, but this
      -- function's job is to match today's behaviour, not to change it.
      (array_agg(currency order by agreed_at desc))[1] as currency
    from public.artwork_deals
    where artist_id = (select public.current_user_id())
  )
  select
    works.total,
    works.with_dimensions,
    works.with_passport,
    deals.settled_total,
    deals.settled_count,
    deals.pending_total,
    deals.pending_count,
    deals.settled_licence_count,
    coalesce(deals.currency, 'USD')
  from works, deals;
$$;

comment on function public.dashboard_summary() is
  'Whole-catalogue totals for the Today dashboard, counted in Postgres so the browser stops reading every artwork and deal to derive them.';

grant execute on function public.dashboard_summary() to authenticated;

-- ── Verification ──────────────────────────────────────────────────────────
-- As a signed-in artist:
--   select * from public.dashboard_summary();
--
-- works_total should match:
--   select count(*) from public.artworks
--    where artist_id = public.current_user_id()
--       or uploaded_by = public.current_user_id();
