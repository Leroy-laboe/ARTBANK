# 27. Production Readiness — Audit and Fix Plan

> Not sourced from the PDF. This is a system-wide audit prompted by a direct question: what in here is a bug or a design decision that won't survive real scale?
> Status: **findings verified against the code, fixes not yet written.**
> Scope: 229 TS/TSX files, 37 pages, 20 service modules, 32 migrations, 24 tables, 50 RLS policies.

## How to read this

Every finding below was checked against the actual source, not inferred. Where a first pass looked alarming and turned out to be fine, it's recorded in [Checked and clear](#checked-and-clear) so nobody re-investigates it later. Fixes are ordered by *when the pain arrives*, not by how hard they are.

| # | Finding | Bites when | Effort |
|---|---|---|---|
| 1 | RLS helper re-runs per row (70 sites) | Tables pass ~10k rows | Mechanical, 1 migration |
| 2 | 25 MB video + 4 MB images go through the build | Immediately — every visitor | Small |
| 3 | No route code-splitting; one 1.19 MB JS bundle | Immediately — every visitor | Small |
| 4 | 110 queries, 9 bounded; no pagination anywhere | First power user | Medium, per-surface |
| 5 | Runtime schema-version sniffing | Every new migration adds a layer | Medium |
| 6 | Dashboard aggregates in JavaScript | Artist passes ~500 works/enquiries | Medium |
| 7 | Demo data can render as if it were real | Any transient query failure | Small |
| 8 | No fetch caching; 26 pages refetch on mount | Steady cost, worse with traffic | Medium |

---

## 1. RLS policies re-evaluate `current_user_id()` for every row

**The evidence.** `current_user_id()` (`0011_artworks_rework.sql`) is:

```sql
create or replace function public.current_user_id()
returns uuid language sql stable security definer
as $$ select id from public.users where auth_user_id = auth.uid() $$;
```

It is referenced **70 times** across the policies. **Zero** of those are wrapped in a scalar subquery. Separately, `auth.uid()` is called directly in **7** policies, also never wrapped.

**Why it matters.** A policy body like `using (artist_id = public.current_user_id())` is a per-row predicate. Postgres can only hoist that lookup out of the loop when it's written as an InitPlan — `using (artist_id = (select public.current_user_id()))`. Without the `(select …)`, a scan over an artist's artworks can re-run the `users` lookup once per candidate row. It costs nothing at 50 rows and is the single most common reason Supabase apps fall over between 10k and 100k rows. `stable` helps the planner but does not guarantee the hoist; the subquery form does.

**The fix.** One migration that rewrites every policy to the subquery form. Mechanical and behaviour-preserving — the predicate is identical, only the evaluation count changes.

- [ ] Rewrite all 70 `current_user_id()` policy references as `(select public.current_user_id())`
- [ ] Rewrite the 7 `auth.uid()` references as `(select auth.uid())`
- [ ] Confirm with `explain (analyze, buffers)` on `artworks` and `messages` before/after, with a seeded table of ~50k rows, so the win is measured rather than assumed
- [ ] Add a note to `CLAUDE.md` so new policies are written in the subquery form from the start

## 2. A 25 MB video and 4 MB of PNGs are compiled into the build

**The evidence.**

| File | Size | How it ships |
|---|---|---|
| `src/video.mp4` | **25 MB** | `import panelVideo from '@/video.mp4'` in `AuthPage.tsx` |
| `src/assets/images/email.png` | 2.4 MB | asset pipeline |
| `src/bacground.png` | 2.2 MB | asset pipeline (note: filename is misspelled) |
| `src/assets/images/email updated image.png` | 1.6 MB | asset pipeline (spaces in filename) |

The last build emitted `dist/assets/video-*.mp4  25,435.53 kB`.

