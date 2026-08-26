import { supabase } from '../lib/supabaseClient';
import { rowToProfile, PUBLIC_PROFILE_COLUMNS, PUBLIC_PROFILE_COLUMNS_PRE_0022 } from './profile';
import type { Profile } from '../types/user';

/** What a visitor to /artists/{handle} can do: follow, and make contact.
 *
 *  Both require identifying yourself. That is the brief's rule, not a
 *  limitation — identity disclosure before serious access is the whole point
 *  of the interest ledger (docs/pivot-checklist/12-interest-ledger.md), and
 *  there is deliberately no anonymous follow. */

export type PublicArtistSummary = {
  handle: string;
  name: string;
  avatarUrl: string | null;
  country: string | null;
  /** ISO alpha-2, lowercase — only set once the artist chose a country from
   *  the real list rather than typing free text. See migration 0022. */
  countryCode: string | null;
  mediums: string[];
  followers: number;
};

/** Real, publicly-visible artist accounts — what the Artists directory shows
 *  alongside its mock showcase entries. Only rows with a chosen handle and
 *  `profile_visibility: 'public'` are reachable, matching the RLS policy in
 *  migration 0021.
 *
 *  Sorted alphabetically, not by followers or any other figure — the brief
 *  bans a public artist ranking (docs/pivot-checklist/17-do-not-build-guardrails.md),
 *  and ordering by a popularity number would read as exactly that.
 *
 *  Falls back to the pre-0022 column list on error (missing country_code):
 *  without this, every artist who already has a working public profile would
 *  drop out of the directory the moment that column was added, not because
 *  anything about their profile changed. */
export async function listPublicArtists(limit = 24): Promise<PublicArtistSummary[]> {
  const client = supabase;
  if (!client) return [];

  // select() has to come first — the filter methods below only exist on the
  // builder it returns, so the columns can't be swapped in afterwards.
  const query = (columns: string) =>
    client
      .from('users')
      .select(columns)
      .eq('profile_visibility', 'public')
      .eq('role', 'artist')
      .not('profile_handle', 'is', null)
      .limit(limit);

  const full = await query(PUBLIC_PROFILE_COLUMNS);
  let data = full.data;
  if (full.error) {
    const fallback = await query(PUBLIC_PROFILE_COLUMNS_PRE_0022);
    if (fallback.error || !fallback.data) return [];
    data = fallback.data;
  }

  if (!data) return [];

  const profiles = (data as unknown as Record<string, unknown>[]).map(rowToProfile);

  const summaries = await Promise.all(
    profiles.map(async (p): Promise<PublicArtistSummary | null> => {
      if (!p.profileHandle) return null;
      return {
        handle: p.profileHandle,
        name: p.artistName?.trim() || p.displayName?.trim() || 'Artist',
        avatarUrl: p.avatarUrl,
        country: p.country,
        countryCode: p.countryCode,
        mediums: p.mediums,
        followers: await getFollowerCount(p.id),
      };
    }),
  );

  return summaries
    .filter((s): s is PublicArtistSummary => s !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type FeaturedWork = {
  id: string;
  title: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  imageUrl: string;
  price: number | null;
  currency: string;
  availability: string;
};

/** The artist's featured works, in the order they chose.
 *
 *  Public and published only. `price` is returned but the page shows it only
 *  when the artist turned Show Artwork Prices on. */
export async function getFeaturedWorks(artistId: string): Promise<FeaturedWork[]> {
  const client = supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('artworks')
    .select(
      'id, title, year, medium, dimensions, image_url, price, currency, availability, featured_position, artwork_images(url, is_primary)',
    )
    .eq('artist_id', artistId)
    .eq('status', 'published')
    .eq('visibility', 'public')
    .not('featured_position', 'is', null)
    .order('featured_position', { ascending: true });

  if (error || !data) return [];

  type Row = {
    id: string;
    title: string;
    year: number | null;
    medium: string | null;
    dimensions: string | null;
    image_url: string | null;
    price: number | string | null;
    currency: string | null;
    availability: string;
    artwork_images: { url: string; is_primary: boolean }[] | null;
  };

  return (data as unknown as Row[]).map((row) => {
    const images = row.artwork_images ?? [];
    return {
      id: row.id,
      title: row.title,
      year: row.year,
      medium: row.medium,
      dimensions: row.dimensions,
      imageUrl: images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? row.image_url ?? '',
      price: row.price === null ? null : Number(row.price),
      currency: row.currency ?? 'USD',
      availability: row.availability,
    };
  });
}

export async function getFollowerCount(artistId: string): Promise<number> {
  const client = supabase;
  if (!client) return 0;
  const { count } = await client
    .from('profile_follows')
    .select('follower_id', { count: 'exact', head: true })
    .eq('artist_id', artistId);
  return count ?? 0;
}

export async function isFollowing(artistId: string, viewer: Profile): Promise<boolean> {
  const client = supabase;
  if (!client) return false;
  const { data } = await client
    .from('profile_follows')
    .select('artist_id')
    .eq('artist_id', artistId)
    .eq('follower_id', viewer.id)
    .maybeSingle();
  return Boolean(data);
}

export async function setFollowing(
  artistId: string,
  viewer: Profile,
  following: boolean,
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured.');

  if (following) {
    const { error } = await client
      .from('profile_follows')
      .upsert({ artist_id: artistId, follower_id: viewer.id });
    if (error) throw error;
    return;
  }

  const { error } = await client
    .from('profile_follows')
    .delete()
    .eq('artist_id', artistId)
    .eq('follower_id', viewer.id);
  if (error) throw error;
}

export type ContactInput = {
  purpose: 'purchase' | 'licence' | 'exhibit' | 'commission' | 'collaborate';
  message: string;
  organization: string | null;
  artworkId: string | null;
};

/** Records an enquiry against the artist's interest ledger.
 *
 *  Always `is_identified: true` — a visitor who has signed in and pressed
 *  Contact has identified themselves, and the ledger's whole distinction rests
 *  on that flag being honest. */
export async function sendEnquiry(
  artistId: string,
  viewer: Profile,
  input: ContactInput,
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be sent yet.');

  const { error } = await client.from('interest_entries').insert({
    artist_id: artistId,
    artwork_id: input.artworkId,
    viewer_id: viewer.id,
    is_identified: true,
    identity_sharing_consent: true,
    purpose: input.purpose,
    message: input.message,
    organization: input.organization,
    pipeline_stage: 'enquiry',
    source: 'profile',
  });

  if (error) throw error;
}
