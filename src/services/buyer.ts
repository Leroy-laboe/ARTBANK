import { supabase } from '../lib/supabaseClient';
import { PAGE_SIZE, toPaged } from './pagination';
import {
  buyerEnquiries as demoEnquiries,
  demoArtworkDetail,
  discoverArtworks as demoArtworks,
  intentPurposes,
  savedArtworks as demoSaved,
  type BuyerArtwork,
  type BuyerArtworkDetail,
  type BuyerAvailability,
  type BuyerEnquiry,
  type BuyerPassport,
  type EnquiryStatus,
  type IntentPurpose,
} from '../data/buyerContent';
import { isSettled } from './deals';
import type { Profile } from '../types/user';

/** Everything the buyer workspace at /collect reads and writes.
 *
 *  Four tables, all of which already existed for the artist's side: artworks
 *  (0011/0017/0019/0020), saved_artworks and interest_entries (0012), and
 *  conversations (0014). Nothing here is a buyer-only mirror of artist data —
 *  an enquiry the buyer files *is* the row the artist's Interest Ledger reads,
 *  which is why the two sides can never disagree about what was asked.
 *
 *  Same fallback contract as the rest of src/services: with no Supabase
 *  project, no session, or nothing published yet, reads return the demo set
 *  from src/data/buyerContent.ts with `isDemo: true` so a screen can say so
 *  rather than pass it off as real. Writes never fall back — they throw, since
 *  quietly "succeeding" at an enquiry nobody receives is the one failure this
 *  product cannot afford.
 *
 *  Requires migration 0023 for the tightened published-artwork read policy. */

/* ── Vocabulary ─────────────────────────────────────────────────────────── */

const availabilityLabel: Record<string, BuyerAvailability> = {
  available: 'Available',
  on_view: 'On View',
  reserved: 'Reserved',
  sold: 'Sold',
  licensing_available: 'Licensing Available',
  unavailable: 'Unavailable',
};

const passportLabel: Record<string, BuyerPassport> = {
  not_requested: 'None',
  pending_review: 'In Review',
  issued: 'Verified',
};

/** Two separate permissions decide whether a number appears here, and both
 *  have to say yes: the artist's profile switch (users.show_artwork_prices)
 *  and the record's own pricing choice (artworks.price_type). "Price on
 *  request" is what the artist chose, not a value we failed to load. */
