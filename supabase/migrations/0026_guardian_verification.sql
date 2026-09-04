-- 0026 — Guardian verification: turn guardian_links from "any row exists"
-- into an approval the guardian actually gave.
--
-- guardian_links (0007) has RLS enabled but no policies — service-role only,
-- by design. That stays true here: every read and write goes through one of
-- the narrow functions below rather than a table policy, so nobody can point
-- their own row at someone else's minor account by editing it directly.
--
-- Safe to re-run.

-- ── 1. A minor names their guardian ──────────────────────────────────────
-- Creates (or replaces) the caller's own link, unverified, and marks them as
-- a minor immediately. That's the actual safety edge: is_minor flips true the
-- moment a guardian is requested, not once approved, so the messaging trigger
-- below already blocks uncontrolled contact from this point on.
create or replace function public.request_guardian_link(guardian_email text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me     uuid := public.current_user_id();
  target uuid;
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  select id into target from public.users where lower(email) = lower(guardian_email);

  if target is null then
    raise exception 'guardian_not_found';
  end if;

  if target = me then
    raise exception 'cannot_link_self';
  end if;

  insert into public.guardian_links (guardian_user_id, minor_user_id, verified_at)
  values (target, me, null)
  on conflict (minor_user_id) do update
    set guardian_user_id = excluded.guardian_user_id,
        verified_at = null,
        created_at = now();

  update public.users set is_minor = true where id = me;
end;
$$;

-- ── 2. The guardian approves ─────────────────────────────────────────────
-- Only the named guardian can approve their own row, and only once — a
-- second call is a no-op rather than an error, so a double-click is harmless.
create or replace function public.approve_guardian_link(target_minor_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  me uuid := public.current_user_id();
begin
  if me is null then
    raise exception 'not_signed_in';
  end if;

  update public.guardian_links
     set verified_at = now()
   where minor_user_id = target_minor_id
     and guardian_user_id = me
     and verified_at is null;
end;
$$;

-- ── 3. What the minor sees about their own link ──────────────────────────
create or replace function public.my_guardian_link()
returns table (
  guardian_name text,
  guardian_email text,
  verified_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(u.display_name, u.email), u.email, g.verified_at, g.created_at
    from public.guardian_links g
    join public.users u on u.id = g.guardian_user_id
   where g.minor_user_id = public.current_user_id();
$$;

-- ── 4. What a guardian sees: everyone who has named them ─────────────────
create or replace function public.my_guardian_requests()
returns table (
  minor_id uuid,
  minor_name text,
  minor_email text,
  verified_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select u.id, coalesce(u.display_name, u.email), u.email, g.verified_at, g.created_at
    from public.guardian_links g
    join public.users u on u.id = g.minor_user_id
   where g.guardian_user_id = public.current_user_id()
   order by g.verified_at nulls first, g.created_at desc;
$$;

grant execute on function public.request_guardian_link(text) to authenticated;
grant execute on function public.approve_guardian_link(uuid) to authenticated;
grant execute on function public.my_guardian_link() to authenticated;
grant execute on function public.my_guardian_requests() to authenticated;

-- ── 5. The actual fix: require an approved link, not just a linked row ──
-- Before this, ANY guardian_links row — requested but never approved — was
-- enough to let a conversation involving a minor through. That defeats the
-- point of asking the guardian at all.
create or replace function public.enforce_guardian_routing()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  artist_is_minor boolean;
  buyer_is_minor  boolean;
begin
  select is_minor into artist_is_minor from public.users where id = new.artist_id;
  select is_minor into buyer_is_minor  from public.users where id = new.buyer_id;

  if coalesce(artist_is_minor, false) or coalesce(buyer_is_minor, false) then
    if new.guardian_cc_id is null then
      raise exception
        'A conversation involving a minor requires guardian_cc_id (guardian routing is mandatory).'
        using errcode = 'check_violation';
    end if;

    -- The named guardian must actually be a *verified* guardian of the minor
    -- in question — an unapproved request doesn't count, and neither does any
    -- other account.
    if not exists (
      select 1
        from public.guardian_links g
       where g.guardian_user_id = new.guardian_cc_id
         and g.verified_at is not null
         and g.minor_user_id in (
           case when coalesce(artist_is_minor, false) then new.artist_id end,
           case when coalesce(buyer_is_minor,  false) then new.buyer_id  end
         )
    ) then
      raise exception
        'guardian_cc_id is not a verified guardian of the minor in this conversation.'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;
