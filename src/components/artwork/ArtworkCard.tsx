import { Icon } from '../ui/Icon';
import type { Artwork } from '../../types/artwork';
import styles from './ArtworkCard.module.css';

export function ArtworkCard({ artwork }: { artwork: Artwork }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap} style={{ background: artwork.gradient }}>
        {artwork.verified && (
          <span className={styles.verisBadge}>
            <Icon name="shield-check" size={11} />
            VERIS
          </span>
        )}
        <button type="button" className={styles.likeBtn} aria-label="Like artwork">
          <Icon name="heart" size={14} />
        </button>
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{artwork.title}</div>
        <div className={styles.artist}>{artwork.artist}</div>
        <div className={styles.footerRow}>
          <span className={styles.price}>
            {artwork.currency} {artwork.price.toLocaleString()}
          </span>
          <span className={styles.likes}>
            <Icon name="heart" size={13} />
            {artwork.likes}
          </span>
        </div>
      </div>
    </article>
  );
}
