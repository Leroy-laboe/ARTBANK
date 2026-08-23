import { supabase } from '../lib/supabaseClient';
import { marketplaceArtworks } from './mockArtworks';
import type { Artwork } from '../types/artwork';

/** Reads the public marketplace grid.
 *
 *  Migration 0011 drops `price`, `currency`, `likes`, `verified` and
 *  `gradient` from public.artworks — the pivot removes all five. This file
 *  used to select them, so it would have started returning nothing the moment
 *  that migration ran. It now selects only columns that survive, and fills the
 *  gaps with neutral values so the public marketplace components (which still
 *  take the old `Artwork` shape) keep rendering while they're rewritten.
 *
 *  `image_url` is still read on purpose: 0011 keeps it, deprecated, precisely
 *  so this query doesn't break. The replacement is public.artwork_images. */

interface ArtworkRow {
  id: string;
  title: string;
  artist: string | null;
  artist_display_name: string | null;
  image_url: string | null;
}

function fromRow(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    // `artist` is being replaced by a real FK plus a display name; prefer the
    // new column and fall back while the backfill settles.
    artist: row.artist_display_name ?? row.artist ?? 'Unknown artist',
    // Removed by the pivot — price is never shown or set upfront, and likes
    // and the unexplained "verified" badge are on the do-not-build list.
    price: null,
    currency: 'USD',
    likes: 0,
    verified: false,
    gradient: '',
    imageUrl: row.image_url ?? undefined,
  };
}

export async function getMarketplaceArtworks(limit?: number): Promise<Artwork[]> {
  if (!supabase) return limit ? marketplaceArtworks.slice(0, limit) : marketplaceArtworks;

  let query = supabase
    .from('artworks')
    .select('id, title, artist, artist_display_name, image_url')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  // Falling back to the demo set keeps the homepage alive when the table
  // isn't reachable, rather than rendering an empty grid.
  if (error || !data) return limit ? marketplaceArtworks.slice(0, limit) : marketplaceArtworks;

  return data.map(fromRow);
}
