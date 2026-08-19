import { Icon } from '../ui/Icon';
import { marketSignals } from '../../data/homeSections';
import styles from './MarketIntelligence.module.css';

export function MarketIntelligence() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>Market intelligence</p>
        <h2 className={styles.title}>
          Demand signals artists
          <br />
          can actually use.
        </h2>

        <div className={styles.row}>
          <div className={styles.leadCard}>
            <p className={styles.leadText}>
              Buyer demand is shifting from finished objects to thoughtful, contextual work. Stay
              ahead of what’s next.
            </p>
            <span className={styles.leadLink}>
              View market insights
              <Icon name="arrow-right" size={13} />
            </span>
          </div>

          {marketSignals.map((signal) => (
            <div className={styles.signalCard} key={signal.value}>
              <div className={styles.signalValue}>{signal.value}</div>
              <div className={styles.signalLabel}>{signal.label}</div>
            </div>
          ))}
        </div>

        <p className={styles.footnote}>Based on platform activity over the last 90 days.</p>
      </div>
    </section>
  );
}
