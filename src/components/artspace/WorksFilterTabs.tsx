import { worksTabs } from '../../data/artspaceWorks';
import styles from './WorksFilterTabs.module.css';

/** Status filter tabs above the table. Counts sit in a pill on the right of
 *  each label; "All Works" has none because it isn't a status. */
export function WorksFilterTabs({
  active,
  onChange,
}: {
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Filter artworks by status">
      {worksTabs.map((tab) => {
        const isActive = tab.id === active;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={[styles.tab, isActive && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
            {tab.count !== undefined && <span className={styles.count}>{tab.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
