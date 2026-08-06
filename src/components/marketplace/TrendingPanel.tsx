import { Icon } from '../ui/Icon';
import { trendingCreators } from '../../data/marketplaceContent';
import styles from './TrendingPanel.module.css';

export function TrendingPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Trending Now</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <ul className={styles.list}>
        {trendingCreators.map((creator) => (
          <li className={styles.item} key={creator.name}>
            <img src={creator.imageUrl} alt={creator.name} className={styles.avatar} />
            <div className={styles.info}>
              <div className={styles.name}>{creator.name}</div>
              <div className={styles.score}>MRI {creator.mriScore}</div>
            </div>
            <Icon name="trend-up" size={15} className={styles.trendIcon} />
          </li>
        ))}
      </ul>
    </div>
  );
}
