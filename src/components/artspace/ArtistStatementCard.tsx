import { useState } from 'react';
import { Icon } from '../ui/Icon';
import { statementGuidance } from '../../data/artspaceProfile';
import type { ProfilePatch } from '../../services/profile';
import type { Profile } from '../../types/user';
import styles from './profileTabs.module.css';

/** The artist statement — the longest thing on the public profile, and the
 *  part a curator reads first.
 *
 *  Nothing is generated or suggested here. The brief deletes AI-written facts
 *  from the artwork flow for the same reason they'd be wrong here: a statement
 *  someone else wrote isn't the artist's. */
export function ArtistStatementCard({
  profile,
  saving,
  onSave,
}: {
  profile: Profile | null;
  saving: boolean;
  onSave: (patch: ProfilePatch) => Promise<boolean>;
}) {
  const [text, setText] = useState(profile?.artistStatement ?? '');
  const [saved, setSaved] = useState(false);

  const dirty = text !== (profile?.artistStatement ?? '');

  async function handleSave() {
    const ok = await onSave({ artistStatement: text.trim() || null });
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2400);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Artist Statement</h2>
          <p className={styles.subtitle}>{statementGuidance.hint}</p>
        </div>
        <span className={styles.count}>
          {text.trim() ? `${text.trim().split(/\s+/).length} words` : 'Empty'}
        </span>
      </header>

      <label className={styles.label} htmlFor="artist-statement">
        Your statement
      </label>
      <textarea
        id="artist-statement"
        className={styles.textarea}
        rows={12}
        maxLength={statementGuidance.limit}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write in your own voice. There is no right length."
      />
      <p className={styles.counter}>
        {text.length}/{statementGuidance.limit}
      </p>

      <div className={styles.actions}>
        {saved && (
          <p className={styles.saved}>
            <Icon name="check-circle" size={14} />
            Saved
          </p>
        )}
        <button
          type="button"
          className={styles.save}
          onClick={handleSave}
          disabled={saving || !profile || !dirty}
        >
          {saving ? 'Saving…' : 'Save Statement'}
        </button>
      </div>
    </section>
  );
}
