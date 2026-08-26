import { supabase } from '../lib/supabaseClient';
import { works as demoWorks } from '../data/artspaceWorks';
import { listArtworkImages, type ArtworkImage } from './artworkImages';
import { listArtworkDocuments, type ArtworkDocument } from './artworkDocuments';

/** Everything behind one artwork record — the "Living Creative Asset Passport"
 *  of docs/pivot-checklist/11-artwork-record-passport.md.
 *
 *  Assembled from several small queries rather than one deep join: the tabs
 *  are independent, the sets are small, and a single failing relation would
 *  otherwise take the whole page down with it.
 *
 *  Requires migrations 0011–0020. */

export type RecordArtwork = {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  category: string | null;
  materials: string[];
  tags: string[];
  description: string | null;
  collection: string | null;
  artworkType: string;
  editionSize: number | null;
  creationLocation: string | null;
  dateCreated: string | null;
  isSigned: boolean;
  ownershipStatement: string | null;
  coaPromised: boolean;
  coaStatus: string;
  status: string;
  availability: string;
  availabilityNote: string | null;
  visibility: string;
  permittedUses: string[];
  rightsNote: string | null;
  publishedAt: string | null;
  priceType: string;
  price: number | null;
  priceMax: number | null;
  currency: string;
  shipsFrom: string | null;
  readyToShipIn: string | null;
  shippingRegions: string[];
  smartLinkSlug: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export type RecordInterest = {
  id: string;
  /** null for anonymous rows — which are never returned. See below. */
  name: string;
  location: string | null;
  organization: string | null;
  purpose: string | null;
  message: string | null;
  stage: string;
  createdAt: string;
};

export type RecordDeal = {
  id: string;
  dealType: string;
  amount: number;
  currency: string;
  agreedAt: string;
  buyer: string | null;
};

export type RecordMatch = {
  id: string;
  title: string;
  organizer: string | null;
  organizerVerified: boolean;
  strength: string;
  whyText: string;
  missing: string[];
  deadline: string | null;
  location: string | null;
};

export type RecordEvent = {
  id: string;
  eventType: string;
  description: string | null;
  occurredAt: string;
};

export type LinkStats = {
  total: number;
  bySource: { source: string; count: number }[];
};

export type ArtworkRecord = {
  artwork: RecordArtwork;
  images: ArtworkImage[];
  documents: ArtworkDocument[];
  interest: {
    identified: RecordInterest[];
    /** Reported as a number only. The brief forbids ever revealing these. */
    anonymousCount: number;
  };
  deals: RecordDeal[];
  matches: RecordMatch[];
  events: RecordEvent[];
  linkStats: LinkStats;
  isDemo: boolean;
};

const ARTWORK_SELECT = `
  id, title, artist, artist_display_name, year, medium, dimensions, category, materials, tags,
  description, collection, artwork_type, edition_size, creation_location, date_created,
  is_signed, ownership_statement, coa_promised, coa_status, status, availability,
  availability_note, visibility, permitted_uses, rights_note, published_at,
  price_type, price, price_max, currency, ships_from, ready_to_ship_in, shipping_regions,
  smart_link_slug, created_at, updated_at
`;

type ArtworkRowRaw = Record<string, unknown>;

function str(row: ArtworkRowRaw, key: string): string | null {
  const value = row[key];
  return typeof value === 'string' ? value : null;
}

function num(row: ArtworkRowRaw, key: string): number | null {
  const value = row[key];
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function list(row: ArtworkRowRaw, key: string): string[] {
  const value = row[key];
  return Array.isArray(value) ? (value as string[]) : [];
}

function toArtwork(row: ArtworkRowRaw): RecordArtwork {
  return {
    id: String(row.id),
    title: str(row, 'title') ?? 'Untitled',
    artist: str(row, 'artist_display_name') ?? str(row, 'artist') ?? '',
    year: num(row, 'year'),
    medium: str(row, 'medium'),
    dimensions: str(row, 'dimensions'),
    category: str(row, 'category'),
    materials: list(row, 'materials'),
    tags: list(row, 'tags'),
    description: str(row, 'description'),
    collection: str(row, 'collection'),
    artworkType: str(row, 'artwork_type') ?? 'original',
    editionSize: num(row, 'edition_size'),
    creationLocation: str(row, 'creation_location'),
    dateCreated: str(row, 'date_created'),
    isSigned: row.is_signed === true,
    ownershipStatement: str(row, 'ownership_statement'),
    coaPromised: row.coa_promised === true,
    coaStatus: str(row, 'coa_status') ?? 'not_requested',
    status: str(row, 'status') ?? 'draft',
    availability: str(row, 'availability') ?? 'unavailable',
    availabilityNote: str(row, 'availability_note'),
    visibility: str(row, 'visibility') ?? 'private',
    permittedUses: list(row, 'permitted_uses'),
    rightsNote: str(row, 'rights_note'),
    publishedAt: str(row, 'published_at'),
    priceType: str(row, 'price_type') ?? 'on_request',
    price: num(row, 'price'),
    priceMax: num(row, 'price_max'),
    currency: str(row, 'currency') ?? 'USD',
    shipsFrom: str(row, 'ships_from'),
    readyToShipIn: str(row, 'ready_to_ship_in'),
    shippingRegions: list(row, 'shipping_regions'),
    smartLinkSlug: str(row, 'smart_link_slug'),
    createdAt: str(row, 'created_at') ?? new Date().toISOString(),
    updatedAt: str(row, 'updated_at'),
  };
}

/** A record assembled from the demo set, used only when there is no Supabase
 *  project at all. With a database configured, a missing id is a 404 rather
 *  than a silent substitution — showing someone else's demo artwork under the
 *  URL they asked for would be worse than an honest empty state. */
function demoRecord(id: string): ArtworkRecord | null {
  const work = demoWorks.find((w) => w.id === id);
  if (!work) return null;

  return {
    artwork: {
      id: work.id,
      title: work.title,
      artist: '',
      year: work.year,
      medium: work.medium,
      dimensions: work.dimensions,
      category: null,
      materials: [],
      tags: [],
      description: null,
      collection: null,
      artworkType: 'original',
      editionSize: null,
      creationLocation: null,
      dateCreated: null,
      isSigned: false,
      ownershipStatement: null,
      coaPromised: false,
      coaStatus: work.passport === 'Verified' ? 'issued' : 'not_requested',
      status: work.status.toLowerCase(),
      availability: work.availability.toLowerCase().replace(' ', '_'),
      availabilityNote: work.availabilityNote ?? null,
      visibility: work.visibility,
      permittedUses: [],
      rightsNote: null,
      publishedAt: null,
      priceType: 'on_request',
      price: null,
      priceMax: null,
      currency: 'USD',
      shipsFrom: null,
      readyToShipIn: null,
      shippingRegions: [],
      smartLinkSlug: work.id,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    },
    images: work.imageUrl
      ? [
          {
            id: 'demo-cover',
            url: work.imageUrl,
            storagePath: null,
            position: 0,
            isPrimary: true,
            role: 'cover',
            fileName: 'cover',
            fileSize: 0,
          },
        ]
      : [],
    documents: [],
    interest: { identified: [], anonymousCount: 0 },
    deals: [],
    matches: [],
    events: [],
    linkStats: { total: 0, bySource: [] },
    isDemo: true,
  };
}

type InterestRowRaw = {
  id: string;
  purpose: string | null;
  message: string | null;
  organization: string | null;
  is_identified: boolean;
  pipeline_stage: string;
  created_at: string;
  users: { display_name: string | null; country: string | null; organization: string | null } | null;
};

type DealRowRaw = {
  id: string;
  deal_type: string;
  amount: number | string;
  currency: string;
  agreed_at: string;
  users: { display_name: string | null } | null;
};

type MatchRowRaw = {
  opportunity_id: string;
  match_strength: string;
  why_text: string;
  missing_requirements: string[] | null;
  opportunities: {
    title: string;
    organizer_name: string | null;
    organizer_verified: boolean;
    deadline: string | null;
    location: string | null;
  } | null;
};

export async function getArtworkRecord(id: string): Promise<ArtworkRecord | null> {
  const client = supabase;
  if (!client) return demoRecord(id);

  const { data, error } = await client
    .from('artworks')
    .select(ARTWORK_SELECT)
    .eq('id', id)
    .maybeSingle();

  // A missing table means the migrations haven't run — fall back so the page
  // still renders rather than reporting the artwork as deleted.
  if (error) return demoRecord(id);
  if (!data) return null;

  const artwork = toArtwork(data as ArtworkRowRaw);

  const [images, documents, interestRes, dealsRes, matchesRes, eventsRes, visitsRes] =
    await Promise.all([
      listArtworkImages(id),
      listArtworkDocuments(id),
      client
        .from('interest_entries')
        .select(
          'id, purpose, message, organization, is_identified, pipeline_stage, created_at, users!interest_entries_viewer_id_fkey(display_name, country, organization)',
        )
        .eq('artwork_id', id)
        .order('created_at', { ascending: false }),
      client
        .from('artwork_deals')
        .select('id, deal_type, amount, currency, agreed_at, users!artwork_deals_buyer_id_fkey(display_name)')
        .eq('artwork_id', id)
        .order('agreed_at', { ascending: false }),
      client
        .from('opportunity_matches')
        .select(
          'opportunity_id, match_strength, why_text, missing_requirements, opportunities(title, organizer_name, organizer_verified, deadline, location)',
        )
        .eq('artwork_id', id),
      client
        .from('artwork_history_events')
        .select('id, event_type, description, occurred_at')
        .eq('artwork_id', id)
        .order('occurred_at', { ascending: false }),
      client.from('artwork_link_visits').select('source').eq('artwork_id', id),
    ]);

  const interestRows = (interestRes.data ?? []) as unknown as InterestRowRaw[];

  // HARD RULE: anonymous rows are counted, never listed. There is no identity
  // on them to leak, and the brief forbids ever revealing one — see
  // docs/pivot-checklist/12-interest-ledger.md.
  const identified: RecordInterest[] = interestRows
    .filter((row) => row.is_identified && row.users)
    .map((row) => ({
      id: row.id,
      name: row.users?.display_name ?? 'Identified viewer',
      location: row.users?.country ?? null,
      organization: row.organization ?? row.users?.organization ?? null,
      purpose: row.purpose,
      message: row.message,
      stage: row.pipeline_stage,
      createdAt: row.created_at,
    }));

  const anonymousCount = interestRows.length - identified.length;

  const deals: RecordDeal[] = ((dealsRes.data ?? []) as unknown as DealRowRaw[]).map((row) => ({
    id: row.id,
    dealType: row.deal_type,
    amount: Number(row.amount),
    currency: row.currency,
    agreedAt: row.agreed_at,
    buyer: row.users?.display_name ?? null,
  }));

  const matches: RecordMatch[] = ((matchesRes.data ?? []) as unknown as MatchRowRaw[])
    .filter((row) => row.opportunities)
    .map((row) => ({
      id: row.opportunity_id,
      title: row.opportunities?.title ?? '',
      organizer: row.opportunities?.organizer_name ?? null,
      organizerVerified: row.opportunities?.organizer_verified ?? false,
      strength: row.match_strength,
      whyText: row.why_text,
      missing: row.missing_requirements ?? [],
      deadline: row.opportunities?.deadline ?? null,
      location: row.opportunities?.location ?? null,
    }));

  const events: RecordEvent[] = ((eventsRes.data ?? []) as { id: string; event_type: string; description: string | null; occurred_at: string }[]).map(
    (row) => ({
      id: row.id,
      eventType: row.event_type,
      description: row.description,
      occurredAt: row.occurred_at,
    }),
  );

  const visits = (visitsRes.data ?? []) as { source: string }[];
  const counts = new Map<string, number>();
  for (const visit of visits) counts.set(visit.source, (counts.get(visit.source) ?? 0) + 1);

  return {
    artwork,
    images,
    documents,
    interest: { identified, anonymousCount },
    deals,
    matches,
    events,
    linkStats: {
      total: visits.length,
      bySource: [...counts.entries()]
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count),
    },
    isDemo: false,
  };
}
