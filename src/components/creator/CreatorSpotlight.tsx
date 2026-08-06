import { Icon } from '../ui/Icon';
import type { Creator } from '../../types/creator';
import styles from './CreatorSpotlight.module.css';

export function CreatorSpotlight({ creator }: { creator: Creator }) {
  return (
    <article className={styles.card} style={{ background: creator.gradient }}>
      {creator.imageUrl && (
        <img src={creator.imageUrl} alt={creator.name} className={styles.image} />
      )}
      <div className={styles.body}>
        <div className={styles.name}>{creator.name}</div>
        <div className={styles.title}>{creator.title}</div>
        <p className={styles.bio}>{creator.bio}</p>

        <div className={styles.metrics}>
          <div>
            <div className={styles.metricValue}>{creator.mriScore}</div>
            <div className={styles.metricLabel}>MRI Score</div>
          </div>
          <div>
            <div className={styles.metricValue}>{creator.artworkCount}</div>
            <div className={styles.metricLabel}>Artworks</div>
          </div>
          <div>
            <div className={styles.metricValue}>{creator.followers}</div>
            <div className={styles.metricLabel}>Followers</div>
          </div>
        </div>

        <button type="button" className={styles.viewBtn}>
          View Profile
          <Icon name="arrow-right" size={13} />
        </button>
      </div>
    </article>
  );
}
