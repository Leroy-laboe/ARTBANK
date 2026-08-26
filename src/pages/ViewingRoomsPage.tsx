import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { listViewingRoomRequests, type ViewingRoomRequest } from '../services/buyer';
import { viewingRoomsIntro } from '../data/buyerContent';
import styles from './ViewingRoomsPage.module.css';

/** Viewing Rooms — the buyer's half of
 *  docs/pivot-checklist/21-feature-private-viewing-room.md.
 *
 *  A room is created by the artist: they choose the works, whether prices
 *  show, whether files can be downloaded, and when access expires. None of
 *  that exists on this side and none of it is invented here — what a buyer
 *  can honestly see today is which rooms they have asked for. Every row says
 *  "Requested" until the artist-side builder exists to change it. */
export function ViewingRoomsPage() {
  const { profile } = useSession();
  const [requests, setRequests] = useState<ViewingRoomRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listViewingRoomRequests(profile).then((rows) => {
      if (!active) return;
      setRequests(rows);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader title={viewingRoomsIntro.title} subtitle={viewingRoomsIntro.subtitle} />

      {loading ? (
        <p className={styles.state}>Loading…</p>
      ) : requests.length === 0 ? (
        <div className={styles.empty}>
          <Icon name="lock" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No viewing rooms yet</p>
          <p className={styles.emptyNote}>{viewingRoomsIntro.empty}</p>
          <Link to="/collect" className={styles.emptyLink}>
            Browse artworks
          </Link>
        </div>
      ) : (
        <>
          <p className={styles.note}>
            <Icon name="info" size={14} />
            The artist decides what a room contains and how long it stays open. You will be told
            when one is ready.
          </p>

          <ul className={styles.list}>
            {requests.map((request) => (
              <li className={styles.row} key={request.id}>
                <Icon name="lock" size={17} className={styles.rowIcon} />
                <span className={styles.copy}>
                  <span className={styles.title}>{request.artwork}</span>
                  <span className={styles.meta}>
                    {request.artistName} · requested {request.requestedOn}
                  </span>
                </span>
                <span className={styles.status}>{request.state}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </BuyerShell>
  );
}
