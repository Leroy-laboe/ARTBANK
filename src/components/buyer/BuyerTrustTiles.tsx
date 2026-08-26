import { Icon } from '../ui/Icon';
import { buyerTrustTiles } from '../../data/buyerContent';
import styles from './BuyerTrustTiles.module.css';

/** The four promises under the Discover masthead. Static copy — none of these
 *  is a statistic, which is the point: there is no number on this row to go
 *  stale or to need backing. */
export function BuyerTrustTiles() {
  return (
    <ul className={styles.tiles}>
      {buyerTrustTiles.map((tile) => (
        <li className={styles.tile} key={tile.title}>
          <span className={styles.iconWrap} aria-hidden="true">
            <Icon name={tile.icon} size={16} />
          </span>
          <span className={styles.copy}>
            <span className={styles.title}>{tile.title}</span>
            <span className={styles.note}>{tile.note}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
