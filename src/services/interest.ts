import { supabase } from '../lib/supabaseClient';
import {
  enquiries as demoEnquiries,
  interestOverview as demoInterestOverview,
  recentViewers as demoViewers,
  type Enquiry,
  type Follower,
  type InterestPurpose,
  type MonogramTone,
  type Viewer,
} from '../data/artspaceInterest';
import type { OverviewStat } from '../components/artspace/StatsOverviewPanel';
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
  /** Overview figures for the right rail. Every one is a count of rows this
   *  artist can actually read — see buildStats. */
  stats: OverviewStat[];
  isDemo: boolean;
};

/** Pipeline stages that mean somebody got past a first look.
 *  'viewer' is a visit; everything from 'qualified' on is a real conversation. */
const SERIOUS_STAGES = ['qualified', 'viewing_room', 'negotiation', 'completed'];

/** Counts for the Interest Overview card.
 *
 *  Deliberately excludes a "Shortlisted" figure. Saves live in
 *  `saved_artworks`, whose only policy is "Buyers manage their own save list"
 *  — an artist reading it gets zero rows whether or not anyone saved their
 *  work. A confident 0 that means "cannot see" is a worse lie than no number
 *  at all, so the stat is left out until the artist has a read policy. */
function buildStats(
  rows: EntryRow[],
  anonymousCount: number,
  followers: number,
): OverviewStat[] {
  const serious = rows.filter((r) => SERIOUS_STAGES.includes(r.pipeline_stage)).length;
  const discussing = rows.filter((r) => r.pipeline_stage === 'negotiation').length;

  return [
    { id: 'enquiries', value: String(rows.length), label: 'Identified Enquiries' },
    { id: 'following', value: String(followers), label: 'People Following' },
    { id: 'serious', value: String(serious), label: 'Serious Interest' },
    { id: 'discussions', value: String(discussing), label: 'In Discussion' },
    { id: 'anonymous', value: String(anonymousCount), label: 'Anonymous Views' },
  ];
}

type FollowerRow = {
  follower_id: string;
  created_at: string;
  users: {
    display_name: string | null;
    artist_name: string | null;
    avatar_url: string | null;
    country: string | null;
    organization: string | null;
    role: string;
  } | null;
};

/** The people following this artist.
 *
 *  Readable because 0021 adds "Artists read their own followers". Following is
 *  a stated, identified relationship — not an anonymous view — so unlike the
 *  viewer ledger these people can be named. Returns null on a failed read so
 *  the panel can tell "cannot see" from "nobody yet". */
export async function loadFollowers(profile: Profile | null): Promise<Follower[] | null> {
  if (!supabase || !profile) return null;

  const { data, error } = await supabase
    .from('profile_follows')
    .select(
      'follower_id, created_at, users!profile_follows_follower_id_fkey(display_name, artist_name, avatar_url, country, organization, role)',
    )
    .eq('artist_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(12);

  if (error || !data) return null;

  return (data as unknown as FollowerRow[]).map((row, index) => {
    const name =
      row.users?.artist_name?.trim() || row.users?.display_name?.trim() || 'ArtBank member';

    return {
      id: row.follower_id,
      name,
      // Their organisation where they gave one, otherwise what kind of account
      // it is. Never invented — "Collector" is the account's own role.
      role: row.users?.organization?.trim() || roleLabel[row.users?.role ?? ''] || 'Member',
      location: row.users?.country ?? '—',
      // Everyone here has an account and chose to follow under it, which is
      // exactly what the badge means on this panel.
      verified: true,
      avatarUrl: row.users?.avatar_url ?? undefined,
      monogram: monogram(name),
      tone: tones[index % tones.length],
    };
  });
}

const roleLabel: Record<string, string> = {
  buyer: 'Collector',
  artist: 'Artist',
  partner: 'Partner',
  guardian: 'Guardian',
};

export async function loadInterest(profile: Profile | null): Promise<InterestResult> {
  if (!supabase || !profile) {
    return {
      enquiries: demoEnquiries,
      viewers: demoViewers,
      anonymousCount: 412,
      stats: demoInterestOverview.stats,
      isDemo: true,
    };
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
    return {
      enquiries: demoEnquiries,
      viewers: demoViewers,
      anonymousCount: 412,
      stats: demoInterestOverview.stats,
      isDemo: true,
    };
  }

  const rows = (data ?? []) as unknown as EntryRow[];

  const [{ count }, { count: followerCount }] = await Promise.all([
    supabase
      .from('interest_entries')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('is_identified', false),
    // Readable because 0021 adds "Artists read their own followers".
    supabase
      .from('profile_follows')
      .select('follower_id', { count: 'exact', head: true })
      .eq('artist_id', profile.id),
  ]);

  const anonymousCount = count ?? 0;

  return {
    enquiries: rows.slice(0, 3).map(toEnquiry),
    // Recent Viewers needs thumbnails the ledger doesn't carry; keeping the
    // demo set here is honest as long as the panel says so.
    viewers: demoViewers,
    anonymousCount,
    stats: buildStats(rows, anonymousCount, followerCount ?? 0),
    isDemo: false,
  };
}
