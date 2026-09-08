import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Panel, PanelEmpty } from './Panel';
import type { SavedNotification } from '../../services/interest';
import styles from './RecentSavesPanel.module.css';

function timeAgo(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

/** "Buyer Save List" (staff brief #9) — the artist's half: a notification
 *  that an identified buyer saved a work. Saving requires an account, so
 *  unlike anonymous views, everyone here is named. Requires migration 0029. */
export function RecentSavesPanel({ items }: { items: SavedNotification[] }) {
  return (
    <Panel title="Shortlisted" subtitle="Identified collectors who saved your work.">
      {items.length === 0 ? (
        <PanelEmpty>Nobody has saved your work yet.</PanelEmpty>
      ) : (
        <ul className={styles.list}>
          {items.map((item) => (
            <li className={styles.row} key={item.id}>
              <Icon name="bookmark" size={14} className={styles.icon} />
              <span className={styles.copy}>
                <strong>{item.buyerName}</strong> saved{' '}
                <Link to={`/artspace/works/${item.artworkId}`}>{item.artworkTitle}</Link>
              </span>
              <span className={styles.time}>{timeAgo(item.savedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
