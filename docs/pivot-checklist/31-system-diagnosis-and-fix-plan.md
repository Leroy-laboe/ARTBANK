# 31 — System diagnosis and fix plan (red-team pass)

Status: diagnosis complete 2026-09-15. Code fixes implemented in the working
tree; **one database migration still has to be applied by hand** before the
fixes are live (see "Before anyone red-teams the deployed site").

Written for whoever owns the system and whoever maintains it. It records what
was tested, what was wrong, what was fixed, and what is still open — including
the things that could not be checked from the repository.

---

## How the system was examined

- **Security review of the source.** Every Supabase migration (RLS policies,
  grants, `security definer` functions, triggers, storage buckets), the auth
  guards, redirect handling, the Fastify OIDC server in `server/`, secrets in
  the repo and its git history, and the deploy config.
- **One live probe, anonymous only.** Using nothing but the public anon key
  that ships in the site's JavaScript — exactly what an attacker has — the
  table endpoints were counted, never dumped. That confirmed the user-table
  exposure below. Further reads of production data were stopped by a
  permission gate and not attempted again; everything after that was
  established from the migrations, which are the source of truth for access.
- **A crawl of the production build** (`vite build` + `vite preview`) with a
  real browser: all public routes at 1440px and 390px, console and page
  errors, failed requests, every internal link, signed-out access to every
  gated area, and an automated accessibility audit (axe-core, WCAG 2.1 AA).
- **Verification with the production CSP enforced**, so the new headers are
  proven not to break the site before they ship.

**Not examined:** the signed-in workspaces (ArtSpace, Collect, Admin,
Guardian) were not clicked through, because there was no test account for
each role; and the Supabase project's dashboard settings, which don't live in
the repo. Both are on the list below.

---

## Findings and status

Severity is what a red-team would assign. "Fixed — needs migration" means the
code is written but does nothing until `0036_security_hardening.sql` is
applied.

### Critical

| # | Finding | Status |
|---|---|---|
| C1 | **Any visitor could read every account's email, `is_minor` flag and identity ids.** RLS filters rows, not columns; the public-profile policy allowed `select *` on any row with `profile_visibility = 'public'`, which is the default. The live probe confirmed all 25 user rows were readable with the anon key. | Fixed — needs migration. Column-level privileges; hidden contact emails replaced by a generated `contact_email`; own profile via `my_profile()`; admin reads via `admin_list_users()` / `admin_user_emails()`. |
| C2 | **A minor could switch off every guardian protection, and a suspended account could reactivate itself.** "Users can update their own profile" covered every column; the trigger only blocked `role`. One `PATCH` setting `is_minor = false` removed guardian routing. | Fixed — needs migration. Update privilege limited to the profile editor's columns. |

### High

| # | Finding | Status |
|---|---|---|
| H1 | Suspension did nothing. `current_user_id()` ignored `status`, so a suspended account kept every permission. | Fixed — needs migration. `current_user_id()` and `is_admin()` require `status = 'active'`; suspension now goes through `admin_set_user_status()`, which also blocks self-suspension. |
| H2 | A conversation participant could re-point `artist_id` / `buyer_id` at another account. | Fixed — needs migration (trigger). |
| H3 | Someone who became a minor after a conversation existed could keep messaging without a guardian — routing was only checked when a conversation was created. | Fixed — needs migration (per-message trigger). |
| H4 | Any signed-in user could upload any file type, of any size, under any path, into the public `artwork-images` bucket. | Fixed — needs migration. Uploads only into your own artworks' folders; bucket size and MIME limits match the upload forms. |
| H5 | No security headers: no CSP, HSTS, framing protection, `nosniff`, referrer or permissions policy. | Fixed in `vercel.json`. The CSP was verified against the production build — see Verification. |
| H6 | Auth guards failed **open** in production: a build with Supabase env vars missing, or with `VITE_ARTSPACE_OPEN` set, rendered ArtSpace and the Admin portal to signed-out visitors. | Fixed. The escape hatch is development-only; a production build fails closed. |
| H7 | Open redirect in the OIDC server: `/auth/login?redirect_to=@evil.com` became `https://app@evil.com` after login. | Fixed. The server is not used by the current SPA, but the flaw is gone either way. |

### Medium

