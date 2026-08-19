import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { buyerMatches, buyerSteps } from '../../data/homeSections';
import styles from './BuyerSourcing.module.css';

export function BuyerSourcing() {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copyCol}>
          <p className={`eyebrow ${styles.eyebrow}`}>For buyers &amp; institutions</p>
          <h2 className={styles.title}>Source creativity with context — not guesswork.</h2>

          <ul className={styles.steps}>
            {buyerSteps.map((step) => (
              <li key={step}>
                <Icon name="check-circle" size={15} />
                {step}
              </li>
            ))}
          </ul>

          <Link to="/for-buyers" className={styles.cta}>
            Start a Sourcing Brief
            <Icon name="arrow-right" size={14} />
          </Link>
        </div>

        <div className={styles.matchPanel}>
          <div className={styles.matchHead}>Recently matched for you</div>

          {buyerMatches.map((match) => (
            <div className={styles.matchRow} key={match.name}>
              <img className={styles.avatar} src={match.imageUrl} alt="" loading="lazy" />
              <div className={styles.matchCopy}>
                <div className={styles.matchName}>{match.name}</div>
                <div className={styles.matchMeta}>{match.role}</div>
                <div className={styles.matchMeta}>{match.location}</div>
              </div>
              <div className={styles.matchScore}>
                <span className={styles.matchPct}>{match.match}%</span>
                <span className={styles.matchWord}>match</span>
              </div>
            </div>
          ))}

          <Link to="/for-buyers" className={styles.matchLink}>
            View all matches
            <Icon name="arrow-right" size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
