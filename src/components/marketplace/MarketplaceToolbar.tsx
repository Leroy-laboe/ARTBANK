import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { toolbarTabs, sortOptions } from '../../data/marketplaceContent';
import styles from './MarketplaceToolbar.module.css';

export function MarketplaceToolbar({
  view,
  onViewChange,
}: {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}) {
  const [activeTab, setActiveTab] = useState(toolbarTabs[0]);
  const [sort, setSort] = useState(sortOptions[0]);
  const [sortOpen, setSortOpen] = useState(false);

  return (
    <div className={styles.bar}>
      <nav className={styles.tabs} aria-label="Marketplace filters">
        {toolbarTabs.map((tab) => (
          <button
            type="button"
            key={tab}
            className={`${styles.tab} ${tab === activeTab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className={styles.controls}>
        <div className={styles.sortWrap}>
          <button
            type="button"
            className={styles.sortBtn}
            onClick={() => setSortOpen((v) => !v)}
          >
            Sort by: <strong>{sort}</strong>
            <Icon name="chevron-down" size={14} />
          </button>
          {sortOpen && (
            <ul className={styles.sortMenu}>
              {sortOptions.map((opt) => (
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
