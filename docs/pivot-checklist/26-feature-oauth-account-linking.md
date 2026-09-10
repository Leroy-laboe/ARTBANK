# 26. Feature — Google Sign-In Without Duplicate Accounts

> Not sourced from the PDF directly — this is a production-hardening plan prompted by a direct question: is "Continue with Google" safe to add without splitting one person into two profiles?
> Status: **planning only** — no migration or code written yet. Part 1 is safe to build immediately regardless of the Google decision; Parts 2–4 depend on choosing to ship Google sign-in now.
> Depends on: [08-today-dashboard.md](08-today-dashboard.md)'s auth work (`0008_supabase_auth_login.sql` onward), [25-database-schema-plan.md](25-database-schema-plan.md) (`users` table)

## Current state (verified against the code, not assumed)

- The social buttons in `auth-switch.tsx` (Google, Facebook, X, LinkedIn) are `<a href="#">` — **decorative, not wired to anything.** No duplicate accounts have happened yet; this is a pre-emptive question, which is the right time to ask it.
- `public.users.email` is `text unique not null` (`0006_users_and_sessions.sql`), and is **stored and compared case-sensitively** — nothing normalizes it on insert.
- `handle_new_auth_user()` (`0032_guardian_signup_role.sql`, latest version) does:
  ```sql
  insert into public.users (auth_user_id, email, role)
  values (new.id, new.email, chosen_role)
  on conflict (auth_user_id) do nothing
  ```
  This only guards against the *same* `auth.users` row firing the trigger twice. It does nothing for a *different* `auth.users` row whose email already exists in `public.users` — that insert hits the `email` unique constraint and **raises an unhandled error inside the trigger**, which runs in the same transaction as the `auth.users` insert. Net effect: the second sign-in method doesn't get a friendly "email already in use" — it can break the insert into `auth.users` itself.
- Every place that already compares emails for a real person — `request_guardian_link`, guardian auto-claim on signup — does so via `lower(trim(...))`, because the guardian feature already ran into the same "same email, different casing" problem. The `users` table itself never got the same treatment. That's a live, if unlikely, latent bug today, independent of Google.
- No `/auth/callback` route exists in `src/App.tsx`. OAuth needs one.
- Whether two sign-in methods for the same email end up as **one** `auth.users` row or **two** is a **Supabase project setting** (Authentication → Sign In / Up → account linking), not application code. Getting this wrong in either direction is a real production risk:
  - **Off**: exactly the duplicate-profile problem you asked about.
  - **On, configured carelessly**: someone can potentially attach a Google identity to an account they don't own, if the existing account's email was never verified. This is the standard account-linking security tradeoff, not specific to this app — it has to be paired with requiring email confirmation.

## The fix, in four parts

### Part 1 — Harden the database layer (do this regardless of the Google decision)

This closes the actual bug above and is safe to ship on its own.

- [ ] Add a case-insensitive unique index so two casings of one email can never both exist:
  ```sql
  create unique index if not exists users_email_lower_idx on public.users (lower(email));
  -- then drop the case-sensitive `unique` on email itself, since the index above supersedes it
  ```
- [ ] Rewrite `handle_new_auth_user()` to upsert by **email**, not just `auth_user_id`, and to backfill `auth_user_id` onto an existing row rather than erroring:
  ```sql
  insert into public.users (auth_user_id, email, role)
  values (new.id, lower(trim(new.email)), chosen_role)
  on conflict (email) do update
    set auth_user_id = coalesce(public.users.auth_user_id, excluded.auth_user_id)
  where public.users.auth_user_id is null
  returning id into new_user_id;
  ```
  The `where ... is null` guard matters: if a row already has an `auth_user_id`, a second `auth.users` insert for the same email should never silently reassign ownership of that profile. That case shouldn't happen once Part 2 is configured correctly — this is the defensive fallback for if it ever does (a misconfigured setting, a future provider added carelessly), so it fails safe (does nothing, logs no ownership change) instead of failing loud (breaks sign-in) or failing dangerous (reassigns a profile).
- [ ] Confirm the guardian auto-claim block (already `lower()`-safe) still works unchanged against the new email storage.

### Part 2 — Configure identity linking (Supabase dashboard + Google Cloud Console, no app code)