function priceLabelFor(row: ArtworkRow, showPrices: boolean): string {
  if (!showPrices || row.price_type === 'on_request') return 'Price on request';

  const currency = row.currency ?? 'USD';
  const money = (value: number) => `${currency} ${Math.round(value).toLocaleString('en-US')}`;

  if (row.price_type === 'range' && row.price != null && row.price_max != null) {
    return `${money(Number(row.price))} – ${money(Number(row.price_max))}`;
  }
  if (row.price != null) return money(Number(row.price));
  return 'Price on request';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/* ── Reading artworks ───────────────────────────────────────────────────── */

/** The artist row embedded on an artwork. Null whenever the artist's profile
 *  is not public: 0021's RLS is row-level, so a non-public profile simply
 *  isn't readable and PostgREST returns null for the embed rather than
 *  dropping the artwork. `artist_display_name` is the fallback. */
type ArtistEmbed = {
  id: string;
  display_name: string | null;
  artist_name: string | null;
  avatar_url: string | null;
  country: string | null;
  country_code: string | null;
  profile_handle: string | null;
  show_artwork_prices: boolean | null;
  allow_enquiries: boolean | null;
  created_at: string | null;
} | null;

type ArtworkRow = {
  id: string;
  title: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  image_url: string | null;
  price: number | string | null;
  price_max: number | string | null;
  price_type: string;
  currency: string | null;
  availability: string;
  coa_status: string;
  artist_id: string | null;
  artist_display_name: string | null;
  artwork_images: { url: string; is_primary: boolean }[] | null;
  users: ArtistEmbed;
};

/* One FK hint is not optional here: artworks points at users twice (artist_id
   and uploaded_by), and PostgREST refuses an ambiguous embed. */
const ARTIST_EMBED =
  'users!artworks_artist_id_fkey(id, display_name, artist_name, avatar_url, country, country_code, profile_handle, show_artwork_prices, allow_enquiries, created_at)';

const ARTWORK_SELECT = `
  id, title, year, medium, dimensions, image_url, published_at,
  price, price_max, price_type, currency, availability, coa_status,
  artist_id, artist_display_name,
  artwork_images(url, is_primary),
  ${ARTIST_EMBED}
`;

function primaryImage(row: ArtworkRow): string {
  const images = row.artwork_images ?? [];
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? row.image_url ?? '';
}

function artistNameFor(row: ArtworkRow): string {
  return (
    row.users?.artist_name?.trim() ||
    row.users?.display_name?.trim() ||
    row.artist_display_name?.trim() ||
    'Artist'
  );
}

function toArtwork(row: ArtworkRow, savedIds: Set<string>): BuyerArtwork {
  return {
    id: row.id,
    title: row.title,
    artistId: row.artist_id,
    artistName: artistNameFor(row),
    artistHandle: row.users?.profile_handle ?? null,
    year: row.year,
    medium: row.medium,
    dimensions: row.dimensions,
    imageUrl: primaryImage(row),
    priceLabel: priceLabelFor(row, row.users?.show_artwork_prices === true),
    availability: availabilityLabel[row.availability] ?? 'Unavailable',
    passport: passportLabel[row.coa_status] ?? 'None',
    saved: savedIds.has(row.id),
  };
}

/** The ids on this buyer's save list. Read separately rather than joined onto
 *  the feed, because saved_artworks is readable only by its owner — embedding
 *  it would make the whole Discover query depend on being signed in. */
export async function getSavedIds(profile: Profile | null): Promise<Set<string>> {
  if (!supabase || !profile) return new Set();

  const { data, error } = await supabase
    .from('saved_artworks')
    .select('artwork_id')
    .eq('buyer_user_id', profile.id);

  if (error || !data) return new Set();
  return new Set((data as { artwork_id: string }[]).map((r) => r.artwork_id));
}

/** `hasMore` is set when the read hit its ceiling and stopped short of the
 *  full set — the surface showing it is expected to say so rather than
 *  quietly presenting a truncated list as complete. */
export type ArtworkFeed = { artworks: BuyerArtwork[]; isDemo: boolean; hasMore?: boolean };

/** Discover — every published, publicly-visible artwork.
 *
 *  `unlisted` records are excluded on purpose. They are readable (that is what
 *  makes a Smart Artwork Link work) but being absent from listings is the
 *  entire point of the setting, so the filter belongs here rather than in
 *  0023's read policy. */
export async function listDiscoverArtworks(
  profile: Profile | null,
  limit = 24,
): Promise<ArtworkFeed> {
  if (!supabase) return { artworks: demoArtworks, isDemo: true };

  const savedIds = await getSavedIds(profile);

  const { data, error } = await supabase
    .from('artworks')
    .select(ARTWORK_SELECT)
    .eq('status', 'published')
    .eq('visibility', 'public')
    // Records with no account behind them are excluded. The competition
    // entries (0003) were uploaded on the entrants' behalf and have a name but
    // no artist_id, which means nobody can be followed, contacted or enquired
    // with — BuyerArtworkPage already has to say "this record has no ArtBank
    // account behind it". A feed of works whose whole purpose is to start a
    // conversation should not be mostly works that cannot hold one.
    //
    // Excluded from the listing, not deleted: the rows still exist and stay
    // reachable by direct link, exactly like an `unlisted` work.
    .not('artist_id', 'is', null)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data || data.length === 0) {
    // Keep the demo set honest about the one thing that is real even when the
    // rest isn't: what this buyer has actually saved.
    const artworks = demoArtworks.map((a) =>
      savedIds.size > 0 ? { ...a, saved: savedIds.has(a.id) } : a,
    );
    return { artworks, isDemo: true };
  }

  const rows = data as unknown as ArtworkRow[];
  return { artworks: rows.map((row) => toArtwork(row, savedIds)), isDemo: false };
}

/** Saved Works. Ordered by when it was saved, not by anything about the work —
 *  this is the buyer's own shelf. */
