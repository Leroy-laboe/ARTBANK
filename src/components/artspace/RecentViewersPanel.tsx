import { Icon } from '../ui/Icon';
import { Panel, PanelLink } from './Panel';
import { anonymousViews, recentViewers, type MonogramTone } from '../../data/artspaceInterest';
import styles from './RecentViewersPanel.module.css';

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

/** How many thumbnails fit before the rest collapse into a "+N" chip. */
const THUMB_LIMIT = 3;

/** Identified viewers only — people who consented to reveal themselves.
 *  Anonymous traffic is reported underneath as a bare count and never gets a
 *  row here; keeping the two visibly apart is a hard rule of the spec. */
export function RecentViewersPanel({ anonymousCount }: { anonymousCount?: number }) {
  const count = anonymousCount ?? anonymousViews.count;
  return (
    <Panel
      title="Recent Viewers"
      subtitle="People who viewed your artworks."
      action={
        <PanelLink to="/artspace/interest" arrow>
          View all viewers
        </PanelLink>
      }
    >
      <div className={styles.scroller}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Viewer</th>
              <th>Viewed</th>
              <th>Artworks Viewed</th>
              <th>Last Viewed</th>
              <th>Action</th>
              <th className={styles.menuCol}>
                <span className="visually-hidden">More</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {recentViewers.map((viewer) => {
              const shown = viewer.thumbs.slice(0, THUMB_LIMIT);
              const overflow = viewer.thumbs.length - shown.length;

              return (
                <tr key={viewer.id}>
                  <td>
                    <div className={styles.viewer}>
                      {viewer.avatarUrl ? (
                        <img src={viewer.avatarUrl} alt="" className={styles.avatar} loading="lazy" />
                      ) : (
                        <span
                          className={[styles.monogram, toneClass[viewer.tone ?? 'ink']].join(' ')}
                          aria-hidden="true"
                        >
                          {viewer.monogram}
                        </span>
                      )}
                      <div className={styles.viewerCopy}>
                        <p className={styles.name}>
                          {viewer.name}
                          {viewer.verified && (
                            <Icon
                              name="badge-check"
                              size={13}
                              className={styles.verified}
                              aria-label="Identity verified"
                            />
                          )}
                        </p>
                        <p className={styles.location}>{viewer.location}</p>
                      </div>
                    </div>
                  </td>

                  <td className={styles.count}>
                    {viewer.viewedCount} artwork{viewer.viewedCount === 1 ? '' : 's'}
                  </td>

                  <td>
                    <div className={styles.thumbs}>
                      {shown.map((src, i) => (
                        <img src={src} alt="" className={styles.thumb} key={i} loading="lazy" />
                      ))}
                      {overflow > 0 && <span className={styles.overflow}>+{overflow}</span>}
                    </div>
                  </td>

                  <td>
                    <p className={styles.date}>{viewer.lastViewedDate}</p>
                    <p className={styles.time}>{viewer.lastViewedTime}</p>
                  </td>

                  <td>
                    <button type="button" className={styles.profileBtn}>
                      View Profile
                    </button>
                  </td>

                  <td className={styles.menuCol}>
                    <button type="button" className={styles.menu} aria-label={`More actions for ${viewer.name}`}>
                      <Icon name="more-vertical" size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* The spec's hard rule: anonymous traffic is counted, never named, and
          must stay visibly separate from the identified people above. */}
      <p className={styles.anonymous}>
        <Icon name="eye-off" size={14} />
        <span>
          <strong>{count.toLocaleString('en-US')}</strong> anonymous visits ·{' '}
          {anonymousViews.period} — {anonymousViews.note}
        </span>
      </p>
    </Panel>
  );
}
