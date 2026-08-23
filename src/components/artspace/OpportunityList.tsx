import { Icon } from '../ui/Icon';
import { stageDisplay, type Opportunity } from '../../data/artspaceOpportunities';
import styles from './OpportunityList.module.css';

const toneClass: Record<string, string> = {
  neutral: styles.toneNeutral,
  info: styles.toneInfo,
  gold: styles.toneGold,
  success: styles.toneSuccess,
  muted: styles.toneMuted,
};

/** One row per opportunity: what it is, when it closes, what it pays, and
 *  where the artist stands with it.
 *
 *  "View Details" opens the opportunity rather than applying — nothing is
 *  submitted without the artist explicitly approving it, per the brief. */
export function OpportunityList({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return <p className={styles.empty}>No opportunities in this stage yet.</p>;
  }

  return (
    <ul className={styles.list}>
      {opportunities.map((item) => {
        const display = stageDisplay[item.stage];

        return (
          <li className={styles.row} key={item.id}>
            <div className={styles.media}>
              <img src={item.imageUrl} alt="" className={styles.image} loading="lazy" />
              {item.featured && <span className={styles.featured}>Featured</span>}
            </div>

            <div className={styles.copy}>
              <h3 className={styles.title}>{item.title}</h3>
              <p className={styles.organizer}>
                {item.organizer}
                {item.organizerVerified && (
                  <Icon
                    name="badge-check"
                    size={13}
                    className={styles.verified}
                    aria-label="Organisation verified"
                  />
                )}
              </p>
              <p className={styles.location}>{item.location}</p>
              <p className={styles.summary}>{item.summary}</p>

              <dl className={styles.tags}>
                <div>
                  <dt className={styles.tagLabel}>Category</dt>
                  <dd className={styles.tagValue}>{item.category}</dd>
                </div>
                <div>
                  <dt className={styles.tagLabel}>Medium</dt>
                  <dd className={styles.tagValue}>{item.medium}</dd>
                </div>
              </dl>
            </div>

            <div className={styles.terms}>
              <p className={styles.termLabel}>Application Deadline</p>
              <p className={styles.deadline}>{item.deadline}</p>
              <p className={styles.daysLeft}>(in {item.daysLeft} days)</p>

              <p className={[styles.termLabel, styles.budgetLabel].join(' ')}>Budget</p>
              <p className={styles.budget}>{item.budget}</p>
              {item.fee && <p className={styles.fee}>Entry fee {item.fee}</p>}
            </div>

            <div className={styles.side}>
              <div className={[styles.stage, toneClass[display.tone]].join(' ')}>
                <p className={styles.stageName}>
                  <Icon name={display.icon} size={15} />
                  {item.stage}
                </p>
                <p className={styles.stageNote}>{item.stageNote}</p>
              </div>

              <div className={styles.actions}>
                <button type="button" className={styles.details}>
                  View Details
                </button>
                <button type="button" className={styles.menu} aria-label={`More actions for ${item.title}`}>
                  <Icon name="more-vertical" size={16} />
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
