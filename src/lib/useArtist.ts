import { useMemo } from 'react';
import { useSession } from './sessionContext';
import { artspaceArtist } from '../data/artspaceContent';

/** The artist as ArtSpace screens need them: real profile fields where a
 *  session exists, demo values where it doesn't.
 *
 *  Keeping the fallback means every screen renders on a fresh clone with no
 *  Supabase project behind it — the same pattern artworksRepo.ts uses. Check
 *  `isDemo` before showing anything as fact. */
export function useArtist() {
  const { profile } = useSession();

  return useMemo(() => {
    if (!profile) return { ...artspaceArtist, isDemo: true };

    const name = profile.displayName?.trim() || profile.email.split('@')[0];

    return {
      ...artspaceArtist,
      name,
      firstName: name.split(' ')[0],
      avatarUrl: profile.avatarUrl ?? artspaceArtist.avatarUrl,
      location: profile.country ?? artspaceArtist.location,
      // JO1N ID is the identity provider's subject claim once that flow is
      // live; Supabase accounts don't have one yet.
      joinId: profile.jo1nIdentityId ?? artspaceArtist.joinId,
      memberSince: new Date(profile.createdAt).toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      }),
      isDemo: false,
    };
  }, [profile]);
}
