import { Icon } from '../ui/Icon';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

const strengthLabel: Record<string, string> = {
  strong: 'Strong match',
  good: 'Good match',
  partial: 'Partial match',
  weak: 'Weak match',
};

/** Opportunities this work has been matched to.
 *
 *  Every match shows `whyText` and anything still missing. The brief forbids
 *  unexplained recommendations, and an artist who can't see why they were
 *  matched can't judge whether to act — these two fields are the point of the
 *  tab, not decoration on it. */
export function RecordOpportunitiesTab({ record }: { record: ArtworkRecord }) {
  const { matches } = record;

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div>
          <h2 className={styles.panelTitle}>Matched opportunities ({matches.length})</h2>
          <p className={styles.panelNote}>
            Nothing is submitted on your behalf. Applying is always your decision.
          </p>
        </div>
      </div>

      {matches.length > 0 ? (
        <ul className={styles.list}>
          {matches.map((match) => (
            <li className={styles.item} key={match.id}>
              <div className={styles.itemHead}>
                <p className={styles.itemTitle}>{match.title}</p>
                <p className={styles.itemMeta}>
                  {match.deadline
                    ? `Closes ${new Date(match.deadline).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : 'No deadline stated'}
                </p>
              </div>

              <div className={styles.chips} style={{ marginTop: 7 }}>
                <span className={[styles.chip, styles.chipGold].join(' ')}>
                  {strengthLabel[match.strength] ?? match.strength}
                </span>
                {match.organizer && (
                  <span className={styles.chip}>
                    {match.organizer}
                    {match.organizerVerified ? ' ✓' : ''}
                  </span>
                )}
                {match.location && <span className={styles.chip}>{match.location}</span>}
              </div>

              <p className={styles.itemBody}>
                <strong>Why this matched: </strong>
                {match.whyText}
              </p>

              {match.missing.length > 0 && (
                <p className={styles.itemBody}>
                  <strong>Still needed: </strong>
                  {match.missing.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.empty}>
          <Icon name="briefcase" size={17} className={styles.emptyIcon} />
          <div>
            <p className={styles.emptyTitle}>No opportunities matched to this work</p>
            <p className={styles.emptyBody}>
              Matches are made against the record’s medium, category and location. A more complete
              record can be matched more accurately.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
