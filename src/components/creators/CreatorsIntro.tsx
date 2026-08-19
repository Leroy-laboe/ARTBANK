import { Icon } from '../ui/Icon';
import { creatorsStats, creatorsCollage } from '../../data/creatorsContent';
import styles from './CreatorsIntro.module.css';

export function CreatorsIntro() {
  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <div className={styles.headline}>
          <h1 className={styles.title}>Artists</h1>
          <p className={styles.desc}>
            Discover visionary artists shaping culture. Verified. Represented. Remembered.
          </p>
        </div>

        <div className={styles.collage}>
          <img className={`${styles.photo} ${styles.photoBack}`} src={creatorsCollage[0].imageUrl} alt="" />
          <img className={`${styles.photo} ${styles.photoMain}`} src={creatorsCollage[1].imageUrl} alt="" />
          <img className={`${styles.photo} ${styles.photoFront}`} src={creatorsCollage[2].imageUrl} alt="" />

          <div className={styles.badge}>
            <span className={styles.badgeIcon}>
              <Icon name="check-circle" size={13} />
            </span>
            <div>
              <div className={styles.badgeValue}>1M+</div>
              <div className={styles.badgeLabel}>Verified Creators</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.searchBar}>
          <span className={styles.searchIconWrap}>
            <Icon name="search" size={15} />
          </span>
          <input type="text" placeholder="Search creators, styles, expertise..." />
        </div>
        <button type="button" className={styles.advancedBtn}>
          <Icon name="sliders" size={15} />
          Advanced Search
        </button>
      </div>

      <div className={styles.stats}>
        {creatorsStats.map((stat) => (
          <div className={styles.stat} key={stat.label}>
            <Icon name={stat.icon} size={18} />
            <div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
