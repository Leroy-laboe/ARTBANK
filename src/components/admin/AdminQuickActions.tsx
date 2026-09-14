import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { adminQuickActions } from '../../data/adminContent';
import styles from './AdminQuickActions.module.css';

/** The rail's shortcut list — one row per real admin function plus the soft
 *  "add opportunity" case, same set as the Overview screen's stat cards. */
export function AdminQuickActions() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Quick Actions</h2>

      <ul className={styles.list}>
        {adminQuickActions.map((action) => (
          <li key={action.id}>
            <Link to={action.to} className={styles.row}>
              <span className={styles.iconWrap}>
                <Icon name={action.icon} size={16} />
              </span>
              <span className={styles.copy}>
                <span className={styles.label}>{action.label}</span>
                <span className={styles.detail}>{action.detail}</span>
              </span>
              <Icon name="chevron-right" size={14} className={styles.caret} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
