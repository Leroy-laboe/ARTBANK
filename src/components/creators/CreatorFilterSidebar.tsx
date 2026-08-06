import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { creatorCategories, careerStages } from '../../data/creatorsContent';
import styles from './CreatorFilterSidebar.module.css';

export function CreatorFilterSidebar() {
  const [checkedStages, setCheckedStages] = useState<Record<string, boolean>>({});
  const [verisOnly, setVerisOnly] = useState(false);

  const toggleStage = (key: string) =>
    setCheckedStages((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.heading}>Filters</span>
        <button type="button" className={styles.clearBtn}>
          Clear all
        </button>
        <Icon name="sliders" size={15} className={styles.headIcon} />
      </div>

      <div className={styles.searchBox}>
        <input type="text" placeholder="Search creators..." />
        <Icon name="search" size={15} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Category
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.categoryList}>
          {creatorCategories.map((cat) => (
            <button type="button" key={cat.label} className={styles.categoryItem}>
              <span className={styles.categoryLabel}>
                <Icon name={cat.icon} size={15} />
                {cat.label}
              </span>
              <span className={styles.categoryCount}>{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Country
          <Icon name="chevron-down" size={15} />
        </div>
        <button type="button" className={styles.selectBox}>
          All Countries
          <Icon name="chevron-down" size={14} />
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Art Style
          <Icon name="chevron-down" size={15} />
        </div>
        <button type="button" className={styles.selectBox}>
          All Styles
          <Icon name="chevron-down" size={14} />
        </button>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          MRI Score
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} />
          <span className={styles.sliderThumb} style={{ left: '9%' }} />
        </div>
        <div className={styles.rangeRow}>
          <label className={styles.rangeField}>
            <span>Min</span>
            <input type="text" defaultValue="0" />
          </label>
          <label className={styles.rangeField}>
            <span>Max</span>
            <input type="text" defaultValue="100" />
          </label>
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
                  checked={!!checkedStages[stage.key]}
                  onChange={() => toggleStage(stage.key)}
                />
                {stage.label}
              </span>
              <span className={styles.checkCount}>({stage.count.toLocaleString()})</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Verification
          <Icon name="chevron-down" size={15} />
        </div>
        <label className={styles.checkItem}>
          <span className={styles.checkLeft}>
            <input
              type="checkbox"
              checked={verisOnly}
              onChange={() => setVerisOnly((v) => !v)}
            />
            VERIS Verified Only
          </span>
          <Icon name="shield-check" size={15} className={styles.verisIcon} />
        </label>
      </div>

      <button type="button" className={styles.applyBtn}>
        Apply Filters
      </button>
      <button type="button" className={styles.resetBtn}>
        <Icon name="refresh" size={13} />
        Reset All
      </button>
    </aside>
  );
}
