import { trendingTags } from '../../data/mriRankingsContent';
import styles from './TrendingTagsPanel.module.css';

export function TrendingTagsPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Trending This Month</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <div className={styles.tags}>
        {trendingTags.map((tag) => (
          <span className={styles.tag} key={tag}>
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