| # | Finding | Status |
|---|---|---|
| M1 | Login's `?next=` check let `/\evil.com` through (browsers treat it as protocol-relative). | Fixed — parsed against a placeholder origin. |
| M2 | **All ten footer links on every page were `href="#"`**, and the newsletter form's submit handler only called `preventDefault()` — it took an email address and sent it nowhere. | Fixed. Real routes only; the fake form replaced by a sign-up link. |
| M3 | "How It Works" in the main nav, the footer and the homepage led to a "Coming Soon" placeholder. | Fixed. A real page, built only from features that exist. |
| M4 | Mistyped or dead URLs rendered "Coming Soon" and were indexable. | Fixed. A real 404 page, `noindex`. |
| M5 | No error boundary: any render error — including the common "stale chunk after a new deploy" — left a blank white page. | Fixed. |
| M6 | Every URL reported the same title and description; no `robots.txt`, no social preview tags. | Fixed. Per-route titles, descriptions and robots directives; private areas and invite links `noindex`. |
| M7 | WCAG AA colour contrast failed on 279 elements across 13 public pages (worst: `--gold-dark` on `--gold-bg`, `--muted` on the page ground and in the footer). | Fixed. Two tokens darkened a step, footer and light-ground text retargeted, Tailwind gold aligned. |
| M8 | Unlabelled `<select>`s on `/artists` (axe: critical); no `<h1>` on `/pricing`, `/login`, `/register`; a scrollable gallery unreachable by keyboard. | Fixed. |
| M9 | For Buyers artwork cards sent every signed-out visitor to a login wall. | Fixed. Signed-out visitors open the public artwork link. |
| M10 | A dead image (blocked by the browser) on For Buyers and nine demo spots. | Fixed. |
| M11 | Link-visit analytics accepted forged rows from anyone; deals and interest entries could name artworks that weren't the artist's. | Fixed — needs migration. |
| M12 | The public artwork link read the artwork before the session settled, so signed-in visitors saw the signed-out view and were logged as anonymous. This was also the site's one lint warning. | Fixed. |
| M13 | **`/artists` presented invented figures and false claims as real**: category counts (Painters 4,258), career-stage counts, follower counts on example profiles, "Trending Styles" counts, and a "Verified Creators" badge over stock photographs. Its intro search box, "Advanced Search" button and "View all" link did nothing. The brief's own completion test forbids fake statistics and requires demo content to be labelled. | Fixed. Figures and dead controls removed, verification claim removed, example profiles labelled as examples. |

---

## Before anyone red-teams the deployed site

These are the steps that turn the fixes above into what an outside tester
actually sees. In order.

> **Migrate before you deploy — not after.** The new frontend reads the
> `contact_email` column and calls `my_profile()`, `admin_list_users()`,
> `admin_user_emails()` and `admin_set_user_status()`, none of which exist
> until 0036 runs. Deploy the frontend first and the Artists directory,
> public profiles, sign-in's profile load and the Admin users screen all fail.
> This was confirmed against the production build before the migration was
> applied: the directory query returned HTTP 400. The app deliberately has no
> fallback for a database that is behind (see finding 5 in doc 27).

1. **Apply the migrations** in the Supabase SQL editor: `0035_admin_functions.sql`
   first (if not already applied), then `0036_security_hardening.sql`. Both are
   safe to re-run.
