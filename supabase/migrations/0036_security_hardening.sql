-- ─────────────────────────────────────────────────────────────────────────
-- 0036 — Security hardening from the end-to-end red-team pass
-- (docs/pivot-checklist/31-system-diagnosis-and-fix-plan.md).
--
-- Apply AFTER 0035_admin_functions.sql — this redefines is_admin() and
-- replaces functions that 0035's admin screens call.
--
-- Every statement is safe to re-run.
--
-- What this closes, in order of severity:
--   1. Account emails, is_minor flags and identity ids were readable by
--      anyone holding the public anon key (RLS filters rows, not columns, and
--      profile_visibility defaults to 'public').
--   2. A user could update any column of their own row — including is_minor
--      (switching off every guardian protection) and status (a suspended
--      account reactivating itself).
--   3. Suspension had no effect: current_user_id() ignored status, so a
--      suspended account kept every permission it had.
--   4. A conversation participant could re-point artist_id / buyer_id at
--      another account, and a minor who became one after a conversation
--      existed could keep messaging without a guardian.
--   5. A signed-in user could upload any file type, under any path, into the
--      public artwork-images bucket.
--   6. Integrity gaps: link visits accepted any row from anyone; deals and
--      interest entries could name artworks that aren't the caller's / the
--      artist's.
-- ─────────────────────────────────────────────────────────────────────────


-- ── 1. Suspension actually suspends ─────────────────────────────────────
-- Every client-facing policy keys on current_user_id(). Returning null for a
-- non-active account denies all of them at once. "Users can read their own
-- profile" keys on auth.uid() directly, so a suspended user can still load
-- their own row and be told why nothing else works.
create or replace function public.current_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.users where auth_user_id = auth.uid() and status = 'active'
$$;

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
       and status = 'active'
  )
$$;


-- ── 2. users: column-level privileges ───────────────────────────────────
-- A hidden contact address must never leave the database. contact_email is
-- derived from public_email and is null unless the artist chose to show it;
-- it is the column strangers get, public_email is not.
alter table public.users
  add column if not exists contact_email text
  generated always as (case when show_contact_information then public_email end) stored;

revoke select, insert, update, delete, truncate, references, trigger
  on public.users from anon, authenticated;

-- Readable by the client roles (still subject to the row policies below).
-- Deliberately absent: email, public_email, is_minor, status, auth_user_id,
-- jo1n_identity_id, collecting_interests, last_login_at, updated_at.
-- A column added to users later is NOT readable from the client until it is
-- added here — that default-deny is the point.
grant select (
  id, display_name, artist_name, avatar_url, cover_url,
  country, country_code, organization, nationality, website, contact_email,
  short_bio, artist_statement, mediums, years_active, education, awards,
  social_links, profile_handle, profile_visibility,
  show_contact_information, allow_enquiries, show_artwork_prices,
  role, created_at
) on public.users to anon, authenticated;

-- Writable by the account itself: the profile editor's fields and nothing
-- that controls the account (role, status, is_minor, email, identity ids).
grant update (
  display_name, avatar_url, cover_url, country, country_code, organization,
  collecting_interests, artist_name, nationality, website, public_email,
  short_bio, artist_statement, mediums, years_active, education, awards,
  social_links, profile_handle, profile_visibility,
  show_contact_information, allow_enquiries, show_artwork_prices, updated_at
) on public.users to authenticated;

-- Row visibility. Signed-out visitors see artists' public profiles — the
-- public directory is what they are for — not buyers', guardians' or
-- admins'. Signed-in accounts also see other non-admin public profiles,
-- because messages, deals and the interest ledger name the other party.
drop policy if exists "Anyone can read public profiles" on public.users;

drop policy if exists "Visitors read public artist profiles" on public.users;
create policy "Visitors read public artist profiles"
  on public.users for select
  to anon
  using (profile_visibility = 'public' and role = 'artist' and status = 'active');

drop policy if exists "Members read public profiles" on public.users;
create policy "Members read public profiles"
  on public.users for select
  to authenticated
  using (profile_visibility = 'public' and role <> 'admin' and status = 'active');


