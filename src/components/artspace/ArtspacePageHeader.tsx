import type { ReactNode } from 'react';
import styles from './ArtspacePageHeader.module.css';

/** Title, sub-line and right-aligned controls for an ArtSpace screen that
 *  isn't Today. Shared so My Works, Interest and the rest keep one masthead. */
export function ArtspacePageHeader({
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
