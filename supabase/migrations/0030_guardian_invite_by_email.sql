-- 0030 — A guardian no longer needs an ArtBank account to be named.
--
-- 0026's request_guardian_link() required the guardian to already have an
-- account, or refused outright. That gets the real-world flow backwards: a
-- guardian is, by definition, usually someone who has never touched ArtBank
-- yet. This makes the invite stand on the email alone, and claims it
-- automatically the moment that email actually signs up — no email
-- infrastructure needed, because telling the guardian to go sign up is
-- already a real conversation happening outside the app.
--
-- Safe to re-run.

alter table public.guardian_links alter column guardian_user_id drop not null;
alter table public.guardian_links add column if not exists guardian_email text;

-- Backfill for any row created under 0026, where guardian_user_id was
-- always resolved before the row could exist at all.
update public.guardian_links g
   set guardian_email = u.email
  from public.users u
 where u.id = g.guardian_user_id
   and g.guardian_email is null;

alter table public.guardian_links alter column guardian_email set not null;

-- ── 1. Naming a guardian never fails on "they don't have an account" ────
create or replace function public.request_guardian_link(guardian_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me     uuid := public.current_user_id();
  target uuid;
  clean_email text := lower(trim(guardian_email));
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  select id into target from public.users where lower(email) = clean_email;

  if target = me then
    raise exception 'cannot_link_self';
  end if;

  -- target is null here whenever nobody has signed up with that email yet —
  -- the row is still created, just unresolved until they do.
  insert into public.guardian_links (guardian_user_id, guardian_email, minor_user_id, verified_at)
  values (target, clean_email, me, null)
  on conflict (minor_user_id) do update
    set guardian_user_id = excluded.guardian_user_id,
        guardian_email = excluded.guardian_email,
        verified_at = null,
        created_at = now();

  update public.users set is_minor = true where id = me;
end;
$$;

-- ── 2. Claim any pending invite the moment that email signs up ──────────
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text := new.raw_user_meta_data ->> 'role';
  new_user_id uuid;
begin
  if chosen_role is null or chosen_role not in ('artist', 'buyer') then
    chosen_role := 'buyer';
  end if;

  insert into public.users (auth_user_id, email, role)
  values (new.id, new.email, chosen_role)
  on conflict (auth_user_id) do nothing
  returning id into new_user_id;

  if new_user_id is not null then
    update public.guardian_links
       set guardian_user_id = new_user_id
     where guardian_user_id is null
       and lower(guardian_email) = lower(new.email);
  end if;

  return new;
end;
$$;

-- ── 3. The minor's own view needs to tell "invited" from "linked" ───────
-- CREATE OR REPLACE can't change a function's return columns, only its
-- body — has_account is a new column, so the old signature has to go first.
drop function if exists public.my_guardian_link();

create or replace function public.my_guardian_link()
returns table (
  guardian_name text,
  guardian_email text,
  has_account boolean,
  verified_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    coalesce(nullif(u.artist_name, ''), nullif(u.display_name, '')),
    g.guardian_email,
    (g.guardian_user_id is not null),
    g.verified_at,
    g.created_at
    from public.guardian_links g
    left join public.users u on u.id = g.guardian_user_id
   where g.minor_user_id = public.current_user_id();
$$;
