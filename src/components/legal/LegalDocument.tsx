import type { LegalDoc } from '../../data/legalContent';
import styles from './LegalDocument.module.css';

/** Shared reading layout for Terms/Privacy/Cookies — same title-block +
 *  numbered-sections shape for all three, driven entirely by data so the
 *  three pages stay visually identical without repeating markup. */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <div className={styles.wrap}>
      <p className={`eyebrow ${styles.eyebrow}`}>Legal</p>
      <h1 className={styles.title}>{doc.title}</h1>
      <p className={styles.updated}>{doc.updated}</p>
      <p className={styles.intro}>{doc.intro}</p>

      {doc.sections.map((section) => (
        <section className={styles.section} key={section.heading}>
          <h2 className={styles.heading}>{section.heading}</h2>
          {section.body.map((paragraph, i) => (
            <p className={styles.paragraph} key={i}>
              {paragraph}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}