export async function listSavedArtworks(profile: Profile | null): Promise<ArtworkFeed> {
  if (!supabase || !profile) return { artworks: demoSaved, isDemo: true };

  const { data, error } = await supabase
    .from('saved_artworks')
    .select(`saved_at, artworks(${ARTWORK_SELECT})`)
    .eq('buyer_user_id', profile.id)
    .order('saved_at', { ascending: false })
    // Ceiling, not a page: see services/pagination.ts.
    .limit(PAGE_SIZE + 1);

  if (error || !data) return { artworks: demoSaved, isDemo: true };

  type SavedRow = { saved_at: string; artworks: ArtworkRow | null };
  const rows = data as unknown as SavedRow[];
  const ids = new Set(rows.map((r) => r.artworks?.id).filter((id): id is string => Boolean(id)));

  const artworks = rows
    // `artworks` comes back null when the record has since been unpublished or
    // made private. The save row survives; the work is simply no longer
    // readable, and showing a blank card would be worse than showing nothing.
    .filter((row): row is SavedRow & { artworks: ArtworkRow } => row.artworks !== null)
    .map((row) => ({ ...toArtwork(row.artworks, ids), savedAt: row.saved_at }));

  // An empty save list is a real answer — do not fall back to the demo shelf,
  // or nothing a buyer removes would ever look removed.
  //
  // The query asks for PAGE_SIZE + 1; the extra row is the "there is more"
  // probe and is trimmed here rather than shown.
  const page = toPaged(artworks);
  return { artworks: page.items, isDemo: false, hasMore: page.hasMore };
}

/* ── Following ───────────────────────────────────────────────────────────── */

export type FollowedArtist = {
  id: string;
  handle: string | null;
  name: string;
  avatarUrl: string | null;
  country: string | null;
  followedAt: string;
};

type FollowRow = {
  artist_id: string;
  created_at: string;
  users: {
    artist_name: string | null;
    display_name: string | null;
    avatar_url: string | null;
    country: string | null;
    profile_handle: string | null;
  } | null;
};

/** The artists this buyer follows.
 *
 *  Readable because 0021's "Users manage their own follows" policy covers
 *  select as well — a buyer sees their own follow rows and nobody else's.
 *  Ordered by when they followed, newest first: this is the buyer's own list,
 *  not a ranking of the artists on it. */
export async function listFollowedArtists(profile: Profile | null): Promise<FollowedArtist[]> {
  if (!supabase || !profile) return [];

  const { data, error } = await supabase
    .from('profile_follows')
    .select(
      'artist_id, created_at, users!profile_follows_artist_id_fkey(artist_name, display_name, avatar_url, country, profile_handle)',
    )
    .eq('follower_id', profile.id)
    .order('created_at', { ascending: false })
    // Ceiling, not a page: see services/pagination.ts.
    .limit(PAGE_SIZE + 1);

  if (error || !data) return [];

  return (data as unknown as FollowRow[]).map((row) => ({
    id: row.artist_id,
    handle: row.users?.profile_handle ?? null,
    name: row.users?.artist_name?.trim() || row.users?.display_name?.trim() || 'Artist',
    avatarUrl: row.users?.avatar_url ?? null,
    country: row.users?.country ?? null,
    followedAt: row.created_at,
  }));
}

/** Published work by the artists this buyer follows, newest first.
 *
 *  An updates list, not a social feed: no likes, no comments, no engagement
 *  ranking, and the only ordering is when the artist published
 *  (docs/pivot-checklist/17-do-not-build-guardrails.md bans the feed; the
 *  Follow action itself is required by 16-public-profile-access.md).
 *
 *  Everything the artist has published is included rather than only what came
 *  after the follow — following someone and being shown an empty list until
 *  they next post is a worse answer than showing the work you followed them
 *  for. */
export async function listNewFromFollowed(
  profile: Profile | null,
  limit = 24,
): Promise<ArtworkFeed> {
  if (!supabase || !profile) return { artworks: [], isDemo: false };

  const artists = await listFollowedArtists(profile);
  // Following nobody is a real answer, and an empty list is the honest render.
  if (artists.length === 0) return { artworks: [], isDemo: false };

  const savedIds = await getSavedIds(profile);

  const { data, error } = await supabase
    .from('artworks')
    .select(ARTWORK_SELECT)
    .in(
      'artist_id',
      artists.map((a) => a.id),
    )
    .eq('status', 'published')
    .eq('visibility', 'public')
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error || !data) return { artworks: [], isDemo: false };

  type PublishedRow = ArtworkRow & { published_at: string | null };
  const rows = data as unknown as PublishedRow[];

  return {
    artworks: rows.map((row) => ({
      ...toArtwork(row, savedIds),
      publishedAt: row.published_at ?? undefined,
    })),
    isDemo: false,
  };
}

