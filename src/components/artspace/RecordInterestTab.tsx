import { Icon } from '../ui/Icon';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

const purposeLabel: Record<string, string> = {
  purchase: 'Acquisition',
  licence: 'Licensing',
  exhibit: 'Exhibition use',
  commission: 'Commission',
  collaborate: 'Collaboration',
};

const stageLabel: Record<string, string> = {
  viewer: 'Viewed',
  enquiry: 'Enquiry',
  qualified: 'Qualified',
  viewing_room: 'Viewing room',
  negotiation: 'In discussion',
  completed: 'Completed',
};

function when(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Interest — who has identified themselves in connection with this work.
 *
 *  Anonymous traffic is counted and never listed. There is no identity on
 *  those rows to show, and the brief forbids ever revealing one, so the count
 *  is the whole of what this tab can honestly say about them
 *  (docs/pivot-checklist/12-interest-ledger.md). No likes, no view counters
 *  dressed up as popularity. */
export function RecordInterestTab({ record }: { record: ArtworkRecord }) {
  const { identified, anonymousCount } = record.interest;

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Identified interest ({identified.length})</h2>
            <p className={styles.panelNote}>
              People who chose to identify themselves in connection with this work.
            </p>
          </div>
        </div>

        {identified.length > 0 ? (
          <ul className={styles.list}>
            {identified.map((entry) => (
              <li className={styles.item} key={entry.id}>
                <div className={styles.itemHead}>
                  <p className={styles.itemTitle}>
                    {entry.name}
                    {entry.organization ? ` · ${entry.organization}` : ''}
                  </p>
                  <p className={styles.itemMeta}>{when(entry.createdAt)}</p>
                </div>

                <div className={styles.chips} style={{ marginTop: 7 }}>
                  {entry.purpose && (
                    <span className={styles.chip}>
                      {purposeLabel[entry.purpose] ?? entry.purpose}
                    </span>
                  )}
                  <span className={styles.chip}>{stageLabel[entry.stage] ?? entry.stage}</span>
                  {entry.location && <span className={styles.chip}>{entry.location}</span>}
                </div>

                {entry.message && <p className={styles.itemBody}>{entry.message}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <Icon name="eye" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>Nobody has identified themselves yet</p>
              <p className={styles.emptyBody}>
                Sharing the smart link is what starts this. Anyone who wants serious access has to
                say who they are first.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Anonymous viewers</h2>
            <p className={styles.panelNote}>
              Counted only. ARTBANK never reveals who these people are — not to you, not to
              anyone.
            </p>
          </div>
          <span className={styles.chip}>{anonymousCount}</span>
        </div>
      </section>
    </>
  );
}
