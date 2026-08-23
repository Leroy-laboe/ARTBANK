import { supabase } from '../lib/supabaseClient';
import {
  works as demoWorks,
  type InterestLevel,
  type PassportState,
  type Work,
  type WorkAvailability,
  type WorkStatus,
} from '../data/artspaceWorks';
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
  coa_status: string;
  image_url: string | null;
  updated_at: string | null;
  created_at: string;
  artwork_images: { url: string; is_primary: boolean }[] | null;
  // Counted, not summarised by the database, because these sets are small and
  // one round trip beats four.
  interest_entries: { id: string; is_identified: boolean }[] | null;
  artwork_deals: { amount: number }[] | null;
  opportunity_matches: { opportunity_id: string }[] | null;
};

const SELECT = `
  id, title, year, medium, dimensions, status, availability, availability_note,
  coa_status, image_url, updated_at, created_at,
  artwork_images(url, is_primary),
  interest_entries(id, is_identified),
  artwork_deals(amount),
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

  const deals = row.artwork_deals ?? [];
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
  };
}

export type WorksResult = { works: Work[]; isDemo: boolean };

export async function listMyWorks(profile: Profile | null): Promise<WorksResult> {
  if (!supabase || !profile) return { works: demoWorks, isDemo: true };

  const { data, error } = await supabase
    .from('artworks')
    .select(SELECT)
    .or(`artist_id.eq.${profile.id},uploaded_by.eq.${profile.id}`)
    .order('updated_at', { ascending: false });

  // A missing table (migrations not run yet) lands here too — fall back rather
  // than showing an empty portfolio the artist might mistake for data loss.
  if (error || !data || data.length === 0) return { works: demoWorks, isDemo: true };

  return { works: (data as unknown as ArtworkRow[]).map(fromRow), isDemo: false };
}

export async function setArtworkStatus(id: string, status: 'draft' | 'published' | 'archived') {
  if (!supabase) throw new Error('No database is configured, so changes cannot be saved yet.');
  const { error } = await supabase
    .from('artworks')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
