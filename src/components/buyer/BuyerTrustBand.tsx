import { Icon } from '../ui/Icon';
import { buyerTrustBand } from '../../data/buyerContent';
import styles from './BuyerTrustBand.module.css';

/** The dark band that closes Discover. Four statements about how this place
 *  works — deliberately the negative space of a marketplace: no likes, no
 *  spam, no anonymous browsing dressed up as engagement. */
export function BuyerTrustBand() {
  return (
    <section className={styles.band}>
      <ul className={styles.items}>
        {buyerTrustBand.map((item) => (
          <li className={styles.item} key={item.title}>
            <Icon name={item.icon} size={19} className={styles.icon} />
            <span className={styles.copy}>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.note}>{item.note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
