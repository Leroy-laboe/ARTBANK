import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import { ownershipStatement } from '../../data/artspaceAddArtwork';
import type { ArtworkDraft, DraftErrors } from './artworkDraft';
import styles from './ProvenanceCard.module.css';

/** Where the work came from, and who owns it.
 *
 *  The ownership panel is required by the brief: adding a record must never
 *  imply a transfer of ownership, and the artist has to confirm they hold the
 *  rights. See docs/pivot-checklist/10-add-artwork.md. */
export function ProvenanceCard({
  draft,
  errors,
  onChange,
}: {
  draft: ArtworkDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Provenance &amp; Authenticity</h2>
        <p className={styles.subtitle}>Provide provenance details for your artwork.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={styles.field}>
            <span className={styles.label}>Certificate of Authenticity</span>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={draft.coaPromised}
                onChange={(e) => onChange({ coaPromised: e.target.checked })}
              />
              <span>
                I will provide a COA
                <span className={styles.checkHint}>You can upload it in the Documents step</span>
              </span>
            </label>
          </div>

          <FormField
            label="Creation Location"
            value={draft.creationLocation}
            placeholder="e.g. Kuala Lumpur, Malaysia"
            onChange={(v) => onChange({ creationLocation: v })}
          />
        </div>

        <div className={styles.col}>
          <FormField
            label="Date Created"
            type="date"
            value={draft.dateCreated}
            onChange={(v) => onChange({ dateCreated: v })}
            hint="Optional — the year above is what appears on your record."
          />

          <div className={styles.field}>
            <span className={styles.label}>Signature</span>
            <label className={styles.check}>
              <input
                type="checkbox"
                checked={draft.isSigned}
                onChange={(e) => onChange({ isSigned: e.target.checked })}
              />
              <span>
                Artwork is signed
                <span className={styles.checkHint}>Indicate if the artwork is signed by you</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Required by the brief, and deliberately hard to miss. */}
      <div className={styles.ownership}>
        <p className={styles.ownershipHead}>
          <Icon name="shield-check" size={16} className={styles.ownershipIcon} />
          {ownershipStatement.heading}
        </p>
        <p className={styles.ownershipBody}>{ownershipStatement.body}</p>

        <label
          className={[styles.confirm, errors.ownershipConfirmed && styles.confirmError]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="checkbox"
            checked={draft.ownershipConfirmed}
            onChange={(e) => onChange({ ownershipConfirmed: e.target.checked })}
          />
          <span>{ownershipStatement.confirmLabel}</span>
        </label>

        {errors.ownershipConfirmed && <p className={styles.error}>{errors.ownershipConfirmed}</p>}
      </div>
    </section>
  );
}
