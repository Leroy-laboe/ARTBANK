-- 0035 — Admin Portal: schema and RLS for the four functions in
-- docs/pivot-checklist/29-feature-admin-functions.md.
--
-- Nothing before this migration lets `role = 'admin'` reach another user's
-- rows: every policy in 0001–0034 is scoped to "yours" (artist_id/uploaded_by/
-- flagged_by/auth.uid()). This adds the admin-wide read/write those four
-- screens need, plus the two columns the schema plan never had a use for
-- until now (a COA rejection reason, and somewhere for a flag's resolution to
-- live).
--
-- Safe to re-run.

-- ── Helper: is the caller an admin? ──────────────────────────────────────
-- Mirrors current_user_id() (0011) — one place for the lookup, called as
-- `(select public.is_admin())` in policies per 0033's InitPlan rewrite, so
-- it evaluates once per query rather than once per row.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
     where auth_user_id = auth.uid()
       and role = 'admin'
  )
$$;

comment on function public.is_admin() is
  'True when the authenticated caller''s public.users row has role = admin.';

-- ── artworks: a rejection reason worth having ────────────────────────────
-- docs/pivot-checklist/29's function #3 flags this explicitly: "sent back
-- with no reason is a bad artist experience," but nothing before this
-- migration had anywhere to put one. Cleared on approval, overwritten on
-- each new rejection — it reflects the current review, not a history of
-- every past one.
alter table public.artworks add column if not exists coa_rejection_reason text;

-- ── conversation_flags: what happens after the flag ──────────────────────
-- 0014 created the flag itself (who, what action, why) but nothing tracked
-- what admin did about it — function #4's whole gap. 'open' is every
-- existing row's real state: none of them have been looked at yet.
alter table public.conversation_flags
  add column if not exists status text not null default 'open';
alter table public.conversation_flags
  drop constraint if exists conversation_flags_status_check;
alter table public.conversation_flags
  add constraint conversation_flags_status_check
  check (status in ('open', 'dismissed', 'escalated'));

alter table public.conversation_flags add column if not exists resolved_by uuid references public.users(id);
alter table public.conversation_flags add column if not exists resolved_at timestamptz;

create index if not exists conversation_flags_status_idx on public.conversation_flags (status);

-- ── artworks: admin sees and edits every row ─────────────────────────────
-- Needed for both function #1 (an admin who didn't create an unclaimed
-- upload still has to be able to link it — the existing "Artists manage
-- their own artworks" policy only covers artist_id/uploaded_by = self) and
-- function #3 (a COA request can sit on a draft, private record the public
-- read policy in 0023 would otherwise hide from admin entirely).
drop policy if exists "Admins manage all artworks" on public.artworks;
create policy "Admins manage all artworks"
  on public.artworks for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ── artwork_images / artwork_evidence_files: admin reads every file ──────
-- The existing artwork_images policy only shows published rows or your own;
-- artwork_evidence_files had no non-owner read path at all (0015: "Evidence
-- is private to the artist"). A COA review needs both regardless of who
-- uploaded them.
drop policy if exists "Admins read all artwork images" on public.artwork_images;
create policy "Admins read all artwork images"
  on public.artwork_images for select
  using ((select public.is_admin()));

drop policy if exists "Admins read all evidence files" on public.artwork_evidence_files;
create policy "Admins read all evidence files"
  on public.artwork_evidence_files for select
  using ((select public.is_admin()));

-- ── conversations / messages / conversation_flags: admin reads and resolves ──
-- 0014 scoped every one of these to "a participant" (artist_id, buyer_id,
-- guardian_cc_id, flagged_by). Reviewing a report means reading a
-- conversation admin is not part of, and resolving it means updating a flag
-- admin didn't raise.
drop policy if exists "Admins read all conversations" on public.conversations;
create policy "Admins read all conversations"
  on public.conversations for select
  using ((select public.is_admin()));

drop policy if exists "Admins read all messages" on public.messages;
create policy "Admins read all messages"
  on public.messages for select
  using ((select public.is_admin()));

drop policy if exists "Admins manage all conversation flags" on public.conversation_flags;
create policy "Admins manage all conversation flags"
  on public.conversation_flags for all
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ── users: admin can search the directory ────────────────────────────────
-- 0008 scoped reads to "your own row" (auth.uid() = auth_user_id). Function
-- #2's manual search, and every embedded users(...) join a flagged
-- conversation's artist/buyer names come through, both need admin to read
-- rows that aren't their own.
drop policy if exists "Admins read all users" on public.users;
create policy "Admins read all users"
  on public.users for select
  using ((select public.is_admin()));

-- ── storage: admin can open a private evidence file ──────────────────────
-- artwork-documents (0020) is a private bucket; createSignedUrl still checks
-- a select policy against storage.objects, and the existing policy is
-- ownership-scoped the same way the table's own RLS was before this
-- migration.
drop policy if exists "Admins read all artwork documents" on storage.objects;
create policy "Admins read all artwork documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'artwork-documents' and (select public.is_admin()));

-- ── users: close the self-promotion gap this migration would otherwise open ──
-- 0008's "Users can update their own profile" policy checks *row* ownership
-- (auth.uid() = auth_user_id) but never restricts *which columns* an owner
-- may change. That was harmless while `role` only ever meant
-- artist/buyer/guardian/partner — now that it also means "can reach every
-- other user's data", any authenticated account could call the REST API
-- directly and set its own role to admin, with no UI involved at all.
--
-- auth.role() reads the Postgres role PostgREST authenticated the request
-- as: 'anon' or 'authenticated' for anything that came through the client
-- library with a JWT, 'service_role' for the service-role key, and neither
-- for a direct connection (SQL editor, psql, the CLI) — which runs as the
-- connecting Postgres user instead. So this blocks the client path
-- specifically, while leaving the SQL editor as the one place `role` can
-- still be set — which is exactly how a first admin account should be
-- created: by someone with real database access, not a browser request.
create or replace function public.prevent_client_role_change()
returns trigger
language plpgsql
as $$
begin
  if new.role is distinct from old.role and auth.role() = 'authenticated' then
    raise exception 'role cannot be changed from the client — use the Supabase SQL editor.'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_client_role_change on public.users;
create trigger prevent_client_role_change
  before update of role on public.users
  for each row execute function public.prevent_client_role_change();