**Why it matters.** Every visitor who opens `/login` or `/register` pulls a 25 MB video. On Vercel's Hobby tier (100 GB/month) that is roughly **4,000 auth page views before the bandwidth cap** — before counting anything else the site serves. It is also the slowest possible first impression on mobile data.

**The fix.**

- [ ] Move the video out of the bundle: host it on Supabase Storage or a CDN and reference it by URL, so it is not a build artifact and can be cached/streamed independently
- [ ] Re-encode it — a UI panel loop at this size is almost certainly uncompressed; target < 2 MB (H.264 + WebM, short loop, muted, no audio track)
- [ ] Add `preload="none"` / `poster` so it doesn't download before the auth form is usable
- [ ] Compress the three oversized PNGs (they are almost certainly screenshots saved as PNG — convert to WebP; expect 90 %+ reduction)
- [ ] Rename `bacground.png` and `email updated image.png` — the typo and the spaces will bite in a URL eventually
- [ ] Add a CI size budget so a multi-megabyte asset can't be imported again without someone noticing

## 3. No code splitting — one bundle for 37 routes

**The evidence.** `src/App.tsx` contains **zero** `lazy()` or `Suspense` usages; all 37 pages are statically imported. The build emits a single `index-*.js` of **1,197 kB** (343 kB gzipped) plus `index-*.css` at **311 kB**, and Vite prints the >500 kB chunk warning on every build.

**Why it matters.** A signed-out visitor reading the homepage downloads the artist dashboard, the buyer workspace, the guardian oversight screens, the room builder and every service module — code they may never reach. This grows with each feature and never shrinks.

**The fix.**

- [ ] `React.lazy()` + a single `<Suspense>` boundary for every route under `/artspace/*`, `/collect/*` and `/guardian/*` — the three trees a public visitor never sees
- [ ] Keep the marketing homepage, `/login`, `/register` and the public share routes (`/a/:id`, `/rooms/:id`, `/artists/:handle`) eagerly loaded — those are first-paint surfaces
- [ ] Verify the entry chunk drops below ~250 kB gzipped, and that CSS Modules split alongside their routes

## 4. 110 queries, 9 bounded — no pagination anywhere

**The evidence.** Across `src/services/`, `.from(` appears 110 times; `.limit(` or `.range(` appears 9 times. `listDiscoverArtworks` and `listNewFromFollowed` are correctly capped. These are not:

| Function | Table | Grows with |
|---|---|---|
| `listSavedArtworks` | `saved_artworks` | Everything a buyer ever saved |
| `listFollowedArtists` | `profile_follows` | Everyone they follow |
| `listMyEnquiries` | `interest_entries` + `conversations` + `artwork_deals` | Their whole enquiry history |
| `listViewingRoomRequests` | `interest_entries` | Every room request received |
| `listMyWorks` | `artworks` | The artist's entire catalogue |
| thread loaders | `messages` | Every message in a conversation |

Each has `.order(...)` but no ceiling, so they are ordered full reads.

**Why it matters.** These are per-user tables, so nothing breaks in testing — they break for your *best* users first. An artist with 800 works or a long-running conversation pulls the lot on every page open.

**The fix.** Pagination is a UI decision as much as a query one, so this is per-surface rather than one sweep.

- [ ] Add a shared `PAGE_SIZE` and `.range()` helper in `src/services/`, so every list uses one convention
- [ ] Messages: load the newest N and page backwards on scroll — the one place infinite-scroll is genuinely correct
- [ ] Lists (saved, following, enquiries, works): cap at a page with an explicit "Load more", which is honest about there being more
- [ ] Add a hard `.limit()` to every remaining unbounded read even where the UI shows all of it, so a runaway row count degrades gracefully instead of hanging the tab

## 5. Services sniff the schema version at runtime

**The evidence.** `profile.ts:192`, `buyer.ts:750`, `deals.ts:533` and others catch Postgres `42703` (undefined column), `42P01` (undefined table) and PostgREST `PGRST204`, then re-issue the query against an older column list. `profile.ts` documents three generations of this: *"0022's `country_code` → 0021's public-profile columns → the pre-0021 base."*