- [ ] Google Cloud Console: create OAuth 2.0 credentials, add authorized redirect URI `https://<your-project-ref>.supabase.co/auth/v1/callback`.
- [ ] Supabase dashboard → Authentication → Providers → enable Google, paste the client ID/secret.
- [ ] Supabase dashboard → Authentication → Sign In / Up: **require email confirmation** for password sign-ups. This is the other half of the safety pair — automatic linking is only safe when a matching email has actually been proven owned by *someone*, not just typed into a form.
- [ ] Enable automatic linking for verified emails (exact toggle name varies by Supabase dashboard version — currently under the same Sign In / Up settings, sometimes labelled around "manual linking" / "identity linking"). With confirmation required, this makes both directions safe:
  - Manual signup (confirmed) → later "Continue with Google", same email → **same account**, new identity attached.
  - Google first → later manual signup attempt, same email → Supabase returns "already registered", surfaced as a normal sign-up error rather than a second profile.
- [ ] Register the production domain's redirect URL (`https://<your-vercel-domain>/auth/callback`) as an allowed redirect in Supabase Auth settings, plus `http://localhost:5173/auth/callback` for local dev.

### Part 3 — Application code

- [ ] `src/services/auth.ts` — add:
  ```ts
  export async function signInWithGoogle() {
    const client = requireSupabase();
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) throw error;
  }
  ```
- [ ] New route + page, `src/pages/AuthCallbackPage.tsx` at `/auth/callback` in `src/App.tsx` (outside `RequireAuth`, same reasoning as `/login`): waits for Supabase to finish the OAuth exchange (`onAuthStateChange` or `getSession`), then sends the user to the same `next`-aware destination `AuthPage` already computes.
- [ ] Wire the Google `<a href="#">` in `auth-switch.tsx` to a real `<button onClick={signInWithGoogle}>`. Leave Facebook/X/LinkedIn as they are — out of scope until asked for; wiring one provider doesn't obligate wiring all four, and each one is its own Cloud Console + dashboard setup.
- [ ] Surface Supabase's "already registered" error from a blocked manual signup as the plain-language message it already deserves ("That email already has an account — try signing in with Google instead"), rather than a raw Supabase error string, matching how `AuthPage.tsx` already catches and rewrites errors elsewhere.

### Part 4 — Verification (run this against a staging Supabase project before trusting it in production)

- [ ] Manual signup with email X (confirm it) → sign out → "Continue with Google" with the same email X → exactly one row in `public.users`, `auth.users` gained an identity, not a row.
- [ ] "Continue with Google" with a fresh email Y first → then try manual signup with the same email Y → rejected with a clear message, no second profile.
- [ ] Manual signup with `Person@Example.com`, then attempt manual signup again with `person@example.com` → rejected as a duplicate (this is the case-sensitivity bug from Part 1 — confirm the new index actually catches it).
- [ ] Manual signup, **never confirm the email**, then "Continue with Google" with the same address → confirm this still links safely (Google itself only ever reports verified addresses) rather than either erroring or creating a second row.
- [ ] Confirm the guardian invite-by-email flow (`request_guardian_link`, `handle_new_auth_user`'s auto-claim block) still fires correctly for both a manual and a Google-originated signup.

## Explicitly not doing right now

- **No backfill/merge tool for existing duplicate accounts.** Not needed — Google sign-in has never been live, so no real duplicates exist today. If a future provider is added carelessly and this ever does happen, that's a one-off admin SQL job against real data at the time, not code to maintain speculatively.
- **Facebook, X, LinkedIn** — same account-linking foundation covers them once Part 1 is in, but each needs its own provider setup and its own line in Part 4's verification pass. Treat as repeats of this same plan, not a bigger one.
- **Showing "linked sign-in methods" in account settings** — genuinely nice for a production product (so someone isn't confused about why their old password stopped being the only way in), but it's UX polish on top of a correct foundation, not a blocker for shipping this safely. Worth a follow-up ticket once Parts 1–4 are live.

## Suggested order

1. Part 1 (migration) — ship independently, fixes a real bug today, no product decision required.
2. Part 2 (dashboard/console config) — no app deploy needed, but nothing in Part 3 works without it.
3. Part 3 (code) + Part 4 (verification) together, against a staging Supabase project first.
4. Production deploy, then re-run the Part 4 checklist once against production's real Google OAuth credentials before announcing the button is live.
