import { Icon } from '../ui/Icon';
import { Panel, PanelEmpty, PanelLink } from './Panel';
import { followers as demoFollowers, type Follower, type MonogramTone } from '../../data/artspaceInterest';
import styles from './FollowersPanel.module.css';

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

/** People who follow the profile. Following is a stated, identified
 *  relationship — not an anonymous view — so these people can be named. */
export function FollowersPanel({ followers = demoFollowers }: { followers?: Follower[] }) {
  return (
    <Panel
      title="People Following You"
      subtitle="People who follow your profile and stay updated."
      action={
        <PanelLink to="/artspace/interest" arrow>
          View all followers
        </PanelLink>
      }
    >
      {followers.length === 0 ? (
        <PanelEmpty>
          Nobody is following you yet. A public profile is what gives collectors something to
          follow.
        </PanelEmpty>
      ) : (
      <ul className={styles.grid}>
        {followers.map((person) => (
          <li className={styles.card} key={person.id}>
            {person.avatarUrl ? (
              <img src={person.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
            ) : (
              <span
                className={[styles.monogram, toneClass[person.tone ?? 'ink']].join(' ')}
                aria-hidden="true"
              >
                {person.monogram}
              </span>
            )}

            <div className={styles.copy}>
              <p className={styles.name}>
                {person.name}
                {person.verified && (
                  <Icon name="badge-check" size={13} className={styles.verified} aria-label="Identity verified" />
                )}
              </p>
              <p className={styles.role}>{person.role}</p>
              <p className={styles.location}>{person.location}</p>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.message}>
                Message
              </button>
              <button type="button" className={styles.follow} aria-label={`Follow ${person.name} back`}>
                <Icon name="user-plus" size={15} />
              </button>
            </div>
          </li>
        ))}
      </ul>
      )}
    </Panel>
  );
}
