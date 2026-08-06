import { Link } from 'react-router-dom';
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
            <Link key={link.label} to={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button type="button" className={styles.iconBtn} aria-label="Search">
            <Icon name="search" size={19} />
          </button>
          <button type="button" className={styles.iconBtn} aria-label="Cart">
            <Icon name="bag" size={19} />
          </button>
          <button type="button" className={styles.loginBtn}>
            Login / Sign up
          </button>
        </div>
      </div>
    </header>
  );
}
