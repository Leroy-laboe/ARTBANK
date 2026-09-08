-- 0029 — Lets an artist see who saved their own work.
--
-- "Buyer Save List" (staff brief, practical features #9): "What Artist
-- Sees: Notification that an identified buyer saved a work." 0012 gave
-- saved_artworks exactly one policy — the buyer manages their own list —
-- so an artist reading it always got zero rows, indistinguishable from
-- nobody having saved anything. interest.ts has said so explicitly since
-- this session's earlier work; this is what closes that gap.
--
-- Same shape as "Artists read their own link visits" (0015): joined through
-- artworks, checking artist_id or uploaded_by, select-only — an artist can
-- see who saved their work, never touch the buyer's list itself.
--
-- Safe to re-run.

drop policy if exists "Artists read who saved their own artworks" on public.saved_artworks;
create policy "Artists read who saved their own artworks"
  on public.saved_artworks for select
  using (
    exists (
      select 1 from public.artworks a
       where a.id = artwork_id
         and (a.artist_id = public.current_user_id() or a.uploaded_by = public.current_user_id())
    )
  );
