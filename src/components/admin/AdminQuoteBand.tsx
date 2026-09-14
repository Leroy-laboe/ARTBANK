import { adminQuote } from '../../data/adminContent';
import styles from './AdminQuoteBand.module.css';

/** A quiet echo of the rail's decorative bands elsewhere in ArtSpace — the
 *  admin portal's own version of the brand line, not a functional module. */
export function AdminQuoteBand() {
  return (
    <section className={styles.card} style={{ backgroundImage: `url(${adminQuote.imageUrl})` }}>
      <div className={styles.scrim} />
      <blockquote className={styles.quote}>
        {adminQuote.lines.map((line) => (
          <span className={styles.line} key={line}>
            {line}
          </span>
        ))}
      </blockquote>
    </section>
  );
}
