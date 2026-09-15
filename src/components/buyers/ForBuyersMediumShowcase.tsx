import { Icon } from '../ui/Icon';
import styles from './ForBuyersMediumShowcase.module.css';

export type MediumTile = { label: string; count: number; imageUrl: string };

/** The honest version of the old Marketplace's "Curated Collections" panel —
 *  same visual pattern (four image tiles, a label and a count), but the
 *  groupings are real mediums pulled from the loaded artworks rather than
 *  named collections ("Modern Abstracts", "Investment Picks") nothing in
 *  the schema actually curates. */
export function ForBuyersMediumShowcase({
  tiles,
  onSelect,
}: {
  tiles: MediumTile[];
  onSelect: (medium: string) => void;
}) {
  if (tiles.length === 0) return null;

  return (
    <section className={styles.section}>
      <header className={styles.head}>
        <h2 className={styles.title}>Browse by Medium</h2>
        <p className={styles.subtitle}>Jump straight to the kind of work you're after.</p>
      </header>

      <div className={styles.grid}>
        {tiles.map((tile) => (
          <button type="button" className={styles.tile} key={tile.label} onClick={() => onSelect(tile.label)}>
            <img src={tile.imageUrl} alt="" className={styles.image} loading="lazy" />
            <div className={styles.overlay}>
              <div>
                <p className={styles.tileLabel}>{tile.label}</p>
                <p className={styles.tileCount}>
                  {tile.count} {tile.count === 1 ? 'artwork' : 'artworks'}
                </p>
              </div>
              <Icon name="arrow-right" size={15} className={styles.tileIcon} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
