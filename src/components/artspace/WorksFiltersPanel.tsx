import { Icon } from '../ui/Icon';
import { worksFilterGroups } from '../../data/artspaceWorks';
import styles from './WorksFiltersPanel.module.css';

/** Secondary filters that don't fit the status tab strip. Presentational for
 *  now — the tabs above the table are the filter that actually drives state. */
export function WorksFiltersPanel({
  showArchived,
  onShowArchivedChange,
  onClear,
}: {
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
        {worksFilterGroups.map((group) => (
          <label className={styles.group} key={group.id}>
            <span className={styles.label}>{group.label}</span>
            <span className={styles.selectWrap}>
              <select className={styles.select} defaultValue={group.options[0]}>
                {group.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <Icon name="chevron-down" size={14} className={styles.caret} />
            </span>
          </label>
        ))}
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