2. **Confirm the leak is closed**, from any machine, with only the anon key
   (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`):
   ```
   curl "$VITE_SUPABASE_URL/rest/v1/users?select=email,is_minor&limit=1" \
     -H "apikey: $VITE_SUPABASE_ANON_KEY"
   ```
   Expected: an error `permission denied for column email` (HTTP 401/403), not
   rows. `?select=display_name,profile_handle&limit=1` should still work — the
   public directory depends on it.
3. **Deploy**, then check the headers: `curl -sI https://<your-domain>/` must
   show `content-security-policy`, `strict-transport-security` and
   `x-frame-options`.
4. **Sign in once per role** (artist, buyer, guardian, admin) on the deployed
   site and open the main screens — the profile loader, admin directory and
   suspension now use new database functions, so a missed migration shows up
   here immediately.
5. **Supabase dashboard settings** — none of these are in the repo, and a
   red-team will probe them: enable leaked-password protection; require email
   confirmation; restrict Auth redirect URLs to the production domain; set
   sign-up and OTP rate limits; enable MFA for admin accounts.

---

## Still open — the plan

Ordered by priority. None of these were fixed in this pass; each says why.

### P1 — before the review

- **O1 — Audit the signed-in workspaces end to end.** This pass crawled the
  public site and verified that every gated route redirects a signed-out
  visitor; it did not click through ArtSpace, Collect, Admin or Guardian as a
  signed-in user. Needs one test account per role. Most of the product lives
  there, so it is where a thorough reviewer will spend their time.
- **O2 — The Supabase settings in step 5 above**, confirmed rather than
  assumed.

### P2 — soon after

- **O3 — Server-side enforcement of private artwork fields.** An artist who
  turns Show Artwork Prices off still has `price` readable through the API;
  `coa_rejection_reason` (the admin's note to the artist) is readable on
  published artworks; `unlisted` artworks can be listed, not only opened by
  link. The users-table fix (column privileges) doesn't fit here — the owner's
  own screens select those columns directly — so the right shape is a
  public-artwork read function that applies the artist's settings, with the
  base table's public policy narrowed. Touches the buyer, public profile and
  smart-link services.
- **O4 — Relationship-scoped visibility for buyer profiles.** Signed-in
  accounts can list other non-admin public profiles (display name, country,
  organisation). Signed-out visitors now see artists only. The fuller fix
  scopes buyer rows to people they have a conversation, deal or enquiry with.
- **O5 — Rate limits on anonymous writes.** Link visits are now validated but
  not throttled; Postgres policies can't rate-limit. Supabase's API rate
  limits or an edge function are the place for it.

- **O5a — The example artist grid on `/artists`.** It is now labelled, and its
  invented numbers are gone, but it is still eight made-up people with stock
  portraits sitting beside the real directory, and its sort control offers
  "Most Followed" — a popularity ordering the guardrails rule out. The clean
  end state is the real directory alone once there are enough real public
  profiles to fill it; that is a product decision rather than a bug fix.

### P3 — housekeeping

- **O6 — Uniform guardian-link response.** `request_guardian_link()` raises
  `guardian_not_found` for an unknown email, which reveals whether an address
  has an account.
- **O7 — First-load JavaScript** is ~181KB gzipped. Lazy-loading the auth
  card and splitting the animation library would bring it down.
- **O8 — The Fastify server in `server/`** isn't used by the SPA (sign-in is
  Supabase Auth). Decide whether it stays; if it does, it needs rate limiting
  and security headers of its own.
- **O9 — `/archive`, `/articon`, `/academy`** still render placeholders. They
  are unlinked and `noindex`, so no visitor meets them by navigation.

---

## Verification

Run against the production build (`vite build` + `vite preview`) with the
exact `Content-Security-Policy` from `vercel.json` enforced on every document,
at 1440px, plus 390px for overflow. Pages: `/`, `/artists`, `/for-buyers`,
`/how-it-works`, `/pricing`, `/login`, `/register`, `/terms`, `/privacy` and a
nonexistent URL.

| Check | Before | After |
| --- | --- | --- |
| CSP violations caused by the app | CSP absent | **0** |
| axe serious/critical issues (WCAG 2.1 AA) | colour contrast on 279 elements across 13 pages, unlabelled selects, inaccessible scroll region | **0** on every page |
| Pages without an `<h1>` | 3 | **0** |
| Distinct page titles | 1 for every URL | **one per route**; 404 `noindex` |
| `href="#"` links | 11 (footer ×10, Trending Styles ×1) | **0** |
| Nonexistent URL | "Coming Soon", indexable | **404 page**, `noindex` |
| For Buyers card, signed out | login wall | **public artwork page** |
| Horizontal overflow at 390px | 0 | 0 |
| JavaScript page errors | 0 | 0 |
| `npm run lint` | 1 warning | **0** |
| `npm run typecheck` (app + server) | pass | pass |

Two things the verification run caught that code review alone had not:

- **The CSP blocked Google Fonts.** The font stylesheet is fetched under
  `connect-src`, which didn't list `fonts.googleapis.com`. Shipping the header
  as first written would have silently dropped the site's typefaces in
  production.
- **Tailwind text colours never applied to links.** `a { color: inherit }` in
  `globals.css` was unlayered, and unlayered CSS beats Tailwind's layered
  utilities regardless of specificity — the pricing page's white-on-gold
  button rendered body-brown on gold (1.81:1). The element resets now sit in
  `@layer base`.

**Expected failure until the migration runs:** `/artists` requests
`contact_email`, which 0036 creates — HTTP 400 against a database without it.
This is the reason for the "migrate before you deploy" rule above.

**Not verified here, by design:** the database changes in 0036 are written and
reviewed but were not executed — production access was out of bounds for this
pass. Step 2 of "Before anyone red-teams the deployed site" is how to confirm
them once applied.
