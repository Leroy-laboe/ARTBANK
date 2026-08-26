import { Icon } from '../ui/Icon';
import {
  availabilityStatuses,
  permittedUses as allPermittedUses,
  priceTypes,
  visibilityOptions,
} from '../../data/artspaceAddArtwork';
import { formatDimensions, type ArtworkDraft, type ReviewItem } from './artworkDraft';
import styles from './ReviewSummaryCard.module.css';

/** Step 9 of the spec: review before publishing.
 *
 *  Reads the record back rather than congratulating the artist on it. Anything
 *  they didn't fill in shows as "Not set" and stays editable — the checklist
 *  names the incomplete step, which is what the Artwork Readiness Scan
 *  (docs/pivot-checklist/18-feature-artwork-readiness-scan.md) needs too. */

type Row = { label: string; value: string };

function priceLine(draft: ArtworkDraft): string {
  const type = priceTypes.find((p) => p.id === draft.priceType)?.label ?? '—';
  if (draft.priceType === 'on_request') return type;
  if (draft.priceType === 'range') {
    if (!draft.price || !draft.priceMax) return `${type} · Not set`;
    return `${draft.currency} ${Number(draft.price).toLocaleString('en-US')} – ${Number(draft.priceMax).toLocaleString('en-US')}`;
  }
  if (!draft.price) return `${type} · Not set`;
  return `${draft.currency} ${Number(draft.price).toLocaleString('en-US')}`;
}

const orNotSet = (value: string) => (value.trim() ? value : 'Not set');

export function ReviewSummaryCard({
  draft,
  checklist,
  imageCount,
  documentCount,
  coverUrl,
  onGoToStep,
}: {
  draft: ArtworkDraft;
  checklist: ReviewItem[];
  imageCount: number;
  documentCount: number;
  coverUrl?: string;
  onGoToStep: (step: string) => void;
}) {
  const outstanding = checklist.filter((item) => !item.done);

  const detailRows: Row[] = [
    { label: 'Title', value: orNotSet(draft.title) },
    { label: 'Year', value: orNotSet(draft.year) },
    { label: 'Medium', value: orNotSet(draft.medium) },
    { label: 'Dimensions', value: orNotSet(formatDimensions(draft)) },
    { label: 'Category', value: orNotSet(draft.category) },
    { label: 'Materials', value: orNotSet(draft.materials) },
  ];

  const availabilityRows: Row[] = [
    { label: 'Price', value: priceLine(draft) },
    {
      label: 'Availability',
      value:
        availabilityStatuses.find((a) => a.id === draft.availabilityStatus)?.label ?? 'Not set',
    },
    { label: 'Ships from', value: orNotSet(draft.shipsFrom) },
    {
      label: 'Ships to',
      value: draft.shippingRegions.length ? draft.shippingRegions.join(', ') : 'Not set',
    },
  ];

  const grantedUses = allPermittedUses.filter((u) => draft.permittedUses.includes(u.id));
  const visibility = visibilityOptions.find((v) => v.id === draft.visibility);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Review</h2>
          <p className={styles.subtitle}>
            Check the record before you publish. Everything here stays editable afterwards.
          </p>
        </div>
      </header>

      {/* ── Checklist ── */}
      <div className={styles.checklist}>
        <p className={styles.checklistHead}>
          {outstanding.length === 0
            ? 'Every step is complete.'
            : `${outstanding.length} step${outstanding.length === 1 ? '' : 's'} still open — none of them block publishing.`}
        </p>

        <ul className={styles.checkList}>
          {checklist.map((item) => (
            <li key={item.id} className={styles.checkItem}>
              <Icon
                name={item.done ? 'check-circle' : 'circle-dashed'}
                size={15}
                className={item.done ? styles.checkDone : styles.checkOpen}
              />
              <span className={item.done ? undefined : styles.checkOpenLabel}>{item.label}</span>
              {!item.done && (
                <button
                  type="button"
                  className={styles.checkLink}
                  onClick={() => onGoToStep(item.step)}
                >
                  Complete
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* ── The record ── */}
      <div className={styles.preview}>
        {coverUrl ? (
          <img src={coverUrl} alt="" className={styles.cover} />
        ) : (
          <div className={styles.coverEmpty}>
            <Icon name="image" size={20} />
            <span>No images</span>
          </div>
        )}
        <div className={styles.previewCopy}>
          <p className={styles.previewTitle}>{orNotSet(draft.title)}</p>
          <p className={styles.previewMeta}>
            {[draft.year, draft.medium].filter(Boolean).join(' • ') || 'Details incomplete'}
          </p>
          <p className={styles.previewCounts}>
            {imageCount} image{imageCount === 1 ? '' : 's'} · {documentCount} document
            {documentCount === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <Group label="Details" step="details" rows={detailRows} onGoToStep={onGoToStep} />

      <div className={styles.group}>
        <div className={styles.groupHead}>
          <h3 className={styles.groupTitle}>Description</h3>
          <button type="button" className={styles.edit} onClick={() => onGoToStep('details')}>
            Edit
          </button>
        </div>
        <p className={styles.description}>
          {draft.description.trim() || 'Not set — this is what people read first.'}
        </p>
      </div>

      <Group
        label="Pricing & Availability"
        step="availability"
        rows={availabilityRows}
        onGoToStep={onGoToStep}
      />

      <div className={styles.group}>
        <div className={styles.groupHead}>
          <h3 className={styles.groupTitle}>Rights &amp; Visibility</h3>
          <button type="button" className={styles.edit} onClick={() => onGoToStep('review')}>
            Edit
          </button>
        </div>

        <dl className={styles.rows}>
          <div className={styles.row}>
            <dt>Visibility</dt>
            <dd>{visibility ? `${visibility.label} — ${visibility.detail}` : 'Not set'}</dd>
          </div>
          <div className={styles.row}>
            <dt>Permitted uses</dt>
            <dd>
              {grantedUses.length === 0
                ? 'None — every use has to be requested from you first.'
                : grantedUses.map((u) => u.label).join(', ')}
            </dd>
          </div>
          {draft.rightsNote.trim() && (
            <div className={styles.row}>
              <dt>Your note</dt>
              <dd>{draft.rightsNote}</dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
}

function Group({
  label,
  step,
  rows,
  onGoToStep,
}: {
  label: string;
  step: string;
  rows: Row[];
  onGoToStep: (step: string) => void;
}) {
  return (
    <div className={styles.group}>
      <div className={styles.groupHead}>
        <h3 className={styles.groupTitle}>{label}</h3>
        <button type="button" className={styles.edit} onClick={() => onGoToStep(step)}>
          Edit
        </button>
      </div>

      <dl className={styles.rows}>
        {rows.map((row) => (
          <div className={styles.row} key={row.label}>
            <dt>{row.label}</dt>
            <dd className={row.value === 'Not set' ? styles.unset : undefined}>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
