-- 0021 — The columns the profile editor collects.
--
-- Backs docs/pivot-checklist/16-public-profile-access.md. The editor asked for
-- an artist name, website, bio, nationality, statement, mediums, education,
-- awards, social links and visibility settings; public.users had none of them,
-- so most of that screen had nowhere to save to and quietly discarded what was
-- typed into it.
--
-- Safe to re-run.

-- ── Identity and presentation ────────────────────────────────────────────
-- Distinct from display_name: an artist may exhibit under a name that isn't
-- the one on their account.
alter table public.users add column if not exists artist_name text;
alter table public.users add column if not exists nationality text;
alter table public.users add column if not exists website text;

-- Separate from `email`, which is the account address and never public. This
-- is the address the artist chooses to publish, if any.
alter table public.users add column if not exists public_email text;

alter table public.users add column if not exists short_bio text;
alter table public.users add column if not exists artist_statement text;
alter table public.users add column if not exists cover_url text;

comment on column public.users.public_email is
  'Address the artist chose to show publicly. Never assume users.email may be displayed — that is the account address.';

-- ── Credentials ──────────────────────────────────────────────────────────
alter table public.users add column if not exists mediums text[] not null default '{}';
alter table public.users add column if not exists years_active text;
alter table public.users add column if not exists education text;
alter table public.users add column if not exists awards text;

-- ── Social links ─────────────────────────────────────────────────────────
-- One jsonb rather than a column per network: the set grows (the brief names
-- Instagram, Threads and RedNote for source tracking alone), and none of it is
-- ever queried — it is presentation only.
alter table public.users add column if not exists social_links jsonb not null default '{}'::jsonb;

comment on column public.users.social_links is
  'Presentation only, shape {platform_id: url}. Spec 16 orders the public profile Contact first, Follow second, social links third — these are the third rank.';

-- ── The public handle ────────────────────────────────────────────────────
-- What /artists/{handle} resolves to. Unique, but nullable so an account
-- without one is simply not reachable by a public URL yet.
alter table public.users add column if not exists profile_handle text;

create unique index if not exists users_profile_handle_key
  on public.users (lower(profile_handle))
  where profile_handle is not null;

-- ── Visibility ───────────────────────────────────────────────────────────
alter table public.users add column if not exists profile_visibility text not null default 'public';
alter table public.users drop constraint if exists users_profile_visibility_check;
alter table public.users add constraint users_profile_visibility_check
  check (profile_visibility in ('public', 'members', 'private'));

-- Publishing a contact address is opt-in, like every other disclosure in this
-- system. Enquiries default on because reaching the artist is the point of the
-- platform, and they arrive through ARTBANK rather than exposing an address.
alter table public.users add column if not exists show_contact_information boolean not null default false;
alter table public.users add column if not exists allow_enquiries boolean not null default true;
alter table public.users add column if not exists show_artwork_prices boolean not null default false;

-- ── Featured artworks ────────────────────────────────────────────────────
-- Position rather than a boolean, so the artist controls the order. null means
-- not featured.
alter table public.artworks add column if not exists featured_position integer;

create index if not exists artworks_featured_idx
  on public.artworks (artist_id, featured_position)
  where featured_position is not null;

-- ── Reading someone else's public profile ────────────────────────────────
-- 0008 let a user read only their own row. A public profile nobody else can
-- read is not public, so allow reading the rows that opted into it.
--
-- This is a row-level grant: it exposes the whole row to anyone. The columns
-- above are all artist-authored public presentation, but `email`, `role` and
-- `is_minor` are not — so the public profile page must select only the public
-- columns explicitly, and the app does. Tightening this to column-level grants
-- is the follow-up if this table ever gains something more sensitive.
drop policy if exists "Anyone can read public profiles" on public.users;
create policy "Anyone can read public profiles"
  on public.users for select
  using (profile_visibility = 'public');

-- ── Storage: profile images ──────────────────────────────────────────────
-- Public, like artwork-images: an avatar that only its owner can load is not
-- an avatar. Writes are scoped to the owner's own folder, {user_id}/...
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read access on profile-images" on storage.objects;
create policy "Public read access on profile-images"
  on storage.objects for select
  using (bucket_id = 'profile-images');

drop policy if exists "Users manage their own profile images" on storage.objects;
create policy "Users manage their own profile images"
  on storage.objects for all
  to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  )
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = public.current_user_id()::text
  );

-- ── Following an artist ──────────────────────────────────────────────────
-- Spec 16 orders the public profile Contact first, Follow second. There was
-- no table behind "Follow" anywhere — the Interest ledger's Followers tab is
-- still reading a demo array, and this is what will replace it.
--
-- Following is an identified act by design: there is no anonymous follow, so
-- an artist always knows who is on this list.
create table if not exists public.profile_follows (
  follower_id uuid not null references public.users(id) on delete cascade,
  artist_id   uuid not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, artist_id),
  -- Following yourself is not a thing.
  constraint profile_follows_not_self check (follower_id <> artist_id)
);

create index if not exists profile_follows_artist_idx
  on public.profile_follows (artist_id, created_at);

alter table public.profile_follows enable row level security;

drop policy if exists "Users manage their own follows" on public.profile_follows;
create policy "Users manage their own follows"
  on public.profile_follows for all
  to authenticated
  using (follower_id = public.current_user_id())
  with check (follower_id = public.current_user_id());

-- The artist sees who follows them. Read-only: they cannot remove a follower
-- through this policy, only the follower can unfollow.
drop policy if exists "Artists read their own followers" on public.profile_follows;
create policy "Artists read their own followers"
  on public.profile_follows for select
  to authenticated
  using (artist_id = public.current_user_id());
