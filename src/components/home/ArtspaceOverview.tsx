import { Icon } from '../ui/Icon';
import { artspaceActivity, artspaceNav, artspaceViewsBars } from '../../data/homeSections';
import styles from './ArtspaceOverview.module.css';

/** A static preview of the ArtSpace dashboard — presentation only, no live
 *  data behind it. Everything here reads from homeSections.ts. */
export function ArtspaceOverview() {
  return (
    <section className={styles.section}>
      <div className="container">
        <p className={`eyebrow ${styles.eyebrow}`}>Your ArtSpace overview</p>

        <div className={styles.head}>
          <h2 className={styles.title}>
            Your entire creative career,
            <br />
            made usable.
          </h2>
          <span className={styles.headLink}>
            Go to your ArtSpace
            <Icon name="arrow-right" size={14} />
          </span>
        </div>

        <div className={styles.mock} aria-hidden="true">
          <aside className={styles.sidebar}>
            <div className={styles.sidebarBrand}>ARTSPACE</div>
            {artspaceNav.map((item, i) => (
              <div
                className={[styles.navItem, i === 0 && styles.navItemActive].filter(Boolean).join(' ')}
                key={item.label}
              >
                <Icon name={item.icon} size={13} />
                {item.label}
              </div>
            ))}
            <div className={styles.sidebarBtn}>
              View Public Profile
              <Icon name="arrow-right" size={11} />
            </div>
          </aside>

          <div className={styles.panel}>
            <div className={styles.panelTop}>
              <span className={styles.greeting}>Good morning, Maya.</span>
              <span className={styles.addBtn}>
                <Icon name="plus" size={11} />
                Add New
              </span>
            </div>

            <div className={styles.cards}>
              <div className={styles.readiness}>
                <div className={styles.readinessLabel}>Portfolio Readiness</div>
                <div className={styles.readinessValue}>82%</div>
                <div className={styles.readinessNote}>You’re in great shape.</div>
                <div className={styles.readinessNote}>Two actions until buyer-ready.</div>
              </div>

              <div className={styles.chartCard}>
                <div className={styles.bars}>
                  {artspaceViewsBars.map((height, i) => (
                    <span className={styles.bar} style={{ height: `${height}%` }} key={i} />
                  ))}
                </div>
              </div>

              <div className={styles.viewsCard}>
                <div className={styles.viewsLabel}>Profile Views</div>
                <div className={styles.viewsValue}>1,246</div>
                <div className={styles.viewsDelta}>+18% this week</div>
              </div>
            </div>

            <div className={styles.activityHead}>
              <span>Recent Activity</span>
              <span className={styles.activityLink}>View all activity →</span>
            </div>

            <div className={styles.activityList}>
              {artspaceActivity.map((item) => (
                <div className={styles.activityRow} key={item.title}>
                  <img className={styles.activityThumb} src={item.imageUrl} alt="" loading="lazy" />
                  <div className={styles.activityCopy}>
                    <div className={styles.activityTitle}>{item.title}</div>
                    <div className={styles.activityDetail}>{item.detail}</div>
                  </div>
                  <span className={styles.activityTime}>{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
