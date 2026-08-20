import { Icon } from '../ui/Icon';
import { type Work } from '../../data/artspaceWorks';
import styles from './WorksGrid.module.css';

/** The card alternative to the table, per the "Artwork card" field list in
 *  docs/pivot-checklist/09-my-works.md. Same private management data as the
 *  table row — no likes, no public popularity signals — with the card's
 *  View · Edit · Share · More actions. */
export function WorksGrid({ works }: { works: Work[] }) {
  return (
    <div className={styles.grid}>
      {works.map((work) => (
        <article className={styles.card} key={work.id}>
          <div className={styles.media}>
            <img src={work.imageUrl} alt="" className={styles.image} loading="lazy" />
            <span className={styles.status}>{work.status}</span>
          </div>

          <div className={styles.body}>
            <p className={styles.title}>{work.title}</p>
            <p className={styles.meta}>
              {work.year} • {work.medium}
            </p>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>Availability</dt>
                <dd>
                  {work.availability}
                  {work.availabilityNote && ` ${work.availabilityNote}`}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Passport / COA</dt>
                <dd>{work.passport}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Interest</dt>
                <dd>
                  {work.interestCount === 0
                    ? 'No identified viewers'
                    : `${work.interestCount} identified viewer${work.interestCount === 1 ? '' : 's'}`}
                </dd>
              </div>
              <div className={styles.fact}>
                <dt>Opportunities</dt>
                <dd>{work.opportunities === 0 ? 'None' : `${work.opportunities} active`}</dd>
              </div>
              <div className={styles.fact}>
                <dt>Earnings</dt>
                <dd>{work.earnings === null ? '—' : `USD ${work.earnings.toLocaleString('en-US')} recorded`}</dd>
              </div>
            </dl>

            <div className={styles.actions}>
              <button type="button" className={styles.action}>
                View
              </button>
              <button type="button" className={styles.action}>
                Edit
              </button>
              <button type="button" className={styles.action}>
                Share
              </button>
              <button type="button" className={styles.more} aria-label={`More actions for ${work.title}`}>
                <Icon name="more-vertical" size={15} />
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
