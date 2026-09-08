-- 0027 — Two follow-ups from finishing guardian verification (0026).
--
-- Safe to re-run.

-- ── 1. opportunity_applications had the same unverified-row gap ─────────
-- "Guardians manage their minor's applications" (0013) matched on ANY
-- guardian_links row, same as the messaging trigger used to. It's worse
-- there: it's a `for all` policy (select/insert/update/delete), so before
-- this fix, anyone a minor named as guardian had full control over that
-- minor's applications the instant the request was sent — no approval
-- needed. 0026 is what makes that reachable at all (nothing could create a
-- guardian_links row before it), so this closes the door 0026 opened.
drop policy if exists "Guardians manage their minor's applications" on public.opportunity_applications;
create policy "Guardians manage their minor's applications"
  on public.opportunity_applications for all
  using (
    exists (
      select 1 from public.guardian_links g
       where g.minor_user_id = artist_id
         and g.guardian_user_id = public.current_user_id()
         and g.verified_at is not null
    )
  )
  with check (
    exists (
      select 1 from public.guardian_links g
       where g.minor_user_id = artist_id
         and g.guardian_user_id = public.current_user_id()
         and g.verified_at is not null
    )
  );

-- ── 2. Wire the guardian into an actual conversation ─────────────────────
-- Before this, nothing ever set conversations.guardian_cc_id, so the
-- messaging trigger's minor check could only ever fail closed — a verified
-- guardian didn't make messaging work, because nothing attached them.
--
-- Callable only by one of the two people actually forming the conversation,
-- so it can't be used as a general "is this account a minor" oracle over
-- arbitrary id pairs.
create or replace function public.resolve_guardian_cc(p_artist_id uuid, p_buyer_id uuid)
returns uuid
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  me uuid := public.current_user_id();
  buyer_is_minor  boolean;
  artist_is_minor boolean;
  cc uuid;
begin
  if me is null or (me <> p_artist_id and me <> p_buyer_id) then
    raise exception 'not_a_party';
  end if;

  select is_minor into buyer_is_minor  from public.users where id = p_buyer_id;
  select is_minor into artist_is_minor from public.users where id = p_artist_id;

  if coalesce(buyer_is_minor, false) then
    select guardian_user_id into cc from public.guardian_links
     where minor_user_id = p_buyer_id and verified_at is not null;
  end if;

  if cc is null and coalesce(artist_is_minor, false) then
    select guardian_user_id into cc from public.guardian_links
     where minor_user_id = p_artist_id and verified_at is not null;
  end if;

  return cc;
end;
$$;

grant execute on function public.resolve_guardian_cc(uuid, uuid) to authenticated;
