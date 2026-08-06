import { Icon } from '../ui/Icon';
import { featuredCollection } from '../../data/marketplaceContent';
import styles from './FeaturedBanner.module.css';

export function FeaturedBanner() {
  return (
    <div className={styles.banner} style={{ background: featuredCollection.gradient }}>
      <div className={styles.glow} />

      <div className={styles.navBtns}>
        <button type="button" className={styles.navBtn} aria-label="Previous collection">
          <Icon name="chevron-right" size={16} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <button type="button" className={`${styles.navBtn} ${styles.navBtnLight}`} aria-label="Next collection">
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className={styles.content}>
        <p className={styles.eyebrow}>{featuredCollection.eyebrow}</p>
        <h2 className={styles.title}>{featuredCollection.title}</h2>
        <p className={styles.desc}>{featuredCollection.description}</p>
        <a href="#" className={styles.link}>
          View Collection
          <Icon name="arrow-right" size={15} />
        </a>
      </div>
    </div>
  );
}
