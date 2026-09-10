import { supabase } from '../lib/supabaseClient';
import {
  works as demoWorks,
  type InterestLevel,
  type PassportState,
  type Work,
  type WorkAvailability,
  type WorkStatus,
  type WorkVisibility,
} from '../data/artspaceWorks';
import { isSettled } from './deals';
import type { Profile } from '../types/user';

/** Reads and writes public.artworks for the signed-in artist.
 *
 *  Requires migrations 0011–0016. Until those run — or with no Supabase
 *  project at all — every read falls back to the demo set, the same pattern
 *  artworksRepo.ts uses, so My Works keeps rendering either way. Callers get
 *  `isDemo` so the UI can label it rather than passing it off as real. */

type ArtworkRow = {
  id: string;
  title: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  status: string;
  availability: string;
  availability_note: string | null;
  visibility: string;
  coa_status: string;
  image_url: string | null;
  updated_at: string | null;
  created_at: string;
  artwork_images: { url: string; is_primary: boolean }[] | null;
  // Counted, not summarised by the database, because these sets are small and
  // one round trip beats four.
  interest_entries: { id: string; is_identified: boolean }[] | null;
  artwork_deals: { amount: number; status: string }[] | null;
  opportunity_matches: { opportunity_id: string }[] | null;
};

const SELECT = `
  id, title, year, medium, dimensions, status, availability, availability_note,
  visibility, coa_status, image_url, updated_at, created_at,
  artwork_images(url, is_primary),
  interest_entries(id, is_identified),
  artwork_deals(amount, status),
  opportunity_matches(opportunity_id)
`;

const statusLabel: Record<string, WorkStatus> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  private: 'Private',
};

const availabilityLabel: Record<string, WorkAvailability> = {
  available: 'Available',
  on_view: 'On View',
  reserved: 'Reserved',
  sold: 'Sold',
  licensing_available: 'Available',
  unavailable: 'Unavailable',
};

/** The Passport column shows evidence state, never a bare verified badge. */
const passportLabel: Record<string, PassportState> = {
  not_requested: 'Draft',
  pending_review: 'In Review',
  issued: 'Verified',
};

/** Interest is banded for scanning, but the exact count is always shown too —
 *  the band is a reading aid, not a replacement for the number. */
function bandFor(count: number): InterestLevel {
  if (count >= 8) return 'High';
  if (count >= 4) return 'Medium';
  if (count >= 1) return 'Low';
  return 'None';
}

function primaryImage(row: ArtworkRow): string {
  const images = row.artwork_images ?? [];
  return images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? row.image_url ?? '';
}

