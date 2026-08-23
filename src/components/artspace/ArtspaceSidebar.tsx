import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import { artspaceAccountNav, artspacePrimaryNav } from '../../data/artspaceContent';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './ArtspaceSidebar.module.css';

/** The ArtSpace shell nav — five primary destinations, a persistent
 *  "+ Add Artwork" button, then the account menu. Shared by every ArtSpace
 *  screen, so the active row comes from the router rather than a prop. */
export function ArtspaceSidebar() {
  const navigate = useNavigate();
  const { signOut } = useSession();

  async function handleLogOut() {
    try {
      await signOut();
    } finally {
      // Land on the homepage either way — a failed sign-out call shouldn't
      // strand the user on a broken button.
      navigate('/');
    }
  }

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="ARTBANK" className={styles.brandLogo} />
      </Link>

      <nav className={styles.nav} aria-label="ArtSpace">
        <p className={styles.groupLabel}>ArtSpace</p>
        {artspacePrimaryNav.map((item) => (
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
            {item.badge && <span className={styles.badge}>{item.badge}</span>}
          </NavLink>
        ))}

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
  );
}
