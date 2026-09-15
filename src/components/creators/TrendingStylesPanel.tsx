import { trendingStyles } from '../../data/creatorsContent';
import styles from './TrendingStylesPanel.module.css';

/** Styles artists on the platform work in.
 *
 *  This used to show a count beside each style (Contemporary 2,540, Abstract
 *  2,130…) and a "View all" link to href="#". The counts were invented — no
 *  query produces them — and 17-do-not-build-guardrails.md rules out fake
 *  statistics anywhere on the site. The labels stay; the numbers and the dead
 *  link don't. */
export function TrendingStylesPanel() {
  return (
    <div className={styles.panel}>
      <div className={styles.headRow}>
        <span className={styles.title}>Styles</span>
      </div>

      <div className={styles.grid}>
        {trendingStyles.map((style) => (
          <div className={styles.tag} key={style.label}>
            <span className={styles.tagLabel}>{style.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