**Why it matters.** This treats "which migrations are applied" as a runtime unknown. Three consequences: the fallback path costs two round-trips; a genuine typo'd column is silently swallowed as a schema-version difference instead of failing loudly; and the ladder grows a rung with every migration that adds a column, so the cost compounds in exactly the file everyone touches.

**The fix.**

- [ ] Decide and record the minimum supported schema version — for a single production database, that is simply "latest"
- [ ] Delete the fallback ladders; let a missing column be a real error
- [ ] Make migrations a deploy gate (run `supabase db push` in CI before the Vercel build promotes), so the app can *assume* its schema
- [ ] Keep exactly one guard: a clear startup error if the schema is older than the app expects, rather than per-query guesswork

## 6. The dashboard computes its numbers in JavaScript

**The evidence.** `loadDashboard()` (`dashboard.ts:346`) fires five parallel unbounded reads — `listMyWorks`, `loadInterest`, `loadOpportunities`, `listMyDeals`, `listArtworkReadiness` — then `buildNeedsDecision`, `buildRealInterest`, `buildArtworksAtWork`, `buildMoney` and `buildReadiness` iterate those arrays in the browser to produce what are, in every case, aggregates.

**Why it matters.** To show "3 things need your decision" it downloads every work, every enquiry and every deal the artist has. The payload and the parse time both scale linearly with a successful artist's history — the dashboard gets slower precisely as someone succeeds on the platform.

**The fix.**

- [ ] Move the aggregates into Postgres — one `dashboard_summary(uuid)` RPC returning the counts and the top-3 decision items, rather than five list reads
- [ ] Keep the presentation helpers (`money()`, `shortDate()`) client-side; only the reduction moves
- [ ] Where a list genuinely must be shown, fetch it separately and bounded (see finding 4)

## 7. Demo data can render as though it were the artist's own

**The evidence.** `isDemo` appears **48 times** across seven services. `loadDashboard` returns `demoDashboard()` whenever *any* of its five sources reports a fallback — including `deals === null`, which is what a transient query failure produces.

**Why it matters.** The intent is good and the dashboard does label itself. But the trigger is "a query failed", not "this is a new account". A network blip on a real artist's dashboard can swap their real figures for fabricated earnings and enquiries. For a product whose entire pitch is verified provenance, showing invented numbers is the worst available failure mode.

**The fix.**

- [ ] Separate the two conditions: **empty** (a real account with no data → real zeros and empty states) from **failed** (→ an error state with a retry, never sample content)
- [ ] Restrict demo content to a signed-out marketing preview, where nobody can mistake it for their own account
- [ ] Make `null` from a service mean "error", and `[]` mean "none" — right now both collapse into the same branch

## 8. No fetch caching — 26 pages refetch on every mount

**The evidence.** No `@tanstack/react-query`, `swr` or equivalent in `package.json`; 26 of 37 pages fetch inside `useEffect`. Per `CLAUDE.md` there is no global store by design.

**Why it matters.** Navigating ArtSpace → My Works → back re-runs every query. It multiplies the cost of findings 4 and 6, and every one of those requests is a billed Supabase read.

**The fix.** This one is a genuine architectural choice, so it deserves a decision rather than a default.

- [ ] Adopt a query cache (TanStack Query is the smallest change — it wraps the existing service functions without rewriting them) *or* deliberately accept refetching and document why
- [ ] If adopted: shared `staleTime` for reference data (profile, readiness), short or zero for messages
- [ ] Either way, deduplicate in-flight requests so a double-mount in StrictMode doesn't double every query

---

## Checked and clear

Recorded so these aren't re-audited later:

