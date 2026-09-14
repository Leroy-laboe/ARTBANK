import { adminHero } from '../../data/adminContent';
import styles from './AdminHeroBand.module.css';

/** The Overview screen's masthead — a quiet echo of the public site's forest
 *  bands (FeaturedArtistBand and friends), scaled down for a dashboard. */
export function AdminHeroBand() {
  return (
    <section className={styles.band} style={{ backgroundImage: `url(${adminHero.imageUrl})` }}>
      <div className={styles.scrim} />

      <div className={styles.copy}>
        <p className={styles.eyebrow}>{adminHero.eyebrow}</p>
        <h1 className={styles.title}>{adminHero.title}</h1>
        <p className={styles.desc}>{adminHero.description}</p>
      </div>

      <blockquote className={styles.quote}>“{adminHero.quote}”</blockquote>
    </section>
  );
}
