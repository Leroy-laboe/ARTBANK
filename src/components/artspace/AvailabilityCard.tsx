import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import {
  availabilityStatuses,
  readyToShipOptions,
  shippingRegions,
} from '../../data/artspaceAddArtwork';
import type { ArtworkDraft, DraftErrors } from './artworkDraft';
import styles from './AvailabilityCard.module.css';

/** Step 3, part two: when the artwork can be had, and where it can go. */
export function AvailabilityCard({
  draft,
  errors,
  onChange,
}: {
  draft: ArtworkDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  const status = availabilityStatuses.find((s) => s.id === draft.availabilityStatus);
  const remainingRegions = shippingRegions.filter((r) => !draft.shippingRegions.includes(r));

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Availability</h2>
        <p className={styles.subtitle}>Choose when and where your artwork is available.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.col}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="availabilityStatus">
              Availability Status<span className={styles.required}>*</span>
            </label>
            <span className={styles.selectWrap}>
              <select
                id="availabilityStatus"
                className={styles.select}
                value={draft.availabilityStatus}
                onChange={(e) => onChange({ availabilityStatus: e.target.value })}
              >
                {availabilityStatuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <Icon name="chevron-down" size={15} className={styles.caret} />
            </span>
            {/* The hint changes with the choice, so the consequence is visible
                before the artist commits to it. */}
            <p className={styles.hint}>{status?.hint}</p>
          </div>

          <FormField
            label="Ready to Ship In"
            as="select"
            value={draft.readyToShipIn}
            options={readyToShipOptions}
            onChange={(v) => onChange({ readyToShipIn: v })}
            hint="Estimated time before the artwork ships."
          />
        </div>

        <div className={styles.col}>
          <FormField
            label="Ships From"
            required
            value={draft.shipsFrom}
            placeholder="e.g. Kuala Lumpur, Malaysia"
            onChange={(v) => onChange({ shipsFrom: v })}
            hint="Location from where the artwork will be shipped."
            error={errors.shipsFrom}
          />

          <div className={styles.field}>
            <span className={styles.label}>
              Shipping Regions<span className={styles.required}>*</span>
            </span>

            <div
              className={[styles.chips, errors.shippingRegions && styles.chipsInvalid]
                .filter(Boolean)
                .join(' ')}
            >
              {draft.shippingRegions.map((region) => (
                <span className={styles.chip} key={region}>
                  {region}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    onClick={() =>
                      onChange({ shippingRegions: draft.shippingRegions.filter((r) => r !== region) })
                    }
                    aria-label={`Remove ${region}`}
                  >
                    <Icon name="close" size={11} />
                  </button>
                </span>
              ))}

              <span className={styles.addWrap}>
                <span className="visually-hidden">Add a shipping region</span>
                <select
                  className={styles.add}
                  value=""
                  disabled={remainingRegions.length === 0}
                  onChange={(e) => {
                    if (e.target.value) {
                      onChange({ shippingRegions: [...draft.shippingRegions, e.target.value] });
                    }
                  }}
                  aria-label="Add a shipping region"
                >
                  <option value="">
                    {draft.shippingRegions.length === 0 ? 'Select regions…' : 'Add…'}
                  </option>
                  {remainingRegions.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={15} className={styles.addCaret} />
              </span>
            </div>

            {errors.shippingRegions ? (
              <p className={styles.error}>{errors.shippingRegions}</p>
            ) : (
              <p className={styles.hint}>Select the regions you are willing to ship to.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