- **RLS coverage** — all 24 tables have `enable row level security`. `sessions` has RLS on and no policies, which is correct: it is a service-role-only table, so deny-by-default is the intent.
- **Service-role key exposure** — zero references to `SERVICE_ROLE` anywhere under `src/`. The client only ever holds the publishable key.
- **`select('*')`** — zero occurrences; every query names its columns.
- **N+1 query loops** — no `await` inside `.map()`/`for` over query calls. The loops found are in-memory reductions over already-fetched arrays.
- **Server-side counting** — 19 uses of `count:`/`head: true`, so some aggregates already avoid pulling rows.
- **`users.role` check constraint** — `0006` allowed `('collector','artist','gallery','admin')`, which would have rejected the `'buyer'` the signup trigger inserts. `0007` already migrated it to `('artist','buyer','guardian','partner','admin')`. Not a bug.

## Also worth deciding (not bugs, but they will shape scale)

- **Two identity systems in one table.** `users` carries both `jo1n_identity_id` (the JO1N ID/BFF path in `server/`) and `auth_user_id` (Supabase Auth), with a check constraint requiring at least one. Every profile read must handle both. That is a reasonable interim, but it doubles the auth surface — worth an explicit decision on whether JO1N ID is still the destination or Supabase Auth has become the answer.
- **`artworks.id` is `text`, not `uuid`.** Every FK to it (`artwork_link_visits`, `saved_artworks`, `artwork_images`, …) is therefore a text column. Text keys index and join more expensively than uuid, and it is far cheaper to change now than after a large catalogue exists.

## Suggested order

1. **Findings 2 and 3** — assets and code splitting. Largest visible win, smallest change, no schema risk, and they cost money today.
2. **Finding 1** — the RLS rewrite. One migration, mechanical, and the longer it waits the more policies there are to convert.
3. **Finding 7** — the demo/error split. Small, and it is a trust bug, not a performance one.
4. **Finding 5** — delete the fallback ladders and make migrations a deploy gate. Unblocks confident schema work afterwards.
5. **Findings 4 and 6** — pagination and dashboard aggregates, per surface, once the above are stable.
6. **Finding 8** — the caching decision, last, because it is the only one that changes how the app is written rather than fixing something already wrong.

---

# Status — first fix pass

| # | Finding | State |
|---|---|---|
| 1 | RLS per-row identity calls | **Migration written** (`0033`), not yet applied |
| 2 | 25 MB video in the bundle | **Partly fixed** — out of the bundle and gated; still needs re-encoding |
| 3 | No code splitting | **Fixed and measured** |
| 4 | Unbounded list reads | **Partly fixed** — ceilings on the worst two; "Load more" UI outstanding |
| 5 | Runtime schema sniffing | **Deliberately not touched yet** — see below |
| 6 | Dashboard aggregates in JS | Outstanding |
| 7 | Demo data on failure | **Fixed** |
| 8 | No fetch caching | Outstanding — needs a decision, not a patch |

## What changed

**Finding 3 — code splitting.** `src/App.tsx` now lazy-loads every route behind a sign-in plus the secondary marketing pages, with `RouteFallback` as the single Suspense boundary. Cold-landing surfaces stay eager: homepage, auth, and the three public links (`/a/:id`, `/rooms/:id`, `/artists/:handle`) that get opened from a QR code or a shared URL with no warmed cache.

Measured, not assumed:

| | before | after |
|---|---|---|
| entry JS | 1,197.58 kB (343 kB gz) | **450.22 kB (139 kB gz)** |
| entry CSS | 311.59 kB (49.9 kB gz) | **103.48 kB (21.1 kB gz)** |
| Vite chunk warning | on every build | gone |

**Finding 2 — the video.** Moved `src/video.mp4` → `public/panel-loop.mp4`, so it is no longer a build artifact. `useHeavyMediaAllowed()` now gates whether it is requested at all: skipped for reduced-motion, Data Saver, and 3g-or-worse. The existing `{videoSrc && …}` branch in `auth-switch.tsx` already degraded to the gradient panel, so no fallback UI was needed.

