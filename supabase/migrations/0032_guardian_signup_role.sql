-- 0032 — 'guardian' becomes a real signup choice, not just a role a
-- database row could hold.
--
-- users.role has allowed 'guardian' since 0007, and the original brief
-- names it as one of four account types (Artist · Buyer · Guardian ·
-- Partner) — but handle_new_auth_user() only ever accepted 'artist' or
-- 'buyer', silently downgrading anything else to 'buyer'. That was fine
-- while nothing in the UI ever sent 'guardian'; auth-switch.tsx now does.
--
-- Safe to re-run.

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
  if chosen_role is null or chosen_role not in ('artist', 'buyer', 'guardian') then
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
