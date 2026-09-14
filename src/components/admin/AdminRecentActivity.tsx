import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { adminActivity } from '../../data/adminContent';
import styles from './AdminRecentActivity.module.css';

/** A running log of what admin action was taken and when — the audit trail
 *  side of the four review functions, not another queue to act on. */
export function AdminRecentActivity() {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Recent Admin Activity</h2>
        <Link to="/admin" className={styles.viewAll}>
          View all
          <Icon name="arrow-right" size={12} />
        </Link>
      </header>

      <ul className={styles.list}>
        {adminActivity.map((item) => (
          <li key={item.id} className={styles.row}>
            <span
              className={[styles.dot, item.tone === 'success' ? styles.dotSuccess : styles.dotMuted].join(' ')}
              aria-hidden="true"
            />
            <span className={styles.text}>{item.text}</span>
            <span className={styles.time}>{item.time}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
