import { useState } from 'react';
import { Icon } from '../ui/Icon';
import type { ArtworkRecord } from '../../services/artworkRecord';
import styles from './recordTabs.module.css';

/** Overview — what the work is, and the only tab that can be edited in place.
 *
 *  Editing is limited to what the artist *described*. Availability, visibility
 *  and status are changed from My Works, evidence from the Passport tab, and
 *  rights from Rights — each where the consequence is visible. */
export function RecordOverviewTab({
  record,
  editing,
  saving,
  onStartEdit,
  onCancelEdit,
  onSave,
}: {
  record: ArtworkRecord;
  editing: boolean;
  saving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (patch: {
    title: string;
    year: string;
    medium: string;
    dimensions: string;
    category: string;
    description: string;
    materials: string;
    creationLocation: string;
  }) => void;
}) {
  const { artwork, images } = record;

  const [form, setForm] = useState({
    title: artwork.title,
    year: artwork.year?.toString() ?? '',
    medium: artwork.medium ?? '',
    dimensions: artwork.dimensions ?? '',
    category: artwork.category ?? '',
    description: artwork.description ?? '',
    materials: artwork.materials.join(', '),
    creationLocation: artwork.creationLocation ?? '',
  });

  const set = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const value = (v: string | number | null) =>
    v === null || v === '' ? <span className={styles.unset}>Not set</span> : v;

  if (editing) {
    return (
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <div>
            <h2 className={styles.panelTitle}>Edit details</h2>
            <p className={styles.panelNote}>
              Changes are saved to the record and logged with today’s date.
            </p>
          </div>
        </div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Title</span>
            <input
              className={styles.input}
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Year</span>
            <input
              className={styles.input}
              inputMode="numeric"
              value={form.year}
              onChange={(e) => set({ year: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Medium</span>
            <input
              className={styles.input}
              value={form.medium}
              onChange={(e) => set({ medium: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Dimensions</span>
            <input
              className={styles.input}
              value={form.dimensions}
              onChange={(e) => set({ dimensions: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Category</span>
            <input
              className={styles.input}
              value={form.category}
              onChange={(e) => set({ category: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Materials</span>
            <input
              className={styles.input}
              placeholder="Comma separated"
              value={form.materials}
              onChange={(e) => set({ materials: e.target.value })}
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Made in</span>
            <input
              className={styles.input}
              value={form.creationLocation}
              onChange={(e) => set({ creationLocation: e.target.value })}
            />
          </label>

          <label className={[styles.field, styles.fieldWide].join(' ')}>
            <span className={styles.label}>Description</span>
            <textarea
              className={styles.textarea}
              rows={6}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </label>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancel} onClick={onCancelEdit}>
              Cancel
            </button>
            <button
              type="button"
              className={styles.save}
              disabled={saving || !form.title.trim()}
              onClick={() => onSave(form)}
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>About this work</h2>
          <button type="button" className={styles.cancel} onClick={onStartEdit}>
            Edit details
          </button>
        </div>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Year</dt>
            <dd>{value(artwork.year)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Medium</dt>
            <dd>{value(artwork.medium)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Dimensions</dt>
            <dd>{value(artwork.dimensions)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Category</dt>
            <dd>{value(artwork.category)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Materials</dt>
            <dd>{value(artwork.materials.join(', '))}</dd>
          </div>
          <div className={styles.row}>
            <dt>Type</dt>
            <dd>
              {artwork.artworkType.replace(/_/g, ' ')}
              {artwork.editionSize ? ` · edition of ${artwork.editionSize}` : ''}
            </dd>
          </div>
          <div className={styles.row}>
            <dt>Made in</dt>
            <dd>{value(artwork.creationLocation)}</dd>
          </div>
          <div className={styles.row}>
            <dt>Signed</dt>
            <dd>{artwork.isSigned ? 'Yes' : 'Not stated'}</dd>
          </div>
        </dl>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Description</h2>
        </div>
        {artwork.description ? (
          <p className={styles.prose}>{artwork.description}</p>
        ) : (
          <div className={styles.empty}>
            <Icon name="file-text" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>No description yet</p>
              <p className={styles.emptyBody}>
                This is what people read first. Add it from Edit details.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHead}>
          <h2 className={styles.panelTitle}>Images ({images.length})</h2>
        </div>
        {images.length > 0 ? (
          <ul className={styles.strip}>
            {images.map((image) => (
              <li className={styles.stripItem} key={image.id}>
                <img src={image.url} alt={image.fileName} className={styles.stripImg} />
                <p className={styles.stripLabel}>{image.isPrimary ? 'Cover' : image.role}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className={styles.empty}>
            <Icon name="image" size={17} className={styles.emptyIcon} />
            <div>
              <p className={styles.emptyTitle}>No images</p>
              <p className={styles.emptyBody}>A record without images can’t be shown to anyone.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
