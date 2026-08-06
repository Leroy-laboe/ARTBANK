import { Icon } from '../ui/Icon';
import { trustPoints } from '../../data/marketplaceContent';
import styles from './TrustBar.module.css';

export function TrustBar() {
  return (
    <section className={styles.bar}>
      <div className={styles.row}>
        {trustPoints.map((point) => (
          <div className={styles.item} key={point.title}>
            <Icon name={point.icon} size={20} className={styles.icon} />
            <div>
              <div className={styles.title}>{point.title}</div>
              <div className={styles.desc}>{point.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
