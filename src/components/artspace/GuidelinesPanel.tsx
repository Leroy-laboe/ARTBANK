import { Icon } from '../ui/Icon';
import { guidelines } from '../../data/artspaceAddArtwork';
import styles from './GuidelinesPanel.module.css';

/** What makes a good record. Advice only — none of it gates the form, and
 *  none of it is filled in for the artist. */
export function GuidelinesPanel() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Guidelines</h2>

      <ul className={styles.list}>
        {guidelines.map((item) => (
          <li className={styles.row} key={item.id}>
            <span className={styles.icon}>
              <Icon name={item.icon} size={15} />
            </span>
            <div className={styles.copy}>
              <p className={styles.rowTitle}>{item.title}</p>
              <p className={styles.detail}>{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
