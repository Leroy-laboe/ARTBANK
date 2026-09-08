-- 0028 — Private Viewing Rooms, artist side.
--
-- Implements docs/pivot-checklist/21-feature-private-viewing-room.md and the
-- schema in 25-database-schema-plan.md section 6. The buyer side has existed
-- since 0012 as a request (interest_entries.pipeline_stage = 'viewing_room')
-- — this is the other half: the artist actually curating and opening a room.
--
-- Safe to re-run.

create table if not exists public.viewing_rooms (
  id                      uuid primary key default gen_random_uuid(),
  artist_id               uuid not null references public.users(id) on delete cascade,
  title                   text not null,
  private_notes           text,
  price_visible           boolean not null default false,
  download_allowed        boolean not null default false,
  buyer_identity_required boolean not null default true,
  expires_at              timestamptz,
  created_at              timestamptz not null default now()
);

create index if not exists viewing_rooms_artist_id_idx on public.viewing_rooms (artist_id);

-- "One controlled link" (21-feature-private-viewing-room.md) — the room's own
-- id is that link (/rooms/:id). No separate slug: a uuid is unguessable
-- enough for a shared link and it's one less thing to generate and collide on.
create table if not exists public.viewing_room_artworks (
  viewing_room_id uuid not null references public.viewing_rooms(id) on delete cascade,
  artwork_id      text not null references public.artworks(id) on delete cascade,
  sort_order      int not null default 0,
  primary key (viewing_room_id, artwork_id)
);

create table if not exists public.viewing_room_access_log (
  id              uuid primary key default gen_random_uuid(),
  viewing_room_id uuid not null references public.viewing_rooms(id) on delete cascade,
  -- null when the room doesn't require identity and the visitor wasn't
  -- signed in. Still a real visit, just not an identified one.
  viewer_id       uuid references public.users(id) on delete set null,
  viewed_at       timestamptz not null default now()
);

create index if not exists viewing_room_access_log_room_idx
  on public.viewing_room_access_log (viewing_room_id, viewed_at desc);

alter table public.viewing_rooms             enable row level security;
alter table public.viewing_room_artworks     enable row level security;
alter table public.viewing_room_access_log   enable row level security;

-- The artist manages their own rooms directly — ordinary ownership, same
-- shape as artworks/interest_entries. No public select policy: a visitor
-- with the link goes through open_viewing_room() below instead, because an
-- open `select` policy would let anyone page through every artist's rooms
-- and private notes regardless of which id they actually asked for.
drop policy if exists "Artists manage their own viewing rooms" on public.viewing_rooms;
create policy "Artists manage their own viewing rooms"
  on public.viewing_rooms for all
  using (artist_id = public.current_user_id())
  with check (artist_id = public.current_user_id());

drop policy if exists "Artists manage their own room artworks" on public.viewing_room_artworks;
create policy "Artists manage their own room artworks"
  on public.viewing_room_artworks for all
  using (
    exists (
      select 1 from public.viewing_rooms r
       where r.id = viewing_room_id and r.artist_id = public.current_user_id()
    )
  )
  with check (
    exists (
      select 1 from public.viewing_rooms r
       where r.id = viewing_room_id and r.artist_id = public.current_user_id()
    )
  );

-- The artist reads who viewed their own rooms. Nobody else — a buyer should
-- never see who else was shown the same room.
drop policy if exists "Artists read their own room activity" on public.viewing_room_access_log;
create policy "Artists read their own room activity"
  on public.viewing_room_access_log for select
  using (
    exists (
      select 1 from public.viewing_rooms r
       where r.id = viewing_room_id and r.artist_id = public.current_user_id()
    )
  );

-- ── The public side of the link ──────────────────────────────────────────
-- Being included in a room is the authorization here, independent of the
-- artwork's own status/visibility — the whole point of a room is to show a
-- buyer something that isn't publicly published. Logs the visit in the same
-- call, except the artist's own preview, which isn't a "viewer".
create or replace function public.open_viewing_room(p_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  room   public.viewing_rooms%rowtype;
  me     uuid := public.current_user_id();
  result jsonb;
begin
  select * into room from public.viewing_rooms where id = p_room_id;

  if room.id is null then
    raise exception 'not_found';
  end if;

  if room.expires_at is not null and room.expires_at < now() then
    raise exception 'expired';
  end if;

  if room.buyer_identity_required and me is null then
    raise exception 'identity_required';
  end if;

  if me is distinct from room.artist_id then
    insert into public.viewing_room_access_log (viewing_room_id, viewer_id)
    values (room.id, me);
  end if;

  select jsonb_build_object(
    'id', room.id,
    'title', room.title,
    'privateNotes', room.private_notes,
    'priceVisible', room.price_visible,
    'downloadAllowed', room.download_allowed,
    'expiresAt', room.expires_at,
    'artistId', room.artist_id,
    'artistName', coalesce(nullif(u.artist_name, ''), nullif(u.display_name, ''), 'Artist'),
    'artistHandle', u.profile_handle,
    'artworks', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', a.id,
            'title', a.title,
            'medium', a.medium,
            'dimensions', a.dimensions,
            'year', a.year,
            'availability', a.availability,
            'imageUrl', coalesce(
              (
                select ai.url from public.artwork_images ai
                 where ai.artwork_id = a.id
                 order by ai.is_primary desc
                 limit 1
              ),
              a.image_url
            ),
            'price', case when room.price_visible then a.price else null end,
            'priceMax', case when room.price_visible then a.price_max else null end,
            'priceType', a.price_type,
            'currency', a.currency
          )
          order by vra.sort_order
        )
        from public.viewing_room_artworks vra
        join public.artworks a on a.id = vra.artwork_id
        where vra.viewing_room_id = room.id
      ),
      '[]'::jsonb
    )
  )
  into result
  from public.users u
  where u.id = room.artist_id;

  return result;
end;
$$;

-- Reachable by a fully signed-out visitor when the room doesn't require
-- identity, so this is the one function in the schema granted to `anon`.
grant execute on function public.open_viewing_room(uuid) to authenticated, anon;
