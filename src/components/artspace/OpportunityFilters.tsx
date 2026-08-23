import { Icon } from '../ui/Icon';
import { opportunityFilters, opportunitySorts } from '../../data/artspaceOpportunities';
import styles from './OpportunityFilters.module.css';

/** Type/category/medium/location narrowing plus sort order. Presentational
 *  until there's a backend to re-query — the tabs above drive real state. */
export function OpportunityFilters() {
  return (
    <div className={styles.bar}>
      <div className={styles.filters}>
        {opportunityFilters.map((filter) => (
          <label className={styles.field} key={filter.id}>
            <span className="visually-hidden">{filter.label}</span>
            <select className={styles.select} defaultValue={filter.options[0]}>
              {filter.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <Icon name="chevron-down" size={14} className={styles.caret} />
          </label>
        ))}
      </div>

      <label className={styles.sort}>
        <span className={styles.sortLabel}>Sort by:</span>
        <span className={styles.field}>
          <select className={[styles.select, styles.sortSelect].join(' ')} defaultValue={opportunitySorts[0]}>
            {opportunitySorts.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className={styles.caret} />
        </span>
      </label>
    </div>
  );
}
