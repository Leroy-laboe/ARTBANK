import { Icon } from '../ui/Icon';
import type { MarketplaceListing } from '../../types/artwork';
import styles from './ListingCard.module.css';

export function ListingCard({ listing }: { listing: MarketplaceListing }) {
  const isAuction = listing.listingType === 'auction';

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap} style={{ background: listing.gradient }}>
        {listing.imageUrl && (
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className={styles.image}
            loading="lazy"
            decoding="async"
          />
        )}

        {listing.verified && (
          <span className={styles.verisBadge}>
            <Icon name="shield-check" size={11} />
            VERIS VERIFIED
          </span>
        )}

        <button type="button" className={styles.likeBtn} aria-label="Like artwork">
          <Icon name="heart" size={14} />
        </button>

        <span className={`${styles.typeTag} ${isAuction ? styles.typeAuction : styles.typeBuyNow}`}>
          {isAuction ? 'Auction' : 'Buy Now'}
        </span>
      </div>

      <div className={styles.body}>
        <div className={styles.title}>{listing.title}</div>
        <div className={styles.artist}>{listing.artist}</div>

        {isAuction ? (
          <div className={styles.footerRow}>
            <div>
              <div className={styles.metaLabel}>Current Bid</div>
              <span className={styles.price}>
                {listing.currency} {listing.price?.toLocaleString()}
              </span>
            </div>
            <div className={styles.endsCol}>
              <div className={styles.metaLabel}>Ends in</div>
              <span className={styles.endsIn}>{listing.endsIn}</span>
            </div>
          </div>
        ) : (
          <div className={styles.footerRow}>
            <span className={styles.price}>
              {listing.price != null ? `${listing.currency} ${listing.price.toLocaleString()}` : 'Price on request'}
            </span>
            <span className={styles.mri}>
              <span className={styles.mriTop}>
                <Icon name="heart" size={13} />
                {listing.mriScore}
              </span>
              <span className={styles.mriLabel}>MRI</span>
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
