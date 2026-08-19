import { Icon } from '../ui/Icon';
import { quickActions } from '../../data/artspaceContent';
import styles from './QuickActionsPanel.module.css';

/** The four things an artist starts most often, one tap from anywhere. */
export function QuickActionsPanel() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Quick Actions</h2>

      <ul className={styles.list}>
        {quickActions.map((action) => (
          <li key={action.id}>
            <button type="button" className={styles.row}>
              <Icon name={action.icon} size={17} className={styles.icon} />
              <span className={styles.label}>{action.label}</span>
              <Icon name="chevron-right" size={15} className={styles.caret} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
