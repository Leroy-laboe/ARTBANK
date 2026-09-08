import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Private Viewing Rooms — the artist's half.
 *  docs/pivot-checklist/21-feature-private-viewing-room.md: the artist
 *  selects works and creates one controlled link; the buyer sees a curated
 *  presentation instead of public browsing. Requires migration 0028.
 *
 *  Ownership (create/edit/list/activity) goes through ordinary table RLS —
 *  same shape as artworks. Only the public link (openViewingRoom, below)
 *  needs the security-definer function, because that's the one path where
 *  someone other than the owner legitimately reads the row. */

export type ViewingRoomSummary = {
  id: string;
  title: string;
  artworkCount: number;
  viewCount: number;
  expiresAt: string | null;
  isExpired: boolean;
  createdAt: string;
};

export type ViewingRoomSettings = {
  title: string;
  privateNotes: string;
  priceVisible: boolean;
  downloadAllowed: boolean;
  buyerIdentityRequired: boolean;
  /** null means open-ended. */
  expiresAt: string | null;
};

export type ViewingRoomVisit = {
  id: string;
  viewerName: string | null;
  viewedAt: string;
};

export type ViewingRoomDetail = ViewingRoomSettings & {
  id: string;
  artworkIds: string[];
  visits: ViewingRoomVisit[];
};

function isExpired(expiresAt: string | null): boolean {
  return expiresAt != null && new Date(expiresAt).getTime() < Date.now();
}

/** The artist's own rooms, newest first. */
export async function listMyViewingRooms(profile: Profile | null): Promise<ViewingRoomSummary[]> {
  if (!supabase || !profile) return [];

  const { data, error } = await supabase
    .from('viewing_rooms')
    .select('id, title, expires_at, created_at, viewing_room_artworks(artwork_id), viewing_room_access_log(id)')
    .eq('artist_id', profile.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  type Row = {
    id: string;
    title: string;
    expires_at: string | null;
    created_at: string;
    viewing_room_artworks: { artwork_id: string }[] | null;
    viewing_room_access_log: { id: string }[] | null;
  };

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    title: row.title,
    artworkCount: (row.viewing_room_artworks ?? []).length,
    viewCount: (row.viewing_room_access_log ?? []).length,
    expiresAt: row.expires_at,
    isExpired: isExpired(row.expires_at),
    createdAt: row.created_at,
  }));
}

/** One room, with enough to both edit it and show its activity. Null when it
 *  doesn't exist or isn't this artist's — the two look the same from here,
 *  which is correct: RLS already decided that, this just can't tell which. */
export async function getViewingRoom(
  profile: Profile | null,
  id: string,
): Promise<ViewingRoomDetail | null> {
  if (!supabase || !profile) return null;

  const { data, error } = await supabase
    .from('viewing_rooms')
    .select(
      `id, title, private_notes, price_visible, download_allowed, buyer_identity_required,
       expires_at, viewing_room_artworks(artwork_id),
       viewing_room_access_log(id, viewed_at, users(display_name, artist_name))`,
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;

  type Row = {
    id: string;
    title: string;
    private_notes: string | null;
    price_visible: boolean;
    download_allowed: boolean;
    buyer_identity_required: boolean;
    expires_at: string | null;
    viewing_room_artworks: { artwork_id: string }[] | null;
    viewing_room_access_log:
      | { id: string; viewed_at: string; users: { display_name: string | null; artist_name: string | null } | null }[]
      | null;
  };

  const row = data as unknown as Row;

  return {
    id: row.id,
    title: row.title,
    privateNotes: row.private_notes ?? '',
    priceVisible: row.price_visible,
    downloadAllowed: row.download_allowed,
    buyerIdentityRequired: row.buyer_identity_required,
    expiresAt: row.expires_at,
    artworkIds: (row.viewing_room_artworks ?? []).map((a) => a.artwork_id),
    visits: (row.viewing_room_access_log ?? [])
      .map((v) => ({
        id: v.id,
        viewerName: v.users?.artist_name?.trim() || v.users?.display_name?.trim() || null,
        viewedAt: v.viewed_at,
      }))
      .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()),
  };
}

/** Creates a room and its artwork list in one call. Returns the new id so the
 *  caller can navigate straight to the link. */
export async function createViewingRoom(
  profile: Profile,
  settings: ViewingRoomSettings,
  artworkIds: string[],
): Promise<string> {
  if (!supabase) throw new Error('No database is configured.');

  const { data, error } = await supabase
    .from('viewing_rooms')
    .insert({
      artist_id: profile.id,
      title: settings.title,
      private_notes: settings.privateNotes || null,
      price_visible: settings.priceVisible,
      download_allowed: settings.downloadAllowed,
      buyer_identity_required: settings.buyerIdentityRequired,
      expires_at: settings.expiresAt,
    })
    .select('id')
    .single();

  if (error || !data) throw error ?? new Error('Could not create the room.');
  const roomId = (data as { id: string }).id;

  if (artworkIds.length > 0) {
    const { error: artworksError } = await supabase.from('viewing_room_artworks').insert(
      artworkIds.map((artwork_id, index) => ({
        viewing_room_id: roomId,
        artwork_id,
        sort_order: index,
      })),
    );
    if (artworksError) throw artworksError;
  }

  return roomId;
}

