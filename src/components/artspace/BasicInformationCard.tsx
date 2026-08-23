import { useState, type KeyboardEvent } from 'react';
import { Icon } from '../ui/Icon';
import { FormField } from './FormField';
import {
  artworkTypes,
  categories,
  collections,
  DESCRIPTION_LIMIT,
  dimensionUnits,
  mediums,
  type ArtworkType,
} from '../../data/artspaceAddArtwork';
import type { ArtworkDraft, DraftErrors } from './artworkDraft';
import styles from './BasicInformationCard.module.css';

/** Step 1 of the guided flow: what the artwork is.
 *
 *  Nothing is auto-populated — the brief deletes AI-generated facts, so every
 *  value here is something the artist typed or picked
 *  (docs/pivot-checklist/10-add-artwork.md). */
export function BasicInformationCard({
  draft,
  errors,
  onChange,
}: {
  draft: ArtworkDraft;
  errors: DraftErrors;
  onChange: (patch: Partial<ArtworkDraft>) => void;
}) {
  const [tagInput, setTagInput] = useState('');

  const addTag = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' && event.key !== ',') return;
    event.preventDefault();
    const value = tagInput.trim().replace(/,$/, '');
    if (value && !draft.tags.includes(value)) {
      onChange({ tags: [...draft.tags, value] });
    }
    setTagInput('');
  };

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <h2 className={styles.title}>Basic Information</h2>
        <p className={styles.subtitle}>Tell us about your artwork.</p>
      </header>

      <div className={styles.grid}>
        {/* ── Left column ── */}
        <div className={styles.col}>
          <FormField
            label="Artwork Title"
            required
            value={draft.title}
            placeholder="e.g. Echoes of Memory"
            onChange={(v) => onChange({ title: v })}
            error={errors.title}
          />

          <FormField
            label="Year Created"
            required
            type="number"
            value={draft.year}
            placeholder="e.g. 2024"
            onChange={(v) => onChange({ year: v })}
            error={errors.year}
          />

          <FormField
            label="Medium"
            required
            as="select"
            value={draft.medium}
            placeholder="Select medium"
            options={mediums}
            onChange={(v) => onChange({ medium: v })}
            error={errors.medium}
          />

          <div className={styles.field}>
            <span className={styles.label}>
              Dimensions<span className={styles.required}>*</span>
            </span>
            <div className={styles.dimensions}>
              <input
                className={[styles.input, errors.dimensions && styles.invalid].filter(Boolean).join(' ')}
                placeholder="Height"
                inputMode="decimal"
                value={draft.height}
                onChange={(e) => onChange({ height: e.target.value })}
                aria-label="Height"
              />
              <input
                className={[styles.input, errors.dimensions && styles.invalid].filter(Boolean).join(' ')}
                placeholder="Width"
                inputMode="decimal"
                value={draft.width}
                onChange={(e) => onChange({ width: e.target.value })}
                aria-label="Width"
              />
              <input
                className={styles.input}
                placeholder="Depth (optional)"
                inputMode="decimal"
                value={draft.depth}
                onChange={(e) => onChange({ depth: e.target.value })}
                aria-label="Depth, optional"
              />
              <span className={styles.unitWrap}>
                <select
                  className={styles.unit}
                  value={draft.unit}
                  onChange={(e) => onChange({ unit: e.target.value as 'cm' | 'in' })}
                  aria-label="Unit"
                >
                  {dimensionUnits.map((unit) => (
                    <option key={unit}>{unit}</option>
                  ))}
                </select>
                <Icon name="chevron-down" size={14} className={styles.unitCaret} />
              </span>
            </div>
            {errors.dimensions && <p className={styles.error}>{errors.dimensions}</p>}
          </div>

          <FormField
            label="Category"
            required
            as="select"
            value={draft.category}
            placeholder="Select category"
            options={categories}
            onChange={(v) => onChange({ category: v })}
            error={errors.category}
          />

          <div className={styles.field}>
            <span className={styles.label}>Tags</span>
            <input
              className={styles.input}
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={addTag}
              aria-label="Add a tag"
            />
            {draft.tags.length > 0 && (
              <div className={styles.chips}>
                {draft.tags.map((tag) => (
                  <span className={styles.chip} key={tag}>
                    {tag}
                    <button
                      type="button"
                      className={styles.chipRemove}
                      onClick={() => onChange({ tags: draft.tags.filter((t) => t !== tag) })}
                      aria-label={`Remove ${tag}`}
                    >
                      <Icon name="close" size={11} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className={styles.col}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="artwork-description">
              Description<span className={styles.required}>*</span>
            </label>
            <div className={styles.counted}>
              <textarea
                id="artwork-description"
                className={[styles.textarea, errors.description && styles.invalid]
                  .filter(Boolean)
                  .join(' ')}
                rows={5}
                maxLength={DESCRIPTION_LIMIT}
                placeholder="Describe your artwork, inspiration, materials, and the story behind it..."
                value={draft.description}
                onChange={(e) => onChange({ description: e.target.value })}
              />
              <span className={styles.counter}>
                {draft.description.length} / {DESCRIPTION_LIMIT}
              </span>
            </div>
            {errors.description && <p className={styles.error}>{errors.description}</p>}
          </div>

          <FormField
            label="Collection (Optional)"
            as="select"
            value={draft.collection}
            placeholder={
              collections.length > 0 ? 'Select or create a collection' : 'No collections yet'
            }
            options={collections}
            onChange={(v) => onChange({ collection: v })}
          />

          <FormField
            label="Materials"
            value={draft.materials}
            placeholder="e.g. Oil paints, Canvas, Charcoal"
            hint="Separate multiple materials with commas"
            onChange={(v) => onChange({ materials: v })}
          />

          <fieldset className={styles.field}>
            <legend className={styles.label}>
              Artwork Type<span className={styles.required}>*</span>
            </legend>
            <div className={styles.radios}>
              {artworkTypes.map((type) => (
                <label className={styles.radio} key={type.id}>
                  <input
                    type="radio"
                    name="artworkType"
                    value={type.id}
                    checked={draft.artworkType === type.id}
                    onChange={() => onChange({ artworkType: type.id as ArtworkType })}
                  />
                  <span className={styles.radioCopy}>
                    <span className={styles.radioLabel}>{type.label}</span>
                    <span className={styles.radioDetail}>{type.detail}</span>
                  </span>
                </label>
              ))}
            </div>

            {/* Edition size only means something for a series. */}
            {draft.artworkType !== 'original' && (
              <div className={styles.editionSize}>
                <FormField
                  label="Edition size"
                  type="number"
                  value={draft.editionSize}
                  placeholder="e.g. 25"
                  onChange={(v) => onChange({ editionSize: v })}
                />
              </div>
            )}
          </fieldset>
        </div>
      </div>
    </section>
  );
}
