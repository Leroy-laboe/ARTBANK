import { CreatorSpotlight } from '../creator/CreatorSpotlight';
import { MarketplacePreview } from '../marketplace/MarketplacePreview';
import { spotlightCreator } from '../../data/homeContent';
import styles from './SpotlightSection.module.css';

export function SpotlightSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.spotlightCol}>
            <p className="eyebrow" style={{ marginBottom: 16 }}>
              Creator Spotlight
            </p>
            <CreatorSpotlight creator={spotlightCreator} />
          </div>
          <MarketplacePreview />
        </div>
      </div>
    </section>
  );
}
