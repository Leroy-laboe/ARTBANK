import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { useSession } from '../../lib/sessionContext';
import type { BuyerArtwork } from '../../data/buyerContent';
import styles from './ForBuyersArtworkCard.module.css';

/** One artwork on the public For Buyers grid. Differs from the private
 *  Discover screen's BuyerArtworkCard in the footer: a priced work gets
 *  "View Details", an unpriced one with a real account behind it gets
 *  "Contact Artist" — both computed from priceLabel/artistId rather than a
 *  listing type that doesn't exist in the schema (there is no "Buy Now" vs
 *  "Auction" distinction). A record with no artistId (a competition entry
 *  uploaded on someone's behalf, still awaiting their own account) gets
 *  "View Artwork" instead — BuyerArtworkPage can't take an enquiry for one
 *  of these yet, so the card shouldn't promise it can. */
export function ForBuyersArtworkCard({
  artwork,
  onToggleSave,
  busy = false,
}: {
  artwork: BuyerArtwork;
  onToggleSave?: (artwork: BuyerArtwork) => void;
  busy?: boolean;
}) {
  const hasPrice = artwork.priceLabel !== 'Price on request';
  const actionLabel = hasPrice ? 'View Details' : artwork.artistId ? 'Contact Artist' : 'View Artwork';
  // /collect/artworks/:id is behind sign-in, so on this public page it sent
  // every signed-out visitor straight to a login wall. They get the public
  // Smart Artwork Link page for the same work instead.
  const { isAuthenticated } = useSession();
  const detailHref = isAuthenticated ? `/collect/artworks/${artwork.id}` : `/a/${artwork.id}`;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={detailHref} className={styles.imageLink}>
          {artwork.imageUrl ? (
            <img src={artwork.imageUrl} alt={artwork.title} className={styles.image} loading="lazy" decoding="async" />
          ) : (
            <span className={styles.imageEmpty} aria-hidden="true">
              <Icon name="image" size={22} />
            </span>
          )}
        </Link>

        {onToggleSave && (
          <button
            type="button"
            className={[styles.corner, artwork.saved && styles.cornerOn].filter(Boolean).join(' ')}
            aria-label={artwork.saved ? `Remove ${artwork.title} from saved works` : `Save ${artwork.title}`}
            aria-pressed={artwork.saved}
            disabled={busy}
            onClick={() => onToggleSave(artwork)}
          >
            <Icon name={artwork.saved ? 'heart-filled' : 'heart'} size={14} />
          </button>
        )}

        {artwork.availability !== 'Available' && (
          <span className={styles.availability}>{artwork.availability}</span>
        )}
      </div>

      <div className={styles.body}>
        <Link to={detailHref} className={styles.title}>
          {artwork.title}
        </Link>
        {artwork.artistHandle ? (
          <Link to={`/artists/${artwork.artistHandle}`} className={styles.artistLink}>
            {artwork.artistName}
          </Link>
        ) : (
          <p className={styles.artist}>{artwork.artistName}</p>
        )}

        <p className={styles.meta}>
          {[artwork.medium, artwork.dimensions].filter(Boolean).join(' · ') || '—'}
        </p>

        <p className={hasPrice ? styles.price : styles.priceMuted}>{artwork.priceLabel}</p>

        <Link to={detailHref} className={styles.action}>
          {actionLabel}
          <Icon name="arrow-right" size={13} />
        </Link>
      </div>
    </article>
  );
}