export async function setArtworkSaved(
  profile: Profile,
  artworkId: string,
  saved: boolean,
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be saved yet.');

  if (saved) {
    const { error } = await client
      .from('saved_artworks')
      .upsert({ buyer_user_id: profile.id, artwork_id: artworkId });
    if (error) throw error;
    return;
  }

  const { error } = await client
    .from('saved_artworks')
    .delete()
    .eq('buyer_user_id', profile.id)
    .eq('artwork_id', artworkId);
  if (error) throw error;
}

/* ── One artwork, in full ───────────────────────────────────────────────── */

const DETAIL_SELECT = `
  ${ARTWORK_SELECT},
  description, artwork_type, edition_size, is_signed, materials,
  ships_from, rights_note, permitted_uses, visibility
`;

type DetailRow = ArtworkRow & {
  description: string | null;
  artwork_type: string;
  edition_size: number | null;
  is_signed: boolean;
  materials: string[] | null;
  ships_from: string | null;
  rights_note: string | null;
  permitted_uses: string[] | null;
  visibility: string;
};

const typeLabel: Record<string, string> = {
  original: 'Original',
  limited_edition: 'Limited Edition',
  open_edition: 'Open Edition',
};

/** The spec table. Only rows the artist actually filled in appear — an empty
 *  cell reading "—" tells a buyer nothing, and the brief deletes invented
 *  facts outright (docs/pivot-checklist/10-add-artwork.md). */
function specsFor(row: DetailRow) {
  const edition =
    row.artwork_type === 'original'
      ? typeLabel.original
      : `${typeLabel[row.artwork_type] ?? 'Edition'}${row.edition_size ? ` of ${row.edition_size}` : ''}`;

  return [
    { label: 'Medium', value: row.medium },
    { label: 'Dimensions', value: row.dimensions },
    { label: 'Year', value: row.year === null ? null : String(row.year) },
    { label: 'Type', value: edition },
    { label: 'Materials', value: (row.materials ?? []).join(', ') || null },
    { label: 'Signed', value: row.is_signed ? 'Yes' : null },
    { label: 'Ships From', value: row.ships_from },
  ].filter((spec): spec is { label: string; value: string } => Boolean(spec.value));
}

function demoDetail(id: string): BuyerArtworkDetail | null {
  if (id === demoArtworkDetail.id) return demoArtworkDetail;
  const found = demoArtworks.find((a) => a.id === id);
  if (!found) return null;

  return {
    ...found,
    description: null,
    specs: [
      { label: 'Medium', value: found.medium ?? '' },
      { label: 'Dimensions', value: found.dimensions ?? '' },
      { label: 'Year', value: found.year === null ? '' : String(found.year) },
    ].filter((spec) => spec.value !== ''),
    rightsNote: null,
    permittedUses: [],
    artistAvatarUrl: null,
    artistCountry: null,
    artistCountryCode: null,
    artistMemberSince: null,
    artistWorks: 0,
    allowEnquiries: true,
  };
}

export type ArtworkDetailResult = { artwork: BuyerArtworkDetail | null; isDemo: boolean };

export async function getBuyerArtwork(
  id: string,
  profile: Profile | null,
): Promise<ArtworkDetailResult> {
  if (!supabase) return { artwork: demoDetail(id), isDemo: true };

  const savedIds = await getSavedIds(profile);

  const { data, error } = await supabase
    .from('artworks')
    .select(DETAIL_SELECT)
    .eq('id', id)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) return { artwork: demoDetail(id), isDemo: true };

  const row = data as unknown as DetailRow;
  // Published but private is unreachable under 0023's policy; this covers a
  // database that hasn't run it yet, so the app never shows a record the
  // artist has taken back.
  if (row.visibility === 'private') return { artwork: null, isDemo: false };

  const artistWorks = row.artist_id ? await countPublishedWorks(row.artist_id) : 0;

  return {
    artwork: {
      ...toArtwork(row, savedIds),
      description: row.description,
      specs: specsFor(row),
      rightsNote: row.rights_note,
      permittedUses: row.permitted_uses ?? [],
      artistAvatarUrl: row.users?.avatar_url ?? null,
      artistCountry: row.users?.country ?? null,
      artistCountryCode: row.users?.country_code ?? null,
      artistMemberSince: row.users?.created_at
        ? new Date(row.users.created_at).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
        : null,
      artistWorks,
      // Defaults to true only when there is no readable profile to ask —
      // an artist who set it false has a public row saying so.
      allowEnquiries: row.users?.allow_enquiries !== false,
    },
    isDemo: false,
  };
}

