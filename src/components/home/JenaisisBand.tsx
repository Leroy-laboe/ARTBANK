import { Icon } from '../ui/Icon';
import { jenaisis } from '../../data/homeSections';
import styles from './JenaisisBand.module.css';

export function JenaisisBand() {
  return (
    <section className={styles.band}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.mark} aria-hidden="true">
          <span className={styles.markLetter}>J</span>
        </div>

        <div className={styles.copy}>
          <p className={`eyebrow ${styles.eyebrow}`}>{jenaisis.eyebrow}</p>
          <h2 className={styles.title}>
            Not another chatbot.
            <br />
            A next-action guide for creative work.
          </h2>
          <p className={styles.desc}>{jenaisis.description}</p>

          <div className={styles.tags}>
            {jenaisis.tags.map((tag) => (
              <span className={styles.tag} key={tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <button type="button" className={styles.cta}>
          {jenaisis.cta}
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </section>
  );
}
