import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { adminGlanceRanges, adminGlanceStats } from '../../data/adminContent';
import styles from './AdminPlatformGlance.module.css';

/** Platform-wide totals, distinct from the queue above it — this panel is
 *  read-only context ("how is ArtBank doing"), not another thing to action. */
export function AdminPlatformGlance() {
  const [range, setRange] = useState(adminGlanceRanges[0]);

  return (
    <section className={styles.panel}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Platform at a Glance</h2>
          <p className={styles.subtitle}>Growth and activity across ArtBank.</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Date range">
          {adminGlanceRanges.map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={option === range}
              className={[styles.tab, option === range && styles.tabActive].filter(Boolean).join(' ')}
              onClick={() => setRange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.stats}>
        {adminGlanceStats.map((stat) => (
          <div key={stat.id} className={styles.stat}>
            <span className={styles.iconWrap}>
              <Icon name={stat.icon} size={18} />
            </span>
            <div>
              <p className={styles.value}>{stat.value}</p>
              <p className={styles.label}>{stat.label}</p>
              <p className={styles.change}>
                <Icon name="trend-up" size={11} />
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
