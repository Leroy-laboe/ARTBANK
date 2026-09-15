import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../lib/sessionContext';
import styles from './RequireAuth.module.css';

/** Escape hatch for design work: with no identity provider configured there is
 *  no way to sign in, so guarding would make ArtSpace unreachable on a fresh
 *  clone. Set VITE_ARTSPACE_OPEN=true to keep it open even when one is.
 *
 *  Development builds only. A production build ignores the flag entirely, so
 *  a stray env var on the host can never hand the private area to a
 *  signed-out visitor.
 *
 *  Not exported: RequireAdmin needs this exact same check (see its own
 *  comment) but a file exporting anything besides a component breaks Fast
 *  Refresh, so it keeps its own copy instead of importing this one. */
const alwaysOpen =
  import.meta.env.DEV &&
  (import.meta.env.VITE_ARTSPACE_OPEN === 'true' || import.meta.env.VITE_ARTSPACE_OPEN === '1');

/** Gates the private area. Sends anonymous visitors to sign in and returns
 *  them to where they were headed afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated, configured } = useSession();
  const location = useLocation();

  if (alwaysOpen) return <>{children}</>;

  if (!configured) {
    // No database means no way to check a session. On a local clone that is
    // design work, so the area stays open. A production build with its
    // Supabase variables missing fails closed instead of failing open.
    if (import.meta.env.DEV) return <>{children}</>;
    return (
      <div className={styles.pending} role="alert">
        <p>Sign-in is temporarily unavailable. Please try again shortly.</p>
      </div>
    );
  }

  // Redirecting mid-check would bounce signed-in users on every refresh.
  if (loading) {
    return (
      <div className={styles.pending} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Checking your session…</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
