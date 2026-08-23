-- 0018 — Metadata the Add Artwork image step records for each file.
--
-- Backs step 2 (Images) of docs/pivot-checklist/10-add-artwork.md.
--
-- Safe to re-run.

-- What the image shows. The first upload defaults to the cover; the rest are
-- labelled by the artist so a buyer can tell a detail shot from the front.
alter table public.artwork_images add column if not exists role text not null default 'detail';
alter table public.artwork_images drop constraint if exists artwork_images_role_check;
alter table public.artwork_images add constraint artwork_images_role_check
  check (role in ('cover', 'front', 'back', 'side', 'detail', 'framed', 'in_situ', 'signature'));

-- Kept so the artist recognises their own files in the list, and so an
-- orphaned storage object can be traced back to its row.
alter table public.artwork_images add column if not exists file_name text;
alter table public.artwork_images add column if not exists file_size bigint;

-- The object path inside the storage bucket. `url` is the public URL, which
-- is what gets rendered; this is what has to be removed on delete.
alter table public.artwork_images add column if not exists storage_path text;

create index if not exists artwork_images_position_idx
  on public.artwork_images (artwork_id, position);

-- Existing rows were mirrored from artworks.image_url and are the cover.
update public.artwork_images set role = 'cover' where is_primary and role = 'detail';
