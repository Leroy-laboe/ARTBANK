import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { footerLinks } from '../../data/homeContent';
import logo from '../../assets/images/artbank-logo-light.png';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <img src={logo} alt="ARTBANK" className={styles.wordmark} />
            <p>
              The global platform for creators, collectors and institutions to build, value and
              preserve creative legacy.
            </p>
          </div>

          <div>
            <div className={styles.colTitle}>Platform</div>
            <ul className={styles.linkList}>
              {footerLinks.platform.map((label) => (
                <li key={label}>
                  <a href="#">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className={styles.colTitle}>Resources</div>
            <ul className={styles.linkList}>
              {footerLinks.resources.map((label) => (
                <li key={label}>
                  <a href="#">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className={styles.colTitle}>Company</div>
            <ul className={styles.linkList}>
              {footerLinks.company.map((label) => (
                <li key={label}>
                  <a href="#">{label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className={styles.colTitle}>Stay Connected</div>
            <p style={{ fontSize: 13.5, marginBottom: 14 }}>Subscribe to our newsletter</p>
            <form
              className={styles.newsletterRow}
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="Enter your email" required />
              <button type="submit" aria-label="Subscribe">
                <Icon name="arrow-right" size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© 2026 ARTBANK. All rights reserved.</span>
          <div className={styles.bottomLinks}>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
