import { Link } from 'react-router-dom';
import { joinStandard } from '../../data/homeSections';
import styles from './JoinStandard.module.css';

export function JoinStandard() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.inner}`}>
        <p className={`eyebrow ${styles.eyebrow}`}>{joinStandard.eyebrow}</p>

        <h2 className={styles.title}>
          {joinStandard.lines.map((line) => (
            <span className={styles.line} key={line}>
              {line}
            </span>
          ))}
        </h2>

        <p className={styles.desc}>{joinStandard.description}</p>

        <div className={styles.ctaRow}>
          <Link to="/register" className={styles.primary}>
            Create Your ArtBank ID
          </Link>
          <Link to="/for-buyers" className={styles.secondary}>
            I’m a buyer / institution
          </Link>
        </div>
      </div>
    </section>
  );
}
