import { Icon } from '../ui/Icon';
import { footerLinks } from '../../data/homeContent';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brandCol}>
            <span className={styles.wordmark}>
              ART<span>BANK</span>
            </span>
            <p>
              The global platform for creators, collectors and institutions to build, value and
              preserve creative legacy.
            </p>
            <div className={styles.social}>
              <a href="#" aria-label="Instagram">
                <Icon name="instagram" size={16} />
              </a>
              <a href="#" aria-label="Facebook">
                <Icon name="facebook" size={16} />
              </a>
              <a href="#" aria-label="X">
                <Icon name="x-twitter" size={15} />
              </a>
              <a href="#" aria-label="YouTube">
                <Icon name="youtube" size={16} />
              </a>
              <a href="#" aria-label="LinkedIn">
                <Icon name="linkedin" size={16} />
              </a>
            </div>
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
          <span>© 2025 ARTBANK. All rights reserved.</span>
          <div className={styles.bottomLinks}>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
