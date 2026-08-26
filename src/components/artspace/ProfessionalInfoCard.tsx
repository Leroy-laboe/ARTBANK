import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import { professionalInfo } from '../../data/artspaceProfile';
import type { ProfilePatch } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './ProfessionalInfoCard.module.css';

/** Practice, training and recognition — the credentials half of the profile.
 *
 *  The Save button here previously had no onClick at all, so everything typed
 *  into it was lost on navigation. All four fields map to columns added in
 *  migration 0021. */
export function ProfessionalInfoCard({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const [mediums, setMediums] = useState<string[]>(profile?.mediums ?? []);
  const [saved, setSaved] = useState(false);

  const remaining = professionalInfo.mediumOptions.filter((option) => !mediums.includes(option));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = (key: string) => String(form.get(key) ?? '').trim() || null;

    const ok = await onSave({
      mediums,
      yearsActive: value('yearsActive'),
      education: value('education'),
      awards: value('awards'),
    });

    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Professional Information</h2>
        <p className={styles.subtitle}>Tell the world more about your artistic journey.</p>
      </header>

      <form onSubmit={handleSubmit}>
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
                    <Icon name="close" size={12} />
                  </button>
                </span>
              ))}
            </div>

            {remaining.length > 0 && (
              <span className={styles.addWrap}>
                <select
                  className={styles.add}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setMediums((prev) => [...prev, e.target.value]);
                  }}
                >
                  <option value="">Add a medium…</option>
                  {remaining.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={14} className={styles.caret} />
              </span>
            )}
          </div>

          <FormField
            label="Years Active"
            name="yearsActive"
            value={profile?.yearsActive ?? ''}
            placeholder="e.g. 2018 – Present"
          />

          <FormField
            label="Education"
            name="education"
            as="textarea"
            rows={2}
            value={profile?.education ?? ''}
            placeholder="One qualification per line."
          />

          <FormField
            label="Awards & Recognition"
            name="awards"
            as="textarea"
            rows={3}
            value={profile?.awards ?? ''}
            placeholder="One award per line."
          />
        </div>

        <div className={styles.actions}>
          {saved && (
            <p className={styles.saved}>
              <Icon name="check-circle" size={14} />
              Saved
            </p>
          )}
          <button type="submit" className={styles.save} disabled={saving || !profile}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </section>
  );
}
