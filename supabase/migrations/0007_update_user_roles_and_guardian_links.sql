-- Realign public.users.role with the brief's actual roles (Artist, Buyer,
-- Guardian, Partner, Admin) and add the profile fields the Buyer Card and
-- Guardian flows need. See docs/pivot-checklist/25-database-schema-plan.md.

alter table public.users drop constraint if exists users_role_check;

update public.users set role = 'buyer'   where role = 'collector';
update public.users set role = 'partner' where role = 'gallery';

alter table public.users alter column role set default 'buyer';

alter table public.users
  add constraint users_role_check
  check (role in ('artist', 'buyer', 'guardian', 'partner', 'admin'));

-- Buyer Card fields (docs/pivot-checklist/13-buyer-card.md) not covered by
-- the base profile.
alter table public.users add column if not exists country text;
alter table public.users add column if not exists organization text;
alter table public.users add column if not exists collecting_interests text[];

-- Drives Guardian routing in Messages (docs/pivot-checklist/15-messages.md):
-- a minor must never receive uncontrolled adult contact.
alter table public.users add column if not exists is_minor boolean not null default false;

-- Links a minor's account to whoever guards it. One active guardian per minor;
-- a guardian may cover more than one minor.
create table if not exists public.guardian_links (
  id                uuid primary key default gen_random_uuid(),
  guardian_user_id  uuid not null references public.users (id) on delete cascade,
  minor_user_id     uuid not null references public.users (id) on delete cascade unique,
  relationship      text,
  verified_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists guardian_links_guardian_user_id_idx
  on public.guardian_links (guardian_user_id);

-- Same posture as sessions/auth_flows: service-role only for now, no
-- permissive policies yet.
alter table public.guardian_links enable row level security;
