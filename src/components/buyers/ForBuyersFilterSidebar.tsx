import { Icon } from '../ui/Icon';
import type { BuyerAvailability } from '../../data/buyerContent';
import styles from './ForBuyersFilterSidebar.module.css';

export type MediumFacet = { label: string; count: number };
export type AvailabilityFacet = { key: BuyerAvailability; count: number };
export type PriceFacet = { key: string; label: string; count: number };

/** The For Buyers grid's real filter panel. Every count here is derived from
 *  the artworks actually loaded on the page — unlike the old (retired)
 *  Marketplace sidebar, there's no Size, Style, Artist or Location filter,
 *  since none of those exist as real, queryable fields yet, and no "Apply
 *  Filters" button: every control re-filters the grid the moment it
 *  changes. Price Range is real too — its buckets come from parsing the
 *  same priceLabel string the card shows, not a separate numeric field. */
export function ForBuyersFilterSidebar({
  term,
  onTermChange,
  mediums,
  activeMedium,
  onSelectMedium,
  availabilityFacets,
  activeAvailability,
  onToggleAvailability,
  priceFacets,
  activePriceBucket,
  onSelectPriceBucket,
  onClear,
  hasActiveFilters,
}: {
  term: string;
  onTermChange: (value: string) => void;
  mediums: MediumFacet[];
  activeMedium: string | null;
  onSelectMedium: (medium: string | null) => void;
  availabilityFacets: AvailabilityFacet[];
  activeAvailability: Set<BuyerAvailability>;
  onToggleAvailability: (key: BuyerAvailability) => void;
  priceFacets: PriceFacet[];
  activePriceBucket: string | null;
  onSelectPriceBucket: (key: string | null) => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <aside className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.heading}>
          <Icon name="sliders" size={16} />
          Filters
        </span>
        {hasActiveFilters && (
          <button type="button" className={styles.clearBtn} onClick={onClear}>
            Clear all
          </button>
        )}
      </div>

      <div className={styles.searchBox}>
        <Icon name="search" size={15} />
        <input
          type="text"
          placeholder="Search artworks or artists..."
          value={term}
          onChange={(e) => onTermChange(e.target.value)}
        />
      </div>

      {mediums.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Medium</p>
          <div className={styles.list}>
            <button
              type="button"
              className={[styles.item, activeMedium === null && styles.itemActive].filter(Boolean).join(' ')}
              onClick={() => onSelectMedium(null)}
            >
              <span>All</span>
            </button>
            {mediums.map((medium) => (
              <button
                type="button"
                key={medium.label}
                className={[styles.item, activeMedium === medium.label && styles.itemActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectMedium(medium.label)}
              >
                <span>{medium.label}</span>
                <span className={styles.count}>{medium.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {priceFacets.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Price Range</p>
          <div className={styles.list}>
            <button
              type="button"
              className={[styles.item, activePriceBucket === null && styles.itemActive].filter(Boolean).join(' ')}
              onClick={() => onSelectPriceBucket(null)}
            >
              <span>All</span>
            </button>
            {priceFacets.map((bucket) => (
              <button
                type="button"
                key={bucket.key}
                className={[styles.item, activePriceBucket === bucket.key && styles.itemActive]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelectPriceBucket(bucket.key)}
              >
                <span>{bucket.label}</span>
                <span className={styles.count}>{bucket.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {availabilityFacets.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Availability</p>
          <div className={styles.checkList}>
            {availabilityFacets.map((facet) => (
              <label className={styles.checkItem} key={facet.key}>
                <span className={styles.checkLeft}>
                  <input
                    type="checkbox"
                    checked={activeAvailability.has(facet.key)}
                    onChange={() => onToggleAvailability(facet.key)}
                  />
                  {facet.key}
                </span>
                <span className={styles.count}>{facet.count}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <blockquote className={styles.quote}>
        “Great art lives in curious hands.”
        <cite>— ArtBank</cite>
      </blockquote>
    </aside>
  );
}
