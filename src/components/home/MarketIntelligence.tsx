import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { marketFacts, marketSignals, marketTexture } from '../../data/homeSections';
import styles from './MarketIntelligence.module.css';

export function MarketIntelligence() {
  return (
    <section className={styles.section}>
      <img className={styles.texture} src={marketTexture} alt="" loading="lazy" aria-hidden="true" />
      <span className={styles.glow} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={`eyebrow ${styles.eyebrow}`}>Market intelligence</p>
            <h2 className={styles.title}>
              What buyers are looking for,
              <br />
              <span className={styles.titleAccent}>before it becomes obvious.</span>
            </h2>
            <p className={styles.intro}>
              Real buyer activity reveals emerging demand, growing categories and new opportunities.
            </p>

            <Link to="/for-buyers" className={styles.cta}>
              View market insights
              <Icon name="arrow-right" size={15} />
            </Link>

            <p className={styles.footnote}>Based on platform activity over the last 90 days.</p>
          </div>

          <div className={styles.right}>
            <div className={styles.signals}>
              {marketSignals.map((signal) => (
                <article className={styles.signal} key={signal.rank}>
                  <p className={styles.rank} aria-hidden="true">
                    {signal.rank}
                  </p>
                  <p className={styles.tag}>{signal.tag}</p>

                  <div className={styles.signalBody}>
                    <div className={styles.signalCopy}>
                      <p className={styles.value}>{signal.value}</p>
                      <p className={styles.label}>{signal.label}</p>
                      <p className={styles.note}>
                        <Icon name="trend-up" size={15} />
                        {signal.note}
                      </p>
                    </div>

                    <img className={styles.shot} src={signal.imageUrl} alt="" loading="lazy" />
                  </div>
                </article>
              ))}
            </div>

            {/* Sits under the signals rather than the whole band, so its rule
                starts where the columns start and the footnote opposite it
                keeps the left column's baseline. */}
            <div className={styles.facts}>
              {marketFacts.map((fact) => (
                <div className={styles.fact} key={fact.label}>
                  <span className={styles.factIcon}>
                    <Icon name={fact.icon} size={17} />
                  </span>
                  <div>
                    <p className={styles.factValue}>{fact.value}</p>
                    <p className={styles.factLabel}>{fact.label}</p>
                  </div>
                </div>
              ))}

              <p className={styles.script}>
                Real interest.
                <br />
                Real opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
