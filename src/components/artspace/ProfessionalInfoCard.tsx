import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import { professionalInfo } from '../../data/artspaceProfile';
import styles from './ProfessionalInfoCard.module.css';

/** Practice, training and recognition — the credentials half of the profile.
 *
 *  The medium chips keep their own state rather than lifting it to the page:
 *  nothing outside this card reacts to them, so there's nothing to share. */
export function ProfessionalInfoCard() {
  const [mediums, setMediums] = useState(professionalInfo.mediums);

  const remaining = professionalInfo.mediumOptions.filter((option) => !mediums.includes(option));

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Professional Information</h2>
        <p className={styles.subtitle}>Tell the world more about your artistic journey.</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.field}>
          <span className={styles.label}>Practice / Medium</span>
          <div className={styles.chips}>
            {mediums.map((medium) => (
              <span className={styles.chip} key={medium}>
                {medium}
                <button
                  type="button"
                  className={styles.chipRemove}
                  onClick={() => setMediums((prev) => prev.filter((m) => m !== medium))}
                  aria-label={`Remove ${medium}`}
                >
                  <Icon name="close" size={11} />
                </button>
              </span>
            ))}

            <label className={styles.addWrap}>
              <span className="visually-hidden">Add a medium</span>
              <select
                className={styles.add}
                value=""
                onChange={(e) => {
                  if (e.target.value) setMediums((prev) => [...prev, e.target.value]);
                }}
                disabled={remaining.length === 0}
              >
                <option value="">Add…</option>
                {remaining.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
              <Icon name="chevron-down" size={15} className={styles.caret} />
            </label>
          </div>
        </div>

        <FormField label="Years Active" value={professionalInfo.yearsActive} />

        <FormField label="Education" as="textarea" rows={2} value={professionalInfo.education} />

        <FormField
          label="Awards & Recognition"
          as="textarea"
          rows={3}
          value={professionalInfo.awards}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.save}>
          Save Changes
        </button>
      </div>
    </section>
  );
}
