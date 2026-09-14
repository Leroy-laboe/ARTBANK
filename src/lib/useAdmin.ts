import { useMemo } from 'react';
import { useSession } from './sessionContext';
import { demoAdmin } from '../data/adminContent';

/** The admin as the Admin Portal needs them: real profile fields where a
 *  session exists, demo values where it doesn't. Same "real vs demo"
 *  fallback as useArtist. */
export function useAdmin() {
  const { profile } = useSession();

  return useMemo(() => {
    if (!profile) return { ...demoAdmin, isDemo: true };

    const name = profile.displayName?.trim() || profile.email.split('@')[0];

    return {
      ...demoAdmin,
      name,
      avatarUrl: profile.avatarUrl ?? demoAdmin.avatarUrl,
      isDemo: false,
    };
  }, [profile]);
}
