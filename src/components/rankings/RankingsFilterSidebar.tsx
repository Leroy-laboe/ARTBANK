import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { rankingTypes } from '../../data/mriRankingsContent';
import styles from './RankingsFilterSidebar.module.css';

export function RankingsFilterSidebar() {
  const [activeType, setActiveType] = useState(rankingTypes[0].label);

  return (
    <aside className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.heading}>Filters</span>
        <button type="button" className={styles.clearBtn}>
          Clear all
        </button>
        <Icon name="sliders" size={15} className={styles.headIcon} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Search
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.searchBox}>
          <input type="text" placeholder="Search creators..." />
          <Icon name="search" size={15} />
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Ranking Type</div>
        <div className={styles.typeList}>
          {rankingTypes.map((type) => (
            <button
              type="button"
              key={type.label}
              className={`${styles.typeItem} ${activeType === type.label ? styles.typeActive : ''}`}
              onClick={() => setActiveType(type.label)}
            >
              <Icon name={type.icon} size={16} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Time Period
          <Icon name="chevron-down" size={15} />
        </div>
        <button type="button" className={styles.selectBox}>
          All Time
          <Icon name="chevron-down" size={14} />
        </button>
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
        <div className={styles.sectionTitle}>MRI Score Range</div>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} />
          <span className={styles.sliderThumb} style={{ left: '0%' }} />
          <span className={styles.sliderThumb} style={{ left: '100%' }} />
        </div>
        <div className={styles.scaleRow}>
          <span>0</span>
          <span>100</span>
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
