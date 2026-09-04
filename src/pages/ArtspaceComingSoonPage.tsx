import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { WorkspaceComingSoon } from '../components/ui/WorkspaceComingSoon';
import styles from './ArtspaceComingSoonPage.module.css';

/** Placeholder for an ArtSpace nav destination that isn't built yet (Billing,
 *  Help Center). Keeps the ArtSpace sidebar and topbar in place — see
 *  WorkspaceComingSoon for why that matters. */
export function ArtspaceComingSoonPage({ title }: { title: string }) {
  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />
        <ArtspacePageHeader title={title} />
        <WorkspaceComingSoon title={title} />
      </main>
    </div>
  );
}
