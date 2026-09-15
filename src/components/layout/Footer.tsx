import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { footerLinks } from '../../data/homeContent';
import logo from '../../assets/images/artbank-logo-light.png';
import styles from './Footer.module.css';

const FOOTER_GROUPS = [
  { title: 'Platform', links: footerLinks.platform },
  { title: 'Resources', links: footerLinks.resources },
  { title: 'Account', links: footerLinks.account },
];

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

          {/* Three identical shapes, so one loop rather than three copies.

              <details> rather than a plain <div>: on a phone these become
              collapsible groups, which is the difference between a footer you
              scroll past and a footer you scroll *through*. They carry `open`
              so they start expanded, and the stylesheet keeps them expanded
              and untoggleable above the mobile tier — desktop sees three
              ordinary link columns, exactly as before. */}
          {FOOTER_GROUPS.map(({ title, links }) => (
            <details key={title} className={styles.group}>
              <summary className={styles.colTitle}>
                {title}
                <Icon name="chevron-down" size={15} className={styles.groupCaret} />
              </summary>
              <ul className={styles.linkList}>
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link to={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          ))}

          {/* This was a newsletter form whose submit handler only called
              preventDefault() — it accepted an email address and sent it
              nowhere. There is no mailing list behind the site yet, so the
              column offers the one real next step instead. */}
          <div className={styles.newsletterCol}>
            <div className={styles.colTitle}>Get Started</div>
            <p className={styles.ctaText}>
              Create a free JO1N ID to build your ArtSpace or start collecting.
            </p>
            <Link to="/register" className={styles.ctaLink}>
              Create your JO1N ID
              <Icon name="arrow-right" size={15} />
            </Link>
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
