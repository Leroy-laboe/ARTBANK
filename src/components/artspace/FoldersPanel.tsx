import { Icon } from '../ui/Icon';
import { messageFolders } from '../../data/artspaceMessages';
import styles from './FoldersPanel.module.css';

/** Mailbox folders. Archive lives here rather than behind a menu because it's
 *  one of the safety controls the brief requires to be reachable. */
export function FoldersPanel({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section className={styles.card}>
      <div className={styles.head}>
        <h2 className={styles.title}>Folders</h2>
        <button type="button" className={styles.add} aria-label="Create a folder">
          <Icon name="plus" size={15} />
        </button>
      </div>

      <ul className={styles.list}>
        {messageFolders.map((folder) => (
          <li key={folder.id}>
            <button
              type="button"
              className={[styles.row, folder.id === active && styles.rowActive].filter(Boolean).join(' ')}
              onClick={() => onSelect(folder.id)}
              aria-current={folder.id === active ? 'true' : undefined}
            >
              <Icon name={folder.icon} size={15} className={styles.icon} />
              <span className={styles.label}>{folder.label}</span>
              {folder.count !== undefined && <span className={styles.count}>{folder.count}</span>}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