-- ── 3. The signed-in account's own full row ─────────────────────────────
-- The client can no longer select email / is_minor / status even on its own
-- row (a column privilege can't tell rows apart), so this returns it.
create or replace function public.my_profile()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(u) from public.users u where u.auth_user_id = auth.uid()
$$;

revoke all on function public.my_profile() from public, anon;
grant execute on function public.my_profile() to authenticated;


-- ── 4. Admin reads and writes of account-control columns ────────────────
create or replace function public.admin_list_users(p_query text default '', p_limit integer default 50)
returns table (
  id uuid,
  display_name text,
  artist_name text,
  email text,
  avatar_url text,
  role text,
  status text,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  pattern text;
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  pattern := '%' || replace(replace(replace(coalesce(trim(p_query), ''), '\', '\\'), '%', '\%'), '_', '\_') || '%';

  return query
    select u.id, u.display_name, u.artist_name, u.email, u.avatar_url, u.role, u.status, u.created_at
      from public.users u
     where coalesce(trim(p_query), '') = ''
        or u.display_name ilike pattern
        or u.artist_name  ilike pattern
        or u.email        ilike pattern
     order by u.created_at desc
     limit least(greatest(coalesce(p_limit, 50), 1), 200);
end;
$$;

create or replace function public.admin_user_emails(p_ids uuid[])
returns table (id uuid, email text)
language plpgsql
stable
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;

  return query
    select u.id, u.email from public.users u where u.id = any(p_ids);
end;
$$;

create or replace function public.admin_set_user_status(p_user_id uuid, p_status text)
returns table (id uuid)
language plpgsql
volatile
security definer
set search_path = public
as $$
#variable_conflict use_column
begin
  if not public.is_admin() then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_status not in ('active', 'suspended') then
    raise exception 'invalid_status' using errcode = '22023';
  end if;
  -- An admin suspending themselves would lock the portal with no way back in
  -- short of the SQL editor.
  if p_user_id = public.current_user_id() then
    raise exception 'cannot_change_own_status' using errcode = '42501';
  end if;

  return query
    update public.users u
       set status = p_status, updated_at = now()
     where u.id = p_user_id
    returning u.id;
end;
$$;

revoke all on function public.admin_list_users(text, integer) from public, anon;
revoke all on function public.admin_user_emails(uuid[]) from public, anon;
revoke all on function public.admin_set_user_status(uuid, text) from public, anon;
grant execute on function public.admin_list_users(text, integer) to authenticated;
grant execute on function public.admin_user_emails(uuid[]) to authenticated;
grant execute on function public.admin_set_user_status(uuid, text) to authenticated;


-- ── 5. Conversations and minors ─────────────────────────────────────────
-- The update policy lets a participant change the row as long as they stay
-- one side of it, which let them swap the *other* side for anyone.
create or replace function public.prevent_conversation_reassignment()
returns trigger
language plpgsql
as $$
begin
  if (new.artist_id is distinct from old.artist_id or new.buyer_id is distinct from old.buyer_id)
     and current_user in ('anon', 'authenticated') then
    raise exception 'conversation participants cannot be changed'
      using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

drop trigger if exists conversations_no_reassignment on public.conversations;
create trigger conversations_no_reassignment
  before update of artist_id, buyer_id on public.conversations
  for each row execute function public.prevent_conversation_reassignment();

-- enforce_guardian_routing checks a conversation when it is created. Someone
-- who becomes a minor afterwards (request_guardian_link sets is_minor) would
-- otherwise keep messaging in an unrouted conversation. Checked per message.
create or replace function public.enforce_minor_message_routing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  convo public.conversations%rowtype;
  involves_minor boolean;
begin
  select * into convo from public.conversations where id = new.conversation_id;

  select coalesce(bool_or(is_minor), false) into involves_minor
    from public.users
   where id in (convo.artist_id, convo.buyer_id);

  if involves_minor and convo.guardian_cc_id is null then
    raise exception
      'A conversation involving a minor needs a verified guardian before messages can be sent.'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists messages_minor_routing on public.messages;
create trigger messages_minor_routing
  before insert on public.messages
  for each row execute function public.enforce_minor_message_routing();


-- ── 6. Integrity of client-written rows ─────────────────────────────────
drop policy if exists "Anyone can record a link visit" on public.artwork_link_visits;
drop policy if exists "Anyone can record a visit to a visible artwork" on public.artwork_link_visits;
create policy "Anyone can record a visit to a visible artwork"
  on public.artwork_link_visits for insert
  with check (
    (viewer_id is null or viewer_id = public.current_user_id())
    and exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.status = 'published'
              or a.artist_id = public.current_user_id()
              or a.uploaded_by = public.current_user_id())
    )
  );

drop policy if exists "Artists record their own deals" on public.artwork_deals;
create policy "Artists record their own deals"
  on public.artwork_deals for insert
  to authenticated
  with check (
    artist_id = public.current_user_id()
    and (
      artwork_id is null
      or exists (
        select 1 from public.artworks a
         where a.id = artwork_id
           and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
      )
    )
  );

drop policy if exists "Viewers create their own interest entries" on public.interest_entries;
create policy "Viewers create their own interest entries"
  on public.interest_entries for insert
  to authenticated
  with check (
    viewer_id = public.current_user_id()
    and (
      artwork_id is null
      or exists (
        select 1 from public.artworks a
         where a.id = artwork_id
           and a.artist_id = interest_entries.artist_id
      )
    )
  );


-- ── 7. Storage: uploads only into your own artworks' folders ────────────
-- Paths are `${artworkId}/…` (artworkImages.ts). Admins upload for accountless
-- entrants, so is_admin() is allowed through as well.
drop policy if exists "Authenticated users can upload artwork images" on storage.objects;
drop policy if exists "Owners upload images for their own artworks" on storage.objects;
create policy "Owners upload images for their own artworks"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'artwork-images'
    and (
      public.is_admin()
      or exists (
        select 1 from public.artworks a
         where a.id = (storage.foldername(name))[1]
           and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
      )
    )
  );


-- Size and type limits enforced by Storage itself, matching what the upload
-- forms already accept (IMAGE_LIMITS, PROFILE_IMAGE_LIMITS, ADMIN_IMAGE_LIMITS
-- in src/). Client-side checks are a courtesy; these are the real limit.
update storage.buckets
   set file_size_limit = 20 * 1024 * 1024,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'artwork-images';

update storage.buckets
   set file_size_limit = 5 * 1024 * 1024,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
 where id = 'profile-images';

-- DOCUMENT_LIMITS in artworkDocuments.ts.
update storage.buckets
   set file_size_limit = 15 * 1024 * 1024,
       allowed_mime_types = array[
         'application/pdf',
         'image/jpeg', 'image/png', 'image/webp',
         'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
       ]
 where id = 'artwork-documents';


-- PostgREST caches privileges with the schema; without this the new column
-- grants and functions aren't visible to the API until its next restart.
notify pgrst, 'reload schema';
