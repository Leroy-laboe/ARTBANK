import { Icon } from '../ui/Icon';
import { featuredCreator } from '../../data/creatorsContent';
import styles from './FeaturedCreatorPanel.module.css';

export function FeaturedCreatorPanel() {
  return (
    <div>
      <div className={styles.label}>Featured Creator</div>

      <article className={styles.card}>
        <img src={featuredCreator.imageUrl} alt={featuredCreator.name} className={styles.image} />
        <div className={styles.scrim} />

        <span className={styles.verisBadge}>
          <Icon name="shield-check" size={11} />
          VERIS VERIFIED
        </span>

        <button type="button" className={styles.bookmarkBtn} aria-label="Save creator">
          <Icon name="bookmark" size={14} />
        </button>

        <div className={styles.body}>
          <div className={styles.name}>{featuredCreator.name}</div>
          <div className={styles.title}>{featuredCreator.title}</div>

          <div className={styles.mriRow}>
            <span className={styles.mriValue}>{featuredCreator.mriScore}</span>
            <div>
              <div className={styles.rankLabel}>{featuredCreator.rankLabel}</div>
              <div className={styles.rankSub}>{featuredCreator.rankSubLabel}</div>
            </div>
          </div>

          <button type="button" className={styles.viewBtn}>
            View Profile
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </article>
    </div>
  );
}
