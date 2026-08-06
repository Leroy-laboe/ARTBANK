import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { ArtworkCard } from '../artwork/ArtworkCard';
import { getMarketplaceArtworks } from '../../data/artworksRepo';
import { marketplaceArtworks as fallbackArtworks } from '../../data/mockArtworks';
import type { Artwork } from '../../types/artwork';
import styles from './MarketplacePreview.module.css';

export function MarketplacePreview() {
  const [artworks, setArtworks] = useState<Artwork[]>(fallbackArtworks);

  useEffect(() => {
    getMarketplaceArtworks(4).then(setArtworks);
  }, []);

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
        {artworks.map((artwork) => (
          <ArtworkCard artwork={artwork} key={artwork.id} />
        ))}
      </div>
    </div>
  );
}
