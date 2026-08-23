import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSession } from '../../lib/sessionContext';
import styles from './RequireAuth.module.css';

/** Escape hatch for design work: with no identity provider configured there is
 *  no way to sign in, so guarding would make ArtSpace unreachable on a fresh
 *  clone. Set VITE_ARTSPACE_OPEN=true to keep it open even when one is. */
const alwaysOpen =
  import.meta.env.VITE_ARTSPACE_OPEN === 'true' || import.meta.env.VITE_ARTSPACE_OPEN === '1';

/** Gates the private area. Sends anonymous visitors to sign in and returns
 *  them to where they were headed afterwards. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, isAuthenticated, configured } = useSession();
  const location = useLocation();

  if (!configured || alwaysOpen) return <>{children}</>;

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
