import { Icon } from '../ui/Icon';
import { permittedUses, visibilityOptions } from '../../data/artspaceAddArtwork';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

/** Rights — what the artist has permitted, and what they haven't.
 *
 *  Both halves are listed. A tab that showed only the granted uses would let
 *  an empty list read as "unrestricted", which is the opposite of what an
 *  empty `permitted_uses` means (see migration 0020's column comment). */
export function RecordRightsTab({ record }: { record: ArtworkRecord }) {
  const { artwork } = record;
  const granted = permittedUses.filter((u) => artwork.permittedUses.includes(u.id));
  const withheld = permittedUses.filter((u) => !artwork.permittedUses.includes(u.id));
  const visibility = visibilityOptions.find((v) => v.id === artwork.visibility);

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Ownership</h2>
            <p className={styles.panelNote}>
              Recorded when this artwork was added, and kept with it.
            </p>
          </div>
        </div>

        {artwork.ownershipStatement ? (
          <p className={styles.prose}>{artwork.ownershipStatement}</p>
        ) : (
          <div className={styles.empty}>
            <Icon name="shield-check" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>No ownership statement on this record</p>
              <p className={styles.emptyBody}>
                Records added through the current flow always carry one. This predates it.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Permitted uses</h2>
            <p className={styles.panelNote}>
              {granted.length === 0
                ? 'Nothing is permitted. Every use has to be requested from you first.'
                : `${granted.length} of ${permittedUses.length} permitted. Each still has to be agreed with you individually.`}
            </p>
          </div>
        </div>

        <ul className={styles.checks}>
          {granted.map((use) => (
            <li className={styles.check} key={use.id}>
              <Icon
                name="check-circle"
                size={16}
                className={[styles.checkIcon, styles.checkDone].join(' ')}
              />
              <span className={styles.checkCopy}>
                <strong>{use.label}</strong>
                <span>{use.detail}</span>
              </span>
            </li>
          ))}
          {withheld.map((use) => (
            <li className={styles.check} key={use.id}>
              <Icon
                name="x-circle"
                size={16}
                className={[styles.checkIcon, styles.checkOpen].join(' ')}
              />
              <span className={styles.checkCopy}>
                <strong style={{ color: 'var(--muted)' }}>{use.label}</strong>
                <span>Not permitted.</span>
              </span>
            </li>
          ))}
        </ul>

        {artwork.rightsNote && (
          <>
            <p className={styles.label} style={{ marginTop: 16 }}>
              Your note
            </p>
            <p className={styles.prose}>{artwork.rightsNote}</p>
          </>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Visibility</h2>
            <p className={styles.panelNote}>
              {visibility?.detail ?? 'Who can see this record.'}
            </p>
          </div>
          <span className={styles.chip}>{visibility?.label ?? artwork.visibility}</span>
        </div>
      </section>
    </>
  );
}
