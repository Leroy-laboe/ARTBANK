import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { BuyerAccountMenu } from './BuyerAccountMenu';
import { useSession } from '../../lib/sessionContext';
import { getUnreadMessageSummary } from '../../services/messages';
import { buyerAccountNav, buyerPrimaryNav } from '../../data/buyerContent';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './BuyerSidebar.module.css';

/** The buyer workspace's nav — five primary destinations, then the two the
 *  brief puts on this side specifically (Viewing Rooms, Help Center), then
 *  the account. Shared by every /collect screen, so the active row comes from
 *  the router rather than a prop.
 *
 *  ArtspaceSidebar is the artist's equivalent. They are deliberately separate
 *  components: this one has no "+ Add Artwork" (a buyer adds nothing) and
 *  closes with the account rather than a help card, so factoring them into
 *  one configurable rail would leave a shell that is mostly conditionals. */
export function BuyerSidebar() {
  const { profile } = useSession();
  const [unreadMessages, setUnreadMessages] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setUnreadMessages(null);
      return;
    }
    // 'buyer' side: unread means the artist wrote and this buyer hasn't read
    // it — the mirror of what the same call counts inside ArtSpace.
    getUnreadMessageSummary(profile, 'buyer').then((summary) => {
      if (active) setUnreadMessages(summary.count);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <aside className={styles.sidebar}>
      <Link to="/" className={styles.brand}>
        <img src={logo} alt="ARTBANK" className={styles.brandLogo} />
      </Link>

      <nav className={styles.nav} aria-label="Collect">
        {buyerPrimaryNav.map((item) => {
          const badge =
            item.to === '/collect/messages' && profile ? unreadMessages : item.badge;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/collect'}
              className={({ isActive }) =>
                [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')
              }
            >
              <Icon name={item.icon} size={17} className={styles.navIcon} />
              <span className={styles.navLabel}>{item.label}</span>
              {Boolean(badge) && <span className={styles.badge}>{badge}</span>}
            </NavLink>
          );
        })}

        <div className={styles.gap} />

        {buyerAccountNav.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              [styles.navItem, isActive && styles.navItemActive].filter(Boolean).join(' ')
            }
          >
            <Icon name={item.icon} size={17} className={styles.navIcon} />
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.accountWrap}>
        <BuyerAccountMenu trigger="row" />
      </div>
    </aside>
  );
}
