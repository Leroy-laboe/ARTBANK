import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { messageTip } from '../../data/artspaceMessages';
import styles from './MessageTipsPanel.module.css';

/** A single standing note rather than a list of tips — it exists to state the
 *  keep-contact-on-platform rule, which is a requirement of the brief and not
 *  merely advice. */
export function MessageTipsPanel() {
  return (
    <section className={styles.card}>
      <p className={styles.head}>
        <Icon name="info" size={16} className={styles.icon} />
        <span className={styles.title}>{messageTip.title}</span>
      </p>

      <p className={styles.body}>{messageTip.body}</p>

      <Link to="/artspace/help" className={styles.link}>
        {messageTip.linkLabel}
        <Icon name="arrow-right" size={13} />
      </Link>
    </section>
  );
}
