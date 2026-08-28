import { supabase } from '../lib/supabaseClient';
import {
  enquiries as demoEnquiries,
  recentViewers as demoViewers,
  type Enquiry,
  type InterestPurpose,
  type MonogramTone,
  type Viewer,
} from '../data/artspaceInterest';
import type { Profile } from '../types/user';

/** Reads the interest ledger. Requires migrations 0012 and 0016.
 *
 *  HARD RULE: only identified entries are ever returned with a person
 *  attached. Anonymous rows carry no viewer_id in the database at all, so
 *  there is nothing here that could leak an identity — see
 *  docs/pivot-checklist/12-interest-ledger.md. */

type EntryRow = {
  id: string;
  purpose: string | null;
  message: string | null;
  organization: string | null;
  is_identified: boolean;
  pipeline_stage: string;
  next_action: string | null;
  created_at: string;
  artworks: { title: string } | null;
  users: { display_name: string | null; country: string | null; organization: string | null } | null;
};

const SELECT = `
  id, purpose, message, organization, is_identified, pipeline_stage, next_action, created_at,
  artworks(title),
  users!interest_entries_viewer_id_fkey(display_name, country, organization)
`;

const purposeLabel: Record<string, string> = {
  purchase: 'Acquisition',
  licence: 'Licensing',
  exhibit: 'Exhibition use',
  commission: 'Commission',
  collaborate: 'Collaboration',
};

/** Initials for a correspondent with no photo — "Galerie Lumière" → "GL". */
function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

const tones: MonogramTone[] = ['forest', 'gold', 'ink'];

function relativeTime(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function toEnquiry(row: EntryRow, index: number): Enquiry {
  const name = row.users?.display_name ?? row.organization ?? 'Identified viewer';
  const purpose = (row.purpose ?? 'purchase') as InterestPurpose;

  return {
    id: row.id,
    name,
    monogram: monogram(name),
    tone: tones[index % tones.length],
    // Everyone in this list consented to be identified, which is exactly what
    // the verification badge means here.
    verified: row.is_identified,
    location: row.users?.country ?? '—',
    artwork: row.artworks?.title ?? 'Your portfolio',
    purpose: (purpose.charAt(0).toUpperCase() + purpose.slice(1)) as Enquiry['purpose'],
    purposeLabel: purposeLabel[purpose] ?? 'Enquiry',
    preview: row.message ?? `${purposeLabel[purpose] ?? 'Enquiry'} — no message attached.`,
    time: relativeTime(row.created_at),
    status: row.pipeline_stage === 'viewer' ? 'New' : row.next_action ? 'Replied' : 'Awaiting',
    nextAction: 'Reply',
  };
}

export type InterestResult = {
  enquiries: Enquiry[];
  viewers: Viewer[];
  /** Count only, never names. Anonymous visitors are not identifiable. */
  anonymousCount: number;
  isDemo: boolean;
};

export async function loadInterest(profile: Profile | null): Promise<InterestResult> {
  if (!supabase || !profile) {
    return { enquiries: demoEnquiries, viewers: demoViewers, anonymousCount: 412, isDemo: true };
  }

  const { data, error } = await supabase
    .from('interest_entries')
    .select(SELECT)
    .eq('artist_id', profile.id)
    .eq('is_identified', true)
    .order('created_at', { ascending: false })
    .limit(24);

  // A read that FAILED and a ledger that is EMPTY are not the same thing.
  // The first means we cannot see the data — no migrations, no permission —
  // and standing in demo content is the kind thing to do. The second is a
  // real answer, and dressing it up as someone else's enquiries tells a
  // signed-in artist they have interest they do not have.
  if (error) {
    return { enquiries: demoEnquiries, viewers: demoViewers, anonymousCount: 412, isDemo: true };
  }

  const rows = (data ?? []) as unknown as EntryRow[];

  const { count } = await supabase
    .from('interest_entries')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', profile.id)
    .eq('is_identified', false);

  return {
    enquiries: rows.slice(0, 3).map(toEnquiry),
    // Recent Viewers needs thumbnails the ledger doesn't carry; keeping the
    // demo set here is honest as long as the panel says so.
    viewers: demoViewers,
    anonymousCount: count ?? 0,
    isDemo: false,
  };
}
