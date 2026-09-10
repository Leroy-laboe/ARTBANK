import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useArtist } from '../../lib/useArtist';
import { useSession } from '../../lib/sessionContext';
import { useGuardianRequestSummary } from '../../lib/useGuardianRequests';
import { getUnreadMessageSummary, type MessageNotification } from '../../services/messages';
import { artspaceAccountNav } from '../../data/artspaceContent';
import styles from './ArtspaceTopbar.module.css';

/** Search and account controls, shared by every ArtSpace screen.
 *
 *  Today puts its greeting on this row, so the greeting lives here behind
 *  `showGreeting`. Screens with their own page title (My Works and friends)
 *  turn it off and render an ArtspacePageHeader underneath instead.
 *
 *  The search box, notification bell and account menu used to be inert —
 *  none of them had a handler. All three now do something real: search opens
 *  My Works filtered by what was typed, the bell reads actual unread messages
 *  (the one thing in the schema with a real read/unread state), and the
 *  account menu offers the public profile link and sign-out. */
export function ArtspaceTopbar({
  showGreeting = true,
  searchPlaceholder = 'Search ArtSpace...',
  searchValue,
  onSearchChange,
  onSearchSubmit,
}: {
  showGreeting?: boolean;
  searchPlaceholder?: string;
  /** Pass together for a screen that filters its own list as you type (My
   *  Works). Omit both and the box falls back to submitting on Enter, which
   *  opens My Works filtered by the search — the only screen with an artwork
   *  list to search against. */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
}) {
  const { greeting, firstName, statusLine, name, avatarUrl, unreadNotifications } = useArtist();
  const { profile, signOut } = useSession();
  const navigate = useNavigate();
  // Shown in the account menu only for the handful of people someone has
  // actually named as their guardian — everyone else, nothing changes.
  const guardianRequests = useGuardianRequestSummary();

  /* ── Search ── */

  const [draft, setDraft] = useState('');
  const searchTerm = searchValue ?? draft;
  const setSearchTerm = onSearchChange ?? setDraft;
  const searchRef = useRef<HTMLInputElement>(null);

  // The "/" hint next to the box has never actually focused it until now.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (typing) return;
      event.preventDefault();
      searchRef.current?.focus();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const q = searchTerm.trim();
    if (onSearchSubmit) {
      onSearchSubmit(q);
      return;
    }
    navigate(q ? `/artspace/works?q=${encodeURIComponent(q)}` : '/artspace/works');
  }

  /* ── Notifications ── */

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<MessageNotification[]>([]);
  const [notifCount, setNotifCount] = useState<number | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setNotifCount(null);
      setNotifItems([]);
      return;
    }
    getUnreadMessageSummary(profile).then((summary) => {
      if (!active) return;
      setNotifCount(summary.count);
      setNotifItems(summary.items);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  // Real once signed in — even when that real count is zero. The demo figure
  // only stands in for a session that has nothing to count against.
  const bellCount = profile ? (notifCount ?? 0) : unreadNotifications;

  /* ── Account menu ── */

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notifOpen && !accountOpen) return;

    function onPointerDown(event: MouseEvent) {
      if (notifOpen && !notifRef.current?.contains(event.target as Node)) setNotifOpen(false);
      if (accountOpen && !accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setNotifOpen(false);
        setAccountOpen(false);
      }
    }

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [notifOpen, accountOpen]);

  async function handleLogOut() {
    // Navigate first, sign out after — see ArtspaceSidebar's handleLogOut for
    // why: signOut() flips isAuthenticated before this would otherwise reach
    // navigate('/'), and RequireAuth's own re-render can win that race and
    // redirect to /login instead. Leaving the guarded route first removes it.
    navigate('/');
    try {
      await signOut();
    } catch {
      // Already off the private route; nothing else to do here.
    }
  }

  return (
    <header className={[styles.topbar, !showGreeting && styles.topbarBare].filter(Boolean).join(' ')}>
      {showGreeting && (
        <div className={styles.greetingCol}>
          <h1 className={styles.greeting}>
            {greeting}, {firstName} <span className={styles.wave}>👋</span>
          </h1>
          <p className={styles.status}>{statusLine}</p>
        </div>
      )}

      <div className={styles.controls}>
        <form className={styles.search} onSubmit={submitSearch} role="search">
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            ref={searchRef}
            type="search"
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm ? (
            <button
              type="button"
              className={styles.searchClear}
              aria-label="Clear search"
              onClick={() => setSearchTerm('')}
            >
              <Icon name="close" size={12} />
            </button>
          ) : (
            <kbd className={styles.kbd}>/</kbd>
          )}
        </form>

        <div className={styles.menuWrap} ref={notifRef}>
          <button
            type="button"
            className={styles.bell}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-label={`Notifications (${bellCount} unread)`}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Icon name="bell" size={18} />
            {bellCount > 0 && (
              <span className={styles.bellCount}>{bellCount > 9 ? '9+' : bellCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.panel} role="menu" aria-label="Notifications">
              <p className={styles.panelTitle}>Notifications</p>

              {!profile ? (
                <p className={styles.panelEmpty}>Sign in to see your notifications.</p>
              ) : notifItems.length === 0 ? (
                <p className={styles.panelEmpty}>You’re all caught up.</p>
              ) : (
                <ul className={styles.notifList}>
                  {notifItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/artspace/messages?c=${item.id}`}
                        className={styles.notifItem}
                        onClick={() => setNotifOpen(false)}
                      >
                        <span className={styles.notifDot} aria-hidden="true" />
                        <span className={styles.notifBody}>
                          <span className={styles.notifName}>{item.name}</span>
                          <span className={styles.notifPreview}>{item.preview}</span>
                        </span>
                        <span className={styles.notifTime}>{item.time}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                to="/artspace/messages"
                className={styles.panelFooter}
                onClick={() => setNotifOpen(false)}
              >
                View all messages
              </Link>
            </div>
          )}
        </div>

        <div className={styles.menuWrap} ref={accountRef}>
          <button
            type="button"
            className={styles.account}
            aria-haspopup="true"
            aria-expanded={accountOpen}
            onClick={() => setAccountOpen((v) => !v)}
          >
            <img src={avatarUrl} alt="" className={styles.avatar} />
            <span className={styles.accountName}>{name}</span>
            <Icon name="chevron-down" size={15} className={styles.caret} />
          </button>

          {accountOpen && (
            <div className={[styles.panel, styles.panelRight].join(' ')} role="menu" aria-label="Account">
              <p className={styles.panelEmail}>{profile?.email ?? 'Not signed in'}</p>

              {profile?.profileHandle ? (
                <Link
                  to={`/artists/${profile.profileHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.panelItem}
                  onClick={() => setAccountOpen(false)}
                >
                  <Icon name="external-link" size={14} />
                  View Public Profile
                </Link>
              ) : (
                <Link
                  to="/artspace/profile"
                  className={styles.panelItem}
                  onClick={() => setAccountOpen(false)}
                >
                  <Icon name="user" size={14} />
                  Set up your profile
                </Link>
              )}

              {guardianRequests.total > 0 && (
                <Link
                  to="/guardian"
                  className={styles.panelItem}
                  onClick={() => setAccountOpen(false)}
                >
                  <Icon name="shield-check" size={14} />
                  Guardian Requests
                  {guardianRequests.pending > 0 && (
                    <span className={styles.panelBadge}>{guardianRequests.pending}</span>
                  )}
                </Link>
              )}

              {/* The account destinations normally live in the sidebar, which
                  the bottom bar replaces on a phone. Without these they would
                  be unreachable there, so they appear here at exactly the
                  widths the sidebar is gone. */}
              <div className={styles.panelSidebarOnly}>
                {artspaceAccountNav
                  // Skip Public Profile when the link above is already
                  // pointing at that same editor ("Set up your profile"). With
                  // a handle the link above goes to the public page instead,
                  // so the editor still needs its own row.
                  .filter((item) => item.to !== '/artspace/profile' || profile?.profileHandle)
                  .map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={styles.panelItem}
                      onClick={() => setAccountOpen(false)}
                    >
                      <Icon name={item.icon} size={14} />
                      {item.label}
                    </Link>
                  ))}
              </div>

              <button
                type="button"
                className={[styles.panelItem, styles.panelDanger].join(' ')}
                onClick={handleLogOut}
              >
                <Icon name="log-out" size={14} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
