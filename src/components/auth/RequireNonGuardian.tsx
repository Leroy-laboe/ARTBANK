import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../../lib/sessionContext';

/** Blocks a pure guardian account from the artist and buyer workspaces.
 *
 *  WorkspaceHome already sends a guardian to /guardian on sign-in, but that
 *  only covers the one path everyone lands on after logging in — nothing
 *  stopped the same account from typing /artspace or /collect straight into
 *  the address bar and seeing a full workspace that has nothing to do with
 *  them. A guardian's account has no artist or buyer business at all, so
 *  reaching either by a stale link or a direct URL sends them back to the
 *  one place that actually belongs to them. */
export function RequireNonGuardian({ children }: { children: ReactNode }) {
  const { profile } = useSession();
  if (profile?.role === 'guardian') return <Navigate to="/guardian" replace />;
  return <>{children}</>;
}
