import { useEffect, useRef, useState } from 'react';
import { Icon } from '../ui/Icon';
import { adminRegisteredUsers } from '../../data/adminLinkArtworks';
import { searchRegisteredUsers } from '../../services/admin';
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import type { AdminRegisteredUser } from '../../types/admin';
import styles from './AdminUserSearchPopover.module.css';

/** The manual-search half of Link Artworks: when there's no suggested email
 *  to confirm, the admin searches registered users by hand — see
 *  docs/pivot-checklist/29-feature-admin-functions.md's function #2.
 *
 *  Queries public.users live (requires migration 0035's "Admins read all
 *  users" policy). Falls back to the small demo directory with no backend
 *  configured, same as the rest of this prototype. */
export function AdminUserSearchPopover({
  onPick,
  onClose,
}: {
  onPick: (user: AdminRegisteredUser) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AdminRegisteredUser[]>(
    isSupabaseConfigured ? [] : adminRegisteredUsers,
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) onClose();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const q = query.trim().toLowerCase();
      setResults(
        q
          ? adminRegisteredUsers.filter(
              (user) => user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q),
            )
          : adminRegisteredUsers,
      );
      return;
    }

    let active = true;
    // A short debounce so every keystroke doesn't fire its own query.
    const timer = window.setTimeout(() => {
      searchRegisteredUsers(query).then((found) => {
        if (active) setResults(found);
      });
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className={styles.panel} ref={ref} role="menu" aria-label="Search registered users">
      <div className={styles.search}>
        <Icon name="search" size={14} className={styles.searchIcon} />
        <input
          autoFocus
          type="text"
          placeholder="Search by name or email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length === 0 ? (
        <p className={styles.empty}>No registered users match.</p>
      ) : (
        <ul className={styles.list}>
          {results.map((user) => (
            <li key={user.id}>
              <button type="button" className={styles.row} onClick={() => onPick(user)}>
                <span className={styles.name}>{user.name}</span>
                <span className={styles.email}>{user.email}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
