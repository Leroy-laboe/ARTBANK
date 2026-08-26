import { Icon } from '../ui/Icon';
import { documentTypes } from '../../services/artworkDocuments';
import { formatBytes } from '../../services/artworkImages';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

/** Passport — the evidence state, stated exactly.
 *
 *  The brief deletes the unexplained "Verified" badge: this tab says what has
 *  been supplied, what a review would still need, and where the COA request
 *  has actually got to. A record is never described as verified because it
 *  exists (docs/pivot-checklist/11-artwork-record-passport.md). */

const coaState: Record<string, { label: string; detail: string; tone: 'green' | 'gold' | 'plain' }> = {
  issued: {
    label: 'Certificate issued',
    detail: 'Evidence was reviewed and a Certificate of Authenticity was issued for this record.',
    tone: 'green',
  },
  pending_review: {
    label: 'In review',
    detail: 'Your evidence is with a reviewer. Nothing further is needed from you right now.',
    tone: 'gold',
  },
  not_requested: {
    label: 'Not requested',
    detail:
      'No certificate has been requested. A COA is a paid review of the evidence below — it is never issued automatically for uploading a work.',
    tone: 'plain',
  },
};

export function RecordPassportTab({ record }: { record: ArtworkRecord }) {
  const { artwork, documents, images } = record;
  const state = coaState[artwork.coaStatus] ?? coaState.not_requested;

  // What a reviewer needs. Stated as evidence present or absent — never as a
  // score, and never as a percentage of "completeness".
  const evidence = [
    {
      id: 'images',
      done: images.length > 0,
      title: 'Images of the work',
      detail: `${images.length} uploaded.`,
    },
    {
      id: 'basics',
      done: Boolean(artwork.year && artwork.medium && artwork.dimensions),
      title: 'Year, medium and dimensions',
      detail: 'The facts a certificate states about the work.',
    },
    {
      id: 'ownership',
      done: Boolean(artwork.ownershipStatement),
      title: 'Ownership statement',
      detail: 'Your confirmation that you are the creator or rights holder.',
    },
    {
      id: 'signed',
      done: artwork.isSigned,
      title: 'Signature recorded',
      detail: 'Whether the physical work is signed.',
    },
    {
      id: 'provenance',
      done: Boolean(artwork.creationLocation || artwork.dateCreated),
      title: 'Where and when it was made',
      detail: 'Provenance a reviewer can check against.',
    },
    {
      id: 'documents',
      done: documents.length > 0,
      title: 'Supporting documents',
      detail:
        documents.length > 0
          ? `${documents.length} attached.`
          : 'Ownership proof, invoices or exhibition records strengthen a review.',
    },
  ];

  const missing = evidence.filter((item) => !item.done);

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Certificate of Authenticity</h2>
            <p className={styles.panelNote}>{state.detail}</p>
          </div>
          <span
            className={[
              styles.chip,
              state.tone === 'green' && styles.chipGreen,
              state.tone === 'gold' && styles.chipGold,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {state.label}
          </span>
        </div>

        {artwork.coaPromised && artwork.coaStatus === 'not_requested' && (
          <div className={styles.empty}>
            <Icon name="info" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>You said you hold a certificate for this work</p>
              <p className={styles.emptyBody}>
                That is recorded as your statement. It is separate from an ARTBANK COA, which
                requires the evidence review below.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Evidence</h2>
            <p className={styles.panelNote}>
              {missing.length === 0
                ? 'Everything a review looks at is present.'
                : `${missing.length} of ${evidence.length} still missing.`}
            </p>
          </div>
        </div>

        <ul className={styles.checks}>
          {evidence.map((item) => (
            <li className={styles.check} key={item.id}>
              <Icon
                name={item.done ? 'check-circle' : 'circle-dashed'}
                size={16}
                className={[styles.checkIcon, item.done ? styles.checkDone : styles.checkOpen].join(' ')}
              />
              <span className={styles.checkCopy}>
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Documents ({documents.length})</h2>
            <p className={styles.panelNote}>Private to you. Never shown alongside the artwork.</p>
          </div>
        </div>

        {documents.length > 0 ? (
          <ul className={styles.list}>
            {documents.map((doc) => (
              <li className={styles.item} key={doc.id}>
                <div className={styles.itemHead}>
                  <p className={styles.itemTitle}>{doc.fileName}</p>
                  <p className={styles.itemMeta}>{formatBytes(doc.fileSize)}</p>
                </div>
                <p className={styles.itemBody}>
                  {documentTypes.find((t) => t.id === doc.documentType)?.label ?? 'Supporting file'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <Icon name="folder" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>No documents attached</p>
              <p className={styles.emptyBody}>
                Evidence is added in the Documents step of Add Artwork. A record without it is
                still a complete record — it just can’t support a certificate yet.
              </p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
