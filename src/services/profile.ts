import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Reads and writes public.users.
 *
 *  Since 0036 the client roles hold column-level privileges on this table,
 *  not table-wide ones. Any account's public presentation columns can be read
 *  (subject to the row policies), but `email`, `is_minor`, `status`,
 *  `jo1n_identity_id`, `auth_user_id` and the raw `public_email` cannot — not
 *  even on your own row, because a column privilege can't tell rows apart.
 *  Your own full row comes from the my_profile() function instead.
 *
 *  Writes are column-limited the same way: the profile editor's fields are
 *  updatable, the account-control ones are not. */

/** The subset a stranger may see. Every column here is one 0036 grants to the
 *  client roles. `contact_email` stands in for `public_email`: it is generated
 *  from it and is null unless the artist switched Show Contact Information
 *  on, so a hidden contact address never leaves the database. */
export const PUBLIC_PROFILE_COLUMNS =
  'id, display_name, avatar_url, cover_url, country, country_code, artist_name, nationality, website, contact_email, short_bio, artist_statement, mediums, years_active, education, awards, social_links, profile_handle, profile_visibility, show_contact_information, allow_enquiries, show_artwork_prices, created_at';

type Row = Record<string, unknown>;

const text = (row: Row, key: string): string | null =>
  typeof row[key] === 'string' ? (row[key] as string) : null;

export function rowToProfile(row: Row): Profile {
  return {
    id: String(row.id ?? ''),
    authUserId: text(row, 'auth_user_id'),
    jo1nIdentityId: text(row, 'jo1n_identity_id'),
    email: text(row, 'email') ?? '',
    displayName: text(row, 'display_name'),
    avatarUrl: text(row, 'avatar_url'),
    role: (row.role as Profile['role']) ?? 'artist',
    status: (row.status as Profile['status']) ?? 'active',
    country: text(row, 'country'),
    countryCode: text(row, 'country_code'),
    organization: text(row, 'organization'),
    collectingInterests: Array.isArray(row.collecting_interests)
      ? (row.collecting_interests as string[])
      : null,
    isMinor: row.is_minor === true,
    createdAt: text(row, 'created_at') ?? new Date().toISOString(),

    // 0021. Defaulted rather than assumed present, so a row read before that
    // migration ran still produces a usable Profile.
    artistName: text(row, 'artist_name'),
    nationality: text(row, 'nationality'),
    website: text(row, 'website'),
    // Your own row (my_profile) carries public_email; anyone else's row only
    // ever carries the generated contact_email.
    publicEmail: text(row, 'public_email') ?? text(row, 'contact_email'),
    shortBio: text(row, 'short_bio'),
    artistStatement: text(row, 'artist_statement'),
    coverUrl: text(row, 'cover_url'),
    mediums: Array.isArray(row.mediums) ? (row.mediums as string[]) : [],
    yearsActive: text(row, 'years_active'),
    education: text(row, 'education'),
    awards: text(row, 'awards'),
    socialLinks:
      row.social_links && typeof row.social_links === 'object'
        ? (row.social_links as Record<string, string>)
        : {},
    profileHandle: text(row, 'profile_handle'),
    profileVisibility: (row.profile_visibility as Profile['profileVisibility']) ?? 'public',
    showContactInformation: row.show_contact_information === true,
    allowEnquiries: row.allow_enquiries !== false,
    showArtworkPrices: row.show_artwork_prices === true,
  };
}

/** Reads the signed-in account's own full profile.
 *
 *  Goes through my_profile() (0036) rather than the table, because the
 *  account-control columns — email, is_minor, status, identity ids — are no
 *  longer selectable from the client at all; see the note at the top of this
 *  file. The function only ever returns the caller's own row.
 *
 *  `column`/`value` are kept so existing callers need no change, and act as a
 *  check: the row is returned only if it really is the one they asked for.
 *
 *  The schema is something the app may assume. A database that is behind
 *  should fail loudly here rather than quietly serve a partial profile — see
 *  finding 5 in docs/pivot-checklist/27-production-readiness-audit.md. */
export async function fetchProfileRow(
  column: string,
  value: string,
): Promise<Profile | null> {
  const client = supabase;
  if (!client) return null;

  const { data, error } = await client.rpc('my_profile');

  if (error) throw error;
  if (!data) return null;
  const row = data as Row;
  return String(row[column] ?? '') === value ? rowToProfile(row) : null;
}

export type ProfilePatch = {
  displayName?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  country?: string | null;
  /** Set together with `country` — see the Country field in Profile Details. */
  countryCode?: string | null;
  organization?: string | null;
  collectingInterests?: string[] | null;

  artistName?: string | null;
  nationality?: string | null;
  website?: string | null;
  publicEmail?: string | null;
  shortBio?: string | null;
  artistStatement?: string | null;
  mediums?: string[];
  yearsActive?: string | null;
  education?: string | null;
  awards?: string | null;
  socialLinks?: Record<string, string>;
  profileHandle?: string | null;
  profileVisibility?: Profile['profileVisibility'];
  showContactInformation?: boolean;
  allowEnquiries?: boolean;
  showArtworkPrices?: boolean;
};

