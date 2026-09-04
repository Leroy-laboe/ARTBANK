import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import { useGuardianRequestSummary } from '../../lib/useGuardianRequests';
import styles from './BuyerAccountMenu.module.css';

/** The signed-in buyer's account menu.
 *
 *  Two triggers, one menu: `row` is the name-and-role block that closes the
 *  sidebar, `avatar` is the bare photo in the top bar. Both open the same
 *  list, so sign-out lives in exactly one place. */
export function BuyerAccountMenu({ trigger }: { trigger: 'row' | 'avatar' }) {
  const navigate = useNavigate();
  const { profile, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  // Shown only for the handful of people someone has actually named as their
  // guardian — everyone else, nothing changes here.
  const guardianRequests = useGuardianRequestSummary();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleLogOut() {
    // Navigate first, sign out after — see ArtspaceSidebar's handleLogOut for
    // the race this avoids: signOut() flips isAuthenticated before this would
    // reach navigate('/'), and RequireAuth can win and redirect to /login.
    navigate('/');
    try {
      await signOut();
    } catch {
      // Already off the private route; nothing else to do here.
    }
  }

  const name = profile?.displayName?.trim() || 'Your account';

  const photo = profile?.avatarUrl ? (
    <img src={profile.avatarUrl} alt="" className={styles.avatar} />
  ) : (
    <span className={styles.avatarEmpty} aria-hidden="true">
      <Icon name="user" size={15} />
    </span>
  );

  return (
    <div
      className={[styles.wrap, trigger === 'row' ? styles.wrapRow : styles.wrapAvatar].join(' ')}
      ref={wrapRef}
    >
      <button
        type="button"
        className={trigger === 'row' ? styles.rowTrigger : styles.avatarTrigger}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={trigger === 'avatar' ? `Account: ${name}` : undefined}
        onClick={() => setOpen((v) => !v)}
      >
        {photo}
        {trigger === 'row' && (
          <>
            <span className={styles.copy}>
              <span className={styles.name}>{name}</span>
              <span className={styles.role}>Collector</span>
            </span>
            <Icon name="chevron-down" size={14} className={styles.caret} />
          </>
        )}
      </button>

      {open && (
        <div className={styles.menu} role="menu" aria-label="Account">
          <p className={styles.email}>{profile?.email ?? 'Not signed in'}</p>

          <Link to="/collect/saved" className={styles.item} onClick={() => setOpen(false)}>
            <Icon name="bookmark" size={14} />
            Saved Works
          </Link>
          <Link to="/collect/rooms" className={styles.item} onClick={() => setOpen(false)}>
            <Icon name="lock" size={14} />
            Viewing Rooms
          </Link>

          {guardianRequests.total > 0 && (
            <Link to="/guardian" className={styles.item} onClick={() => setOpen(false)}>
              <Icon name="shield-check" size={14} />
              Guardian Requests
              {guardianRequests.pending > 0 && (
                <span className={styles.badge}>{guardianRequests.pending}</span>
              )}
            </Link>
          )}

          <button
            type="button"
            className={[styles.item, styles.danger].join(' ')}
            onClick={handleLogOut}
          >
            <Icon name="log-out" size={14} />
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
