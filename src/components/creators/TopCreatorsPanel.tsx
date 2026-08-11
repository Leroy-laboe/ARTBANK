import { Icon } from '../ui/Icon';
import { topCreators } from '../../data/creatorsContent';
import styles from './TopCreatorsPanel.module.css';

export function TopCreatorsPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Top Creators</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <ul className={styles.list}>
        {topCreators.map((creator, index) => (
          <li className={styles.item} key={creator.name}>
            <span className={styles.rank}>{index + 1}</span>
            <img
              src={creator.imageUrl}
              alt={creator.name}
              className={styles.avatar}
              loading="lazy"
              decoding="async"
            />
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
