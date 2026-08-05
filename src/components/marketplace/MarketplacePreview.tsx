import { Icon } from '../ui/Icon';
import { ArtworkCard } from '../artwork/ArtworkCard';
import { marketplaceArtworks } from '../../data/mockArtworks';
import styles from './MarketplacePreview.module.css';

export function MarketplacePreview() {
  return (
    <div className={styles.wrap}>
      <div className={styles.headRow}>
        <p className="eyebrow">Marketplace Preview</p>
        <a href="#" className={styles.viewAll}>
          View all artworks
          <Icon name="arrow-right" size={14} />
        </a>
      </div>

      <div className={styles.grid}>
        {marketplaceArtworks.map((artwork) => (
          <ArtworkCard artwork={artwork} key={artwork.id} />
        ))}
      </div>
    </div>
  );
}
