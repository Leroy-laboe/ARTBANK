import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { trustedBy, testimonialAvatars } from '../../data/homeContent';
import heroBackground from '../../assets/images/hero_background.jpeg';
import styles from './Hero.module.css';

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.textCol}>
          <p className={`eyebrow ${styles.eyebrow}`}>Verified. Ranked. Remembered.</p>
          <h1 className={styles.title}>The Global Creator Bank of Creative Value</h1>
          <p className={styles.lede}>
            ARTBANK connects visionary creators, collectors and institutions through verified
            identity, transparent rankings and a curated marketplace of exceptional works.
          </p>

          <div className={styles.ctaRow}>
            <Button variant="primary" icon={<Icon name="arrow-right" size={16} />}>
              Explore Marketplace
            </Button>
            <Button variant="secondary">Become a Creator</Button>
          </div>
        </div>

        <p className={styles.trustedLabel}>TRUSTED BY LEADING INSTITUTIONS WORLDWIDE</p>
        <div className={styles.trustRow}>
          {trustedBy.map((brand) => (
            <span key={brand.name} className={styles.logo}>
              {brand.icon && <Icon name={brand.icon} size={14} />}
              {brand.name}
            </span>
          ))}

          <div className={styles.collectorsPill}>
            <div className={styles.avatarStack}>
              {testimonialAvatars.slice(0, 4).map((gradient, i) => (
                <span key={i} style={{ background: gradient }} />
              ))}
            </div>
            <p className={styles.collectorsText}>
              <strong>500K+ Collectors</strong>
              <br />
              and Creators worldwide
            </p>
          </div>
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

        <div className={styles.watchIntro}>
          <span className={styles.playBtn} aria-hidden="true">
            <Icon name="play" size={14} />
          </span>
          <span>Watch introduction</span>
        </div>
      </div>
    </section>
  );
}
