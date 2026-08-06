import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { categories, availability } from '../../data/marketplaceContent';
import styles from './FilterSidebar.module.css';

export function FilterSidebar() {
  const [activeCategory, setActiveCategory] = useState('Paintings');
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggleCheck = (key: string) => setChecked((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.heading}>
          <Icon name="sliders" size={16} />
          Filters
        </span>
        <button type="button" className={styles.clearBtn}>
          Clear all
        </button>
      </div>

      <div className={styles.searchBox}>
        <Icon name="search" size={15} />
        <input type="text" placeholder="Search artworks, artists, styles..." />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Category
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.categoryList}>
          {categories.map((cat) => (
            <button
              type="button"
              key={cat.label}
              className={`${styles.categoryItem} ${activeCategory === cat.label ? styles.categoryActive : ''}`}
              onClick={() => setActiveCategory(cat.label)}
            >
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
          Price Range (RM)
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.sliderTrack}>
          <div className={styles.sliderFill} />
          <span className={styles.sliderThumb} style={{ left: '4%' }} />
          <span className={styles.sliderThumb} style={{ left: '42%' }} />
        </div>
        <div className={styles.rangeRow}>
          <label className={styles.rangeField}>
            <span>Min</span>
            <input type="text" defaultValue="200" />
          </label>
          <label className={styles.rangeField}>
            <span>Max</span>
            <input type="text" defaultValue="100,000+" />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Artist
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.searchBox}>
          <Icon name="search" size={14} />
          <input type="text" placeholder="Search artist..." />
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
          MRI Score
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.rangeRow}>
          <label className={styles.rangeField}>
            <span>Min score</span>
            <input type="text" placeholder="0" />
          </label>
          <label className={styles.rangeField}>
            <span>Max score</span>
            <input type="text" placeholder="100" />
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          Availability
          <Icon name="chevron-down" size={15} />
        </div>
        <div className={styles.checkList}>
          {availability.map((item) => (
            <label className={styles.checkItem} key={item.key}>
              <span className={styles.checkLeft}>
                <input
                  type="checkbox"
                  checked={!!checked[item.key]}
                  onChange={() => toggleCheck(item.key)}
                />
                {item.label}
              </span>
              <span className={styles.checkCount}>({item.count.toLocaleString()})</span>
            </label>
          ))}
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
