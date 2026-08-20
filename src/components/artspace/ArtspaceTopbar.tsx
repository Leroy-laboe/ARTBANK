import { Icon } from '../ui/Icon';
import { artspaceArtist } from '../../data/artspaceContent';
import styles from './ArtspaceTopbar.module.css';

/** Search and account controls, shared by every ArtSpace screen.
 *
 *  Today puts its greeting on this row, so the greeting lives here behind
 *  `showGreeting`. Screens with their own page title (My Works and friends)
 *  turn it off and render an ArtspacePageHeader underneath instead. */
export function ArtspaceTopbar({
  showGreeting = true,
  searchPlaceholder = 'Search ArtSpace...',
}: {
  showGreeting?: boolean;
  searchPlaceholder?: string;
}) {
  const { greeting, firstName, statusLine, name, avatarUrl, unreadNotifications } = artspaceArtist;

  return (
    <header className={[styles.topbar, !showGreeting && styles.topbarBare].filter(Boolean).join(' ')}>
      {showGreeting && (
        <div className={styles.greetingCol}>
          <h1 className={styles.greeting}>
            {greeting}, {firstName} <span className={styles.wave}>👋</span>
          </h1>
          <p className={styles.status}>{statusLine}</p>
        </div>
      )}

      <div className={styles.controls}>
        <label className={styles.search}>
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input type="search" placeholder={searchPlaceholder} aria-label={searchPlaceholder} />
          <kbd className={styles.kbd}>/</kbd>
        </label>

        <button type="button" className={styles.bell} aria-label={`Notifications (${unreadNotifications} unread)`}>
          <Icon name="bell" size={18} />
          {unreadNotifications > 0 && <span className={styles.bellCount}>{unreadNotifications}</span>}
        </button>

        <button type="button" className={styles.account}>
          <img src={avatarUrl} alt="" className={styles.avatar} />
          <span className={styles.accountName}>{name}</span>
          <Icon name="chevron-down" size={15} className={styles.caret} />
        </button>
      </div>
    </header>
  );
}
