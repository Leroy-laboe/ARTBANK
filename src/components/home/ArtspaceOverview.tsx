import { Icon } from '../ui/Icon';
import {
  artspaceActionPlan,
  artspaceActivity,
  artspaceDecisions,
  artspaceDemoUser,
  artspaceFeatures,
  artspaceNavGroups,
  artspaceReadiness,
  artspaceStats,
} from '../../data/homeSections';
import styles from './ArtspaceOverview.module.css';

/** What ArtSpace is, told beside a still of it.
 *
 *  The dashboard on the right is presentation only — no live data, nothing
 *  clickable. It's marked aria-hidden for that reason: every promise it makes
 *  is already written out in the feature list next to it, so a screen reader
 *  reading out a fake inbox would add nothing but confusion. */
export function ArtspaceOverview() {
  return (
    <section className={styles.section}>
      <span className={styles.orbTop} aria-hidden="true" />
      <span className={styles.orbBottom} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={`eyebrow ${styles.eyebrow}`}>Your ArtSpace</p>
            <h2 className={styles.title}>
              A workspace for
              <br />
              what you create next.
            </h2>
            <p className={styles.intro}>
              Manage your artworks, discover real opportunities, connect with the right people, and
              grow your creative career — all in one place.
            </p>

            <ul className={styles.features}>
              {artspaceFeatures.map((feature) => (
                <li className={styles.feature} key={feature.title}>
                  <span className={styles.featureTile} aria-hidden="true">
                    <Icon name={feature.icon} size={22} />
                    <span className={styles.featureBadge}>
                      <Icon name={feature.badge} size={11} />
                    </span>
                  </span>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.preview}>
            <p className={styles.note} aria-hidden="true">
              Your art.
              <br />
              New opportunities.
              <svg className={styles.noteArrow} viewBox="0 0 96 82" fill="none">
                <path
                  d="M2 2c26 2 47 14 60 34 6 9 10 21 12 36"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M64 63l10 10 8-12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>

            {/* A canvas leaning out from behind the window, so the panel reads
                as sitting in a studio rather than floating on the page. */}
            <img
              className={styles.peek}
              src={artspaceActivity[2].imageUrl}
              alt=""
              loading="lazy"
              aria-hidden="true"
            />

            <div className={styles.dash} aria-hidden="true">
              <aside className={styles.side}>
                <p className={styles.brand}>artbank</p>

                {artspaceNavGroups.map((group, groupIndex) => (
                  <div className={styles.navGroup} key={group.label}>
                    <p className={styles.navLabel}>{group.label}</p>
                    {group.items.map((item, itemIndex) => (
                      <div
                        className={[
                          styles.navItem,
                          groupIndex === 0 && itemIndex === 0 && styles.navItemActive,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        key={item.label}
                      >
                        <Icon name={item.icon} size={14} />
                        {item.label}
                        {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                      </div>
                    ))}

                    {groupIndex === 0 && (
                      <div className={styles.addBtn}>
                        <Icon name="plus" size={12} />
                        Add Artwork
                      </div>
                    )}
                  </div>
                ))}

                <div className={styles.logOut}>
                  <Icon name="log-out" size={14} />
                  Log Out
                </div>
              </aside>

              <div className={styles.main}>
                <header className={styles.topBar}>
                  <div>
                    <p className={styles.greeting}>Good morning, {artspaceDemoUser} 👋</p>
                    <p className={styles.greetingNote}>
                      Here’s what’s happening with your art and opportunities today.
                    </p>
                  </div>

                  <div className={styles.topTools}>
                    <span className={styles.topSearch}>
                      <Icon name="search" size={13} />
                      Search ArtSpace...
                    </span>
                    <span className={styles.bell}>
                      <Icon name="bell" size={15} />
                      <span className={styles.bellDot}>3</span>
                    </span>
                    <span className={styles.account}>
                      <span className={styles.avatar}>
                        <Icon name="user" size={13} />
                      </span>
                      {artspaceDemoUser}
                      <Icon name="chevron-down" size={13} />
                    </span>
                  </div>
                </header>

                <div className={styles.statRow}>
                  {artspaceStats.map((stat) => (
                    <div className={styles.stat} key={stat.label}>
                      <span className={styles.statIcon}>
                        <Icon name={stat.icon} size={14} />
                      </span>
                      <p className={styles.statValue}>{stat.value}</p>
                      <p className={styles.statLabel}>
                        {stat.label}
                        {stat.delta && (
                          <span className={styles.statDelta}>
                            <Icon name="trend-up" size={11} />
                            {stat.delta}
                          </span>
                        )}
                        {stat.link && (
                          <span className={styles.statLink}>
                            {stat.link} <Icon name="arrow-right" size={10} />
                          </span>
                        )}
                      </p>
                    </div>
                  ))}

                  <div className={`${styles.stat} ${styles.statReady}`}>
                    <p className={styles.statLabel}>{artspaceReadiness.label}</p>
                    <p className={styles.readyValue}>{artspaceReadiness.percent}%</p>
                    <span className={styles.readyTrack}>
                      <span
                        className={styles.readyFill}
                        style={{ width: `${artspaceReadiness.percent}%` }}
                      />
                    </span>
                    <span className={styles.readyAction}>
                      {artspaceReadiness.action} <Icon name="arrow-right" size={10} />
                    </span>
                  </div>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div>
                      <p className={styles.cardTitle}>Needs Your Decision</p>
                      <p className={styles.cardNote}>Maximum 3 urgent actions</p>
                    </div>
                    <span className={styles.cardLink}>View All ({artspaceDecisions.length})</span>
                  </div>

                  <div className={styles.decisions}>
                    {artspaceDecisions.map((decision) => (
                      <div className={styles.decision} key={decision.artwork}>
                        <span className={styles.decisionIcon}>
                          <Icon name="user" size={15} />
                        </span>
                        <div className={styles.decisionCopy}>
                          <p className={styles.decisionKind}>{decision.kind}</p>
                          <p className={styles.decisionWork}>{decision.artwork}</p>
                          <p className={styles.decisionMeta}>
                            {decision.from} · {decision.when}
                          </p>
                        </div>
                        <span className={styles.replyBtn}>Reply</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.pair}>
                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <p className={styles.cardTitle}>Recent Activity</p>
                      <span className={styles.cardLink}>View All</span>
                    </div>

                    {artspaceActivity.map((item) => (
                      <div className={styles.activity} key={item.title}>
                        <img className={styles.thumb} src={item.imageUrl} alt="" loading="lazy" />
                        <div className={styles.activityCopy}>
                          <p className={styles.activityTitle}>{item.title}</p>
                          <p className={styles.activityDetail}>{item.detail}</p>
                        </div>
                        <span className={styles.activityTime}>{item.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.card}>
                    <div className={styles.cardHead}>
                      <div>
                        <p className={styles.cardTitle}>Artwork Action Plan</p>
                        <p className={styles.cardNote}>One next step per artwork — not a score.</p>
                      </div>
                    </div>

                    {artspaceActionPlan.map((row) => (
                      <div className={styles.planRow} key={row.artwork}>
                        <span className={styles.planChip}>{row.status}</span>
                        <div className={styles.activityCopy}>
                          <p className={styles.activityTitle}>{row.artwork}</p>
                          <p className={styles.activityDetail}>{row.step}</p>
                        </div>
                        <span className={styles.fixBtn}>Fix</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.signOff}>
          <p className={styles.signOffKicker}>More than a portfolio</p>
          <p className={styles.signOffScript}>A creative future.</p>
        </div>
      </div>
    </section>
  );
}
