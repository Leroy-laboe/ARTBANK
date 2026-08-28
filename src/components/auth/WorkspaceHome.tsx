import { Navigate } from 'react-router-dom';
import { useSession } from '../../lib/sessionContext';
import styles from './RequireAuth.module.css';

/** Where "sign in" lands you.
 *
 *  There are two private workspaces now — ArtSpace for artists at /artspace
 *  and the buyer workspace at /collect — and which one a person belongs in is
 *  a property of their public.users row, not of the credentials they just
 *  typed. Sign-in cannot answer it: the role arrives with the profile, one
 *  round trip later. So the sign-in form sends everyone here and this waits
 *  for the profile before choosing, rather than guessing and bouncing.
 *
 *  Artists keep the historical destination when the role can't be read at
 *  all — a profile that failed to load is a broken read, not a signal, and
 *  ArtSpace is where every existing account already expected to arrive.
 *
 *  `profileLoading` matters as much as `loading` here, and missing it was a
 *  real bug: `loading` only covers the identity check at mount, which has
 *  long since settled by the time someone signs in. The sign-in form then
 *  navigates here while the profile row is still in flight, so this saw
 *  `profile: null` — indistinguishable from a failed read — and sent buyers
 *  to ArtSpace. Waiting on both means the role is known before we choose. */
export function WorkspaceHome() {
  const { loading, profileLoading, profile } = useSession();

  if (loading || profileLoading) {
    return (
      <div className={styles.pending} role="status" aria-live="polite">
        <span className={styles.spinner} aria-hidden="true" />
        <p>Opening your workspace…</p>
      </div>
    );
  }

  return <Navigate to={profile?.role === 'buyer' ? '/collect' : '/artspace'} replace />;
}
