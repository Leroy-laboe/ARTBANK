import type { ReactNode } from 'react';
import styles from './AdminPageHeader.module.css';

/** Title, sub-line and right-aligned controls for an admin screen that isn't
 *  Overview — shared so the four function screens keep one masthead. */
export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div className={styles.copy}>
        <h1 className={styles.title}>{title}</h1>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}
