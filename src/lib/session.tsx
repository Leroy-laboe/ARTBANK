import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getMyProfile, getSession, onAuthStateChange, signOut as signOutService } from '../services/auth';
import { isSupabaseConfigured } from './supabaseClient';
import { SessionContext, type SessionValue } from './sessionContext';
import type { Profile } from '../types/user';

/** The signed-in user, for the whole app.
 *
 *  Screens read this rather than calling Supabase directly, so the identity
 *  source stays swappable: when JO1N ID goes live, only this file changes to
 *  read `/api/me` from server/ instead, and nothing that consumes
 *  `useSession()` has to move.
 *
 *  See docs/pivot-checklist/06-functions-to-build-by-21-aug.md item 1. */
export function SessionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      setProfile(await getMyProfile());
    } catch {
      // A missing or unreadable profile row shouldn't sign the user out —
      // they're still authenticated, just without a local record yet.
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const session = await getSession();
        if (!active) return;
        setAuthenticated(Boolean(session));
        if (session) await loadProfile();
      } finally {
        if (active) setLoading(false);
      }
    })();

    const { data } = onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
      if (session) {
        void loadProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await signOutService();
    setAuthenticated(false);
    setProfile(null);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      isAuthenticated,
      profile,
      configured: isSupabaseConfigured,
      signOut,
      refresh: loadProfile,
    }),
    [loading, isAuthenticated, profile, signOut, loadProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

