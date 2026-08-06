import { trendingStyles } from '../../data/creatorsContent';
import styles from './TrendingStylesPanel.module.css';

export function TrendingStylesPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Trending Styles</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <div className={styles.grid}>
        {trendingStyles.map((style) => (
          <div className={styles.tag} key={style.label}>
            <span className={styles.tagLabel}>{style.label}</span>
            <span className={styles.tagCount}>{style.count.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