/** The size of the artist's public body of work. The only figure on the About
 *  the Artist card: spec 16 deletes public statistics, and a response rate
 *  would have to be computed from other people's messages, which RLS rightly
 *  refuses to hand over. */
async function countPublishedWorks(artistId: string): Promise<number> {
  if (!supabase) return 0;
  const { count } = await supabase
    .from('artworks')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', artistId)
    .eq('status', 'published')
    .eq('visibility', 'public');
  return count ?? 0;
}

/* ── My Enquiries ───────────────────────────────────────────────────────── */

/** Derived from the form's own list rather than restated, so the label a
 *  buyer picked and the label their enquiry shows can never disagree. */
const purposeShort: Record<string, string> = Object.fromEntries(
  intentPurposes.map((p) => [p.id, p.short]),
);

/** Status is derived, never stored twice. `pipeline_stage` is the artist's
 *  column — the buyer sees the same row, so nothing here can drift from what
 *  the Interest Ledger says. "In Conversation" is the one case the stage
 *  can't answer on its own: it means the artist has actually replied, which
 *  only the message thread knows. */
function statusFor(
  stage: string,
  nextAction: string | null,
  artistReplied: boolean,
  deal: { status: string } | null,
): EnquiryStatus {
  // A deal outranks the stage. An enquiry that ended in a purchase and one
  // that was declined both land on pipeline_stage 'completed', and calling
  // the first of those "Closed" tells a buyer their purchase fell through.
  if (deal) {
    if (isSettled(deal.status)) return 'Purchased';
    if (deal.status === 'awaiting_payment') return 'Payment Due';
    // Cancelled or refunded genuinely is closed.
    return 'Closed';
  }

  if (stage === 'completed' || nextAction === 'decline' || nextAction === 'block') return 'Closed';
  if (stage === 'viewing_room') return 'Viewing Room';
  if (artistReplied || stage === 'qualified' || stage === 'negotiation') return 'In Conversation';
  return 'Awaiting Response';
}

type EnquiryRow = {
  id: string;
  purpose: string | null;
  pipeline_stage: string;
  next_action: string | null;
  created_at: string;
  artwork_id: string | null;
  artist_id: string;
  artworks: {
    id: string;
    title: string;
    image_url: string | null;
    artist_display_name: string | null;
    artwork_images: { url: string; is_primary: boolean }[] | null;
    users: ArtistEmbed;
  } | null;
};

export type EnquiryFeed = { enquiries: BuyerEnquiry[]; isDemo: boolean };

