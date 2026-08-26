import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import type { BuyerArtwork } from '../../data/buyerContent';
import styles from './BuyerArtworkCard.module.css';

/** One artwork in a buyer-side grid.
 *
 *  The corner button is the only thing that changes between screens: on
 *  Discover it saves (heart), on Saved Works it removes (×). Both write the
 *  same saved_artworks row — there is deliberately no "like", and no count of
 *  anything, per docs/pivot-checklist/17-do-not-build-guardrails.md. */
export function BuyerArtworkCard({
  artwork,
  onToggleSave,
  variant = 'save',
  action,
  busy = false,
}: {
  artwork: BuyerArtwork;
  /** Omitted (signed out, or a demo row), the corner button isn't rendered. */
  onToggleSave?: (artwork: BuyerArtwork) => void;
  variant?: 'save' | 'remove';
  /** Footer action, e.g. Saved Works' "Request Availability". */
  action?: { label: string; onClick: (artwork: BuyerArtwork) => void };
  busy?: boolean;
}) {
  const saved = artwork.saved;
  const cornerLabel =
    variant === 'remove'
      ? `Remove ${artwork.title} from saved works`
      : saved
        ? `Remove ${artwork.title} from saved works`
        : `Save ${artwork.title}`;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Link to={`/collect/artworks/${artwork.id}`} className={styles.imageLink}>
          {artwork.imageUrl ? (
            <img
              src={artwork.imageUrl}
              alt={artwork.title}
              className={styles.image}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className={styles.imageEmpty} aria-hidden="true">
              <Icon name="image" size={22} />
            </span>
          )}
        </Link>

        {onToggleSave && (
          <button
            type="button"
            className={[
              styles.corner,
              variant === 'remove' && styles.cornerRemove,
              variant === 'save' && saved && styles.cornerOn,
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={cornerLabel}
            aria-pressed={variant === 'save' ? saved : undefined}
            disabled={busy}
            onClick={() => onToggleSave(artwork)}
          >
            <Icon
              name={variant === 'remove' ? 'close' : saved ? 'heart-filled' : 'heart'}
              size={14}
            />
          </button>
        )}

        {/* Only stated when it is not the ordinary case — a chip on every card
            saying "Available" is noise, one saying "Sold" is information. */}
        {artwork.availability !== 'Available' && (
          <span className={styles.availability}>{artwork.availability}</span>
        )}
      </div>

      <div className={styles.body}>
        <Link to={`/collect/artworks/${artwork.id}`} className={styles.title}>
          {artwork.title}
        </Link>
        <p className={styles.artist}>{artwork.artistName}</p>

        <p className={styles.meta}>
          {[artwork.medium, artwork.dimensions].filter(Boolean).join(' · ') || '—'}
        </p>

        <p className={styles.price}>{artwork.priceLabel}</p>

        {action && (
          <button
            type="button"
            className={styles.action}
            onClick={() => action.onClick(artwork)}
          >
            {action.label}
          </button>
        )}
      </div>
    </article>
  );
}
