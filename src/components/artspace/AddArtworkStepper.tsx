import { Icon } from '../ui/Icon';
import { addArtworkSteps } from '../../data/artspaceAddArtwork';
import styles from './AddArtworkStepper.module.css';

/** Progress through the guided flow. Completed steps become clickable so the
 *  artist can go back and correct something without starting over; steps ahead
 *  stay locked until the ones before them are done. */
export function AddArtworkStepper({
  current,
  completed,
  onSelect,
}: {
  current: string;
  completed: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <ol className={styles.steps}>
      {addArtworkSteps.map((step, i) => {
        const isDone = completed.includes(step.id);
        const isCurrent = step.id === current;
        const reachable = isDone || isCurrent;

        return (
          <li className={styles.step} key={step.id}>
            <button
              type="button"
              className={[
                styles.button,
                isCurrent && styles.current,
                isDone && styles.done,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => reachable && onSelect(step.id)}
              disabled={!reachable}
              aria-current={isCurrent ? 'step' : undefined}
              title={step.covers}
            >
              <span className={styles.marker}>
                {isDone && !isCurrent ? <Icon name="check" size={13} /> : i + 1}
              </span>
              <span className={styles.label}>{step.label}</span>
            </button>

            {i < addArtworkSteps.length - 1 && <span className={styles.line} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