**Still required, and it needs a tool this environment doesn't have:** the file is 25 MB of decorative loop. Re-encode it —

```
ffmpeg -i public/panel-loop.mp4 -t 8 -an -vf "scale=960:-2" \
  -c:v libx264 -crf 30 -movflags +faststart public/panel-loop.mp4
ffmpeg -i public/panel-loop.mp4 -an -c:v libvpx-vp9 -crf 40 -b:v 0 public/panel-loop.webm
```

Target under 2 MB. Until then, visitors on a good connection still pull 25 MB.

**Finding 7 — demo data on failure.** `loadDashboard` became `loadDashboardState`, returning three outcomes instead of two:

- `demo` — no session, or `isSupabaseConfigured` is false. Sample content is the only way the screen renders, and nobody can mistake it for their own account.
- `error` — a signed-in artist whose read did not come back. Renders an alert and a retry. **Never figures.**
- `live` — including an artist with genuinely nothing, who gets real zeros.

The old code collapsed the first and second, so `deals === null` from a dropped request handed a real artist invented earnings under a "sample figures" label.

**Finding 4 — ceilings.** `src/services/pagination.ts` holds one convention (`PAGE_SIZE`, `pageBounds`, `toPaged`). The probe-row trick asks for `PAGE_SIZE + 1` so "is there more?" costs no second query. Applied to `listSavedArtworks` (now returns `hasMore`) and `listFollowedArtists`.

## Why finding 5 was left alone

Removing the `42703`/`42P01`/`PGRST204` fallback ladders is correct **only once migrations are guaranteed applied before the app ships.** Deleting them first would turn a currently-degraded read into a hard failure on any environment whose database is behind — including production, right now, since `0033` is written but unapplied. The order has to be: make migrations a deploy gate, confirm every environment is current, *then* delete the ladders. Doing it in the other order is how you take the site down.

## Next, in order

- [ ] Apply `0033` to a branch/staging database first, run its verification query, confirm with `explain (analyze)` on `artworks`
- [ ] Re-encode the panel video (commands above) and compress `bacground.png` (2.2 MB, on the auth page)
- [ ] Delete the four unreferenced images in `src/assets/images/` — `email.png` (2.4 MB), `email updated image.png` (1.6 MB), `email-hero-520x640.jpg`, `hero.png` — nothing imports them, so they cost repo size only. Left in place rather than deleted, in case they are design sources someone still wants.
- [ ] `.limit()` on the remaining unbounded reads: `listMyEnquiries`, `listViewingRoomRequests`, `listMyWorks`, the message-thread loaders, `getSavedIds`
- [ ] "Load more" affordance wherever `hasMore` is now returned
- [ ] Migration gate in CI, then finding 5
- [ ] `dashboard_summary()` RPC for finding 6
- [ ] Decide finding 8

---

# Status — second fix pass

`0033` applied, and the panel video replaced with a 1.5 MB encode (was 25 MB).

| # | Finding | State |
|---|---|---|
| 1 | RLS per-row identity calls | **Applied** — verify with the query below |
| 2 | Oversized media | **Video done** (25 MB → 1.5 MB). `bacground.png` still 2.2 MB |
| 3 | No code splitting | **Done** |
| 4 | Unbounded list reads | **Mostly done** — mailboxes, works, saves, follows capped |
| 5 | Runtime schema sniffing | Blocked on a migration gate — see below |
| 6 | Dashboard aggregates in JS | Outstanding, and now coupled to finding 4 |
| 7 | Demo data on failure | **Done** |
| 8 | No fetch caching | Outstanding — needs a decision |

## What changed in this pass

