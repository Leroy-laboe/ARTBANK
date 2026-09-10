-- 0033 — make RLS policies evaluate the caller's identity once per query
-- instead of once per row.
--
-- Every policy in this schema is written like:
--
--     using (artist_id = public.current_user_id())
--
-- current_user_id() is `stable`, but a bare function call in a policy is
-- still a per-row predicate: Postgres is free to re-run it for each candidate
-- row, and on a sequential scan it generally does. Since the function body is
-- itself a lookup —
--
--     select id from public.users where auth_user_id = auth.uid()
--
-- — that is one extra index probe per row examined. At 50 rows it is free. At
-- 100k rows it is the whole query.
--
-- Wrapping the call in a scalar subquery turns it into an InitPlan, which
-- Postgres evaluates once and reuses:
--
--     using (artist_id = (select public.current_user_id()))
--
-- The predicate is identical. Only the number of evaluations changes.
--
-- This rewrites every policy in `public` rather than listing them, because
-- there are 50 across 24 tables and a hand-transcribed list is its own
-- security risk — one mistyped predicate in an access-control rule is worse
-- than the performance problem being fixed. ALTER POLICY replaces only the
-- expression; name, command, roles and permissiveness are untouched.
--
-- Idempotent by construction: each expression is first normalised back to
-- bare calls, then wrapped. Running it twice produces the same text as
-- running it once, and it does not nest subqueries deeper on each run.
--
-- If a rewritten expression fails to parse, the statement raises and the
-- whole migration rolls back — a broken policy cannot be committed.

do $$
declare
  r         record;
  new_qual  text;
  new_check text;
  stmt      text;
  touched   int := 0;
  untouched int := 0;

  -- Undo the wrapping, tolerating however this Postgres version renders a
  -- scalar subquery (spacing varies, and it usually adds an `AS alias`).
  -- Deliberately narrow: the parens must contain nothing but that one call,
  -- so a policy with a real `exists (select 1 from ... current_user_id())`
  -- subquery is left completely alone.
  unwrap_cuid constant text :=
    '\(\s*select\s+(public\.)?current_user_id\(\)(\s+as\s+[a-z_]+)?\s*\)';
  unwrap_uid constant text :=
    '\(\s*select\s+auth\.uid\(\)(\s+as\s+[a-z_]+)?\s*\)';
begin
  for r in
    select tablename, policyname, qual, with_check
      from pg_policies
     where schemaname = 'public'
     order by tablename, policyname
  loop
    new_qual  := r.qual;
    new_check := r.with_check;

    -- 1. Normalise: any previous wrapping comes back off.
    if new_qual is not null then
      new_qual := regexp_replace(new_qual, unwrap_cuid, 'public.current_user_id()', 'gi');
      new_qual := regexp_replace(new_qual, unwrap_uid,  'auth.uid()',               'gi');
    end if;

    if new_check is not null then
      new_check := regexp_replace(new_check, unwrap_cuid, 'public.current_user_id()', 'gi');
      new_check := regexp_replace(new_check, unwrap_uid,  'auth.uid()',               'gi');
    end if;

    -- 2. Wrap. The schema-qualified spelling is consumed first via a
    --    sentinel, so `public.current_user_id()` can never be mangled into
    --    `public.(select current_user_id())`.
    if new_qual is not null then
      new_qual := replace(new_qual, 'public.current_user_id()', '@@CUID@@');
      new_qual := replace(new_qual, 'current_user_id()',        '@@CUID@@');
      new_qual := replace(new_qual, 'auth.uid()',               '@@UID@@');
      new_qual := replace(new_qual, '@@CUID@@', '(select public.current_user_id())');
      new_qual := replace(new_qual, '@@UID@@',  '(select auth.uid())');
    end if;

    if new_check is not null then
      new_check := replace(new_check, 'public.current_user_id()', '@@CUID@@');
      new_check := replace(new_check, 'current_user_id()',        '@@CUID@@');
      new_check := replace(new_check, 'auth.uid()',               '@@UID@@');
      new_check := replace(new_check, '@@CUID@@', '(select public.current_user_id())');
      new_check := replace(new_check, '@@UID@@',  '(select auth.uid())');
    end if;

    -- Policies that never referenced either helper come out unchanged.
    if new_qual is not distinct from r.qual
       and new_check is not distinct from r.with_check
    then
      untouched := untouched + 1;
      continue;
    end if;

    -- INSERT policies have no USING clause; SELECT and DELETE have no
    -- WITH CHECK. Build from whichever the policy actually has.
    stmt := format('alter policy %I on public.%I', r.policyname, r.tablename);

    if new_qual is not null then
      stmt := stmt || format(' using (%s)', new_qual);
    end if;

    if new_check is not null then
      stmt := stmt || format(' with check (%s)', new_check);
    end if;

    execute stmt;
    touched := touched + 1;
  end loop;

  raise notice 'RLS InitPlan rewrite: % policies rewritten, % already fine', touched, untouched;
end
$$;

-- ── Verification ──────────────────────────────────────────────────────────
-- Run after applying. Both counts should be 0.
--
--   select
--     count(*) filter (
--       where qual ~* '(?<![(]select )current_user_id'  -- illustrative only;
--     ) as still_per_row                                -- see note below.
--   from pg_policies where schemaname = 'public';
--
-- Postgres has no lookbehind, so the practical check is to eyeball the
-- rendered policies — every identity call should sit inside its own
-- `( SELECT ... )`:
--
--   select tablename, policyname, qual, with_check
--     from pg_policies
--    where schemaname = 'public'
--      and (qual ilike '%current_user_id%' or with_check ilike '%current_user_id%'
--           or qual ilike '%auth.uid%'     or with_check ilike '%auth.uid%')
--    order by tablename, policyname;
--
-- And to confirm the win rather than assume it, on a table with real volume:
--
--   explain (analyze, buffers) select id from public.artworks limit 100;
--
-- Before this migration the plan shows the users lookup repeated under the
-- scan; after it, once as an InitPlan.