function fromRow(row: ArtworkRow): Work {
  // Only identified viewers count. Anonymous traffic is deliberately excluded
  // here as well as in the UI — see docs/pivot-checklist/12-interest-ledger.md.
  const interestCount = (row.interest_entries ?? []).filter((e) => e.is_identified).length;

  // Settled only. A deal awaiting payment is a promise, not an earning, and
  // showing it as one would be the invented figure the brief bans.
  const deals = (row.artwork_deals ?? []).filter((d) => isSettled(d.status));
  const earned = deals.reduce((sum, d) => sum + Number(d.amount), 0);
  const opportunities = (row.opportunity_matches ?? []).length;

  return {
    id: row.id,
    title: row.title,
    year: row.year ?? new Date(row.created_at).getFullYear(),
    medium: row.medium ?? '—',
    dimensions: row.dimensions ?? '—',
    imageUrl: primaryImage(row),
    status: statusLabel[row.status] ?? 'Draft',
    availability: availabilityLabel[row.availability] ?? 'Unavailable',
    availabilityNote: row.availability_note ?? undefined,
    visibility: (row.visibility as Work['visibility']) ?? 'private',
    passport: passportLabel[row.coa_status] ?? 'Draft',
    interestCount,
    interestLevel: bandFor(interestCount),
    opportunities,
    // No deals means nothing recorded, which is not the same as zero — the
    // brief bans presenting an estimate as an earning.
    earnings: deals.length === 0 ? null : earned,
    earningsNote:
      deals.length === 0
        ? 'No earnings'
        : `From ${deals.length} txn${deals.length === 1 ? '' : 's'}`,
    updated: new Date(row.updated_at ?? row.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    updatedAt: row.updated_at ?? row.created_at,
  };
}

export type WorksResult = { works: Work[]; isDemo: boolean };

/** `limit` is opt-in rather than a default, and that asymmetry is deliberate.
 *
 *  Two kinds of caller read this. A *list* surface (My Works, the room
 *  builder's picker) shows a page and should ask for one. The dashboard
 *  reduces the whole catalogue into totals — readiness percentages, money,
 *  how many works are missing dimensions — so a silent cap there would not
 *  truncate a list, it would produce wrong numbers, which is the failure this
 *  audit is trying to remove rather than introduce.
 *
 *  Once `dashboard_summary()` does that counting in Postgres (finding 6 in
 *  docs/pivot-checklist/27-production-readiness-audit.md), the unbounded call
 *  goes away and this can default to a page. */
export async function listMyWorks(
  profile: Profile | null,
  limit?: number,
): Promise<WorksResult> {
  if (!supabase || !profile) return { works: demoWorks, isDemo: true };

  const query = supabase
    .from('artworks')
    .select(SELECT)
    .or(`artist_id.eq.${profile.id},uploaded_by.eq.${profile.id}`)
    .order('updated_at', { ascending: false });

  // Built first, capped only if the caller asked, so the dashboard's
  // whole-catalogue reduction is left alone.
  const { data, error } = await (limit === undefined ? query : query.limit(limit));

  // A missing table (migrations not run yet) lands here — fall back rather
  // than showing an empty portfolio the artist might mistake for data loss.
  // An artist who genuinely has no works is a different case: they get the
  // real empty answer, and the screen's own empty state invites them to add
  // one. Handing them a stranger's portfolio would be worse than nothing.
  if (error) return { works: demoWorks, isDemo: true };

  return { works: ((data ?? []) as unknown as ArtworkRow[]).map(fromRow), isDemo: false };
}

export async function setArtworkStatus(id: string, status: 'draft' | 'published' | 'archived') {
  if (!supabase) throw new Error('No database is configured, so changes cannot be saved yet.');
  const { error } = await supabase
    .from('artworks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/* ── Creating a record ───────────────────────────────────────────────── */

/** A URL-safe id derived from the title, with a short suffix so two works
 *  called "Study" don't collide. Doubles as the smart-link slug. */
function slugFor(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || 'artwork'}-${suffix}`;
}

export type NewArtwork = {
  title: string;
  year: number | null;
  medium: string;
  dimensions: string;
  height: number | null;
  width: number | null;
  depth: number | null;
  dimensionUnit: 'cm' | 'in';
  category: string;
  tags: string[];
  materials: string[];
  description: string;
  collection: string | null;
  artworkType: string;
  editionSize: number | null;
  coaPromised: boolean;
  creationLocation: string | null;
  dateCreated: string | null;
  isSigned: boolean;
  ownershipStatement: string;
};

/** Saves step 1 as a draft.
 *
 *  Always `status: 'draft'` and `visibility: 'private'` — the record isn't
 *  finished until the artist has been through images, availability, documents
 *  and review, and nothing publishes itself. */
export async function createArtworkDraft(profile: Profile, input: NewArtwork): Promise<string> {
  if (!supabase) {
    throw new Error('No database is configured, so this record cannot be saved yet.');
  }

  const id = slugFor(input.title);

  const { error } = await supabase.from('artworks').insert({
    id,
    title: input.title,
    artist: profile.displayName ?? profile.email,
    artist_display_name: profile.displayName ?? profile.email,
    artist_id: profile.id,
    uploaded_by: profile.id,
    year: input.year,
    medium: input.medium,
    dimensions: input.dimensions,
    height: input.height,
    width: input.width,
    depth: input.depth,
    dimension_unit: input.dimensionUnit,
    category: input.category,
    tags: input.tags,
    materials: input.materials,
    description: input.description,
    collection: input.collection,
    artwork_type: input.artworkType,
    edition_size: input.editionSize,
    coa_promised: input.coaPromised,
    coa_status: 'not_requested',
    creation_location: input.creationLocation,
    date_created: input.dateCreated,
    is_signed: input.isSigned,
    ownership_statement: input.ownershipStatement,
    status: 'draft',
    visibility: 'private',
    availability: 'unavailable',
    smart_link_slug: id,
  });

  if (error) throw error;

  // First entry in the provenance log. Best-effort: a failed history write
  // shouldn't lose the artwork the artist just spent time on.
  await supabase
    .from('artwork_history_events')
    .insert({ artwork_id: id, event_type: 'upload', description: 'Record created.' });

  return id;
}

export type PricingUpdate = {
  priceType: string;
  currency: string;
  price: number | null;
  priceMax: number | null;
  compareAtPrice: number | null;
  availability: string;
  readyToShipIn: string | null;
  shipsFrom: string | null;
  shippingRegions: string[];
  allowInternationalShipping: boolean;
  includesCoa: boolean;
  isPhysical: boolean;
  allowLayaway: boolean;
};

/** Saves step 3. Requires migration 0019, which re-adds the price columns
 *  0011 had dropped — see that file's header for the reasoning. */
export async function updateArtworkPricing(id: string, input: PricingUpdate): Promise<void> {
  if (!supabase) throw new Error('No database is configured, so this cannot be saved yet.');

  const { error } = await supabase
    .from('artworks')
    .update({
      price_type: input.priceType,
      currency: input.currency,
      // "Upon request" clears any figure rather than leaving a stale one
      // behind that nothing displays.
      price: input.priceType === 'on_request' ? null : input.price,
      price_max: input.priceType === 'range' ? input.priceMax : null,
      compare_at_price: input.priceType === 'on_request' ? null : input.compareAtPrice,
      availability: input.availability,
      ready_to_ship_in: input.readyToShipIn,
      ships_from: input.shipsFrom,
      shipping_regions: input.shippingRegions,
      allow_international_shipping: input.allowInternationalShipping,
      includes_coa: input.includesCoa,
      is_physical: input.isPhysical,
      allow_layaway: input.allowLayaway,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

export type PublishInput = {
  visibility: 'public' | 'private' | 'unlisted';
  permittedUses: string[];
  rightsNote: string | null;
  /** false saves the record as a draft with its rights and visibility set. */
  publish: boolean;
};

/** Saves step 5 and, if asked, publishes.
 *
 *  Publishing is always an explicit act: `publish` comes from the button the
 *  artist pressed, never inferred from the record looking complete. Requires
 *  migration 0020. */
export async function publishArtwork(id: string, input: PublishInput): Promise<void> {
  if (!supabase) throw new Error('No database is configured, so this cannot be saved yet.');

  const now = new Date().toISOString();

  const { error } = await supabase
    .from('artworks')
    .update({
      permitted_uses: input.permittedUses,
      rights_note: input.rightsNote,
      visibility: input.visibility,
      status: input.publish ? 'published' : 'draft',
      published_at: input.publish ? now : null,
      updated_at: now,
    })
    .eq('id', id);

  if (error) throw error;

  if (input.publish) {
    // Best-effort, same as the creation event: a failed log entry shouldn't
    // undo a publish the artist just confirmed.
    await supabase.from('artwork_history_events').insert({
      artwork_id: id,
      event_type: 'publish',
      description: `Record published with ${input.visibility} visibility.`,
    });
  }
}

/* ── Managing an existing record ─────────────────────────────────────────── */

/** UI availability → the column's value. `licensing_available` is deliberately
 *  absent: it maps to "Available" on the way in, so offering it here would let
 *  a round trip silently rewrite it. It stays settable from Add Artwork. */
const availabilityValue: Record<WorkAvailability, string> = {
  Available: 'available',
  'On View': 'on_view',
  Reserved: 'reserved',
  Sold: 'sold',
  Unavailable: 'unavailable',
};

export async function setArtworkAvailability(id: string, availability: WorkAvailability) {
  if (!supabase) throw new Error('No database is configured, so changes cannot be saved yet.');
  const { error } = await supabase
    .from('artworks')
    .update({
      availability: availabilityValue[availability],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) throw error;
}

export async function setArtworkVisibility(id: string, visibility: WorkVisibility) {
  if (!supabase) throw new Error('No database is configured, so changes cannot be saved yet.');
  const { error } = await supabase
    .from('artworks')
    .update({ visibility, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

/** Permanently removes a record.
 *
 *  Cascades to its images, evidence and history — which is why Archive is the
 *  default action everywhere and this is offered only for records with nothing
 *  recorded against them (see `canDelete` below). Deleting a work that has
 *  provenance destroys that provenance. */
export async function deleteArtwork(id: string) {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be deleted yet.');

  // The row cascade removes artwork_images and artwork_evidence_files, but the
  // files themselves live in storage and would be orphaned. Collect their
  // paths first — after the cascade there is nothing left to read them from.
  const [images, documents] = await Promise.all([
    client.from('artwork_images').select('storage_path').eq('artwork_id', id),
    client.from('artwork_evidence_files').select('storage_path').eq('artwork_id', id),
  ]);

  const imagePaths = (images.data ?? [])
    .map((row) => (row as { storage_path: string | null }).storage_path)
    .filter((p): p is string => Boolean(p));
  const documentPaths = (documents.data ?? [])
    .map((row) => (row as { storage_path: string | null }).storage_path)
    .filter((p): p is string => Boolean(p));

  const { error } = await client.from('artworks').delete().eq('id', id);
  if (error) throw error;

  // Best-effort, and after the record is gone: a storage hiccup should not
  // resurrect an artwork the artist has already confirmed deleting.
  if (imagePaths.length > 0) {
    await client.storage.from('artwork-images').remove(imagePaths);
  }
  if (documentPaths.length > 0) {
    await client.storage.from('artwork-documents').remove(documentPaths);
  }
}

/** A record is safe to delete only while nothing has happened to it: no
 *  identified interest, no opportunities, no recorded earnings. Anything else
 *  gets archived instead, so a history can't be erased by a menu click. */
export function canDelete(work: Work): boolean {
  return work.interestCount === 0 && work.opportunities === 0 && !work.earnings;
}

export type ArtworkDetailsUpdate = {
  title: string;
  year: number | null;
  medium: string;
  dimensions: string;
  category: string;
  description: string;
  materials: string[];
  creationLocation: string | null;
  availabilityNote: string | null;
};

/** Saves the editable fields on the artwork record page.
 *
 *  Deliberately narrow: this edits what the artist described, not what the
 *  record has become. Availability, visibility and status have their own
 *  actions, and evidence and rights are edited where they were captured. */
export async function updateArtworkDetails(id: string, input: ArtworkDetailsUpdate) {
  if (!supabase) throw new Error('No database is configured, so changes cannot be saved yet.');

  const { error } = await supabase
    .from('artworks')
    .update({
      title: input.title,
      year: input.year,
      medium: input.medium,
      dimensions: input.dimensions,
      category: input.category,
      description: input.description,
      materials: input.materials,
      creation_location: input.creationLocation,
      availability_note: input.availabilityNote,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) throw error;
}

/* ── Featured artworks (public profile) ──────────────────────────────────── */

export type FeaturableWork = {
  id: string;
  title: string;
  year: number | null;
  imageUrl: string;
  status: string;
  featuredPosition: number | null;
};

/** The artist's works, with their featured position. Published works only:
 *  featuring a draft on a public profile would publish it by the back door. */
export async function listFeaturableWorks(profile: Profile): Promise<FeaturableWork[]> {
  const client = supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('artworks')
    .select('id, title, year, image_url, status, featured_position, artwork_images(url, is_primary)')
    .or(`artist_id.eq.${profile.id},uploaded_by.eq.${profile.id}`)
    .eq('status', 'published')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];

  return (data as unknown as (ArtworkRow & { featured_position: number | null })[]).map((row) => ({
    id: row.id,
    title: row.title,
    year: row.year,
    imageUrl: primaryImage(row),
    status: row.status,
    featuredPosition: row.featured_position,
  }));
}

/** Rewrites the featured set. Positions come from the array index, so they
 *  stay contiguous, and everything absent is cleared in one pass rather than
 *  left behind as a stale position. Requires migration 0021. */
export async function setFeaturedArtworks(profile: Profile, ids: string[]): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so changes cannot be saved yet.');

  const { error: clearError } = await client
    .from('artworks')
    .update({ featured_position: null })
    .or(`artist_id.eq.${profile.id},uploaded_by.eq.${profile.id}`)
    .not('featured_position', 'is', null);

  if (clearError) throw clearError;

  await Promise.all(
    ids.map((id, index) =>
      client.from('artworks').update({ featured_position: index }).eq('id', id),
    ),
  );
}
