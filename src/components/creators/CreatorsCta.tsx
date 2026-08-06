import { Icon } from '../ui/Icon';
import styles from './CreatorsCta.module.css';

export function CreatorsCta() {
  return (
    <section className={styles.bar}>
      <div className={`container ${styles.row}`}>
        <div className={styles.left}>
          <span className={styles.iconWrap}>
            <Icon name="award" size={22} />
          </span>
          <div>
            <div className={styles.title}>Are you a creator?</div>
            <p className={styles.desc}>
              Join ARTBANK to showcase your work, get verified, and be part of the global creative
              legacy.
            </p>
          </div>
        </div>

        <button type="button" className={styles.applyBtn}>
          Apply as Creator
          <Icon name="arrow-right" size={15} />
        </button>

        <img
          className={styles.decorImage}
          src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=140&fit=crop&auto=format&q=80"
          alt=""
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