export async function listMyEnquiries(profile: Profile | null): Promise<EnquiryFeed> {
  if (!supabase || !profile) return { enquiries: demoEnquiries, isDemo: true };

  const [entries, threads, deals] = await Promise.all([
    supabase
      .from('interest_entries')
      .select(
        `id, purpose, pipeline_stage, next_action, created_at, artwork_id, artist_id,
         artworks(id, title, image_url, artist_display_name, artwork_images(url, is_primary), ${ARTIST_EMBED})`,
      )
      .eq('viewer_id', profile.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('conversations')
      .select('id, artwork_id, artist_id, messages(sender_id)')
      .eq('buyer_id', profile.id),
    // What this buyer has actually bought. Read separately rather than
    // embedded: artwork_deals hangs off the artwork, not off the enquiry, and
    // a deal can exist for a work enquired about more than once.
    supabase
      .from('artwork_deals')
      .select('artwork_id, status, agreed_at')
      .eq('buyer_id', profile.id)
      .order('agreed_at', { ascending: false }),
  ]);

  if (entries.error || !entries.data) return { enquiries: demoEnquiries, isDemo: true };

  type ThreadRow = {
    id: string;
    artwork_id: string | null;
    artist_id: string;
    messages: { sender_id: string }[] | null;
  };
  const conversations = (threads.data ?? []) as unknown as ThreadRow[];

  // Newest first from the query, so the first hit per artwork is the current
  // one and later rows for the same work are ignored.
  const dealByArtwork = new Map<string, { status: string }>();
  for (const row of (deals.data ?? []) as { artwork_id: string | null; status: string }[]) {
    if (row.artwork_id && !dealByArtwork.has(row.artwork_id)) {
      dealByArtwork.set(row.artwork_id, { status: row.status });
    }
  }

  const enquiries = (entries.data as unknown as EnquiryRow[]).map((row): BuyerEnquiry => {
    const work = row.artworks;
    const images = work?.artwork_images ?? [];
    // One conversation per artwork per artist, which is how openConversation
    // below keeps it — an enquiry about a second work opens its own thread.
    const thread = conversations.find(
      (c) => c.artist_id === row.artist_id && c.artwork_id === row.artwork_id,
    );
    const artistReplied = (thread?.messages ?? []).some((m) => m.sender_id !== profile.id);

    return {
      id: row.id,
      artworkId: row.artwork_id,
      artwork: work?.title ?? 'Your enquiry',
      artistName:
        work?.users?.artist_name?.trim() ||
        work?.users?.display_name?.trim() ||
        work?.artist_display_name?.trim() ||
        'Artist',
      artistHandle: work?.users?.profile_handle ?? null,
      imageUrl: images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? work?.image_url ?? '',
      purposeLabel: purposeShort[row.purpose ?? ''] ?? 'Enquiry',
      enquiredOn: row.created_at,
      status: statusFor(
        row.pipeline_stage,
        row.next_action,
        artistReplied,
        row.artwork_id ? (dealByArtwork.get(row.artwork_id) ?? null) : null,
      ),
      conversationId: thread?.id ?? null,
    };
  });

  // An empty list is a real answer for a signed-in buyer who hasn't enquired.
  return { enquiries, isDemo: false };
}

export function enquiredOnLabel(iso: string): string {
  return `Enquired on ${formatDate(iso)}`;
}

/* ── The Buyer Intent Card ──────────────────────────────────────────────── */

/** interest_entries.purpose to conversations.category. Both vocabularies are
 *  fixed by CHECK constraints and they are deliberately not the same list, so
 *  the mapping is explicit rather than a cast. */
const conversationCategory: Record<IntentPurpose, string> = {
  purchase: 'purchase',
  licence: 'licence',
  exhibit: 'exhibition',
  commission: 'commission',
  collaborate: 'collaboration',
};

export type IntentInput = {
  artistId: string;
  artworkId: string | null;
  purpose: IntentPurpose;
  message: string;
  /** How the buyer describes themselves, e.g. "Independent Collector".
   *  Required by spec 20; stored on the entry, not the account. */
  role: string;
  organization: string | null;
  budgetRange: string | null;
  /** Required by spec 20 when the purpose is licensing. */
  intendedUse: string | null;
  decisionTimeline: string | null;
  /** Request Availability and Contact Artist file an enquiry; Request Viewing
   *  Room files the same card one stage further along. */
  stage: 'enquiry' | 'viewing_room';
  /** Where the card was filled in, for the artist's context. */
  source: string;
};

export type IntentResult = {
  /** Null when the enquiry reached the artist's ledger but no thread could be
   *  opened — see openConversation. */
  conversationId: string | null;
};

/** Files a Buyer Intent Card.
 *
 *  Two things happen, in this order and for a reason. The interest entry is
 *  the record that matters: it is what the artist's Interest Ledger reads, and
 *  it is written first so that a failure opening the message thread still
 *  leaves a delivered enquiry rather than nothing. The thread is the
 *  convenience on top.
 *
 *  `is_identified` and `identity_sharing_consent` are both hard-coded true,
 *  and that is not a shortcut: 0012's CHECK constraint refuses any row with a
 *  viewer attached that claims otherwise, and the whole premise of this
 *  product is that a serious request is never anonymous
 *  (docs/pivot-checklist/12-interest-ledger.md). Submitting this form *is*
 *  the consent — the dialog says so above the button. */
export async function sendIntent(profile: Profile, input: IntentInput): Promise<IntentResult> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be sent yet.');

  const entry = {
    artist_id: input.artistId,
    artwork_id: input.artworkId,
    viewer_id: profile.id,
    is_identified: true,
    identity_sharing_consent: true,
    purpose: input.purpose,
    message: input.message,
    organization: input.organization,
    budget_range: input.budgetRange,
    intended_use: input.intendedUse,
    decision_timeline: input.decisionTimeline,
    pipeline_stage: input.stage,
    source: input.source,
  };

  const { error } = await client
    .from('interest_entries')
    .insert({ ...entry, viewer_role: input.role });

  // 0023's viewer_role is assumed present. The retry that used to drop the
  // column and re-insert existed for databases still on 0022; treating a
  // schema gap as an ordinary runtime branch is what finding 5 of the
  // production audit set out to remove.
  if (error) throw error;

  const conversationId = await openConversation(profile, input);
  return { conversationId };
}

