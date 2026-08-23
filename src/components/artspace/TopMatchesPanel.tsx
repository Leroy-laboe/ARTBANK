import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { topMatches } from '../../data/artspaceOpportunities';
import styles from './TopMatchesPanel.module.css';

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Opportunities scored against the artist's profile and works. The ring
 *  restates the number visually; the number itself is the honest signal. */
export function TopMatchesPanel() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Top Opportunity Matches</h2>
      <p className={styles.subtitle}>Based on your profile and artworks</p>

      <ul className={styles.list}>
        {topMatches.map((match) => (
          <li className={styles.row} key={match.id}>
            <img src={match.imageUrl} alt="" className={styles.thumb} loading="lazy" />

            <div className={styles.copy}>
              <p className={styles.name}>{match.title}</p>
              <p className={styles.org}>
                {match.organizer}
                {match.location && `, ${match.location}`}
              </p>
              <p className={styles.score}>{match.score}% Match</p>
            </div>

            <span className={styles.dial}>
              <svg viewBox="0 0 36 36" className={styles.ring} aria-hidden="true">
                <circle cx="18" cy="18" r={RADIUS} className={styles.track} />
                <circle
                  cx="18"
                  cy="18"
                  r={RADIUS}
                  className={styles.progress}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - match.score / 100)}
                />
              </svg>
              <span className={styles.dialValue}>{match.score}%</span>
            </span>
          </li>
        ))}
      </ul>

      <Link to="/artspace/opportunities" className={styles.link}>
        View more matches
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
