import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Icon } from '../components/ui/Icon';
import { IntentDialog, type IntentMode } from '../components/buyer/IntentDialog';
import { useSession } from '../lib/sessionContext';
import { getBuyerArtwork } from '../services/buyer';
import { logArtworkLinkVisit, presentYourself, sourceFromParam } from '../services/smartLink';
import { passportCopy, type BuyerArtworkDetail } from '../data/buyerContent';
import styles from './SmartArtworkLinkPage.module.css';

/** The Smart Artwork Link — docs/pivot-checklist/19-feature-smart-artwork-link-qr.md.
 *  "Artists can replace scattered Instagram DMs with one professional link."
 *  Deliberately outside RequireAuth: the entire point is that someone with no
 *  ArtBank account yet can open it from a bio link or a printed QR code.
 *
 *  What isn't here: a social-media preview card. See smartLink.ts for why —
 *  a client-only SPA can't serve per-route <head> tags to a crawler. */
export function SmartArtworkLinkPage() {
  const { id = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { profile } = useSession();

  const [artwork, setArtwork] = useState<BuyerArtworkDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<IntentMode | null>(null);
  const [sent, setSent] = useState<string | null>(null);
  const [presented, setPresented] = useState(false);
  const [presenting, setPresenting] = useState(false);

  const source = sourceFromParam(searchParams.get('src'));
  const loggedRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getBuyerArtwork(id, profile).then((result) => {
      if (!active) return;
      // A public link has no honest use for demo content standing in for a
      // record that couldn't be read — that would show a real visitor a
      // fictional artwork as if it were the one they were sent to see.
      setArtwork(result.isDemo ? null : result.artwork);
      setLoading(false);

      if (!result.isDemo && result.artwork && !loggedRef.current) {
        loggedRef.current = true;
        logArtworkLinkVisit(id, source, profile);
      }
    });

    return () => {
      active = false;
    };
    // profile is read once the visit is logged, not re-logged on every
    // session change — loggedRef, not the dependency array, guards that.
  }, [id]);

  async function handlePresentYourself() {
    if (!profile) return;
    setPresenting(true);
    try {
      await presentYourself(id, profile);
      setPresented(true);
    } catch {
      // Quiet failure: this is the lightest action on the page and there is
      // nothing useful to ask the visitor to retry.
    } finally {
      setPresenting(false);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>Loading…</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!artwork) {
    return (
      <>
        <Header />
        <main>
          <div className={`container ${styles.state}`}>
            <Icon name="image" size={26} className={styles.stateIcon} />
            <p className={styles.stateTitle}>This artwork isn’t available</p>
            <p className={styles.stateNote}>
              The link may be out of date, or the artist has taken this record out of public view.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const passport = passportCopy[artwork.passport];
  const contactable = Boolean(artwork.artistId) && artwork.allowEnquiries;
  const next = `/a/${id}${source !== 'direct' ? `?src=${source}` : ''}`;

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.wrap}`}>
          {sent && (
            <p className={styles.sent} role="status">
              <Icon name="check-circle" size={15} />
              {sent}
            </p>
          )}

          <div className={styles.layout}>
            <div className={styles.imageCol}>
              {artwork.imageUrl ? (
                <img src={artwork.imageUrl} alt={artwork.title} className={styles.image} />
              ) : (
                <div className={styles.imageEmpty} aria-hidden="true">
                  <Icon name="image" size={28} />
                </div>
              )}
            </div>

            <div className={styles.infoCol}>
              <p className="eyebrow">Artwork Record</p>
              <h1 className={styles.title}>{artwork.title}</h1>

              <p className={styles.by}>
                by{' '}
                {artwork.artistHandle ? (
                  <Link to={`/artists/${artwork.artistHandle}`}>{artwork.artistName}</Link>
                ) : (
                  <span>{artwork.artistName}</span>
                )}
              </p>

              <p className={styles.meta}>
                {[artwork.medium, artwork.dimensions, artwork.year ? String(artwork.year) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </p>

              <div className={styles.priceRow}>
                <span className={styles.price}>{artwork.priceLabel}</span>
                <span className={styles.availability}>{artwork.availability}</span>
              </div>

              <div className={styles.passport}>
                <Icon
                  name={artwork.passport === 'Verified' ? 'shield-check' : 'circle-dashed'}
                  size={16}
                />
                <span>
                  <span className={styles.passportTitle}>{passport.title}</span>
                  <span className={styles.passportNote}>{passport.note}</span>
                </span>
              </div>

              {artwork.description && <p className={styles.description}>{artwork.description}</p>}

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.primaryAction}
                  disabled={!contactable}
                  onClick={() => setDialog('contact')}
                >
                  <Icon name="message" size={15} />
                  Contact Artist
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  disabled={!contactable}
                  onClick={() => setDialog('availability')}
                >
                  <Icon name="calendar" size={15} />
                  Request Availability
                </button>
                <button
                  type="button"
                  className={styles.secondaryAction}
                  disabled={!contactable}
                  onClick={() => setDialog('viewing-room')}
                >
                  <Icon name="lock" size={15} />
                  Request Private Viewing
                </button>

                {profile ? (
                  <button
                    type="button"
                    className={styles.ghostAction}
                    disabled={presented || presenting}
                    onClick={handlePresentYourself}
                  >
                    <Icon name={presented ? 'check-circle' : 'user'} size={15} />
                    {presented ? 'You’ve presented yourself' : 'Present Yourself to Artist'}
                  </button>
                ) : (
                  <Link to={`/login?next=${encodeURIComponent(next)}`} className={styles.ghostAction}>
                    <Icon name="user" size={15} />
                    Present Yourself to Artist
                  </Link>
                )}
              </div>

              {!contactable && (
                <p className={styles.closed}>
                  {artwork.allowEnquiries
                    ? 'This record has no ArtBank account behind it, so it cannot take enquiries.'
                    : 'This artist is not taking enquiries right now.'}
                </p>
              )}

              <p className={styles.identityNote}>
                Contacting the artist, requesting availability or a viewing all ask who you are
                first — nothing here reaches them anonymously.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {dialog && artwork.artistId && (
        <IntentDialog
          mode={dialog}
          artistId={artwork.artistId}
          artworkId={artwork.id}
          artworkTitle={artwork.title}
          artistName={artwork.artistName}
          onClose={() => setDialog(null)}
          onSent={() => {
            setDialog(null);
            setSent(
              dialog === 'viewing-room'
                ? 'Your viewing room request reached the artist.'
                : 'Your message reached the artist, with your name and what you asked for.',
            );
          }}
        />
      )}
    </>
  );
}
