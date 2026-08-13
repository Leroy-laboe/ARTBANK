import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import heroBackground from '../../assets/images/hero_background.jpeg';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.textCol}>
          <p className={`eyebrow ${styles.eyebrow}`}>Documented. Discoverable. Opportunity-Ready.</p>
          <h1 className={styles.title}>Make Every Artwork Easier to Prove, Present and Earn From</h1>
          <p className={styles.lede}>
            Artbank helps artists document their work, build a trusted professional identity,
            discover opportunities and turn serious interest into earnings.
          </p>

          <div className={styles.ctaRow}>
            <Button variant="primary" icon={<Icon name="arrow-right" size={16} />}>
              Build my ArtSpace
            </Button>
            <Button variant="secondary" icon={<Icon name="search" size={16} />}>
              Source creative work
            </Button>
          </div>

          <ul className={styles.trustItems}>
            <li>
              <Icon name="shield-check" size={14} />
              Artist keeps ownership
            </li>
            <li>
              <Icon name="eye" size={14} />
              Identity-presenting enquiries
            </li>
            <li>
              <Icon name="lock" size={14} />
              Private performance data
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.pictureBlock}>
        <img src={heroBackground} alt="" className={styles.bgImage} />
        <div className={styles.bgScrim} />

        <div className={styles.badgeCard}>
          <span className={styles.verisRow}>
            <Icon name="shield-check" size={12} />
            VERIS VERIFIED
          </span>

          <div className={styles.badgeField}>
            <div className={styles.badgeLabel}>MRI Score</div>
            <div className={styles.badgeValue}>96.8</div>
            <div className={styles.badgeSub}>Top 1% Creator</div>
          </div>

          <div className={styles.badgeField}>
            <div className={styles.badgeLabel}>Country</div>
            <div className={styles.countryRow}>
              <span className={styles.flag} aria-hidden="true" />
              Malaysia
            </div>
          </div>

          <div className={styles.badgeField}>
            <div className={styles.badgeLabel}>Auction Ending</div>
            <div className={styles.badgeSub} style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
              02d 14h 32m
            </div>
          </div>

          <div className={styles.badgeField}>
            <div className={styles.badgeLabel}>Current Bid</div>
            <div className={styles.badgeValue} style={{ color: 'var(--gold-light)', fontSize: 18 }}>
              RM 8,500
            </div>
          </div>

          <button type="button" className={styles.badgeBtn}>
            View Artwork
            <Icon name="arrow-right" size={13} />
          </button>
        </div>
      </div>
    </section>
  );
}
