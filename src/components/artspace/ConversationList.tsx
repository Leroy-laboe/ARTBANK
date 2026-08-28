import { Icon } from '../ui/Icon';
import { conversations, type Conversation } from '../../data/artspaceMessages';
import type { MonogramTone } from '../../data/artspaceInterest';
import styles from './ConversationList.module.css';

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

export function ConversationList({
  items = conversations,
  activeId,
  onSelect,
}: {
  items?: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className={styles.pane}>
      <div className={styles.search}>
        <label className={styles.searchField}>
          <Icon name="search" size={15} className={styles.searchIcon} />
          <input type="search" placeholder="Search messages..." aria-label="Search messages" />
        </label>
        <button type="button" className={styles.filterBtn} aria-label="Filter conversations">
          <Icon name="filter" size={16} />
        </button>
      </div>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={[styles.row, item.id === activeId && styles.rowActive].filter(Boolean).join(' ')}
              onClick={() => onSelect(item.id)}
              aria-current={item.id === activeId ? 'true' : undefined}
            >
              {item.avatarUrl ? (
                <img src={item.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
              ) : (
                <span
                  className={[styles.monogram, toneClass[item.tone ?? 'ink']].join(' ')}
                  aria-hidden="true"
                >
                  {item.monogram}
                </span>
              )}

              <div className={styles.copy}>
                <span className={styles.top}>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.time}>{item.time}</span>
                </span>
                <span className={styles.preview}>{item.preview}</span>
              </div>

              {item.unread > 0 && <span className={styles.unread}>{item.unread}</span>}
              {item.unread === 0 && item.starred && (
                <Icon name="star" size={15} className={styles.starred} aria-label="Starred" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {/* The real number. This used to read "Showing 1 to 7 of 28" from a
          literal, which stayed 28 however many conversations there were. */}
      <p className={styles.footer}>
        {items.length} {items.length === 1 ? 'conversation' : 'conversations'}
      </p>
    </div>
  );
}