/** Opens (or reuses) the thread this enquiry belongs to and posts the buyer's
 *  message into it, so the enquiry is readable as a conversation from the
 *  first moment rather than only as a ledger entry.
 *
 *  Returns null rather than throwing when the thread can't be opened. The one
 *  case that reliably does this is 0014's guardian-routing trigger: a
 *  conversation involving a minor is refused without a verified guardian
 *  attached. `resolve_guardian_cc` (0027) looks that guardian up and attaches
 *  them automatically when one exists — so this only actually fails when the
 *  minor hasn't been approved by their guardian yet, which is exactly the
 *  case the rule exists to block. The enquiry has already been recorded by
 *  the time this runs, so the artist still hears about it through the route
 *  the guardian rule permits. */
async function openConversation(profile: Profile, input: IntentInput): Promise<string | null> {
  const client = supabase;
  if (!client) return null;

  try {
    // `artwork_id` is nullable, and `.eq(col, null)` does not match nulls in
    // SQL — a general enquiry would open a second thread every time without
    // the `.is()` branch.
    const lookup = client
      .from('conversations')
      .select('id')
      .eq('buyer_id', profile.id)
      .eq('artist_id', input.artistId);

    const existing = await (
      input.artworkId ? lookup.eq('artwork_id', input.artworkId) : lookup.is('artwork_id', null)
    ).maybeSingle();

    let conversationId = (existing.data as { id: string } | null)?.id ?? null;

    if (!conversationId) {
      // Resolves to null whenever neither party is a minor — a no-op for the
      // overwhelming majority of conversations.
      const guardianLookup = await client.rpc('resolve_guardian_cc', {
        p_artist_id: input.artistId,
        p_buyer_id: profile.id,
      });

      const created = await client
        .from('conversations')
        .insert({
          artist_id: input.artistId,
          buyer_id: profile.id,
          artwork_id: input.artworkId,
          category: conversationCategory[input.purpose],
          purpose: input.role,
          guardian_cc_id: guardianLookup.data ?? null,
        })
        .select('id')
        .single();

      if (created.error || !created.data) return null;
      conversationId = (created.data as { id: string }).id;
    }

    const { error } = await client.from('messages').insert({
      conversation_id: conversationId,
      sender_id: profile.id,
      body: input.message,
    });
    if (error) return conversationId;

    await client
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    return conversationId;
  } catch {
    return null;
  }
}

/* ── Viewing Rooms ──────────────────────────────────────────────────────── */

export type ViewingRoomRequest = {
  id: string;
  artwork: string;
  artistName: string;
  requestedOn: string;
  /** Rooms are opened by the artist, from their side. Until one exists, this
   *  is a request and says so. */
  state: 'Requested' | 'Open';
};

/** What the buyer has asked for, which is all this side can honestly show.
 *  Creating and curating a room is the artist's half of
 *  docs/pivot-checklist/21-feature-private-viewing-room.md and is not built
 *  yet, so nothing here claims a room exists. */
export async function listViewingRoomRequests(
  profile: Profile | null,
): Promise<ViewingRoomRequest[]> {
  if (!supabase || !profile) return [];

  const { data, error } = await supabase
    .from('interest_entries')
    .select('id, created_at, artworks(title, artist_display_name)')
    .eq('viewer_id', profile.id)
    .eq('pipeline_stage', 'viewing_room')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  type Row = {
    id: string;
    created_at: string;
    artworks: { title: string; artist_display_name: string | null } | null;
  };

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    artwork: row.artworks?.title ?? 'An artwork',
    artistName: row.artworks?.artist_display_name ?? 'Artist',
    requestedOn: formatDate(row.created_at),
    state: 'Requested',
  }));
}
