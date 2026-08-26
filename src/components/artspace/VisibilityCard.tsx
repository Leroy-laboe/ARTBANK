import { Icon } from '../ui/Icon';
import { visibilityOptions } from '../../data/artspaceAddArtwork';
import type { ArtworkDraft } from './artworkDraft';
import styles from './VisibilityCard.module.css';

/** Step 8 of the spec: Public, Private or Unlisted.
 *
 *  Separate from status, which is how finished the record is. A published
 *  record can still be private, and the copy says so rather than letting the
 *  two ideas blur together. */
export function VisibilityCard({
  draft,
  onChange,
}: {
  draft: ArtworkDraft;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Visibility</h2>
        <p className={styles.subtitle}>Who can see this record once it is published.</p>
      </header>

      <div className={styles.options} role="radiogroup" aria-label="Visibility">
        {visibilityOptions.map((option) => {
          const on = draft.visibility === option.id;
          return (
            <label
              key={option.id}
              className={[styles.option, on && styles.optionOn].filter(Boolean).join(' ')}
            >
              <input
                type="radio"
                name="visibility"
                value={option.id}
                checked={on}
                onChange={() => onChange({ visibility: option.id })}
              />
              <Icon name={option.icon} size={18} className={styles.icon} />
              <span className={styles.label}>{option.label}</span>
              <span className={styles.detail}>{option.detail}</span>
            </label>
          );
        })}
      </div>

      <p className={styles.note}>
        Visibility is not the same as status. You can publish a record and keep it private, then
        make it public later without going through this flow again.
      </p>
    </section>
  );
}
