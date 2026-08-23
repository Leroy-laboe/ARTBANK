import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Writes to public.users.
 *
 *  This is the one table that already had an update policy before the pivot
 *  migrations ("Users can update their own profile", scoped to
 *  auth.uid() = auth_user_id in 0008), so the profile editor can save for
 *  real without waiting on any new schema. */

export type ProfilePatch = {
  displayName?: string | null;
  avatarUrl?: string | null;
  country?: string | null;
  organization?: string | null;
  collectingInterests?: string[] | null;
};

/** Maps camelCase form fields onto the snake_case columns, dropping anything
 *  the caller didn't set so a partial save never blanks a column. */
function toRow(patch: ProfilePatch) {
  const row: Record<string, unknown> = {};
  if (patch.displayName !== undefined) row.display_name = patch.displayName;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
  if (patch.country !== undefined) row.country = patch.country;
  if (patch.organization !== undefined) row.organization = patch.organization;
  if (patch.collectingInterests !== undefined) row.collecting_interests = patch.collectingInterests;
  return row;
}

export class NotConfiguredError extends Error {
  constructor() {
    super('No database is configured, so changes cannot be saved yet.');
    this.name = 'NotConfiguredError';
  }
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

  return {
    ...profile,
    displayName: patch.displayName ?? profile.displayName,
    avatarUrl: patch.avatarUrl ?? profile.avatarUrl,
    country: patch.country ?? profile.country,
    organization: patch.organization ?? profile.organization,
    collectingInterests: patch.collectingInterests ?? profile.collectingInterests,
  };
}
