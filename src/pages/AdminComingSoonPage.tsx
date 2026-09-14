import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { WorkspaceComingSoon } from '../components/ui/WorkspaceComingSoon';
import styles from './AdminComingSoonPage.module.css';

/** Placeholder for an admin nav destination that isn't built yet. Keeps the
 *  admin sidebar and topbar in place — same reasoning as
 *  ArtspaceComingSoonPage: a workspace link that isn't live yet shouldn't
 *  look like the click dropped you back on the marketing site. */
export function AdminComingSoonPage({ title }: { title: string }) {
  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <h1 className={styles.title}>{title}</h1>
        <WorkspaceComingSoon title={title} />
      </main>
    </div>
  );
}