**The mailbox was the worst read in the codebase.** `loadMessages` selected every conversation for the account *and* embedded every message inside each one, with no ceiling on either. The two multiply, so the busiest account paid the largest bill on every visit to the screen. Both are now capped (`PAGE_SIZE` conversations, `THREAD_PAGE_SIZE` messages each), with messages ordered newest-first so the cap keeps the recent ones. `toThread()` already re-sorted ascending for display, so nothing renders backwards. The same fix went into the guardian mailbox, which shared the pattern.

**`listMyWorks` takes an opt-in `limit` rather than a default cap**, and the asymmetry is the point. Two kinds of caller read it: My Works and the room-builder picker want a page, but the dashboard reduces the whole catalogue into readiness percentages and money totals. A blanket cap there would not truncate a list — it would produce *wrong numbers*, which is the exact failure this audit exists to remove. The list surfaces now pass `PAGE_SIZE`; the dashboard still reads unbounded until finding 6 moves that counting into Postgres.

That coupling is why finding 6 is now the next thing worth doing rather than a nice-to-have: it is what unblocks capping the last unbounded read.

## Verify `0033` actually took

Every identity call in a policy should now sit inside its own `( SELECT … )`:

```sql
select tablename, policyname, qual
  from pg_policies
 where schemaname = 'public'
   and (qual ilike '%current_user_id%' or with_check ilike '%current_user_id%')
 order by tablename
 limit 20;
```

And confirm the plan changed rather than assuming it did:

```sql
explain (analyze, buffers)
select id, title from public.artworks limit 100;
```

Look for the `users` lookup appearing once as an InitPlan, not repeated under the scan.

## Before finding 5 can be touched

The fallback ladders can only come out once every environment is guaranteed current. Check what the live database actually has:

```sql
select column_name
  from information_schema.columns
 where table_schema = 'public' and table_name = 'users'
   and column_name in ('country_code', 'profile_handle', 'show_artwork_prices', 'allow_enquiries');
```

All four present means the 0021/0022 ladders in `profile.ts`, `publicProfile.ts` and `buyer.ts` are dead code and can be deleted. Any missing means production is behind and the ladders are load-bearing.

---

# Status — third fix pass

Both verifications came back clean:

- **`0033` applied correctly.** Every policy now renders as `( SELECT current_user_id() AS current_user_id)`, and the `EXISTS` subquery policies (`artwork_evidence_files`, `artwork_history_events`, `artwork_images`, `artwork_link_visits`) survived intact — which is the case an earlier draft of the migration would have skipped. The `NULL` quals belong to INSERT policies, which correctly carry only `with_check`.
- **Production schema is current.** All four of `country_code`, `profile_handle`, `show_artwork_prices`, `allow_enquiries` exist, so the 0021/0022 fallback ladders were dead code.

| # | Finding | State |
|---|---|---|
| 1 | RLS per-row identity calls | **Done and verified in production** |
| 2 | Oversized media | **Video done** (25 MB → 1.5 MB). `bacground.png` still 2.2 MB |
| 3 | No code splitting | **Done** |
| 4 | Unbounded list reads | **Mostly done** — one deliberate exception, see below |
| 5 | Runtime schema sniffing | **Done** |
| 6 | Dashboard aggregates in JS | Outstanding — now the last blocker on finding 4 |
| 7 | Demo data on failure | **Done** |
| 8 | No fetch caching | Outstanding — needs a decision |

## Finding 5 — what came out

| Site | Was | Now |
|---|---|---|
| `profile.ts` `fetchProfileRow` | 3 selects, retrying down 0022 → 0021 → base | one select, throws on error |
| `profile.ts` `getPublicProfile` | 2 selects, pre-0022 fallback | one select |
| `publicProfile.ts` `listPublicArtists` | 2 selects, pre-0022 fallback | one select |
| `buyer.ts` `sendIntent` | insert, then re-insert without `viewer_role` | one insert, throws on error |
| `profile.ts` column lists | `BASE` → `PROFILE_020` → `PROFILE` tiers | one flat list |
| `profile.ts` public column lists | `_PRE_0022` + `country_code` | one flat list |

