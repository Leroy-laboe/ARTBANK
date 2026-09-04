import { Icon } from './Icon';
import styles from './WorkspaceComingSoon.module.css';

/** Drop-in "not built yet" placeholder for a route inside the ArtSpace or
 *  buyer workspace. Unlike ComingSoonPage — which brings the public site's
 *  Header/Footer with it — this renders as a quiet card inside whichever
 *  shell already wraps it, so a workspace link that isn't live yet never
 *  makes it look like the click dropped you back on the marketing site. */
export function WorkspaceComingSoon({ title }: { title: string }) {
  return (
    <div className={styles.card}>
      <Icon name="clock" size={22} className={styles.icon} />
      <p className={styles.title}>{title} is on its way</p>
      <p className={styles.note}>
        We&rsquo;re still building this. The rest of your workspace works as normal.
      </p>
    </div>
  );
}
