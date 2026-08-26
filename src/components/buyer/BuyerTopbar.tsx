import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { BuyerAccountMenu } from './BuyerAccountMenu';
import { useSession } from '../../lib/sessionContext';
import { getUnreadMessageSummary, type MessageNotification } from '../../services/messages';
import styles from './BuyerTopbar.module.css';

/** Search and account controls, shared by every /collect screen.
 *
 *  Discover is the only screen with something to search, so it passes
 *  `value`/`onChange` and filters as you type; everywhere else the box is
 *  hidden rather than left inert, and pressing Enter from Discover's box is
 *  the same as typing into it. */
export function BuyerTopbar({
  search = false,
  value,
  onChange,
  placeholder = 'Search artworks, artists, styles...',
  onFilterClick,
  filtersOpen = false,
}: {
  search?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** The sliders button beside the box. Omitted, it isn't rendered — a filter
   *  control that opens nothing is worse than no control. */
  onFilterClick?: () => void;
  filtersOpen?: boolean;
}) {
  const { profile } = useSession();
  const navigate = useNavigate();

  const [draft, setDraft] = useState('');
  const term = value ?? draft;
  const setTerm = onChange ?? setDraft;

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<MessageNotification[]>([]);
  const [notifCount, setNotifCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    if (!profile) {
      setNotifCount(0);
      setNotifItems([]);
      return;
    }
    getUnreadMessageSummary(profile, 'buyer').then((summary) => {
      if (!active) return;
      setNotifCount(summary.count);
      setNotifItems(summary.items);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  useEffect(() => {
    if (!notifOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!notifRef.current?.contains(event.target as Node)) setNotifOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setNotifOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [notifOpen]);

  function submit(event: FormEvent) {
    event.preventDefault();
    // Discover already filters live from `onChange`; from anywhere else the
    // box is hidden, so this only fires on the screen that owns the term.
    if (!onChange) navigate(term.trim() ? `/collect?q=${encodeURIComponent(term.trim())}` : '/collect');
  }

  return (
    <header className={styles.topbar}>
      {search ? (
        <form className={styles.search} onSubmit={submit} role="search">
          <Icon name="search" size={16} className={styles.searchIcon} />
          <input
            type="search"
            placeholder={placeholder}
            aria-label={placeholder}
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
          {term && (
            <button
              type="button"
              className={styles.clear}
              aria-label="Clear search"
              onClick={() => setTerm('')}
            >
              <Icon name="close" size={12} />
            </button>
          )}
          {onFilterClick && (
            <button
              type="button"
              className={[styles.filterBtn, filtersOpen && styles.filterBtnOn]
                .filter(Boolean)
                .join(' ')}
              aria-label="Filter artworks"
              aria-pressed={filtersOpen}
              onClick={onFilterClick}
            >
              <Icon name="sliders" size={15} />
            </button>
          )}
        </form>
      ) : (
        <span className={styles.spacer} />
      )}

      <div className={styles.controls}>
        <div className={styles.menuWrap} ref={notifRef}>
          <button
            type="button"
            className={styles.bell}
            aria-haspopup="true"
            aria-expanded={notifOpen}
            aria-label={`Notifications (${notifCount} unread)`}
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Icon name="bell" size={18} />
            {notifCount > 0 && (
              <span className={styles.bellCount}>{notifCount > 9 ? '9+' : notifCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className={styles.panel} role="menu" aria-label="Notifications">
              <p className={styles.panelTitle}>Notifications</p>

              {!profile ? (
                <p className={styles.panelEmpty}>Sign in to see your notifications.</p>
              ) : notifItems.length === 0 ? (
                <p className={styles.panelEmpty}>
                  Nothing new. Artists reply here when they answer an enquiry.
                </p>
              ) : (
                <ul className={styles.notifList}>
                  {notifItems.map((item) => (
                    <li key={item.id}>
                      <Link
                        to={`/collect/messages?c=${item.id}`}
                        className={styles.notifItem}
                        onClick={() => setNotifOpen(false)}
                      >
                        <span className={styles.notifDot} aria-hidden="true" />
                        <span className={styles.notifBody}>
                          <span className={styles.notifName}>{item.name}</span>
                          <span className={styles.notifPreview}>{item.preview}</span>
                        </span>
                        <span className={styles.notifTime}>{item.time}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <Link
                to="/collect/messages"
                className={styles.panelFooter}
                onClick={() => setNotifOpen(false)}
              >
                View all messages
              </Link>
            </div>
          )}
        </div>

        <BuyerAccountMenu trigger="avatar" />
      </div>
    </header>
  );
}
