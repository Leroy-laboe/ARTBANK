import { Link } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import {
  buyerBannerArt,
  buyerDemoUser,
  buyerFeatures,
  buyerFeaturedWorks,
  buyerNavGroups,
  buyerRoomPhoto,
  buyerTrust,
} from '../../data/homeSections';
import styles from './BuyerSourcing.module.css';

/** The collector side of the platform, told beside a still of it.
 *
 *  As with the ArtSpace section, the dashboard is presentation only — no live
 *  data, nothing clickable — so it's aria-hidden. Every claim it makes is
 *  already written out in the feature list beside it, and a screen reader
 *  announcing a fake search field and unreachable save buttons would add
 *  confusion rather than information. */
export function BuyerSourcing() {
  return (
    <section className={styles.section}>
      <img className={styles.room} src={buyerRoomPhoto} alt="" loading="lazy" aria-hidden="true" />
      <span className={styles.orb} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <p className={`eyebrow ${styles.eyebrow}`}>For buyers &amp; institutions</p>
            <h2 className={styles.title}>
              Discover art
              <br />
              with <span className={styles.titleAccent}>real context.</span>
            </h2>
            <p className={styles.intro}>
              Find verified artists, explore original artworks, and make informed decisions — all in
              one place.
            </p>

            <ul className={styles.features}>
              {buyerFeatures.map((feature) => (
                <li className={styles.feature} key={feature.title}>
                  <span className={styles.featureTile} aria-hidden="true">
                    <Icon name={feature.icon} size={22} />
                  </span>
                  <div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                    <p className={styles.featureText}>{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.ctas}>
              <Link to="/marketplace" className={styles.ctaPrimary}>
                Explore Artworks
                <Icon name="arrow-right" size={15} />
              </Link>
              <Link to="/how-it-works" className={styles.ctaGhost}>
                <Icon name="play" size={13} />
                See how it works
              </Link>
            </div>
          </div>

          <div className={styles.preview}>
            <div className={styles.dash} aria-hidden="true">
              <aside className={styles.side}>
                <p className={styles.brand}>artbank</p>

                {buyerNavGroups.map((group, groupIndex) => (
                  <div
                    className={[styles.navGroup, groupIndex > 0 && styles.navGroupRuled]
                      .filter(Boolean)
                      .join(' ')}
                    key={group[0].label}
                  >
                    {group.map((item, itemIndex) => (
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
                  </div>
                ))}

                <div className={styles.who}>
                  <span className={styles.whoAvatar}>
                    <Icon name="user" size={14} />
                  </span>
                  <div>
                    <p className={styles.whoName}>{buyerDemoUser.name}</p>
                    <p className={styles.whoRole}>{buyerDemoUser.role}</p>
                  </div>
                  <Icon name="chevron-down" size={13} />
                </div>
              </aside>

              <div className={styles.main}>
                <header className={styles.topBar}>
                  <span className={styles.topSearch}>
                    <Icon name="search" size={14} />
                    Search artworks, artists, styles...
                  </span>
                  <span className={styles.bell}>
                    <Icon name="bell" size={16} />
                    <span className={styles.bellDot}>2</span>
                  </span>
                  <span className={styles.topAvatar}>
                    <Icon name="user" size={15} />
                  </span>
                </header>

                <div className={styles.banner}>
                  <div className={styles.bannerCopy}>
                    <p className={styles.bannerTitle}>
                      Discover Art
                      <br />
                      that <span className={styles.bannerAccent}>Speaks to You</span>
                    </p>
                    <p className={styles.bannerNote}>
                      Explore original artworks from verified artists worldwide.
                    </p>
                    <span className={styles.bannerBtn}>
                      Explore Artworks
                      <Icon name="arrow-right" size={12} />
                    </span>
                  </div>

                  <p className={styles.bannerMotto}>
                    Art
                    <br />
                    connects
                    <br />
                    people.
                  </p>

                  <img className={styles.bannerArt} src={buyerBannerArt} alt="" loading="lazy" />
                </div>

                <div className={styles.trustRow}>
                  {buyerTrust.map((item) => (
                    <div className={styles.trust} key={item.title}>
                      <span className={styles.trustIcon}>
                        <Icon name={item.icon} size={14} />
                      </span>
                      <div className={styles.trustCopy}>
                        <p className={styles.trustTitle}>{item.title}</p>
                        <p className={styles.trustNote}>{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.worksHead}>
                  <p className={styles.worksTitle}>Featured Artworks</p>
                  <span className={styles.worksLink}>
                    Saved Works <Icon name="arrow-right" size={11} />
                  </span>
                </div>

                <div className={styles.works}>
                  {buyerFeaturedWorks.map((work) => (
                    <div className={styles.work} key={work.title}>
                      <div className={styles.workMedia}>
                        <img src={work.imageUrl} alt="" loading="lazy" />
                        <span className={styles.workSave}>
                          <Icon name="heart" size={13} />
                        </span>
                      </div>
                      <div className={styles.workBody}>
                        <p className={styles.workTitle}>{work.title}</p>
                        <p className={styles.workArtist}>{work.artist}</p>
                        <p className={styles.workDetail}>{work.detail}</p>
                        <p className={styles.workPrice}>{work.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.signOff}>
          <p className={styles.signOffScript}>
            Support real talent.
            <br />
            Build a richer art world.
          </p>
          <p className={styles.signOffCaps}>
            Authentic art.
            <br />
            Meaningful connections.
            <br />
            A brighter creative future.
          </p>
        </div>
      </div>
    </section>
  );
}
