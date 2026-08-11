import { risingStars } from '../../data/mriRankingsContent';
import styles from './RisingStarsPanel.module.css';

export function RisingStarsPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Rising Stars</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <ul className={styles.list}>
        {risingStars.map((star) => (
          <li className={styles.item} key={star.name}>
            <img
              src={star.imageUrl}
              alt={star.name}
              className={styles.thumb}
              loading="lazy"
              decoding="async"
            />
            <div className={styles.info}>
              <div className={styles.name}>{star.name}</div>
              <div className={styles.score}>MRI {star.mriScore}</div>
            </div>
            <span className={styles.change}>↑ {star.changePct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
