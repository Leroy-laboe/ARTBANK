import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

const eventLabel: Record<string, { label: string; icon: IconName }> = {
  upload: { label: 'Record created', icon: 'upload' },
  evidence: { label: 'Evidence added', icon: 'file-text' },
  exhibition: { label: 'Exhibited', icon: 'building' },
  enquiry: { label: 'Enquiry received', icon: 'message' },
  licence: { label: 'Licence agreed', icon: 'handshake' },
  sale: { label: 'Sold', icon: 'bank' },
  publish: { label: 'Published', icon: 'globe' },
};

const sourceLabel: Record<string, string> = {
  instagram: 'Instagram',
  threads: 'Threads',
  rednote: 'RedNote',
  qr: 'QR code',
  direct: 'Direct',
};

/** History — the append-only provenance timeline, plus where the smart link
 *  has been opened from.
 *
 *  The database has no update or delete policy on these events (see migration
 *  0015): a provenance log that can be rewritten is not provenance. */
export function RecordHistoryTab({ record }: { record: ArtworkRecord }) {
  const { events, linkStats } = record;

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Link visits ({linkStats.total})</h2>
            <p className={styles.panelNote}>Where this artwork’s link was opened from.</p>
          </div>
        </div>

        {linkStats.total > 0 ? (
          <dl className={styles.rows}>
            {linkStats.bySource.map((entry) => (
              <div className={styles.row} key={entry.source}>
                <dt>{sourceLabel[entry.source] ?? entry.source}</dt>
                <dd>
                  {entry.count} visit{entry.count === 1 ? '' : 's'}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className={styles.empty}>
            <Icon name="external-link" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>No visits recorded</p>
              <p className={styles.emptyBody}>
                Visits are counted once the smart link has been shared and opened.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Timeline</h2>
            <p className={styles.panelNote}>Append-only. Entries can’t be edited or removed.</p>
          </div>
        </div>

        {events.length > 0 ? (
          <ul className={styles.timeline}>
            {events.map((event) => {
              const meta = eventLabel[event.eventType] ?? {
                label: event.eventType,
                icon: 'clock' as IconName,
              };
              return (
                <li className={styles.event} key={event.id}>
                  <span className={styles.eventDot} />
                  <p className={styles.eventTitle}>{meta.label}</p>
                  <p className={styles.eventMeta}>
                    {new Date(event.occurredAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                    {event.description ? ` · ${event.description}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className={styles.empty}>
            <Icon name="clock" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>Nothing recorded yet</p>
              <p className={styles.emptyBody}>
                Events are written as things happen to the work — evidence added, published, an
                enquiry, a sale.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
