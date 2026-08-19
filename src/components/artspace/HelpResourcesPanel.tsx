import { Icon } from '../ui/Icon';
import { helpResources } from '../../data/artspaceContent';
import styles from './HelpResourcesPanel.module.css';

/** Guides and support. Rows marked `external` open documentation off-app, so
 *  they get the outbound glyph on the right. */
export function HelpResourcesPanel() {
  return (
    <section className={styles.card}>
      <h2 className={styles.title}>Help &amp; Resources</h2>

      <ul className={styles.list}>
        {helpResources.map((item) => (
          <li key={item.id}>
            <button type="button" className={styles.row}>
              <Icon name={item.icon} size={17} className={styles.icon} />
              <span className={styles.label}>{item.label}</span>
              {item.external && <Icon name="external-link" size={14} className={styles.caret} />}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
