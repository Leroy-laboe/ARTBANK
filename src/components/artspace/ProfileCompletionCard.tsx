import { Icon } from '../ui/Icon';
import { profileCompletion } from '../../data/artspaceProfile';
import styles from './ProfileCompletionCard.module.css';

/** How much of the profile is filled in, and which section to do next. This
 *  is an editor aid — it never appears on the public profile. */
export function ProfileCompletionCard({ onGoToNext }: { onGoToNext: (tabId: string) => void }) {
  const next = profileCompletion.steps.find((step) => !step.done);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Profile Completion</h2>
          <p className={styles.subtitle}>
            Complete your profile to increase visibility and attract more opportunities.
          </p>
        </div>
        <span className={styles.percent}>{profileCompletion.percent}% Complete</span>
      </header>

      <div
        className={styles.track}
        role="progressbar"
        aria-valuenow={profileCompletion.percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Profile completion"
      >
        <span className={styles.fill} style={{ width: `${profileCompletion.percent}%` }} />
      </div>

      <ul className={styles.steps}>
        {profileCompletion.steps.map((step) => (
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
        <p className={styles.note}>{profileCompletion.note}</p>
        {next && (
          <button type="button" className={styles.nextBtn} onClick={() => onGoToNext(next.id)}>
            Go to Next Section
          </button>
        )}
      </div>
    </section>
  );
}
