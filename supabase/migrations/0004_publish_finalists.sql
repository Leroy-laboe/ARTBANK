-- Make the finalist artworks visible on the public marketplace. Prices weren't
-- provided per-piece, so they publish as "Price on request" until priced individually.
update public.artworks
set status = 'published'
where id like 'finalist-%';
