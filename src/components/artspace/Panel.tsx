import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import styles from './Panel.module.css';

/** The card chrome every Today module sits in: title, optional sub-line and an
 *  optional top-right action. Kept as one component so the six modules stay
 *  about their own content instead of repeating the same header markup. */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = '',
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={[styles.panel, className].filter(Boolean).join(' ')}>
      <header className={styles.head}>
        <div className={styles.heading}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

/** Quiet "View All" text link used in most panel headers. */
export function PanelLink({ to, children = 'View All' }: { to: string; children?: ReactNode }) {
  return (
    <Link to={to} className={styles.panelLink}>
      {children}
    </Link>
  );
}

/** Outlined counterpart, used where the count matters (Needs Your Decision). */
export function PanelButtonLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.panelButtonLink}>
      {children}
    </Link>
  );
}

/** Gold footer link that closes a panel, e.g. "Go to Interest →". */
export function PanelFooterLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className={styles.footerLink}>
      {children}
      <Icon name="arrow-right" size={14} />
    </Link>
  );
}
