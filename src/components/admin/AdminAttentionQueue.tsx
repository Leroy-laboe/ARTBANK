import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { adminQueue } from '../../data/adminContent';
import type { AdminQueueItemType } from '../../types/admin';
import styles from './AdminAttentionQueue.module.css';

const badgeLabel: Record<AdminQueueItemType, string> = {
  report: 'Report',
  coa: 'COA',
  match: 'Match',
  unclaimed: 'Unclaimed',
};

const badgeClass: Record<AdminQueueItemType, string> = {
  report: styles.badgeDanger,
  coa: styles.badgeGold,
  match: styles.badgeSuccess,
  unclaimed: styles.badgeMuted,
};

const dotClass: Record<AdminQueueItemType, string> = {
  report: styles.dotDanger,
  coa: styles.dotGold,
  match: styles.dotSuccess,
  unclaimed: styles.dotMuted,
};

/** The one screen every real admin function from docs/pivot-checklist/
 *  29-feature-admin-functions.md surfaces on together — a reported
 *  conversation, a COA request, a suggested match and a fresh unclaimed
 *  upload, ranked by what needs eyes first. */
export function AdminAttentionQueue() {
  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>
            <span className={styles.headDot} aria-hidden="true" />
            Requires Your Attention
          </h2>
          <p className={styles.subtitle}>Key items that need admin review.</p>
        </div>
        <Link to="/admin/flagged" className={styles.viewAll}>
          View all
          <Icon name="arrow-right" size={13} />
        </Link>
      </header>

      <ul className={styles.list}>
        {adminQueue.map((item) => (
          <li key={item.id} className={styles.row}>
            <img src={item.imageUrl} alt="" className={styles.thumb} loading="lazy" />

            <div className={styles.body}>
              <p className={styles.rowTitle}>
                <span className={[styles.dot, dotClass[item.type]].join(' ')} aria-hidden="true" />
                {item.title}
                <span className={[styles.badge, badgeClass[item.type]].join(' ')}>
                  {badgeLabel[item.type]}
                </span>
              </p>
              {item.detailLines.map((line) => (
                <p className={styles.detail} key={line}>
                  {line}
                </p>
              ))}
            </div>

            <p className={styles.date}>{item.date}</p>

            <Button variant={item.action.variant === 'primary' ? 'primary' : 'ghost'} size="sm">
              {item.action.label}
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
