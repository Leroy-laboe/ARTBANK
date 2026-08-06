import { Icon } from '../ui/Icon';
import { marketplaceStats } from '../../data/marketplaceContent';
import styles from './MarketplaceIntro.module.css';

export function MarketplaceIntro() {
  return (
    <div className={styles.wrap}>
      <p className="eyebrow">Artcade</p>
      <h1 className={styles.title}>Marketplace</h1>
      <p className={styles.desc}>
        Discover original artworks and rare pieces from verified creators worldwide. Invest in
        creativity. Own a legacy.
      </p>

      <div className={styles.stats}>
        {marketplaceStats.map((stat) => (
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
