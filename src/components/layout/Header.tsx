import { Link, NavLink } from 'react-router-dom';
import { navLinks } from '../../data/homeContent';
import { useSession } from '../../lib/sessionContext';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './Header.module.css';

/** The public site's header.
 *
 *  It has to serve two audiences at once. A visitor needs the way in; someone
 *  already signed in needs the way *back* — the public pages are reachable
 *  from inside both workspaces (an artist's profile at /artists/{handle} is
 *  linked from every buyer artwork card), and without this they were a dead
 *  end that also asked them to sign in again.
 *
 *  The destination is always /workspace rather than /artspace or /collect
 *  directly: that route already owns the role decision, and it waits for the
 *  profile before choosing. Only the label needs the role, and it falls back
 *  to a neutral word when the profile hasn't arrived. */
export function Header() {
  const { loading, isAuthenticated, profile } = useSession();

  // Nothing is rendered in this slot until the identity check settles.
  // Briefly telling a signed-in person to "Create JO1NID" is worse than a
  // brief gap where the button will be.
  const actions = loading ? null : isAuthenticated ? (
    <Link to="/workspace" className={styles.workspaceBtn}>
      {profile?.role === 'buyer'
        ? 'My Workspace'
        : profile?.role === 'guardian'
          ? 'Guardian Requests'
          : 'My ArtSpace'}
    </Link>
  ) : (
    <div className={styles.authGroup}>
      <Link to="/login" className={styles.enterBtn}>
        Enter ArtSpace
      </Link>
      <Link to="/apply" className={styles.createBtn}>
        Create JO1NID
      </Link>
    </div>
  );

  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand}>
          <img src={logo} alt="ARTBANK" className={styles.wordmark} />
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.href}
              end={link.href === '/'}
              className={({ isActive }) => (isActive ? styles.navActive : undefined)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>{actions}</div>
      </div>
    </header>
  );
}
