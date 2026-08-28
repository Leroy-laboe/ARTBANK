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
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    // Set before the first await, so a caller that fires this and renders in
    // the same tick sees "in flight" rather than "no profile".
    setProfileLoading(true);
    try {
      setProfile(await getMyProfile());
    } catch {
      // A missing or unreadable profile row shouldn't sign the user out —
      // they're still authenticated, just without a local record yet.
      setProfile(null);
    } finally {
      setProfileLoading(false);
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
        // Marked in flight synchronously here as well as inside loadProfile:
        // this callback runs before signInWithPassword resolves, so the flag
        // is already up by the time the sign-in form navigates away.
        setProfileLoading(true);
        void loadProfile();
      } else {
        setProfile(null);
        setProfileLoading(false);
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
    setProfileLoading(false);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      loading,
      isAuthenticated,
      profileLoading,
      profile,
      configured: isSupabaseConfigured,
      signOut,
      refresh: loadProfile,
    }),
    [loading, isAuthenticated, profileLoading, profile, signOut, loadProfile],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

