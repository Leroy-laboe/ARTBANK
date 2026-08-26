import { Icon } from '../ui/Icon';
import { permittedUses, rightsStatement } from '../../data/artspaceAddArtwork';
import type { ArtworkDraft, DraftErrors } from './artworkDraft';
import styles from './RightsCard.module.css';

/** Step 6 of the spec: rights and permitted uses.
 *
 *  Every box starts unticked and stays that way until the artist ticks it.
 *  There is deliberately no "select all" — granting six permissions in one
 *  click is exactly the pattern the brief's permission-first stance rules
 *  out. See docs/pivot-checklist/10-add-artwork.md. */
export function RightsCard({
  draft,
  errors,
  onChange,
}: {
  draft: ArtworkDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  const toggle = (id: string) =>
    onChange({
      permittedUses: draft.permittedUses.includes(id)
        ? draft.permittedUses.filter((u) => u !== id)
        : [...draft.permittedUses, id],
    });

  const granted = draft.permittedUses.length;

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Rights &amp; Permitted Uses</h2>
          <p className={styles.subtitle}>
            Choose what people may approach you about. You can change this at any time.
          </p>
        </div>
        <span className={styles.count}>
          {granted === 0 ? 'None permitted' : `${granted} permitted`}
        </span>
      </header>

      <ul className={styles.list}>
        {permittedUses.map((use) => {
          const on = draft.permittedUses.includes(use.id);
          return (
            <li key={use.id}>
              <label className={[styles.use, on && styles.useOn].filter(Boolean).join(' ')}>
                <input type="checkbox" checked={on} onChange={() => toggle(use.id)} />
                <span className={styles.copy}>
                  <span className={styles.label}>{use.label}</span>
                  <span className={styles.detail}>{use.detail}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {granted === 0 && (
        <p className={styles.none}>
          <Icon name="info" size={15} className={styles.noneIcon} />
          Nothing is permitted yet. Your record can still be published — people will simply have
          no listed way to use the work without asking you first.
        </p>
      )}

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="rights-note">
          Anything to add? <span className={styles.optional}>Optional</span>
        </label>
        <textarea
          id="rights-note"
          className={styles.textarea}
          rows={3}
          value={draft.rightsNote}
          maxLength={500}
          placeholder="e.g. Editorial use is fine with a credit line. Please ask before cropping."
          onChange={(e) => onChange({ rightsNote: e.target.value })}
        />
        <p className={styles.counter}>{draft.rightsNote.length}/500</p>
      </div>

      {/* Same treatment as the ownership panel in step 1 — this is the other
          statement the brief requires the artist to actively confirm. */}
      <div className={styles.statement}>
        <p className={styles.statementHead}>
          <Icon name="shield-check" size={16} className={styles.statementIcon} />
          {rightsStatement.heading}
        </p>
        <p className={styles.statementBody}>{rightsStatement.body}</p>

        <label
          className={[styles.confirm, errors.rightsConfirmed && styles.confirmError]
            .filter(Boolean)
            .join(' ')}
        >
          <input
            type="checkbox"
            checked={draft.rightsConfirmed}
            onChange={(e) => onChange({ rightsConfirmed: e.target.checked })}
          />
          <span>{rightsStatement.confirmLabel}</span>
        </label>

        {errors.rightsConfirmed && <p className={styles.error}>{errors.rightsConfirmed}</p>}
      </div>
    </section>
  );
}
