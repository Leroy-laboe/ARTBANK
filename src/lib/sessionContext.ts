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
