import { Icon } from '../ui/Icon';
import { messageTip } from '../../data/artspaceMessages';
import styles from './MessageTipsPanel.module.css';

/** A single standing note rather than a list of tips — it exists to state the
 *  keep-contact-on-platform rule, which is a requirement of the brief and not
 *  merely advice.
 *
 *  It earns its place because the system enforces that rule silently: threads
 *  surface only organisation and country, never a personal email or phone
 *  (docs/pivot-checklist/15-messages.md). This is the only screen that says
 *  why, and without it the natural response to a withheld address is to ask
 *  for it in the thread — the exact thing the rule prevents.
 *
 *  The "Learn more" link is gone: it pointed at /artspace/help, which is a
 *  Coming Soon page. */
export function MessageTipsPanel() {
  return (
    <section className={styles.card}>
      <p className={styles.head}>
        <Icon name="info" size={16} className={styles.icon} />
        <span className={styles.title}>{messageTip.title}</span>
      </p>

      <p className={styles.body}>{messageTip.body}</p>
    </section>
  );
}
