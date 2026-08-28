import { createContext, useContext } from 'react';
import type { Profile } from '../types/user';

/** Shape of the signed-in user, shared by the provider and the hook.
 *
 *  Kept apart from session.tsx so that file exports only a component — mixing
 *  a provider and a hook in one module breaks React Fast Refresh. */
export type SessionValue = {
  /** True until the first identity check settles. Screens should not decide
   *  anything about auth while this is true — it causes redirect flicker. */
  loading: boolean;
  isAuthenticated: boolean;
  /** True while the profile row is being (re-)read.
   *
   *  Distinct from `loading`, which only covers the check at mount. Signing in
   *  happens long after that has settled, so anything deciding on a *field* of
   *  the profile — the role, above all — must wait on this as well, or it will
   *  read `profile: null` in the window between the auth event and the row
   *  arriving. See WorkspaceHome. */
  profileLoading: boolean;
  /** The public.users row for the signed-in account, once loaded. */
  profile: Profile | null;
  /** False when no identity provider is configured at all, which is the
   *  prototype's normal state on a fresh clone. */
  configured: boolean;
  signOut: () => Promise<void>;
  /** Re-reads the profile after something edits it. */
  refresh: () => Promise<void>;
};

export const SessionContext = createContext<SessionValue | null>(null);

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside <SessionProvider>');
  return value;
}
