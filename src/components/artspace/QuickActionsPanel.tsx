import { useNavigate } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';
import styles from './QuickActionsPanel.module.css';

export type QuickAction = {
  id: string;
  icon: IconName;
  label: string;
  /** Where the action goes. Actions without one are not yet reachable and
   *  render disabled rather than silently doing nothing. */
  to?: string;
};

/** The handful of things an artist starts most often on the current screen.
 *  Each screen passes its own list — Today's differs from My Works'. */
export function QuickActionsPanel({
  actions,
  title = 'Quick Actions',
  handlers,
}: {
  actions: QuickAction[];
  title?: string;
  /** Per-action callbacks, keyed by action id. An action is live if it has a
   *  destination or a handler here; anything else renders disabled rather
   *  than looking clickable and doing nothing. */
  handlers?: Record<string, () => void>;
}) {
  const navigate = useNavigate();
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>{title}</h2>

      <ul className={styles.list}>
        {actions.map((action) => {
          const handler = handlers?.[action.id];
          const live = Boolean(action.to || handler);

          return (
          <li key={action.id}>
            <button
              type="button"
              className={styles.row}
              disabled={!live}
              title={live ? undefined : 'Not available yet'}
              onClick={() => {
                if (handler) handler();
                else if (action.to) navigate(action.to);
              }}
            >
              <Icon name={action.icon} size={15} className={styles.icon} />
              <span className={styles.label}>{action.label}</span>
              <Icon name="chevron-right" size={13} className={styles.caret} />
            </button>
          </li>
          );
        })}
      </ul>
    </section>
  );
}
