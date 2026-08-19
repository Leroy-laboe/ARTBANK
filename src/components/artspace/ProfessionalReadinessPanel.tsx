import { Icon } from '../ui/Icon';
import { Panel, PanelLink } from './Panel';
import { professionalReadiness } from '../../data/artspaceContent';
import styles from './ProfessionalReadinessPanel.module.css';

/** Module 6 — the private replacement for the old public MRI ranking. It only
 *  ever tells the artist what to improve next; nobody else can see it. */
export function ProfessionalReadinessPanel() {
  return (
    <Panel
      title="Professional Readiness"
      subtitle="Improve your profile and unlock more opportunities."
      action={<PanelLink to="/artspace/profile">View My Readiness →</PanelLink>}
    >
      <div className={styles.grid}>
        {professionalReadiness.tasks.map((task) => (
          <article className={styles.card} key={task.id}>
            <span className={styles.icon}>
              <Icon name={task.icon} size={20} />
            </span>
            <div className={styles.copy}>
              <p className={styles.title}>{task.title}</p>
              <p className={styles.detail}>{task.detail}</p>
              <div className={styles.progressRow}>
                <span className={styles.track}>
                  <span className={styles.fill} style={{ width: `${task.progress}%` }} />
                </span>
                <span className={styles.percent}>{task.progress}%</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}
