import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { IntentDialog, type IntentMode } from '../components/buyer/IntentDialog';
import { useSession } from '../lib/sessionContext';
import {
  openViewingRoom,
  ViewingRoomAccessError,
  type PublicViewingRoom,
  type ViewingRoomAccessCode,
} from '../services/viewingRooms';
import styles from './PublicViewingRoomPage.module.css';

const errorCopy: Record<ViewingRoomAccessCode, { title: string; note: string }> = {
  not_found: {
    title: 'This link doesn’t open a room',
    note: 'It may have been removed, or the address is incomplete.',
  },
  expired: {
    title: 'This room is no longer open',
    note: 'The artist set an expiry date on this link and it has passed.',
  },
  identity_required: {
    title: 'Sign in to view this room',
    note: 'The artist has asked that anyone viewing this be identified first.',
  },
  unavailable: {
    title: 'This room can’t be opened right now',
    note: 'Please try again in a moment.',
  },
};

/** The buyer's half of a private viewing room — reached only by the exact
 *  link the artist shared, never by browsing. docs/pivot-checklist/
 *  21-feature-private-viewing-room.md: "a private, curated presentation
 *  instead of public browsing." Deliberately outside RequireAuth: a room
 *  that doesn't require identity has to be openable while signed out. */
export function PublicViewingRoomPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useSession();

  const [room, setRoom] = useState<PublicViewingRoom | null>(null);
  const [errorCode, setErrorCode] = useState<ViewingRoomAccessCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<IntentMode | null>(null);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!id) return;
    setLoading(true);

    openViewingRoom(id)
      .then((r) => {
        if (!active) return;
        setRoom(r);
        setErrorCode(null);
      })
      .catch((err) => {
        if (!active) return;
        setErrorCode(err instanceof ViewingRoomAccessError ? err.code : 'unavailable');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
    // Re-opens once a signed-out visitor completes sign-in, in case that's
    // exactly what an `identity_required` refusal was waiting on.
  }, [id, profile]);

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>Opening room…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (errorCode) {
    const copy = errorCopy[errorCode];
    const next = `/rooms/${id}`;

    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>
            <Icon name="lock" size={26} className={styles.stateIcon} />
            <p className={styles.stateTitle}>{copy.title}</p>
            <p className={styles.stateNote}>{copy.note}</p>
            {errorCode === 'identity_required' && (
              <div className={styles.stateActions}>
                <Link to={`/login?next=${encodeURIComponent(next)}`} className={styles.stateButton}>
                  Sign In
                </Link>
                <Link to={`/register?next=${encodeURIComponent(next)}`} className={styles.stateLink}>
                  Create an account
                </Link>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!room) return null;

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.wrap}`}>
          <p className="eyebrow">Private Viewing Room</p>
          <h1 className={styles.title}>{room.title}</h1>
          <p className={styles.byline}>
            Curated by{' '}
            {room.artistHandle ? (
              <Link to={`/artists/${room.artistHandle}`}>{room.artistName}</Link>
            ) : (
              room.artistName
            )}
          </p>

          {room.privateNotes && <p className={styles.notes}>{room.privateNotes}</p>}

          {sent && (
            <p className={styles.notice} role="status">
              {sent}
            </p>
          )}

          <div className={styles.grid}>
            {room.artworks.map((artwork) => (
              <article className={styles.card} key={artwork.id}>
                <div
                  className={styles.imageWrap}
                  style={!artwork.imageUrl ? { background: 'var(--surface)' } : undefined}
                >
                  {artwork.imageUrl && <img src={artwork.imageUrl} alt={artwork.title} loading="lazy" />}
                </div>
                <div className={styles.cardBody}>
                  <p className={styles.cardTitle}>{artwork.title}</p>
                  <p className={styles.cardMeta}>
                    {[artwork.medium, artwork.dimensions, artwork.year].filter(Boolean).join(' · ')}
                  </p>
                  <p className={styles.cardPrice}>{artwork.priceLabel}</p>
                  <p className={styles.cardAvailability}>{artwork.availability}</p>
                  {room.downloadAllowed && artwork.imageUrl && (
                    <a
                      href={artwork.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.download}
                    >
                      <Icon name="download" size={13} />
                      Open full image
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className={styles.actions}>
            {profile ? (
              <>
                <button type="button" className={styles.primaryAction} onClick={() => setDialog('contact')}>
                  Contact Artist
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  onClick={() => setDialog('availability')}
                >
                  Request Discussion
                </button>
              </>
            ) : (
              <p className={styles.signInNote}>
                <Link to={`/login?next=${encodeURIComponent(`/rooms/${id}`)}`}>Sign in</Link> to
                contact the artist about this room.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />

      {dialog && (
        <IntentDialog
          mode={dialog}
          artistId={room.artistId}
          artworkId={null}
          artworkTitle={room.title}
          artistName={room.artistName}
          onClose={() => setDialog(null)}
          onSent={() => {
            setDialog(null);
            setSent('Your message reached the artist, with your name and what you asked for.');
          }}
        />
      )}
    </>
  );
}
