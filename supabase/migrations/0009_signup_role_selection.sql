-- The sign-up form now asks "Artist / Creator" vs "Buyer / Organization"
-- (see auth-switch.tsx) and passes it through as user_metadata.role. This
-- replaces the hardcoded 'buyer' from 0008 with that real choice, falling
-- back to 'buyer' if it's ever missing or not one of the two offered options.
--
-- display_name is no longer set at signup either: the form asks only for
-- email, password and role, because JO1N ID owns profile data once it's live
-- and collecting a name here would create a second source of truth. The row
-- starts with a null display_name and gets filled in later.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  chosen_role text := new.raw_user_meta_data ->> 'role';
begin
  if chosen_role is null or chosen_role not in ('artist', 'buyer') then
    chosen_role := 'buyer';
  end if;

  insert into public.users (auth_user_id, email, role)
  values (new.id, new.email, chosen_role)
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;
