import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { top10Creators } from '../../data/mriRankingsContent';
import styles from './TopRankingsPanel.module.css';

export function TopRankingsPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Top 10 Creators</span>
        <a href="#" className={styles.viewAll}>
          View full ranking
        </a>
      </div>

      <div className={styles.tableHead}>
        <span>#</span>
        <span>Creator</span>
        <span>Country</span>
        <span className={styles.alignRight}>MRI Score</span>
        <span className={styles.alignCenter}>Trend</span>
      </div>

      <ul className={styles.rows}>
        {top10Creators.map((creator) => (
          <li className={styles.row} key={creator.rank}>
            <span className={styles.rankNum}>{creator.rank}</span>
            <span className={styles.creatorCell}>
              <img
                src={creator.imageUrl}
                alt={creator.name}
                className={styles.avatar}
                loading="lazy"
                decoding="async"
              />
              <span className={styles.creatorName}>{creator.name}</span>
            </span>
            <span className={styles.countryCell}>
              <img src={creator.countryFlag} alt="" className={styles.flag} />
              {creator.country}
            </span>
            <span className={`${styles.scoreCell} ${styles.alignRight}`}>{creator.mriScore}</span>
            <span className={styles.alignCenter}>
              {creator.trend === 'up' && <Icon name="trend-up" size={15} className={styles.trendUp} />}
              {creator.trend === 'down' && (
                <Icon name="trend-up" size={15} className={styles.trendDown} />
              )}
              {creator.trend === 'flat' && <Icon name="minus" size={15} className={styles.trendFlat} />}
            </span>
          </li>
        ))}
      </ul>

      <Button variant="ghost" className={styles.viewFullBtn} icon={<Icon name="arrow-right" size={15} />}>
        View Full Rankings
      </Button>
    </div>
  );
}
