import type { ConversationStage } from '../../services/interest';
import styles from './StageProgress.module.css';

const steps: { id: ConversationStage; label: string }[] = [
  { id: 'enquiry', label: 'Enquiry' },
  { id: 'qualified', label: 'Qualified' },
  { id: 'viewing_room', label: 'Viewing Room' },
  { id: 'negotiation', label: 'Negotiation' },
  { id: 'completed', label: 'Completed' },
];

/** "Interest-to-Deal Progress" — one of the "practical features worth adding
 *  now" from the staff brief, placed on Messages. */
export function StageProgress({ stage }: { stage: ConversationStage }) {
  const currentIndex = steps.findIndex((s) => s.id === stage);

  return (
    <div className={styles.row} role="img" aria-label={`Progress: ${steps[currentIndex]?.label ?? stage}`}>
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={[
            styles.step,
            index < currentIndex && styles.stepDone,
            index === currentIndex && styles.stepCurrent,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className={styles.dot} />
          <span className={styles.label}>{step.label}</span>
        </div>
      ))}
    </div>
  );
}
