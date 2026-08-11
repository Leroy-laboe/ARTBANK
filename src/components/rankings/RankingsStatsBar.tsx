import { Icon } from '../ui/Icon';
import { mriGlobalStats } from '../../data/mriRankingsContent';
import styles from './RankingsStatsBar.module.css';

export function RankingsStatsBar() {
  return (
    <div className={styles.panel}>
      {mriGlobalStats.map((stat) => (
        <div className={styles.stat} key={stat.label}>
          <span className={styles.iconWrap}>
            <Icon name={stat.icon} size={18} />
          </span>
          <div>
            <div className={styles.value}>{stat.value}</div>
            <div className={styles.label}>{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
