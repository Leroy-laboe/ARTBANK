import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { listMyViewingRooms, type ViewingRoomSummary } from '../services/viewingRooms';
import styles from './MyRoomsPage.module.css';

/** Viewing Rooms — the list of what this artist has curated.
 *  docs/pivot-checklist/21-feature-private-viewing-room.md: "the artist
 *  selects artworks and creates one controlled link." This is that list;
 *  RoomBuilderPage is where one gets built. Lives under the account menu per
 *  07-artspace-shell-and-navigation.md's placement note. */
export function MyRoomsPage() {
  const { profile } = useSession();
  const [rooms, setRooms] = useState<ViewingRoomSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    listMyViewingRooms(profile).then((rows) => {
      if (!active) return;
      setRooms(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />
        <ArtspacePageHeader
          title="Viewing Rooms"
          subtitle="A private, curated presentation instead of public browsing — one controlled link per room."
          actions={
            <Link to="/artspace/rooms/new" className={styles.newButton}>
              <Icon name="plus" size={15} />
              New Room
            </Link>
          }
        />

        {loading ? (
          <p className={styles.state}>Loading…</p>
        ) : rooms.length === 0 ? (
          <div className={styles.empty}>
            <Icon name="lock" size={26} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>No viewing rooms yet</p>
            <p className={styles.emptyNote}>
              Select a few works, decide what to share, and send one link — instead of pointing a
              collector at your whole public portfolio.
            </p>
            <Link to="/artspace/rooms/new" className={styles.emptyLink}>
              Create your first room
            </Link>
          </div>
        ) : (
          <ul className={styles.list}>
            {rooms.map((room) => (
              <li key={room.id}>
                <Link
                  to={`/artspace/rooms/${room.id}`}
                  className={[styles.row, room.isExpired && styles.rowExpired].filter(Boolean).join(' ')}
                >
                  <Icon name="lock" size={17} className={styles.rowIcon} />
                  <span className={styles.copy}>
                    <span className={styles.title}>{room.title}</span>
                    <span className={styles.meta}>
                      {room.artworkCount} {room.artworkCount === 1 ? 'artwork' : 'artworks'} ·{' '}
                      {room.viewCount} {room.viewCount === 1 ? 'view' : 'views'}
                      {room.expiresAt &&
                        ` · ${room.isExpired ? 'expired' : 'expires'} ${new Date(
                          room.expiresAt,
                        ).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                    </span>
                  </span>
                  <Icon name="chevron-right" size={15} className={styles.chevron} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
