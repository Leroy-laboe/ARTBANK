-- ARTBANK accounts, linked to JO1N ID.
--
-- JO1N ID is the identity provider: it owns credentials, email verification,
-- password reset and MFA. This table is ARTBANK's *local profile* for an
-- identity, joined on jo1n_identity_id (the `sub` claim from JO1N ID).
-- Nothing here duplicates a credential — there is deliberately no password
-- column, because ARTBANK never sees a password.

create table if not exists public.users (
  id                uuid primary key default gen_random_uuid(),

  -- The `sub` claim from JO1N ID. The only link between the two systems.
  jo1n_identity_id  text unique not null,

  email             text unique not null,
  -- JO1N ID has no full_name on identities (userinfo falls back to email),
  -- so display names are ARTBANK's to own.
  display_name      text,
  avatar_url        text,

  role              text not null default 'collector'
                      check (role in ('collector', 'artist', 'gallery', 'admin')),
  status            text not null default 'active'
                      check (status in ('active', 'suspended', 'deleted')),

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_login_at     timestamptz
);

create index if not exists users_jo1n_identity_id_idx on public.users (jo1n_identity_id);

-- Server-side session store for the BFF. The browser only ever holds the
-- opaque `id` in an httpOnly cookie; JO1N's access and refresh tokens stay
-- here and never reach client-side JavaScript.
create table if not exists public.sessions (
  id                text primary key,
  user_id           uuid not null references public.users (id) on delete cascade,

  access_token      text not null,
  refresh_token     text,
  access_expires_at timestamptz not null,

  user_agent        text,
  ip                text,

  created_at        timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),
  expires_at        timestamptz not null,
  revoked_at        timestamptz
);

create index if not exists sessions_user_id_idx on public.sessions (user_id);
create index if not exists sessions_expires_at_idx on public.sessions (expires_at);

-- Transient state for an in-flight authorization-code exchange: the PKCE
-- verifier, CSRF `state` and OIDC `nonce`. Rows are single-use and short-lived.
create table if not exists public.auth_flows (
  state           text primary key,
  code_verifier   text not null,
  nonce           text not null,
  redirect_to     text,
  created_at      timestamptz not null default now(),
  expires_at      timestamptz not null
);

create index if not exists auth_flows_expires_at_idx on public.auth_flows (expires_at);

-- RLS on with no permissive policies: the anon key can reach none of these.
-- All access is through the API using the service-role key, which bypasses
-- RLS by design — authorization is enforced in the API layer.
alter table public.users      enable row level security;
alter table public.sessions   enable row level security;
alter table public.auth_flows enable row level security;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists users_set_updated_at on public.users;
create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();
