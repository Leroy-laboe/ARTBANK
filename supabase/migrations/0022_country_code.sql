-- 0022 — A real country code behind the flag on public profiles.
--
-- users.country has always been free text (the "Location" field took
-- anything typed, e.g. "Kuala Lumpur, Malaysia"), so nothing could reliably
-- show a flag next to it — a flag needs a known ISO code, not a guess parsed
-- out of a sentence. This adds that code, set only when the artist picks a
-- country from a real list (src/data/countries.ts) in Profile Details.
--
-- Safe to re-run.

alter table public.users add column if not exists country_code text;

-- ISO 3166-1 alpha-2, lowercase to match flagcdn.com's URL convention
-- directly with no case conversion at render time.
alter table public.users drop constraint if exists users_country_code_check;
alter table public.users add constraint users_country_code_check
  check (country_code is null or country_code ~ '^[a-z]{2}$');