/** Replaces both the settings and the artwork list — simpler and just as
 *  correct as diffing for a list this size, and it can't drift out of sync
 *  with what the form actually shows. */
export async function updateViewingRoom(
  id: string,
  settings: ViewingRoomSettings,
  artworkIds: string[],
): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');

  const { error } = await supabase
    .from('viewing_rooms')
    .update({
      title: settings.title,
      private_notes: settings.privateNotes || null,
      price_visible: settings.priceVisible,
      download_allowed: settings.downloadAllowed,
      buyer_identity_required: settings.buyerIdentityRequired,
      expires_at: settings.expiresAt,
    })
    .eq('id', id);
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from('viewing_room_artworks')
    .delete()
    .eq('viewing_room_id', id);
  if (deleteError) throw deleteError;

  if (artworkIds.length > 0) {
    const { error: insertError } = await supabase.from('viewing_room_artworks').insert(
      artworkIds.map((artwork_id, index) => ({
        viewing_room_id: id,
        artwork_id,
        sort_order: index,
      })),
    );
    if (insertError) throw insertError;
  }
}

/** Ends access immediately rather than deleting the room — the activity log
 *  (and the room itself, for the artist's own reference) survives. */
export async function closeViewingRoomNow(id: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('viewing_rooms')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteViewingRoom(id: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase.from('viewing_rooms').delete().eq('id', id);
  if (error) throw error;
}

/* ── The public side of the link ──────────────────────────────────────── */

export type PublicRoomArtwork = {
  id: string;
  title: string;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  availability: string;
  imageUrl: string;
  priceLabel: string;
};

export type PublicViewingRoom = {
  id: string;
  title: string;
  privateNotes: string | null;
  downloadAllowed: boolean;
  artistId: string;
  artistName: string;
  artistHandle: string | null;
  artworks: PublicRoomArtwork[];
};

export type ViewingRoomAccessCode = 'not_found' | 'expired' | 'identity_required' | 'unavailable';

export class ViewingRoomAccessError extends Error {
  code: ViewingRoomAccessCode;
  constructor(code: ViewingRoomAccessCode) {
    super(code);
    this.code = code;
  }
}

const availabilityLabel: Record<string, string> = {
  available: 'Available',
  on_view: 'On View',
  reserved: 'Reserved',
  sold: 'Sold',
  licensing_available: 'Licensing Available',
  unavailable: 'Unavailable',
};

type RawRoomArtwork = {
  id: string;
  title: string;
  medium: string | null;
  dimensions: string | null;
  year: number | null;
  availability: string;
  imageUrl: string;
  price: number | string | null;
  priceMax: number | string | null;
  priceType: string;
  currency: string | null;
};

type RawPublicRoom = {
  id: string;
  title: string;
  privateNotes: string | null;
  priceVisible: boolean;
  downloadAllowed: boolean;
  artistId: string;
  artistName: string;
  artistHandle: string | null;
  artworks: RawRoomArtwork[];
};

/** The server already nulls price/priceMax out when the room hides prices —
 *  this only decides the label's shape from what actually came back. */
function priceLabelFor(a: RawRoomArtwork): string {
  if (a.priceType === 'on_request') return 'Price on request';
  const currency = a.currency ?? 'USD';
  const money = (v: number) => `${currency} ${Math.round(v).toLocaleString('en-US')}`;

  if (a.priceType === 'range' && a.price != null && a.priceMax != null) {
    return `${money(Number(a.price))} – ${money(Number(a.priceMax))}`;
  }
  if (a.price != null) return money(Number(a.price));
  return 'Price on request';
}

/** Opens a room by id — the one thing about this feature a signed-out
 *  visitor can do. Throws ViewingRoomAccessError so the page can tell "this
 *  link doesn't exist", "it expired" and "sign in to continue" apart, rather
 *  than showing one generic failure for all three. */
export async function openViewingRoom(roomId: string): Promise<PublicViewingRoom> {
  if (!supabase) throw new ViewingRoomAccessError('unavailable');

  const { data, error } = await supabase.rpc('open_viewing_room', { p_room_id: roomId });

  if (error) {
    if (error.message === 'not_found' || error.message === 'expired' || error.message === 'identity_required') {
      throw new ViewingRoomAccessError(error.message);
    }
    throw new ViewingRoomAccessError('unavailable');
  }

  const raw = data as RawPublicRoom;

  return {
    id: raw.id,
    title: raw.title,
    privateNotes: raw.privateNotes,
    downloadAllowed: raw.downloadAllowed,
    artistId: raw.artistId,
    artistName: raw.artistName,
    artistHandle: raw.artistHandle,
    artworks: raw.artworks.map((a) => ({
      id: a.id,
      title: a.title,
      medium: a.medium,
      dimensions: a.dimensions,
      year: a.year,
      availability: availabilityLabel[a.availability] ?? 'Unavailable',
      imageUrl: a.imageUrl,
      priceLabel: priceLabelFor(a),
    })),
  };
}
