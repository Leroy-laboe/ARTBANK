import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Reads and writes public.users.
 *
 *  This is the one table that already had an update policy before the pivot
 *  migrations ("Users can update their own profile", scoped to
 *  auth.uid() = auth_user_id in 0008), so the profile editor can save for
 *  real. The public presentation columns come from 0021. */

/** Everything that existed before 0021. Kept separate so a project without
 *  that migration can still sign in — see `fetchProfileRow`. */
const BASE_COLUMNS =
  'id, auth_user_id, jo1n_identity_id, email, display_name, avatar_url, role, status, country, organization, collecting_interests, is_minor, created_at';

const PROFILE_020_COLUMNS =
  `${BASE_COLUMNS}, artist_name, nationality, website, public_email, short_bio, artist_statement, cover_url, mediums, years_active, education, awards, social_links, profile_handle, profile_visibility, show_contact_information, allow_enquiries, show_artwork_prices`;

/** Adds 0022's country_code on top of 0021's columns. Kept as its own tier —
 *  see `fetchProfileRow` — rather than folded into PROFILE_020_COLUMNS, so an
 *  account that has 0021 but not yet 0022 doesn't lose every 0021 field over
 *  one missing column. */
const PROFILE_COLUMNS = `${PROFILE_020_COLUMNS}, country_code`;

/** The subset a stranger may see. `email`, `role`, `status` and `is_minor` are
 *  deliberately absent: 0021's read policy is row-level, so keeping them out
 *  of the query is what actually stops them reaching a public page.
 *
 *  `_PRE_0022` omits country_code. Public reads (getPublicProfile,
 *  listPublicArtists) fall back to it on error, so an account that already
 *  has a working public profile doesn't go dark — 404ing, or vanishing from
 *  the directory — over one column added for the flag feature. */
export const PUBLIC_PROFILE_COLUMNS_PRE_0022 =
  'id, display_name, avatar_url, cover_url, country, artist_name, nationality, website, public_email, short_bio, artist_statement, mediums, years_active, education, awards, social_links, profile_handle, profile_visibility, show_contact_information, allow_enquiries, show_artwork_prices, created_at';

export const PUBLIC_PROFILE_COLUMNS = `${PUBLIC_PROFILE_COLUMNS_PRE_0022}, country_code`;

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
    publicEmail: text(row, 'public_email'),
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

/** Reads one profile row by column and value.
 *
 *  Three tiers, each falling back to the last if its columns don't exist yet:
 *  0022's country_code → 0021's public-profile columns → the pre-0021 base.
 *  Without this, running the current build against a database that's behind
 *  by even one migration would fail every profile read and lock the user out
 *  of a signed-in session entirely — a much worse outcome than a profile
 *  missing its newest field. */
export async function fetchProfileRow(
  column: string,
  value: string,
): Promise<Profile | null> {
  const client = supabase;
  if (!client) return null;

  const full = await client.from('users').select(PROFILE_COLUMNS).eq(column, value).maybeSingle();
  if (!full.error) return full.data ? rowToProfile(full.data as Row) : null;

  const mid = await client.from('users').select(PROFILE_020_COLUMNS).eq(column, value).maybeSingle();
  if (!mid.error) return mid.data ? rowToProfile(mid.data as Row) : null;

  const base = await client.from('users').select(BASE_COLUMNS).eq(column, value).maybeSingle();
  if (base.error) throw base.error;
  return base.data ? rowToProfile(base.data as Row) : null;
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

  const full = await client
    .from('users')
    .select(PUBLIC_PROFILE_COLUMNS)
    .ilike('profile_handle', handle)
    .maybeSingle();

  // Loosely typed on purpose: the two selects produce genuinely different
  // Supabase-inferred row shapes, and this only ever feeds rowToProfile,
  // which already reads defensively from an untyped Row.
  let data: Row | null = full.data as Row | null;
  if (full.error) {
    const fallback = await client
      .from('users')
      .select(PUBLIC_PROFILE_COLUMNS_PRE_0022)
      .ilike('profile_handle', handle)
      .maybeSingle();
    if (fallback.error || !fallback.data) return null;
    data = fallback.data as Row;
  }

  if (!data) return null;

  const found = rowToProfile(data as Row);
  return found.profileVisibility === 'public' ? found : null;
}
