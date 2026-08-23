import { formatDimensions, type ArtworkDraft } from './artworkDraft';
import styles from './ListingPreviewPanel.module.css';

/** How the listing will read to a buyer, built from what's been entered so
 *  far. Fields the artist hasn't filled in stay blank rather than being
 *  guessed at. */
export function ListingPreviewPanel({
  draft,
  imageUrl,
}: {
  draft: ArtworkDraft;
  imageUrl?: string;
}) {
  const meta = [draft.medium, formatDimensions(draft)].filter(Boolean).join(' • ');

  const priceText =
    draft.priceType === 'on_request'
      ? 'Price on request'
      : draft.price
        ? draft.priceType === 'range' && draft.priceMax
          ? `${draft.currency} ${draft.price} – ${draft.priceMax}`
          : `${draft.currency} ${draft.price}`
        : null;

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Listing Preview</h2>

      {imageUrl ? (
        <img src={imageUrl} alt="" className={styles.image} />
      ) : (
        <div className={styles.placeholder}>No cover image yet</div>
      )}

      <p className={styles.name}>{draft.title || 'Untitled'}</p>
      {meta && <p className={styles.meta}>{meta}</p>}

      {priceText && (
        <p className={styles.price}>
          {priceText}
          {draft.compareAtPrice && draft.priceType !== 'on_request' && (
            <span className={styles.compare}>
              {draft.currency} {draft.compareAtPrice}
            </span>
          )}
        </p>
      )}
    </section>
  );
}
