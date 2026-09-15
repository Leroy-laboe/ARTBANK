import { Icon } from '../ui/Icon';
import { creatorsCollage } from '../../data/creatorsContent';
import styles from './CreatorsIntro.module.css';

export function CreatorsIntro() {
  return (
    <div className={styles.wrap}>
      <div className={styles.topRow}>
        <div className={styles.headline}>
          <h1 className={styles.title}>Artists</h1>
          {/* Was "Verified. Represented. Remembered." over a "Verified
              Creators" badge — a verification claim the page can't back: the
              people in the collage are stock photographs, and most profiles
              below are examples. */}
          <p className={styles.desc}>
            Discover artists on ARTBANK and the work they are building a professional record for.
          </p>
        </div>

        <div className={styles.collage} aria-hidden="true">
          <img className={`${styles.photo} ${styles.photoBack}`} src={creatorsCollage[0].imageUrl} alt="" />
          <img className={`${styles.photo} ${styles.photoMain}`} src={creatorsCollage[1].imageUrl} alt="" />
          <img className={`${styles.photo} ${styles.photoFront}`} src={creatorsCollage[2].imageUrl} alt="" />

          <div className={styles.badge}>
            <span className={styles.badgeIcon}>
              <Icon name="users" size={13} />
            </span>
            <div className={styles.badgeLabel}>Artist profiles</div>
          </div>
        </div>
      </div>

      {/* The search bar and "Advanced Search" button that sat here were not
          wired to anything. The working search is in the filter sidebar. */}
    </div>
  );
}
