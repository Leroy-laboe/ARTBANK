import { Icon } from '../ui/Icon';
import type { CreatorProfile } from '../../types/creator';
import styles from './CreatorCard.module.css';

export function CreatorCard({ creator }: { creator: CreatorProfile }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={creator.imageUrl}
          alt={creator.name}
          className={styles.image}
          loading="lazy"
          decoding="async"
        />

        {creator.verified && (
          <span className={styles.verisBadge}>
            <Icon name="shield-check" size={11} />
            VERIS
          </span>
        )}

        <button type="button" className={styles.likeBtn} aria-label="Save creator">
          <Icon name="heart" size={14} />
        </button>

        <div className={styles.mriBadge}>
          <span className={styles.mriLabel}>MRI</span>
          <span className={styles.mriValue}>{creator.mriScore}</span>
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.name}>{creator.name}</div>
        <div className={styles.title}>{creator.title}</div>

        <div className={styles.footerRow}>
          <span className={styles.country}>
            <img src={creator.countryFlag} alt="" className={styles.flag} />
            {creator.country}
          </span>
          <span className={styles.followers}>{creator.followers} Followers</span>
        </div>
      </div>
    </article>
  );
}
