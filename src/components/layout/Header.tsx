import { Link, NavLink } from 'react-router-dom';
import { navLinks } from '../../data/homeContent';
import logo from '../../assets/images/artbank-logo-dark.png';
import styles from './Header.module.css';

export function Header() {
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

        <div className={styles.actions}>
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
