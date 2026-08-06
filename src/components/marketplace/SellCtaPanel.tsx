import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import styles from './SellCtaPanel.module.css';

export function SellCtaPanel() {
  return (
    <div className={styles.panel}>
      <span className={styles.iconWrap}>
        <Icon name="brush" size={20} />
      </span>
      <div className={styles.title}>Sell Your Art</div>
      <p className={styles.desc}>
        Join thousands of creators and showcase your art to collectors worldwide.
      </p>
      <Button variant="primary" to="/creators" className={styles.btn}>
        Apply as Creator
      </Button>
    </div>
  );
}
