import { Icon } from '../ui/Icon';
import { creatorCategories, careerStages } from '../../data/creatorsContent';
import { countries as allCountries } from '../../data/countries';
import type { CreatorFilters } from '../../types/creator';
import styles from './CreatorFilterSidebar.module.css';

/** Controlled by CreatorsPage — owns no filter state itself, so the grid can
 *  actually filter on it. The MRI Score slider and "VERIS Verified Only"
 *  checkbox that used to live here are gone entirely, not just unwired —
 *  both are public-ranking features banned by
 *  docs/pivot-checklist/17-do-not-build-guardrails.md. */
export function CreatorFilterSidebar({
  filters,
  onChange,
  onReset,
}: {
  filters: CreatorFilters;
  onChange: (next: Partial<CreatorFilters>) => void;
  onReset: () => void;
}) {
  // Every country is selectable (native <select> supports type-to-search by
  // keyboard), even though the mock dataset currently only has Malaysian
  // creators — selecting anything else will correctly show "no results"
  // rather than silently doing nothing.
  const countries = ['All Countries', ...allCountries];
  const styleOptions = ['All Styles', 'Contemporary', 'Abstract', 'Realism', 'Minimalism', 'Surrealism'];

  function toggleCategory(label: string) {
    const next = filters.categories.includes(label)
      ? filters.categories.filter((c) => c !== label)
      : [...filters.categories, label];
    onChange({ categories: next });
  }

  function toggleStage(label: string) {
    const next = filters.stages.includes(label)
      ? filters.stages.filter((s) => s !== label)
      : [...filters.stages, label];
    onChange({ stages: next });
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.heading}>Filters</span>
        <button type="button" className={styles.clearBtn} onClick={onReset}>
          Clear all
        </button>
        <Icon name="sliders" size={15} className={styles.headIcon} />
      </div>

      <div className={styles.searchBox}>
        <input
          type="text"
          placeholder="Search creators..."
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
        <Icon name="search" size={15} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Category
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.categoryList}>
          {creatorCategories.map((cat) => {
            const active = filters.categories.includes(cat.label);
            return (
              <button
                type="button"
                key={cat.label}
                className={[styles.categoryItem, active && styles.categoryItemActive]
                  .filter(Boolean)
                  .join(' ')}
                aria-pressed={active}
                onClick={() => toggleCategory(cat.label)}
              >
                <span className={styles.categoryLabel}>
                  <Icon name={cat.icon} size={15} />
                  {cat.label}
                </span>
                <span className={styles.categoryCount}>{cat.count.toLocaleString()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Country
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.selectWrap}>
          <select
            className={styles.selectBox}
            value={filters.country}
            onChange={(e) => onChange({ country: e.target.value })}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className={styles.selectChevron} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Art Style
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.selectWrap}>
          <select
            className={styles.selectBox}
            value={filters.style}
            onChange={(e) => onChange({ style: e.target.value })}
          >
            {styleOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className={styles.selectChevron} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Career Stage
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.checkList}>
          {careerStages.map((stage) => (
            <label className={styles.checkItem} key={stage.key}>
              <span className={styles.checkLeft}>
                <input
                  type="checkbox"
                  checked={filters.stages.includes(stage.label)}
                  onChange={() => toggleStage(stage.label)}
                />
                {stage.label}
              </span>
              <span className={styles.checkCount}>({stage.count.toLocaleString()})</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={styles.applyBtn}
        onClick={() => document.getElementById('creators-grid')?.scrollIntoView({ behavior: 'smooth' })}
      >
        Apply Filters
      </button>
      <button type="button" className={styles.resetBtn} onClick={onReset}>
        <Icon name="refresh" size={13} />
        Reset All
      </button>
    </aside>
  );
}
