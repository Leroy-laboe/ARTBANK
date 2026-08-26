import { Icon } from '../ui/Icon';
import { discoverHero } from '../../data/buyerContent';
import styles from './DiscoverHero.module.css';

/** The masthead on Discover. The button scrolls to the grid below rather than
 *  navigating — the artworks it promises are already on this page. */
export function DiscoverHero({ onExplore }: { onExplore: () => void }) {
  return (
    <section className={styles.hero}>
      <div className={styles.copy}>
        <h1 className={styles.title}>
          {discoverHero.titleLead}
          <br />
          {discoverHero.titleRest}
          <span className={styles.accent}>{discoverHero.titleAccent}</span>
        </h1>
        <p className={styles.blurb}>{discoverHero.blurb}</p>
        <button type="button" className={styles.cta} onClick={onExplore}>
          {discoverHero.cta}
          <Icon name="arrow-down" size={15} />
        </button>
      </div>

      <div className={styles.art} aria-hidden="true">
        <img src={discoverHero.imageUrl} alt="" className={styles.image} />
      </div>
    </section>
  );
}
