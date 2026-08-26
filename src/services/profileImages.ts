import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Avatar and cover uploads for the profile editor.
 *
 *  Files go to the public `profile-images` bucket under {user_id}/, which is
 *  what 0021's storage policy scopes writes to. Public like artwork-images —
 *  an avatar only its owner can load is not an avatar. */

export const PROFILE_IMAGE_LIMITS = {
  maxBytes: 5 * 1024 * 1024,
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  acceptLabel: 'JPG, PNG or WebP',
};

export function profileImageRejection(file: File): string | null {
  if (!PROFILE_IMAGE_LIMITS.accept.includes(file.type)) {
    return `That isn’t a supported format. Use ${PROFILE_IMAGE_LIMITS.acceptLabel}.`;
  }
  if (file.size > PROFILE_IMAGE_LIMITS.maxBytes) return 'That image is over 5MB.';
  return null;
}

/** Uploads and returns the public URL. `kind` only names the file, so a new
 *  avatar doesn't overwrite the cover. */
export async function uploadProfileImage(
  profile: Profile,
  file: File,
  kind: 'avatar' | 'cover',
): Promise<string> {
  const client = supabase;
  if (!client) throw new Error('No storage is configured, so images cannot be uploaded yet.');

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${profile.id}/${kind}-${Date.now()}.${extension}`;

  const { error } = await client.storage
    .from('profile-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;

  return client.storage.from('profile-images').getPublicUrl(path).data.publicUrl;
}
