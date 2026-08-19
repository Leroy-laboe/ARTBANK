import { Icon } from '../ui/Icon';
import { artspaceArtist } from '../../data/artspaceContent';
import styles from './ArtspaceTopbar.module.css';

/** Greeting on the left, search and account controls on the right. The
 *  greeting carries a real status line rather than a bare "Welcome back". */
export function ArtspaceTopbar() {
  const { greeting, firstName, statusLine, name, avatarUrl, unreadNotifications } = artspaceArtist;

  return (
    <header className={styles.topbar}>
      <div className={styles.greetingCol}>
        <h1 className={styles.greeting}>
          {greeting}, {firstName} <span className={styles.wave}>👋</span>
        </h1>
        <p className={styles.status}>{statusLine}</p>
      </div>

      <div className={styles.controls}>
        <label className={styles.search}>
          <Icon name="search" size={17} className={styles.searchIcon} />
          <input type="search" placeholder="Search ArtSpace..." aria-label="Search ArtSpace" />
          <kbd className={styles.kbd}>/</kbd>
        </label>

        <button type="button" className={styles.bell} aria-label={`Notifications (${unreadNotifications} unread)`}>
          <Icon name="bell" size={20} />
          {unreadNotifications > 0 && <span className={styles.bellCount}>{unreadNotifications}</span>}
        </button>

        <button type="button" className={styles.account}>
          <img src={avatarUrl} alt="" className={styles.avatar} />
          <span className={styles.accountName}>{name}</span>
          <Icon name="chevron-down" size={16} className={styles.caret} />
        </button>
      </div>
    </header>
  );
}
