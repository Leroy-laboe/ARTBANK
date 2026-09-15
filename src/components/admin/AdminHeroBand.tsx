import { adminHero } from '../../data/adminContent';
import styles from './AdminHeroBand.module.css';

/** The Overview screen's masthead — a light gold-toned card, matching the
 *  rest of the admin portal's chrome (and ArtSpace's own photo-free
 *  dashboard) rather than the public site's dark forest bands. */
export function AdminHeroBand() {
  return (
    <section className={styles.band}>
      <div className={styles.copy}>
        <p className={styles.eyebrow}>{adminHero.eyebrow}</p>
        <h1 className={styles.title}>{adminHero.title}</h1>
        <p className={styles.desc}>{adminHero.description}</p>
      </div>

      <blockquote className={styles.quote}>“{adminHero.quote}”</blockquote>
    </section>
  );
}
