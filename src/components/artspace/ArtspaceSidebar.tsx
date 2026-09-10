import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { BottomNavBar } from '../ui/bottom-nav-bar';
import { useSession } from '../../lib/sessionContext';
import { getUnreadMessageSummary } from '../../services/messages';
import { artspaceAccountNav, artspacePrimaryNav } from '../../data/artspaceContent';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './ArtspaceSidebar.module.css';

/** The ArtSpace shell nav — five primary destinations, a persistent
 *  "+ Add Artwork" button, then the account menu. Shared by every ArtSpace
 *  screen, so the active row comes from the router rather than a prop. */
export function ArtspaceSidebar() {
  const navigate = useNavigate();
  const { profile, signOut } = useSession();

  // Messages carries the one badge with a real unread count behind it
  // (messages.read_at). The `3` in artspacePrimaryNav's data is a demo
  // placeholder for when there's no session to count against.
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setUnreadMessages(null);
      return;
    }
    getUnreadMessageSummary(profile).then((summary) => {
      if (active) setUnreadMessages(summary.count);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  async function handleLogOut() {
    // Navigate first, sign out after. signOut() flips isAuthenticated to
    // false before this function would otherwise reach `navigate('/')` — if
    // that lands while the URL is still /artspace/..., RequireAuth's own
    // re-render can win the race and redirect to /login before the '/'
    // navigation ever takes effect. Leaving the guarded route first removes
    // the race entirely, and a failed sign-out call still shouldn't strand
    // anyone on a broken button.
    navigate('/');
    try {
      await signOut();
    } catch {
      // Already off the private route; nothing else to do here.
    }
  }

  return (
    <>
    {/* The phone's navigation. Rendered here rather than in each ArtSpace
        page so every screen that already mounts this sidebar gets it, and
        hidden above the breakpoint where the rail itself returns. */}
    <BottomNavBar
      className="hidden max-[650px]:flex"
      items={artspacePrimaryNav.map((item) => ({
        ...item,
        end: item.to === '/artspace',
        badge: item.to === '/artspace/messages' && profile ? unreadMessages : item.badge,
      }))}
    />

    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="ARTBANK" className={styles.brandLogo} />
      </Link>

      <nav className={styles.nav} aria-label="ArtSpace">
        <p className={styles.groupLabel}>ArtSpace</p>
        {artspacePrimaryNav.map((item) => {
          const badge =
            item.to === '/artspace/messages' && profile ? unreadMessages : item.badge;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/artspace'}
              className={({ isActive }) =>
                [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')
              }
            >
              <Icon name={item.icon} size={17} />
              <span className={styles.navLabel}>{item.label}</span>
              {Boolean(badge) && <span className={styles.badge}>{badge}</span>}
            </NavLink>
          );
        })}

        <Link to="/artspace/works/new" className={styles.addBtn}>
          <Icon name="plus" size={16} />
          Add Artwork
        </Link>

        <p className={styles.groupLabel}>Account</p>
        {artspaceAccountNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')
            }
          >
            <Icon name={item.icon} size={17} />
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}

        <div className={styles.divider} />

        <button type="button" onClick={handleLogOut} className={`${styles.navItem} ${styles.logOutBtn}`}>
          <Icon name="log-out" size={17} />
          <span className={styles.navLabel}>Log Out</span>
        </button>
      </nav>

      <div className={styles.helpCard}>
        <Icon name="headset" size={20} className={styles.helpIcon} />
        <div>
          <p className={styles.helpTitle}>Need help?</p>
          <p className={styles.helpNote}>We’re here for you</p>
          <Link to="/artspace/help" className={styles.helpLink}>
            Visit Help Center
            <Icon name="arrow-right" size={12} />
          </Link>
        </div>
      </div>
    </aside>
    </>
  );
}
