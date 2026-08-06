import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { creatorSortOptions } from '../../data/creatorsContent';
import styles from './CreatorsToolbar.module.css';

export function CreatorsToolbar({
  total,
  view,
  onViewChange,
}: {
  total: number;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}) {
  const [sort, setSort] = useState(creatorSortOptions[0]);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className={styles.bar}>
      <span className={styles.count}>
        Showing 1-{Math.min(12, total)} of {total.toLocaleString()} creators
      </span>

      <div className={styles.controls}>
        <div className={styles.sortWrap}>
          <button type="button" className={styles.sortBtn} onClick={() => setSortOpen((v) => !v)}>
            Sort by: <strong>{sort}</strong>
            <Icon name="chevron-down" size={14} />
          </button>
          {sortOpen && (
            <ul className={styles.sortMenu}>
              {creatorSortOptions.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      setSort(opt);
                      setSortOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.viewToggle}>
          <button
            type="button"
            aria-label="Grid view"
            className={view === 'grid' ? styles.viewActive : ''}
            onClick={() => onViewChange('grid')}
          >
            <Icon name="grid-dots" size={15} />
          </button>
          <button
            type="button"
            aria-label="List view"
            className={view === 'list' ? styles.viewActive : ''}
            onClick={() => onViewChange('list')}
          >
            <Icon name="list" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
