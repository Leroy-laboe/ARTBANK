import { useEffect, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminHeroBand } from '../components/admin/AdminHeroBand';
import { AdminStatsRow } from '../components/admin/AdminStatsRow';
import { AdminAttentionQueue } from '../components/admin/AdminAttentionQueue';
import { AdminQuickActions } from '../components/admin/AdminQuickActions';
import { AdminQuoteBand } from '../components/admin/AdminQuoteBand';
import { AdminRecentActivity } from '../components/admin/AdminRecentActivity';
import { AdminPlatformGlance } from '../components/admin/AdminPlatformGlance';
import { getOverviewCounts, type AdminOverviewCounts } from '../services/admin';
import styles from './AdminOverviewPage.module.css';

/** The screen an admin account lands on after signing in — see
 *  docs/pivot-checklist/29-feature-admin-functions.md for what the four real
 *  functions behind this dashboard are.
 *
 *  Only the four stat cards read real counts (getOverviewCounts(), requires
 *  migration 0035) — falls back to the demo figures with no backend
 *  configured. The queue, quick actions, recent activity and platform
 *  totals below stay illustrative: a live "Requires Your Attention" feed
 *  would mean re-running all four function screens' own queries here too,
 *  and Recent Admin Activity has no audit-log table behind it yet. */
export function AdminOverviewPage() {
  const [counts, setCounts] = useState<AdminOverviewCounts | undefined>(undefined);
  const [countsAreDemo, setCountsAreDemo] = useState(false);

  useEffect(() => {
    let active = true;
    getOverviewCounts().then((result) => {
      if (!active) return;
      setCounts(result.counts);
      setCountsAreDemo(result.isDemo);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <AdminHeroBand />

        {countsAreDemo && counts && (
          <p className={styles.demoNotice} role="status">
            Showing sample figures for the stat cards below — these aren't real counts yet.
          </p>
        )}

        <div className={styles.statsGap}>
          <AdminStatsRow counts={counts} />
        </div>

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <AdminAttentionQueue />
            <AdminPlatformGlance />
          </div>

          <aside className={styles.rightCol}>
            <AdminQuickActions />
            <AdminQuoteBand />
            <AdminRecentActivity />
          </aside>
        </div>
      </main>
    </div>
  );
}
