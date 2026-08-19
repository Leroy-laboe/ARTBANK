import { valuePillars } from '../../data/homeSections';
import styles from './ValuePillars.module.css';

export function ValuePillars() {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        {valuePillars.map((pillar) => (
          <div className={styles.pillar} key={pillar.index}>
            <span className={styles.index}>{pillar.index}</span>
            <div className={styles.copy}>
              <h3 className={styles.title}>{pillar.title}</h3>
              <p className={styles.desc}>{pillar.description}</p>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{pillar.statValue}</div>
              <div className={styles.statLabel}>{pillar.statLabel}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
