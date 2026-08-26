import { Icon } from '../ui/Icon';
import type { Profile } from '../../types/user';
import styles from './ProfileCompletionCard.module.css';

/** How much of the profile is filled in, and which section to do next.
 *
 *  Computed from the profile, not declared. It used to read a fixed 80% above
 *  a checklist showing three of five done — the card contradicted itself on
 *  screen, and neither number described the account looking at it.
 *
 *  This is an editor aid. It never appears on the public profile, and it is
 *  not a score: the brief bans ranking artists (17-do-not-build-guardrails.md),
 *  so this only ever measures whether fields are filled. */
export function ProfileCompletionCard({
  profile,
  featuredCount,
  onGoToNext,
}: {
  profile: Profile | null;
  featuredCount: number;
  onGoToNext: (tabId: string) => void;
}) {
  const steps = [
    {
      id: 'details',
      label: 'Profile Details',
      done: Boolean(profile?.displayName?.trim() && profile?.country?.trim() && profile?.shortBio?.trim()),
    },
    {
      id: 'statement',
      label: 'Artist Statement',
      done: Boolean(profile?.artistStatement?.trim()),
    },
    { id: 'featured', label: 'Featured Artworks', done: featuredCount > 0 },
    {
      id: 'social',
      label: 'Social Links',
      done: Object.values(profile?.socialLinks ?? {}).some((url) => url?.trim()),
    },
    { id: 'settings', label: 'Profile Settings', done: Boolean(profile?.profileHandle?.trim()) },
  ];

  const done = steps.filter((step) => step.done).length;
  const percent = Math.round((done / steps.length) * 100);
  const next = steps.find((step) => !step.done);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Profile Completion</h2>
          <p className={styles.subtitle}>
            Complete your profile to increase visibility and attract more opportunities.
          </p>
        </div>
        <span className={styles.percent}>{percent}% Complete</span>
      </header>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <span className={styles.fill} style={{ width: `${percent}%` }} />
      </div>

      <ul className={styles.steps}>
        {steps.map((step) => (
          <li className={styles.step} key={step.id}>
            <Icon
              name={step.done ? 'check-circle' : 'circle-dashed'}
              size={16}
              className={step.done ? styles.done : styles.todo}
            />
            <span className={step.done ? styles.stepDone : styles.stepTodo}>{step.label}</span>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        <p className={styles.note}>
          {next
            ? `${steps.length - done} section${steps.length - done === 1 ? '' : 's'} left to reach 100%`
            : 'Every section is complete.'}
        </p>
        {next && (
          <button type="button" className={styles.nextBtn} onClick={() => onGoToNext(next.id)}>
            Go to {next.label}
          </button>
        )}
      </div>
    </section>
  );
}
