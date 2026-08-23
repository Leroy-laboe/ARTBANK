import { Icon } from '../ui/Icon';
import styles from './ArtworkImagePreview.module.css';

/** Placeholder for the images that arrive in step 2. It says plainly that
 *  nothing has been uploaded rather than showing a stock image an artist might
 *  mistake for their own. */
export function ArtworkImagePreview({ imageUrl }: { imageUrl?: string }) {
  return (
    <section className={styles.card}>
      <p className={styles.head}>
        <span className={styles.title}>Artwork Image Preview</span>
        <Icon name="info" size={14} className={styles.headIcon} />
      </p>

      {imageUrl ? (
        <img src={imageUrl} alt="" className={styles.image} />
      ) : (
        <div className={styles.empty}>
          <Icon name="upload" size={26} className={styles.icon} />
          <p className={styles.emptyTitle}>No image uploaded yet</p>
          <p className={styles.emptyNote}>Upload images in the next step</p>
        </div>
      )}

      {imageUrl ? (
        <p className={styles.footnote}>
          <Icon name="image" size={14} className={styles.footIcon} />
          This is how your cover image will appear on your public profile.
        </p>
      ) : (
        <p className={styles.footnote}>You’ll be able to crop and rearrange your images.</p>
      )}
    </section>
  );
}
