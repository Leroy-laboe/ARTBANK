-- 0023 — What the buyer workspace needs the database to guarantee.
--
-- The buyer side (/collect) is the first surface that reads *other people's*
-- artworks in bulk, so the read rule that has been decorative until now
-- suddenly matters. Everything else the workspace uses already exists:
-- saved_artworks and interest_entries (0012), conversations and messages
-- (0014), public profiles (0021).
--
-- Safe to re-run.

-- ── Published no longer means visible ────────────────────────────────────
-- 0002 wrote "Public read access on published artworks" when `status` was the
-- only thing gating a row. 0017 then added `visibility` — "status is how
-- finished the record is; visibility is who may see it" — but left the policy
-- alone, so an artist who publishes a record and later sets it back to
-- Private (setArtworkVisibility in src/services/artwork.ts lets them, and
-- does not touch status) still has that row readable by anyone with the anon
-- key. The Discover feed filters on visibility in its query; that filter is
-- app-level and an artwork fetched by id would bypass it.
--
-- `unlisted` stays readable on purpose: that is the whole point of the Smart
-- Artwork Link (docs/pivot-checklist/19-feature-smart-artwork-link-qr.md) —
-- reachable by the link, absent from every listing. Keeping it out of the
-- listings is the query's job, not this policy's.
drop policy if exists "Public read access on published artworks" on public.artworks;
create policy "Public read access on published artworks"
  on public.artworks for select
  using (status = 'published' and visibility in ('public', 'unlisted'));

-- ── The one field the Buyer Intent Card asks for that 0012 has no column for ──
-- docs/pivot-checklist/20-feature-buyer-intent-card.md lists Role as required,
-- and 13-buyer-card.md repeats it as part of the identity an artist receives.
-- Name and Country come from the buyer's own public.users row; Organization,
-- Purpose, Budget, Intended use and Decision timeline all landed in 0012.
-- Role did not, so an enquiry could never say "Independent Collector" — the
-- exact phrasing the spec's own worked example uses.
alter table public.interest_entries add column if not exists viewer_role text;

comment on column public.interest_entries.viewer_role is
  'How the viewer described themselves when they filed this enquiry, e.g. "Independent Collector". Captured per enquiry rather than on the account, because the same person may write in as a curator one week and a private buyer the next.';

-- ── Reading a save list in one query ─────────────────────────────────────
-- Saved Works reads by buyer and orders by when it was saved; the primary key
-- leads with buyer_user_id, so the lookup is covered but the sort is not.
create index if not exists saved_artworks_buyer_saved_at_idx
  on public.saved_artworks (buyer_user_id, saved_at desc);

-- My Enquiries reads the same shape from the other table.
create index if not exists interest_entries_viewer_id_idx
  on public.interest_entries (viewer_id, created_at desc);
