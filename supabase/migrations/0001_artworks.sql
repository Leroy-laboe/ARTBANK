-- Artwork records
create table if not exists public.artworks (
  id text primary key,
  title text not null,
  artist text not null,
  price numeric not null,
  currency text not null default 'RM',
  likes integer not null default 0,
  verified boolean not null default false,
  gradient text not null default '',
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.artworks enable row level security;

create policy "Public read access on artworks"
  on public.artworks for select
  using (true);

-- Storage bucket for the actual image files (served via Supabase's CDN)
insert into storage.buckets (id, name, public)
values ('artwork-images', 'artwork-images', true)
on conflict (id) do nothing;

create policy "Public read access on artwork-images"
  on storage.objects for select
  using (bucket_id = 'artwork-images');

-- Seed with the same rows currently hardcoded in src/data/mockArtworks.ts,
-- so switching the frontend over to Supabase doesn't change what's shown.
insert into public.artworks (id, title, artist, price, currency, likes, verified, gradient) values
  ('art-1', 'Silent Harmony', 'Wei Lun Khor', 12800, 'RM', 238, true, 'linear-gradient(150deg, #efe9df 0%, #cfc4b0 100%)'),
  ('art-2', 'Golden Echo', 'Ahmad Zaki', 9600, 'RM', 176, true, 'linear-gradient(150deg, #e0a542 0%, #7a4a2a 55%, #1c1712 100%)'),
  ('art-3', 'Eternal Flow', 'Chong Fei', 15000, 'RM', 312, true, 'linear-gradient(150deg, #c81d3f 0%, #7e1027 65%, #2c0a12 100%)'),
  ('art-4', 'Morning Mist', 'Liew Tuck Seng', 6800, 'RM', 189, true, 'linear-gradient(150deg, #cfe3e8 0%, #7fa3ac 50%, #37525c 100%)')
on conflict (id) do nothing;