/** Maps camelCase form fields onto the snake_case columns, dropping anything
 *  the caller didn't set so a partial save never blanks a column. */
function toRow(patch: ProfilePatch) {
  const map: Record<keyof ProfilePatch, string> = {
    displayName: 'display_name',
    avatarUrl: 'avatar_url',
    coverUrl: 'cover_url',
    country: 'country',
    countryCode: 'country_code',
    organization: 'organization',
    collectingInterests: 'collecting_interests',
    artistName: 'artist_name',
    nationality: 'nationality',
    website: 'website',
    publicEmail: 'public_email',
    shortBio: 'short_bio',
    artistStatement: 'artist_statement',
    mediums: 'mediums',
    yearsActive: 'years_active',
    education: 'education',
    awards: 'awards',
    socialLinks: 'social_links',
    profileHandle: 'profile_handle',
    profileVisibility: 'profile_visibility',
    showContactInformation: 'show_contact_information',
    allowEnquiries: 'allow_enquiries',
    showArtworkPrices: 'show_artwork_prices',
  };

  const row: Record<string, unknown> = {};
  for (const [key, column] of Object.entries(map)) {
    const value = patch[key as keyof ProfilePatch];
    if (value !== undefined) row[column] = value;
  }
  return row;
}

export class NotConfiguredError extends Error {
  constructor() {
    super('No database is configured, so changes cannot be saved yet.');
    this.name = 'NotConfiguredError';
  }
}

/** Turns a failed profile write into something actionable — chiefly the case
 *  where 0021 hasn't been applied, which otherwise reads as a mystery. */
export function describeProfileError(err: unknown): string {
  if (err instanceof NotConfiguredError) return err.message;
  const raw = err as { message?: string; code?: string } | null;
  const message = raw?.message ?? '';

  if (raw?.code === '42703' || /column .* does not exist/i.test(message)) {
    return `The database is missing a column this form needs — ${message}. Run the outstanding migrations in supabase/migrations.`;
  }
  if (raw?.code === '23505' || /duplicate key/i.test(message)) {
    return 'That profile URL is already taken. Try another.';
  }
  if (raw?.code === '42501' || /row-level security/i.test(message)) {
    return 'The database refused the change for this account.';
  }
  return message || 'Could not save your changes. Please try again.';
}

export async function updateMyProfile(profile: Profile, patch: ProfilePatch): Promise<Profile> {
  if (!supabase) throw new NotConfiguredError();

  const row = toRow(patch);
  if (Object.keys(row).length === 0) return profile;

  const { error } = await supabase
    .from('users')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', profile.id);

  if (error) throw error;

  // Merge rather than re-read: the caller usually refreshes the session right
  // after, and this keeps the returned value correct if it doesn't.
  return { ...profile, ...patch } as Profile;
}

/* ── Public profile counts ──────────────────────────────────────────────── */

/** The three figures the preview shows.
 *
 *  Portfolio credentials only. No earnings, no interest, no readiness score —
 *  spec 16 deletes public earnings and statistics outright. */
export type ProfileCounts = { artworks: number; exhibitions: number; opportunities: number };

export async function getProfileCounts(profile: Profile): Promise<ProfileCounts> {
  const client = supabase;
  if (!client) return { artworks: 0, exhibitions: 0, opportunities: 0 };

  const [artworks, exhibitions, opportunities] = await Promise.all([
    client
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('artist_id', profile.id)
      .eq('status', 'published'),
    // Exhibitions are provenance events on the artist's works, which is the
    // only place the schema records one today.
    client
      .from('artwork_history_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_type', 'exhibition'),
    client
      .from('opportunity_matches')
      .select('opportunity_id', { count: 'exact', head: true })
      .eq('artist_id', profile.id),
  ]);

  return {
    artworks: artworks.count ?? 0,
    exhibitions: exhibitions.count ?? 0,
    opportunities: opportunities.count ?? 0,
  };
}

/** Reads a public profile by its handle. Returns null when there is no such
 *  handle, or when the profile isn't public — the two are indistinguishable
 *  from outside on purpose.
 *
 *  Falls back to the pre-0022 column list on error (missing country_code),
 *  same reasoning as fetchProfileRow: a real, already-public profile 404ing
 *  because of one column added for the flag feature would be a self-inflicted
 *  regression, not a genuine "not found". */
export async function getPublicProfile(handle: string): Promise<Profile | null> {
  const client = supabase;
  if (!client) return null;

  const { data, error } = await client
    .from('users')
    .select(PUBLIC_PROFILE_COLUMNS)
    .ilike('profile_handle', handle)
    .maybeSingle();

  if (error || !data) return null;

  const found = rowToProfile(data as Row);
  return found.profileVisibility === 'public' ? found : null;
}
