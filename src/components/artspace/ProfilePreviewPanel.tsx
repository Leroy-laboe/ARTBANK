import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { flagUrl } from '../../data/countries';
import type { ProfileCounts } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './ProfilePreviewPanel.module.css';

/** A live read of what the outside world sees.
 *
 *  Every value comes from the profile and from real counts. It used to render
 *  a fixed sample — another artist's name, photo and bio, over stats of
 *  24/8/12 — which made it impossible to tell what was actually published.
 *
 *  Nothing private may appear here: no readiness score, no earnings, no
 *  interest or enquiry data (docs/pivot-checklist/16-public-profile-access.md
 *  deletes public earnings and statistics outright). And no verified badge:
 *  spec 11 removes badges that assert something with no evidence behind them. */
export function ProfilePreviewPanel({
  profile,
  counts,
}: {
  profile: Profile | null;
  counts: ProfileCounts;
}) {
  const name = profile?.artistName?.trim() || profile?.displayName?.trim() || 'Unnamed profile';
  const handle = profile?.profileHandle;

  const stats = [
    { id: 'artworks', value: counts.artworks, label: 'Artworks' },
    { id: 'exhibitions', value: counts.exhibitions, label: 'Exhibitions' },
    { id: 'opportunities', value: counts.opportunities, label: 'Opportunities' },
  ];

  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Public Profile Preview</h2>
        {handle ? (
          <Link
            to={`/artists/${handle}`}
            target="_blank"
            rel="noreferrer"
            className={styles.viewLink}
          >
            View Full Profile
            <Icon name="external-link" size={12} />
          </Link>
        ) : (
          <span className={styles.viewLink} aria-disabled="true">
            No URL yet
          </span>
        )}
      </div>

      <div className={styles.preview}>
        {profile?.coverUrl ? (
          <img src={profile.coverUrl} alt="" className={styles.cover} loading="lazy" />
        ) : (
          <div className={styles.cover} />
        )}

        <div className={styles.identity}>
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
          ) : (
            <div className={styles.avatar} />
          )}

          <p className={styles.name}>{name}</p>

          {profile?.country && (
            <p className={styles.location}>
              {profile.countryCode ? (
                <img
                  src={flagUrl(profile.countryCode)}
                  alt=""
                  className={styles.flag}
                  loading="lazy"
                />
              ) : (
                <Icon name="map-pin" size={13} />
              )}
              {profile.country}
            </p>
          )}

          <p className={styles.bio}>
            {profile?.shortBio?.trim() || 'No short bio yet — add one in Profile Details.'}
          </p>

          <dl className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.id}>
                <dd className={styles.statValue}>{stat.value}</dd>
                <dt className={styles.statLabel}>{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {profile?.profileVisibility !== 'public' && (
        <p className={styles.privateNote}>
          Your profile is set to{' '}
          {profile?.profileVisibility === 'members' ? 'members only' : 'private'}, so this is not
          what a visitor would see.
        </p>
      )}
    </section>
  );
}
