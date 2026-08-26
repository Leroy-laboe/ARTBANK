import { Icon } from '../ui/Icon';
import { worksFilterGroups } from '../../data/artspaceWorks';
import type { WorksFilters } from './worksFilters';
import styles from './WorksFiltersPanel.module.css';

/** Secondary filters that don't fit the status tab strip.
 *
 *  These stack with the tabs rather than replacing them: the tab narrows by
 *  status or availability, and these narrow further. Picking a tab and a
 *  filter that contradict each other correctly returns nothing, and the table
 *  says so rather than showing an unexplained blank. */
export function WorksFiltersPanel({
  filters,
  onFiltersChange,
  showArchived,
  onShowArchivedChange,
  onClear,
}: {
  filters: WorksFilters;
  onFiltersChange: (filters: WorksFilters) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  onClear: () => void;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Filters</h2>
        <button type="button" className={styles.clear} onClick={onClear}>
          Clear
        </button>
      </div>

      <div className={styles.groups}>
        {worksFilterGroups.map((group) => {
          const key = group.id as keyof WorksFilters;
          return (
            <label className={styles.group} key={group.id}>
              <span className={styles.label}>{group.label}</span>
              <span className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={filters[key]}
                  onChange={(e) => onFiltersChange({ ...filters, [key]: e.target.value })}
                >
                  {group.options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={14} className={styles.caret} />
              </span>
            </label>
          );
        })}
      </div>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => onShowArchivedChange(e.target.checked)}
        />
        Show Archived
      </label>
    </section>
  );
}
