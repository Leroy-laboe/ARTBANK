import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { IntentDialog, type IntentMode } from '../components/buyer/IntentDialog';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { useSaveToggle } from '../lib/useSaveToggle';
import { getBuyerArtwork } from '../services/buyer';
import { flagUrl } from '../data/countries';
import { passportCopy, type BuyerArtworkDetail } from '../data/buyerContent';
import styles from './BuyerArtworkPage.module.css';

/** One artwork, as a buyer sees it.
 *
 *  Three actions, and all three are the same act underneath: Request
 *  Availability, Contact Artist and Request Viewing Room each open the Buyer
 *  Intent Card, because docs/pivot-checklist/20-feature-buyer-intent-card.md
 *  requires identity and stated intent before *any* of price, availability,
 *  licensing or private access. Saving is the one thing a buyer can do here
 *  without telling the artist anything.
 *
 *  What is deliberately absent from the About the Artist card: response rate,
 *  average response time, and any other service statistic. Spec 16 deletes
 *  public statistics, and neither figure can be computed honestly from this
 *  side — they would need to read other people's message threads, which RLS
 *  refuses. Member since and the size of the public body of work are real. */
export function BuyerArtworkPage() {
  const { id = '' } = useParams();
  const { profile } = useSession();

  const [artwork, setArtwork] = useState<BuyerArtworkDetail | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dialog, setDialog] = useState<IntentMode | null>(null);
  const [sent, setSent] = useState<{ message: string; conversationId: string | null } | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSent(null);
    getBuyerArtwork(id, profile).then((result) => {
      if (!active) return;
      setArtwork(result.artwork);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [id, profile]);

  const apply = useCallback((_id: string, saved: boolean) => {
    setArtwork((current) => (current ? { ...current, saved } : current));
  }, []);

  const { toggle, busyId, notice } = useSaveToggle(apply);

  if (loading) {
    return (
      <BuyerShell topbar={<BuyerTopbar />}>
        <p className={styles.state}>Loading…</p>
      </BuyerShell>
    );
  }

  if (!artwork) {
    return (
      <BuyerShell topbar={<BuyerTopbar />}>
        <div className={styles.state}>
          <h1 className={styles.stateTitle}>No artwork here</h1>
          <p className={styles.stateNote}>
            This record does not exist, or the artist has taken it out of public view.
          </p>
          <Link to="/collect" className={styles.stateLink}>
            Back to discover
          </Link>
        </div>
      </BuyerShell>
    );
  }

  const passport = passportCopy[artwork.passport];
  // A record uploaded on someone's behalf (the competition rows) has no
  // account behind it, so there is nobody for an enquiry to reach.
  const contactable = Boolean(artwork.artistId) && artwork.allowEnquiries && !isDemo;

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <Link to="/collect" className={styles.back}>
        <Icon name="arrow-right" size={14} className={styles.backIcon} />
        Back to discover
      </Link>

      {notice && (
        <p className={styles.notice} role="status">
          {notice}
        </p>
      )}

      {sent && (
        <p className={styles.sent} role="status">
          <Icon name="check-circle" size={15} />
          {sent.message}
          {sent.conversationId && (
            <Link to={`/collect/messages?c=${sent.conversationId}`} className={styles.sentLink}>
              Open the conversation
            </Link>
          )}
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
          <h1 className={styles.title}>{artwork.title}</h1>

          <p className={styles.by}>
            by{' '}
            {artwork.artistHandle ? (
              <Link to={`/artists/${artwork.artistHandle}`} className={styles.artistLink}>
                {artwork.artistName}
              </Link>
            ) : (
              <span className={styles.artistPlain}>{artwork.artistName}</span>
            )}
          </p>

          <p className={styles.medium}>{artwork.medium ?? 'Medium not stated'}</p>
          <p className={styles.dims}>
            {[artwork.dimensions, artwork.year === null ? null : String(artwork.year)]
              .filter(Boolean)
              .join('  •  ') || 'Dimensions not stated'}
          </p>

          <div className={styles.priceRow}>
            <span className={styles.price}>{artwork.priceLabel}</span>
            <span
              className={[
                styles.availability,
                artwork.availability === 'Available' && styles.availabilityOn,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {artwork.availability}
            </span>
          </div>

          {/* Evidence state, not a badge. "No passport yet" is said out loud
              rather than left as an absence the buyer has to notice. */}
          <div
            className={[styles.passport, artwork.passport === 'None' && styles.passportNone]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon
              name={artwork.passport === 'Verified' ? 'shield-check' : 'circle-dashed'}
              size={17}
              className={styles.passportIcon}
            />
            <span>
              <span className={styles.passportTitle}>{passport.title}</span>
              <span className={styles.passportNote}>{passport.note}</span>
            </span>
          </div>

          <button
            type="button"
            className={styles.save}
            disabled={busyId === artwork.id || isDemo}
            onClick={() => toggle(artwork)}
          >
            <Icon name={artwork.saved ? 'heart-filled' : 'heart'} size={16} />
            {artwork.saved ? 'Saved' : 'Save Artwork'}
          </button>

          <button
            type="button"
            className={styles.secondary}
            disabled={!contactable}
            onClick={() => setDialog('availability')}
          >
            <Icon name="calendar" size={16} />
            Request Availability
          </button>

          <button
            type="button"
            className={styles.secondary}
            disabled={!contactable}
            onClick={() => setDialog('contact')}
          >
            <Icon name="message" size={16} />
            Contact Artist
          </button>

          {!contactable && (
            <p className={styles.closed}>
              {isDemo
                ? 'This is a sample record, so there is no artist to reach.'
                : artwork.allowEnquiries
                  ? 'This record has no ArtBank account behind it, so it cannot take enquiries.'
                  : 'This artist is not taking enquiries right now.'}
            </p>
          )}
        </div>

        <aside className={styles.rail}>
          <section className={styles.card}>
            <p className={styles.cardTitle}>About the Artist</p>

            <div className={styles.artistRow}>
              {artwork.artistAvatarUrl ? (
                <img src={artwork.artistAvatarUrl} alt="" className={styles.avatar} />
              ) : (
                <span className={styles.avatarEmpty} aria-hidden="true">
                  <Icon name="user" size={18} />
                </span>
              )}
              <span className={styles.artistCopy}>
                <span className={styles.artistName}>{artwork.artistName}</span>
                {artwork.artistCountry && (
                  <span className={styles.artistCountry}>
                    {artwork.artistCountryCode && (
                      <img src={flagUrl(artwork.artistCountryCode)} alt="" className={styles.flag} />
                    )}
                    {artwork.artistCountry}
                  </span>
                )}
              </span>
            </div>

            {artwork.artistHandle ? (
              <Link to={`/artists/${artwork.artistHandle}`} className={styles.cardBtn}>
                View Artist Profile
              </Link>
            ) : (
              <p className={styles.cardNote}>This artist has not published a profile page yet.</p>
            )}

            <dl className={styles.facts}>
              {artwork.artistMemberSince && (
                <div className={styles.fact}>
                  <dt>Member Since</dt>
                  <dd>{artwork.artistMemberSince}</dd>
                </div>
              )}
              <div className={styles.fact}>
                <dt>Published Works</dt>
                <dd>{artwork.artistWorks}</dd>
              </div>
            </dl>
          </section>

          <section className={[styles.card, styles.roomCard].join(' ')}>
            <Icon name="lock" size={18} className={styles.roomIcon} />
            <p className={styles.roomTitle}>Need a private viewing?</p>
            <p className={styles.roomNote}>
              Ask the artist to open a private room. They choose what it shows and how long it
              stays open.
            </p>
            <button
              type="button"
              className={styles.roomBtn}
              disabled={!contactable}
              onClick={() => setDialog('viewing-room')}
            >
              Request Viewing Room
            </button>
          </section>
        </aside>

        <section className={styles.about}>
          <div className={styles.aboutCopy}>
            <h2 className={styles.aboutTitle}>About the Artwork</h2>
            <p className={styles.description}>
              {artwork.description ?? 'The artist has not written a description for this work.'}
            </p>

            {artwork.permittedUses.length > 0 && (
              <div className={styles.rights}>
                <p className={styles.rightsTitle}>Permitted uses</p>
                <ul className={styles.rightsList}>
                  {artwork.permittedUses.map((use) => (
                    <li key={use}>
                      <Icon name="check" size={13} />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {artwork.rightsNote && <p className={styles.rightsNote}>{artwork.rightsNote}</p>}

            {/* Permission-first: an empty permitted_uses array means nothing
                beyond showing the record is allowed, and saying so is the
                whole point of migration 0020's default. */}
            {artwork.permittedUses.length === 0 && (
              <p className={styles.rightsNote}>
                No reproduction or reuse is permitted beyond viewing this record. Ask the artist if
                you need more.
              </p>
            )}
          </div>

          <dl className={styles.specs}>
            {artwork.specs.map((spec) => (
              <div className={styles.spec} key={spec.label}>
                <dt>{spec.label}</dt>
                <dd>{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      {dialog && artwork.artistId && (
        <IntentDialog
          mode={dialog}
          artistId={artwork.artistId}
          artworkId={artwork.id}
          artworkTitle={artwork.title}
          artistName={artwork.artistName}
          onClose={() => setDialog(null)}
          onSent={(conversationId) => {
            setDialog(null);
            setSent({
              message:
                dialog === 'viewing-room'
                  ? 'Your viewing room request reached the artist.'
                  : 'Your enquiry reached the artist, with your name and what you asked for.',
              conversationId,
            });
          }}
        />
      )}
    </BuyerShell>
  );
}
