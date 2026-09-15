import { adminQuote } from '../../data/adminContent';
import styles from './AdminQuoteBand.module.css';

/** A quiet echo of the rail's decorative bands elsewhere in ArtSpace — the
 *  admin portal's own version of the brand line. Light card with a gold
 *  accent, matching the same quote treatment used on the public For Buyers
 *  page, rather than a dark photo band. */
export function AdminQuoteBand() {
  return (
    <section className={styles.card}>
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
