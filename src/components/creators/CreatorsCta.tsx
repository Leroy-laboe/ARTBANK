import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import styles from './CreatorsCta.module.css';

export function CreatorsCta() {
  return (
    <section className={styles.bar}>
      {/* The container and the card used to be the same element, so the card's
          own 36px padding overrode the container's gutter and its edge landed
          wherever that left it. They are separate now: the wrapper places the
          band on the page grid, the card styles itself. container-wide, not
          container, because this closes the artists listing page and has to
          line up with the cards above it. */}
      <div className="container-wide">
        <div className={styles.row}>
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

          <Link to="/register" className={styles.applyBtn}>
            Apply as Creator
            <Icon name="arrow-right" size={15} />
          </Link>

          <img
            className={styles.decorImage}
            src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=140&fit=crop&auto=format&q=80"
            alt=""
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
