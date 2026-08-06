-- Not every artwork should be publicly listed the moment it's added (e.g. competition
-- entries waiting on a price, or artist submissions waiting on admin approval).
alter table public.artworks
  alter column price drop not null;

alter table public.artworks
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'pending', 'published'));

-- Enforce visibility at the DB level so the public/anon key can never see
-- unpublished rows, regardless of what the app's query looks like.
drop policy if exists "Public read access on artworks" on public.artworks;

create policy "Public read access on published artworks"
  on public.artworks for select
  using (status = 'published');
