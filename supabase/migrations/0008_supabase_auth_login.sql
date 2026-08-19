-- Lets people log in through Supabase's own email/password auth as an
-- interim path while JO1N ID (id.jo1n.com) isn't live yet.
--
-- This is additive, not a replacement: the JO1N OIDC flow in server/ is
-- untouched and remains the primary path once JO1N ID is up. A public.users
-- row can now be linked via EITHER jo1n_identity_id (JO1N ID) OR
-- auth_user_id (Supabase Auth) — at least one must be set.

alter table public.users
  alter column jo1n_identity_id drop not null;

alter table public.users
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete cascade;

alter table public.users drop constraint if exists users_identity_link_check;
alter table public.users
  add constraint users_identity_link_check
  check (jo1n_identity_id is not null or auth_user_id is not null);

-- Unlike the JO1N/BFF path — service-role only, authorization enforced in
-- server/ — Supabase Auth users call Supabase directly from the browser
-- with their own JWT, so they need policies to reach their own row at all.
drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile"
  on public.users for select
  using (auth.uid() = auth_user_id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Auto-creates the local profile row the moment someone signs up through
-- Supabase Auth, mirroring what upsertUserFromIdentity() does for JO1N ID
-- in server/src/db.ts. Role is intentionally always 'buyer' here — there is
-- no Artist/Buyer/Guardian/Partner picker in the UI yet to trust instead.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (auth_user_id, email, display_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'display_name',
    'buyer'
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();
