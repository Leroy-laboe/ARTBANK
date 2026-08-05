import { Icon } from '../ui/Icon';
import { heroStats } from '../../data/homeContent';
import styles from './StatsBar.module.css';

export function StatsBar() {
  return (
    <section className={styles.bar}>
      <div className={`container ${styles.row}`}>
        {heroStats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <span className={styles.iconWrap}>
              <Icon name={stat.icon} size={19} />
            </span>
            <div>
              <div className={styles.value}>{stat.value}</div>
              <div className={styles.label}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
