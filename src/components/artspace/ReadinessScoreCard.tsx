import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { professionalReadiness } from '../../data/artspaceContent';
import styles from './ReadinessScoreCard.module.css';

const RADIUS = 26;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** The readiness score at a glance. Private to the artist — there is no public
 *  ranking anywhere on Artbank (docs/pivot-checklist/17-do-not-build-guardrails.md). */
export function ReadinessScoreCard() {
  const { score, verdict, note } = professionalReadiness;

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Your Professional Readiness</h2>

      <div className={styles.body}>
        <div className={styles.dial}>
          <svg viewBox="0 0 60 60" className={styles.ring} aria-hidden="true">
            <circle cx="30" cy="30" r={RADIUS} className={styles.track} />
            <circle
              cx="30"
              cy="30"
              r={RADIUS}
              className={styles.progress}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - score / 100)}
            />
          </svg>
          <span className={styles.score}>{score}%</span>
        </div>

        <div className={styles.copy}>
          <p className={styles.verdict}>{verdict}</p>
          <p className={styles.note}>{note}</p>
        </div>
      </div>

      <Link to="/artspace/profile" className={styles.link}>
        View Insights
        <Icon name="arrow-right" size={14} />
      </Link>
    </section>
  );
}
