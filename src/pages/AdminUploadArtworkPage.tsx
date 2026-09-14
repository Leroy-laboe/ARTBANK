import { useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { FormField } from '../components/artspace/FormField';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { AdminImageDropzone, type AdminDraftImage } from '../components/admin/AdminImageDropzone';
import { AdminManageUploadsPanel } from '../components/admin/AdminManageUploadsPanel';
import { adminImageRejectionReason } from '../lib/adminImages';
import { categories, dimensionUnits, mediums } from '../data/artspaceAddArtwork';
import { useSession } from '../lib/sessionContext';
import { createArtworkForEntrant, describeAdminError } from '../services/admin';
import { uploadArtworkImage } from '../services/artworkImages';
import styles from './AdminUploadArtworkPage.module.css';

type Draft = {
  entrantName: string;
  title: string;
  year: string;
  medium: string;
  discipline: string;
  description: string;
  height: string;
  width: string;
  unit: 'cm' | 'in';
};

const emptyDraft: Draft = {
  entrantName: '',
  title: '',
  year: '',
  medium: '',
  discipline: '',
  description: '',
  height: '',
  width: '',
  unit: 'cm',
};

type Errors = Partial<Record<'entrantName' | 'title' | 'discipline' | 'images', string>>;

/** Admin → Upload Artwork — docs/pivot-checklist/29-feature-admin-functions.md's
 *  function #1: creating an artwork record for someone without an account
 *  (competition entries and the like). `artist_id` stays null; the entrant's
 *  name is typed in by hand since there's no account to pull it from.
 *
 *  Requires migration 0035 and a signed-in admin — with neither (a fresh
 *  clone, or the VITE_ARTSPACE_OPEN design-mode bypass with no session) this
 *  still confirms locally rather than blocking the screen, same as the rest
 *  of the prototype's demo fallbacks. */
export function AdminUploadArtworkPage() {
  const { profile } = useSession();
  const [tab, setTab] = useState<'new' | 'manage'>('new');
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Errors>({});
  const [images, setImages] = useState<AdminDraftImage[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [justUploaded, setJustUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const update = (patch: Partial<Draft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key as keyof Errors];
      return next;
    });
  };

  const addImages = (files: FileList | File[]) => {
    setImageError(null);
    const incoming = Array.from(files);
    const accepted: AdminDraftImage[] = [];

    for (const file of incoming) {
      const reason = adminImageRejectionReason(file, images.length + accepted.length);
      if (reason) {
        setImageError(reason);
        break;
      }
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random()}`,
        url: URL.createObjectURL(file),
        fileName: file.name,
        file,
      });
    }
    if (accepted.length > 0) {
      setImages((prev) => [...prev, ...accepted]);
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  const removeImage = (image: AdminDraftImage) => {
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    URL.revokeObjectURL(image.url);
  };

  function validate(): Errors {
    const found: Errors = {};
    if (!draft.entrantName.trim()) found.entrantName = 'Enter the entrant’s name.';
    if (!draft.title.trim()) found.title = 'Enter a title.';
    if (!draft.discipline) found.discipline = 'Select a discipline.';
    if (images.length === 0) found.images = 'Add at least one image.';
    return found;
  }

  function resetForm() {
    images.forEach((image) => URL.revokeObjectURL(image.url));
    setDraft(emptyDraft);
    setImages([]);
    setImageError(null);
    setErrors({});
  }

  async function submit(andAddAnother: boolean) {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // No backend, or no signed-in admin to attribute this record to (the
    // design-mode bypass lets someone reach this screen with no session at
    // all) — confirm locally rather than block the screen.
    if (!profile) {
      setSavedCount((n) => n + 1);
      if (andAddAnother) resetForm();
      else setJustUploaded(true);
      return;
    }

    setSaving(true);
    setSaveError(null);
    try {
      const id = await createArtworkForEntrant(profile, {
        entrantName: draft.entrantName.trim(),
        title: draft.title.trim(),
        year: draft.year ? Number(draft.year) : null,
        medium: draft.medium,
        discipline: draft.discipline,
        description: draft.description.trim(),
        height: draft.height ? Number(draft.height) : null,
        width: draft.width ? Number(draft.width) : null,
        unit: draft.unit,
      });

      // Sequential, so a failure partway through doesn't leave the surviving
      // images out of order.
      let position = 0;
      for (const image of images) {
        await uploadArtworkImage(id, image.file, position);
        position += 1;
      }

      setSavedCount((n) => n + 1);
      if (andAddAnother) resetForm();
      else setJustUploaded(true);
    } catch (err) {
      setSaveError(describeAdminError(err));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <AdminPageHeader
          title="Upload Artwork"
          subtitle="Create an artwork record for someone without an account."
        />

        <div className={styles.tabs} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'new'}
            className={[styles.tab, tab === 'new' && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setTab('new')}
          >
            Upload New
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'manage'}
            className={[styles.tab, tab === 'manage' && styles.tabActive].filter(Boolean).join(' ')}
            onClick={() => setTab('manage')}
          >
            My Uploads
          </button>
        </div>

        {tab === 'manage' && <AdminManageUploadsPanel />}

        {tab === 'new' && (
        <>
        {saveError && (
          <p className={styles.saveError}>
            <Icon name="x-circle" size={14} />
            {saveError}
          </p>
        )}

        {savedCount > 0 && !justUploaded && !saveError && (
          <p className={styles.savedNote}>
            <Icon name="check-circle" size={14} />
            {savedCount} {savedCount === 1 ? 'entry' : 'entries'} saved this session.
          </p>
        )}

        {justUploaded ? (
          <div className={styles.success}>
            <Icon name="check-circle" size={28} className={styles.successIcon} />
            <p className={styles.successTitle}>Artwork uploaded</p>
            <p className={styles.successNote}>
              The record for {draft.entrantName || 'this entrant'} has been created. It'll appear
              in Link Artworks once they register an account.
            </p>
            <Button
              variant="primary"
              onClick={() => {
                resetForm();
                setJustUploaded(false);
              }}
            >
              Upload Another
            </Button>
          </div>
        ) : (
          <div className={styles.card}>
            <div className={styles.grid}>
              <div className={styles.col}>
                <FormField
                  label="Entrant Name"
                  required
                  value={draft.entrantName}
                  placeholder="Name of the entrant (no account required)"
                  onChange={(v) => update({ entrantName: v })}
                  error={errors.entrantName}
                />

                <FormField
                  label="Title"
                  required
                  value={draft.title}
                  placeholder="e.g. Morning Light"
                  onChange={(v) => update({ title: v })}
                  error={errors.title}
                />

                <FormField
                  label="Year"
                  type="number"
                  value={draft.year}
                  placeholder="e.g. 2024"
                  onChange={(v) => update({ year: v })}
                />

                <FormField
                  label="Medium"
                  as="select"
                  value={draft.medium}
                  placeholder="Select medium"
                  options={mediums}
                  onChange={(v) => update({ medium: v })}
                />

                <div className={styles.field}>
                  <span className={styles.label}>Dimensions</span>
                  <div className={styles.dimensions}>
                    <input
                      className={styles.input}
                      placeholder="H"
                      inputMode="decimal"
                      value={draft.height}
                      onChange={(e) => update({ height: e.target.value })}
                      aria-label="Height"
                    />
                    <input
                      className={styles.input}
                      placeholder="W"
                      inputMode="decimal"
                      value={draft.width}
                      onChange={(e) => update({ width: e.target.value })}
                      aria-label="Width"
                    />
                    <select
                      className={styles.unit}
                      value={draft.unit}
                      onChange={(e) => update({ unit: e.target.value as 'cm' | 'in' })}
                      aria-label="Unit"
                    >
                      {dimensionUnits.map((unit) => (
                        <option key={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.col}>
                <div className={styles.field}>
                  <span className={styles.label}>
                    Artwork Images<span className={styles.required}>*</span>
                  </span>
                  <AdminImageDropzone images={images} onAdd={addImages} onRemove={removeImage} error={imageError} />
                  {errors.images && <p className={styles.error}>{errors.images}</p>}
                </div>

                <FormField
                  label="Discipline"
                  required
                  as="select"
                  value={draft.discipline}
                  placeholder="Select discipline"
                  options={categories}
                  onChange={(v) => update({ discipline: v })}
                  error={errors.discipline}
                />

                <FormField
                  label="Description"
                  as="textarea"
                  rows={4}
                  value={draft.description}
                  placeholder="A study of light and atmosphere along the coast..."
                  onChange={(v) => update({ description: v })}
                />
              </div>
            </div>

            <div className={styles.actions}>
              <Button variant="secondary" onClick={() => submit(true)} disabled={saving}>
                Save &amp; Add Another
              </Button>
              <Button variant="primary" onClick={() => submit(false)} disabled={saving}>
                {saving ? 'Uploading…' : 'Upload Artwork'}
              </Button>
            </div>
          </div>
        )}
        </>
        )}
      </main>
    </div>
  );
}
