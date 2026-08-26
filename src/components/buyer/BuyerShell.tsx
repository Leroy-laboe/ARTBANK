import type { ReactNode } from 'react';
import { BuyerSidebar } from './BuyerSidebar';
import styles from './BuyerShell.module.css';

/** Sidebar plus scrolling main column: the frame every /collect screen sits
 *  in. The ArtSpace pages each repeat this geometry in their own module; the
 *  buyer side has one component for it instead, so the rail width and the
 *  breakpoints where it collapses are defined once. */
export function BuyerShell({ topbar, children }: { topbar?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <BuyerSidebar />
      <main className={styles.body}>
        {topbar}
        {children}
      </main>
    </div>
  );
}
