import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useAdmin } from '../../lib/useAdmin';
import { useSession } from '../../lib/sessionContext';
import styles from './AdminTopbar.module.css';

/** Search and account controls, shared by every Admin Portal screen — same
 *  role as ArtspaceTopbar, adapted for the admin shell. The search box is a
 *  stated preview rather than a wired lookup: there is no admin search
 *  service behind it yet (no services/admin.ts — see CLAUDE.md's note on
 *  checking before assuming a service layer exists). */
export function AdminTopbar() {
  const admin = useAdmin();
  const { signOut } = useSession();
  const navigate = useNavigate();

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [accountOpen]);

  async function handleSignOut() {
    // Navigate first, sign out after — same race avoided in ArtspaceSidebar's
    // handleLogOut: signOut() flips isAuthenticated before this would
    // otherwise reach navigate('/'), and RequireAuth's re-render can win
    // that race and redirect to /login instead.
    navigate('/');
    try {
      await signOut();
    } catch {
      // Already off the guarded route; nothing else to do here.
    }
  }

  return (
    <header className={styles.topbar}>
      <form className={styles.search} onSubmit={(e: FormEvent) => e.preventDefault()} role="search">
        <Icon name="search" size={16} className={styles.searchIcon} />
        <input
          type="search"
          placeholder="Search artworks, artists, users, conversations..."
          aria-label="Search"
        />
        <kbd className={styles.kbd}>⌘K</kbd>
      </form>

      <div className={styles.controls}>
        <button type="button" className={styles.bell} aria-label={`Notifications (${admin.unreadNotifications} unread)`}>
          <Icon name="bell" size={18} />
          {admin.unreadNotifications > 0 && (
            <span className={styles.bellCount}>{admin.unreadNotifications}</span>
          )}
        </button>

        <div className={styles.menuWrap} ref={accountRef}>
          <button
            type="button"
            className={styles.account}
            aria-haspopup="true"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((v) => !v)}
          >
            <img src={admin.avatarUrl} alt="" className={styles.avatar} />
            <span className={styles.accountCopy}>
              <span className={styles.accountName}>{admin.name}</span>
              <span className={styles.accountRole}>{admin.roleLabel}</span>
            </span>
            <Icon name="chevron-down" size={15} className={styles.caret} />
          </button>

          {accountOpen && (
            <div className={styles.panel} role="menu" aria-label="Account">
              <Link
                to="/admin/profile"
                className={styles.panelItem}
                onClick={() => setAccountOpen(false)}
              >
                <Icon name="user" size={14} />
                Admin Profile
              </Link>
              <button
                type="button"
                className={[styles.panelItem, styles.panelDanger].join(' ')}
                onClick={handleSignOut}
              >
                <Icon name="log-out" size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>

        <span className={styles.brandWords} aria-hidden="true">
          <span>People</span>
          <span>Art</span>
          <span>Opportunity</span>
          <span className={styles.brandWordsAccent}>A Brighter Tomorrow</span>
        </span>
      </div>
    </header>
  );
}
