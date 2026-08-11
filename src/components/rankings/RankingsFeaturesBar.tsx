import { Icon } from '../ui/Icon';
import { mriFeatures } from '../../data/mriRankingsContent';
import styles from './RankingsFeaturesBar.module.css';

export function RankingsFeaturesBar() {
  return (
    <section className={styles.bar}>
      <div className={styles.row}>
        {mriFeatures.map((feature) => (
          <div className={styles.item} key={feature.title}>
            <Icon name={feature.icon} size={20} className={styles.icon} />
            <div>
              <div className={styles.title}>{feature.title}</div>
              <div className={styles.desc}>{feature.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
