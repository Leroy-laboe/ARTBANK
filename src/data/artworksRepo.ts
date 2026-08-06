import { supabase } from '../lib/supabaseClient';
import { marketplaceArtworks } from './mockArtworks';
import type { Artwork } from '../types/artwork';

interface ArtworkRow {
  id: string;
  title: string;
  artist: string;
  price: number | null;
  currency: string;
  likes: number;
  verified: boolean;
  gradient: string;
  image_url: string | null;
}

function fromRow(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    price: row.price,
    currency: row.currency,
    likes: row.likes,
    verified: row.verified,
    gradient: row.gradient,
    imageUrl: row.image_url ?? undefined,
  };
}

export async function getMarketplaceArtworks(limit?: number): Promise<Artwork[]> {
  if (!supabase) return limit ? marketplaceArtworks.slice(0, limit) : marketplaceArtworks;

  let query = supabase
    .from('artworks')
    .select('id, title, artist, price, currency, likes, verified, gradient, image_url')
    .order('created_at', { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;

  if (error || !data) return marketplaceArtworks;

  return data.map(fromRow);
}
