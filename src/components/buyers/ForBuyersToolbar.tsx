import { Icon } from '../ui/Icon';
import styles from './ForBuyersToolbar.module.css';

export type SortOption = 'newest' | 'title' | 'artist';

const sortLabels: Record<SortOption, string> = {
  newest: 'Newest',
  title: 'Title: A to Z',
  artist: 'Artist: A to Z',
};

const sortOrder: SortOption[] = ['newest', 'title', 'artist'];

export type QuickPill = { id: string; label: string };

/** Real result count, a working sort, quick pills built from what's actually
 *  in the feed (not a fabricated "Featured" tab), and a grid/list toggle.
 *  The old Marketplace toolbar's "Highest MRI" sort option and its Buy Now /
 *  Auction tabs are both gone — neither concept exists in the schema. */
export function ForBuyersToolbar({
  count,
  sort,
  onSortChange,
  pills,
  activePill,
  onPillChange,
  view,
  onViewChange,
}: {
  count: number;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  pills: QuickPill[];
  activePill: string;
  onPillChange: (id: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}) {
  return (
    <div className={styles.wrap}>
      {pills.length > 1 && (
        <nav className={styles.pills} aria-label="Quick filters">
          {pills.map((pill) => (
            <button
              type="button"
              key={pill.id}
              className={[styles.pill, pill.id === activePill && styles.pillActive].filter(Boolean).join(' ')}
              onClick={() => onPillChange(pill.id)}
            >
              {pill.label}
            </button>
          ))}
        </nav>
      )}

      <div className={styles.bar}>
        <p className={styles.count}>
          {count} {count === 1 ? 'artwork' : 'artworks'}
        </p>

        <div className={styles.controls}>
          <label className={styles.sortWrap}>
            <span className="visually-hidden">Sort by</span>
            <select value={sort} onChange={(e) => onSortChange(e.target.value as SortOption)}>
              {sortOrder.map((option) => (
                <option key={option} value={option}>
                  Sort: {sortLabels[option]}
                </option>
              ))}
            </select>
            <Icon name="chevron-down" size={13} className={styles.caret} />
          </label>

          <div className={styles.viewToggle}>
            <button
              type="button"
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
              className={view === 'grid' ? styles.viewActive : ''}
              onClick={() => onViewChange('grid')}
            >
              <Icon name="grid-dots" size={15} />
            </button>
            <button
              type="button"
              aria-label="List view"
              aria-pressed={view === 'list'}
              className={view === 'list' ? styles.viewActive : ''}
              onClick={() => onViewChange('list')}
            >
              <Icon name="list" size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
