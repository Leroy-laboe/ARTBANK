import { Icon } from '../ui/Icon';
import { whyArtbank } from '../../data/homeContent';
import styles from './WhyArtbank.module.css';

export function WhyArtbank() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>Why ARTBANK</p>

        <div className={styles.grid}>
          {whyArtbank.map((item) => (
            <div className={styles.item} key={item.title}>
              <span className={styles.iconWrap}>
                <Icon name={item.icon} size={19} />
              </span>
              <div className={styles.title}>{item.title}</div>
              <p className={styles.desc}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
