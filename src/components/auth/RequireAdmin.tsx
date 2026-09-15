import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../../lib/sessionContext';

/** Same VITE_ARTSPACE_OPEN escape hatch as RequireAuth's own `alwaysOpen` —
 *  duplicated rather than imported because a file exporting anything besides
 *  a component breaks Fast Refresh (see RequireAuth's comment). */
const alwaysOpen =
  import.meta.env.DEV &&
  (import.meta.env.VITE_ARTSPACE_OPEN === 'true' || import.meta.env.VITE_ARTSPACE_OPEN === '1');

/** Gates the Admin Portal to `users.role = 'admin'` — see
 *  docs/pivot-checklist/29-feature-admin-functions.md's closing note: "none
 *  of it reachable from the artist/buyer/guardian navigation."
 *
 *  Left open in development when no identity provider is configured, or when
 *  the same escape hatch RequireAuth uses is set: with no backend behind it
 *  there is no admin account to check a role against. A production build
 *  honours neither and always requires the admin role. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { configured, profile } = useSession();
  if (alwaysOpen || (!configured && import.meta.env.DEV)) return <>{children}</>;
  if (profile?.role !== 'admin') return <Navigate to="/workspace" replace />;
  return <>{children}</>;
}
