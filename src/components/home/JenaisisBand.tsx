import { Icon } from '../ui/Icon';
import { jenaisis } from '../../data/homeSections';
import styles from './JenaisisBand.module.css';

export function JenaisisBand() {
  return (
    <section className={styles.band}>
      {/* Edge furniture: the dark sphere cropped into the bottom left, the
          hairline that runs in from the edge to the monogram, and the stone
          face at the right. */}
      <span className={styles.orb} aria-hidden="true" />
      <span className={styles.lead} aria-hidden="true" />
      <span className={styles.stone} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.mark} aria-hidden="true">
          <span className={styles.markLetter}>J</span>
        </div>

        <div className={styles.copy}>
          <p className={styles.kicker}>
            <span className={styles.kickerName}>{jenaisis.eyebrow}</span>
            <span className={styles.kickerRule} />
            <span className={styles.kickerNote}>{jenaisis.kicker}</span>
          </p>

          <h2 className={styles.title}>
            {jenaisis.titleLead}
            <br />
            <span className={styles.titleAccent}>{jenaisis.titleAccent}</span>
          </h2>

          <p className={styles.desc}>{jenaisis.description}</p>

          <div className={styles.tags}>
            {jenaisis.tags.map((tag) => (
              <span className={styles.tag} key={tag.label}>
                <Icon name={tag.icon} size={16} />
                {tag.label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.rail}>
          <button type="button" className={styles.cta}>
            {jenaisis.cta}
            <Icon name="arrow-right" size={15} />
          </button>

          <p className={styles.railNote}>
            {jenaisis.ctaNote.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>

        {/* Its own column, set low and reading over the stone face. */}
        <ul className={styles.ladder}>
          {jenaisis.ladder.map((rung) => (
            <li key={rung}>{rung}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
