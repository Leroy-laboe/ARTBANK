import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { adminPrimaryNav, adminSecondaryNav } from '../../data/adminContent';
import { getOverviewCounts } from '../../services/admin';
import logo from '../../assets/images/artbank-logo-light.png';
import styles from './AdminSidebar.module.css';

/** The Admin Portal shell nav — forest-dark, distinct from the ArtSpace
 *  sidebar's light surface so an admin never mistakes the portal for their
 *  own artist/buyer workspace. Shared by every admin screen; the active row
 *  comes from the router rather than a prop, same as ArtspaceSidebar. */
export function AdminSidebar() {
  // The `3` in adminPrimaryNav's data is a demo placeholder for when there's
  // no session to count against — same pattern as ArtspaceSidebar's unread
  // message badge.
  const [openFlags, setOpenFlags] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getOverviewCounts().then((result) => {
      if (active && !result.isDemo) setOpenFlags(result.counts.openFlagsCount);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="ARTBANK" className={styles.brandLogo} />
        <span className={styles.brandTagline}>The Global Creator Bank of Creative Value</span>
      </Link>

      <nav className={styles.nav} aria-label="Admin">
        <p className={styles.groupLabel}>Admin Portal</p>
        {adminPrimaryNav.map((item) => {
          const badge = item.to === '/admin/flagged' && openFlags !== null ? openFlags : item.badge;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/admin'}
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

        <div className={styles.divider} />

        {adminSecondaryNav.map((item) => (
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
      </nav>

      <p className={styles.tagline}>Art fuels a more human tomorrow.</p>
    </aside>
  );
}
