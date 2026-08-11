import { Icon } from '../ui/Icon';
import { curatedPicks } from '../../data/marketplaceContent';
import styles from './CuratedPanel.module.css';

export function CuratedPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Curated Collections</span>
        <a href="#" className={styles.viewAll}>
          View all
        </a>
      </div>

      <ul className={styles.list}>
        {curatedPicks.map((pick) => (
          <li className={styles.item} key={pick.title}>
            <img src={pick.imageUrl} alt="" className={styles.thumb} loading="lazy" decoding="async" />
            <div className={styles.info}>
              <div className={styles.name}>{pick.title}</div>
              <div className={styles.count}>{pick.count}</div>
            </div>
            <Icon name="chevron-right" size={15} className={styles.chevron} />
          </li>
        ))}
      </ul>
    </div>
  );
}
