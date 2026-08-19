import { Icon } from '../ui/Icon';
import { Panel, PanelButtonLink } from './Panel';
import { needsDecision } from '../../data/artspaceContent';
import styles from './NeedsDecisionPanel.module.css';

/** Module 1 — the single most important thing on the screen: what is waiting
 *  on the artist right now. Never more than three items. */
export function NeedsDecisionPanel() {
  return (
    <Panel
      title="Needs Your Decision"
      subtitle="Maximum 3 urgent actions"
      action={<PanelButtonLink to="/artspace/messages">View All ({needsDecision.length})</PanelButtonLink>}
    >
      <div className={styles.grid}>
        {needsDecision.map((item) => (
          <article className={styles.card} key={item.id}>
            <span className={styles.icon}>
              <Icon name={item.icon} size={20} />
            </span>
            <div className={styles.copy}>
              <p className={styles.title}>{item.title}</p>
              <p className={styles.context}>{item.context}</p>
              <p className={styles.meta}>{item.meta}</p>
            </div>
            <button type="button" className={styles.action}>
              {item.action}
            </button>
          </article>
        ))}
      </div>
    </Panel>
  );
}
