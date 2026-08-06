import { Icon } from '../ui/Icon';
import styles from './HelpPanel.module.css';

export function HelpPanel() {
  return (
    <div className={styles.panel}>
      <span className={styles.iconWrap}>
        <Icon name="headset" size={19} />
      </span>
      <div className={styles.body}>
        <div className={styles.title}>Need Help?</div>
        <p className={styles.desc}>Our art specialists are here to help you.</p>
        <a href="#" className={styles.link}>
          Chat with Specialist
          <Icon name="chevron-right" size={13} />
        </a>
      </div>
    </div>
  );
}
