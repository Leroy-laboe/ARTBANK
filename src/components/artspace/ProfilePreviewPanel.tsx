import { Icon } from '../ui/Icon';
import { publicPreview } from '../../data/artspaceProfile';
import styles from './ProfilePreviewPanel.module.css';

/** A live read of what the outside world sees.
 *
 *  Nothing private may appear here — no readiness score, no earnings, no
 *  interest or enquiry data (docs/pivot-checklist/16-public-profile-access.md
 *  deletes public earnings and statistics outright). */
export function ProfilePreviewPanel() {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Public Profile Preview</h2>
        <button type="button" className={styles.viewLink}>
          View Full Profile
          <Icon name="external-link" size={12} />
        </button>
      </div>

      <div className={styles.preview}>
        <img src={publicPreview.coverUrl} alt="" className={styles.cover} loading="lazy" />

        <div className={styles.identity}>
          <img src={publicPreview.avatarUrl} alt="" className={styles.avatar} loading="lazy" />

          <p className={styles.name}>
            {publicPreview.name}
            {publicPreview.verified && (
              <Icon name="badge-check" size={14} className={styles.verified} aria-label="Identity verified" />
            )}
          </p>

          <p className={styles.location}>
            <Icon name="map-pin" size={13} />
            {publicPreview.location}
          </p>

          <p className={styles.bio}>{publicPreview.bio}</p>

          <dl className={styles.stats}>
            {publicPreview.stats.map((stat) => (
              <div key={stat.id}>
                <dd className={styles.statValue}>{stat.value}</dd>
                <dt className={styles.statLabel}>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