**Deliberately kept:** the `42703`/`42P01` branches in `describeProfileError` and `describeDealError`. Those are not fallbacks — they turn a schema error into "run the outstanding migrations in supabase/migrations" instead of a bare failure. Failing loudly with a useful message is the behaviour finding 5 wanted.

**Consequence worth stating plainly:** a database behind on migrations now fails rather than degrades. That is the intent, and it is why this step waited until production was verified current. It also means the migration gate in CI is no longer optional — it is what prevents this from being a foot-gun on the next schema change.

## The one unbounded read left, and why

`listMyWorks` still reads the full catalogue **when the dashboard calls it**. Its `limit` is opt-in: My Works and the room-builder picker pass `PAGE_SIZE`, the dashboard does not. Capping it there would not truncate a list — it would silently compute readiness percentages and money totals over a 50-work sample and present them as whole-catalogue figures, which is the same class of error as finding 7. That read only goes away once `dashboard_summary()` (finding 6) does the counting in Postgres.

---

# Status — fourth fix pass

| # | Finding | State |
|---|---|---|
| 1 | RLS per-row identity calls | **Done and verified in production** |
| 2 | Oversized media | **Video done** (25 MB → 1.5 MB). `bacground.png` still 2.2 MB |
| 3 | No code splitting | **Done** |
| 4 | Unbounded list reads | **Done** — no unbounded read remains |
| 5 | Runtime schema sniffing | **Done** |
| 6 | Dashboard aggregates in JS | **Migration written** (`0034`), needs applying |
| 7 | Demo data on failure | **Done** |
| 8 | No fetch caching | Outstanding — needs a decision |

## Finding 6 — what moved

`dashboard_summary()` (migration `0034`) returns one row of whole-catalogue
figures: works total, how many carry dimensions, how many carry an issued
certificate, settled and pending earnings with their transaction counts,
settled licence count, and the currency to label them in.

`security invoker`, so RLS still applies and it can only count rows the caller
could already read. The artist filter mirrors `listMyWorks()` — owned *or*
uploaded — and uses the `(select public.current_user_id())` InitPlan form
established by `0033`.

On the app side:

| Was | Now |
|---|---|
| `buildReadiness(works, profile)` — percentages over the whole `works` array | `buildReadiness(totals, profile)` |
| `buildMoney(works, deals, imageUrl)` — sums over every deal | `buildMoney(totals, imageUrl)` |
| `listMyWorks(profile)` — unbounded, for the dashboard | `listMyWorks(profile, PAGE_SIZE)` |

`totals === null` now counts as an error alongside the other sources, because
a catalogue that could not be counted is not a catalogue with nothing in it.

**Every read in the service layer is now bounded.** The dashboard's payload
stops growing with an artist's success: the panels get a page, the numbers get
one row.

## Apply and verify

```
supabase db push
```

Then, signed in as an artist with works recorded:

```sql
select * from public.dashboard_summary();
```

`works_total` should match:

```sql
select count(*) from public.artworks
 where artist_id = public.current_user_id()
    or uploaded_by = public.current_user_id();
```

If the dashboard shows an error after applying, that is `getDashboardTotals`
returning null — check the function exists and `authenticated` has execute.

## What is left

- **Finding 8, the caching decision.** Every other item was a defect with one
  correct answer. This one is a genuine choice: adopt TanStack Query (it wraps
  the existing service functions without rewriting them), or deliberately
  accept refetch-on-mount and write down why. It should not be decided by
  whoever touches the code next.
- **`bacground.png`, 2.2 MB**, on the auth page. Same treatment as the video —
  WebP should take it under 200 KB.
- **Four unreferenced images** in `src/assets/images/` (~4 MB). Repo size only,
  nothing imports them.
- **The CI migration gate.** Now load-bearing rather than nice-to-have, since
  finding 5 removed the ladders that used to absorb a behind database.
