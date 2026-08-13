import { Link, NavLink } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { navLinks } from '../../data/homeContent';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.bar}`}>
        <Link to="/" className={styles.brand}>
          <span className={styles.wordmark}>
            ART<span>BANK</span>
          </span>
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

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Search">
            <Icon name="search" size={19} />
          </button>
          <div className={styles.authGroup}>
            <Link to="/login" className={styles.enterBtn}>
              Enter ArtSpace
            </Link>
            <Link to="/apply" className={styles.createBtn}>
              Create JO1NID
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
