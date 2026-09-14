import { Icon } from '../ui/Icon';
import { adminStats } from '../../data/adminContent';
import type { AdminOverviewCounts } from '../../services/admin';
import styles from './AdminStatsRow.module.css';

const toneClass: Record<(typeof adminStats)[number]['tone'], string> = {
  success: styles.toneSuccess,
  gold: styles.toneGold,
  danger: styles.toneDanger,
};

/** Maps each stat card to the live count that replaces its demo value, once
 *  one is available. */
const countKey: Record<string, keyof AdminOverviewCounts> = {
  unclaimed: 'unclaimedCount',
  'coa-pending': 'coaPendingCount',
  'open-reports': 'openFlagsCount',
  uploads: 'uploadsThisMonth',
};

/** The Overview screen's four headline figures — one per real admin function
 *  in docs/pivot-checklist/29-feature-admin-functions.md (upload, link, COA,
 *  and the platform's overall upload volume). Labels, icons and tone stay
 *  config; `counts` (from getOverviewCounts()) overrides just the number
 *  once the read resolves. */
export function AdminStatsRow({ counts }: { counts?: AdminOverviewCounts }) {
  return (
    <div className={styles.row}>
      {adminStats.map((stat) => {
        const key = countKey[stat.id];
        const value = counts && key ? String(counts[key]) : stat.value;

        return (
          <div key={stat.id} className={styles.card}>
            <span className={[styles.iconWrap, toneClass[stat.tone]].join(' ')}>
              <Icon name={stat.icon} size={19} />
            </span>

            <div className={styles.copy}>
              <p className={styles.value}>{value}</p>
              <p className={styles.label}>{stat.label}</p>
              <p className={styles.note}>
                {stat.note}
                {stat.change ? (
                  <span className={styles.change}>
                    <Icon name="trend-up" size={11} />
                    {stat.change}
                  </span>
                ) : (
                  <Icon name="arrow-right" size={11} className={styles.noteArrow} />
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
