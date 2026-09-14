import { useCallback, useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { FormField } from '../artspace/FormField';
import { ImageUploadCard } from '../artspace/ImageUploadCard';
import { useSession } from '../../lib/sessionContext';
import {
  deleteArtworkRecord,
  describeAdminError,
  listMyUploadedArtworks,
  updateEntrantArtwork,
} from '../../services/admin';
import {
  deleteArtworkImage,
  listArtworkImages,
  rejectionReason,
  saveImageOrder,
  setCoverImage,
  setImageRole,
  uploadArtworkImage,
  type ArtworkImage,
  type ImageRole,
} from '../../services/artworkImages';
import { categories, dimensionUnits, mediums } from '../../data/artspaceAddArtwork';
import type { AdminUploadedArtwork } from '../../types/admin';
import styles from './AdminManageUploadsPanel.module.css';

type EditDraft = {
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

function toDraft(item: AdminUploadedArtwork): EditDraft {
  return {
    entrantName: item.entrantName,
    title: item.title,
    year: item.year,
    medium: item.medium,
    discipline: item.discipline,
    description: item.description,
    height: item.height !== null ? String(item.height) : '',
    width: item.width !== null ? String(item.width) : '',
    unit: item.unit,
  };
}

/** The follow-on to Upload Artwork: everything an admin has created on
 *  behalf of an entrant, with a real edit and delete path. Reads and writes
 *  under the same "uploaded_by = you" policy the upload form already relies
 *  on, so — unlike most of services/admin.ts — none of this needs migration
 *  0035; it only ever touches records this admin's own account created. */
export function AdminManageUploadsPanel() {
  const { profile } = useSession();
  const [items, setItems] = useState<AdminUploadedArtwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);
  const [images, setImages] = useState<ArtworkImage[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!profile) {
      setItems([]);
      setIsDemo(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    listMyUploadedArtworks(profile).then((result) => {
      setItems(result.items);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(item: AdminUploadedArtwork) {
    setEditingId(item.id);
    setDraft(toDraft(item));
    setSaveError(null);
    setImageError(null);
    setImages([]);
    setImagesLoading(true);
    listArtworkImages(item.id).then((found) => {
      setImages(found);
      setImagesLoading(false);
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setImages([]);
  }

  const addImages = useCallback(
    async (files: FileList | File[]) => {
      if (!editingId) return;
      setImageError(null);
      const incoming = Array.from(files);
      const accepted: File[] = [];

      for (const file of incoming) {
        const reason = rejectionReason(file, images.length + accepted.length);
        if (reason) {
          setImageError(reason);
          break;
        }
        accepted.push(file);
      }
      if (accepted.length === 0) return;

      setImageUploading(true);
      try {
        let next = images;
        for (const file of accepted) {
          const uploaded = await uploadArtworkImage(editingId, file, next.length);
          next = [...next, uploaded];
          setImages(next);
        }
      } catch {
        setImageError('Upload failed. Check your connection and try again.');
      } finally {
        setImageUploading(false);
      }
    },
    [editingId, images],
  );

  const removeImage = async (image: ArtworkImage) => {
    setImages((prev) => prev.filter((i) => i.id !== image.id));
    try {
      await deleteArtworkImage(image);
    } catch {
      setImageError('Could not remove that image.');
    }
  };

  const chooseCover = async (image: ArtworkImage) => {
    if (!editingId) return;
    setImages((prev) =>
      prev.map((i) => ({
        ...i,
        isPrimary: i.id === image.id,
        role: i.id === image.id ? 'cover' : i.role === 'cover' ? 'detail' : i.role,
      })),
    );
    try {
      await setCoverImage(editingId, image.id);
    } catch {
      setImageError('Could not set the cover image.');
    }
  };

  const changeRole = async (image: ArtworkImage, role: ImageRole) => {
    setImages((prev) => prev.map((i) => (i.id === image.id ? { ...i, role } : i)));
    try {
      await setImageRole(image.id, role);
    } catch {
      setImageError('Could not update that label.');
    }
  };

  const moveImage = async (image: ArtworkImage, direction: -1 | 1) => {
    const from = images.findIndex((i) => i.id === image.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= images.length) return;
    const next = [...images];
    [next[from], next[to]] = [next[to], next[from]];
    setImages(next);
    try {
      await saveImageOrder(next);
    } catch {
      setImageError('Could not save the new order.');
    }
  };

  async function save() {
    if (!editingId || !draft) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateEntrantArtwork(editingId, {
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
      cancelEdit();
      load();
    } catch (err) {
      setSaveError(describeAdminError(err));
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteArtworkRecord(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      setDeletingId(null);
      if (editingId === id) cancelEdit();
    } catch (err) {
      setDeleteError(describeAdminError(err));
    } finally {
      setDeleting(false);
    }
  }

  const editing = editingId ? items.find((i) => i.id === editingId) : null;

  if (editing && draft) {
    return (
      <div className={styles.card}>
        <div className={styles.editHead}>
          <button type="button" className={styles.back} onClick={cancelEdit}>
            <Icon name="chevron-left" size={14} />
            Back to My Uploads
          </button>
        </div>

        {saveError && (
          <p className={styles.error}>
            <Icon name="x-circle" size={14} />
            {saveError}
          </p>
        )}

        <div className={styles.grid}>
          <div className={styles.col}>
            <FormField
              label="Entrant Name"
              required
              value={draft.entrantName}
              onChange={(v) => setDraft({ ...draft, entrantName: v })}
            />
            <FormField label="Title" required value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <FormField label="Year" type="number" value={draft.year} onChange={(v) => setDraft({ ...draft, year: v })} />
            <FormField
              label="Medium"
              as="select"
              value={draft.medium}
              placeholder="Select medium"
              options={mediums}
              onChange={(v) => setDraft({ ...draft, medium: v })}
            />
            <div className={styles.field}>
              <span className={styles.label}>Dimensions</span>
              <div className={styles.dimensions}>
                <input
                  className={styles.input}
                  placeholder="H"
                  inputMode="decimal"
                  value={draft.height}
                  onChange={(e) => setDraft({ ...draft, height: e.target.value })}
                  aria-label="Height"
                />
                <input
                  className={styles.input}
                  placeholder="W"
                  inputMode="decimal"
                  value={draft.width}
                  onChange={(e) => setDraft({ ...draft, width: e.target.value })}
                  aria-label="Width"
                />
                <select
                  className={styles.unit}
                  value={draft.unit}
                  onChange={(e) => setDraft({ ...draft, unit: e.target.value as 'cm' | 'in' })}
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
            <FormField
              label="Discipline"
              required
              as="select"
              value={draft.discipline}
              placeholder="Select discipline"
              options={categories}
              onChange={(v) => setDraft({ ...draft, discipline: v })}
            />
            <FormField
              label="Description"
              as="textarea"
              rows={4}
              value={draft.description}
              onChange={(v) => setDraft({ ...draft, description: v })}
            />
          </div>
        </div>

        <div className={styles.imagesSection}>
          {imagesLoading ? (
            <p className={styles.loadingNote}>Loading images…</p>
          ) : (
            <ImageUploadCard
              images={images}
              uploading={imageUploading}
              error={imageError}
              onAdd={addImages}
              onRemove={removeImage}
              onSetCover={chooseCover}
              onSetRole={changeRole}
              onMove={moveImage}
            />
          )}
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={cancelEdit} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      {deleteError && (
        <p className={styles.error}>
          <Icon name="x-circle" size={14} />
          {deleteError}
        </p>
      )}

      {loading ? (
        <p className={styles.loadingNote}>Loading your uploads…</p>
      ) : !profile ? (
        <p className={styles.emptyNote}>Sign in as an admin to see and manage what you've uploaded.</p>
      ) : isDemo ? (
        <p className={styles.emptyNote}>No database is configured yet, so there's nothing to manage here.</p>
      ) : items.length === 0 ? (
        <p className={styles.emptyNote}>
          Nothing uploaded yet. Records created from Upload Artwork will show up here.
        </p>
      ) : (
        <div className={styles.scroller}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Artwork</th>
                <th>Entrant Name</th>
                <th>Medium / Year</th>
                <th>Status</th>
                <th>Uploaded</th>
                <th className={styles.actionCol}>
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.work}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt="" className={styles.thumb} loading="lazy" />
                      ) : (
                        <span className={styles.thumbPlaceholder} aria-hidden="true">
                          <Icon name="image" size={16} />
                        </span>
                      )}
                      <span className={styles.workTitle}>{item.title}</span>
                    </div>
                  </td>
                  <td className={styles.cell}>{item.entrantName}</td>
                  <td className={styles.cell}>
                    {[item.medium, item.year].filter(Boolean).join(' • ') || '—'}
                  </td>
                  <td>
                    <span className={[styles.pill, item.claimed ? styles.pillClaimed : styles.pillUnclaimed].join(' ')}>
                      {item.claimed ? 'Claimed' : 'Unclaimed'}
                    </span>
                  </td>
                  <td className={styles.cell}>{item.uploadedDate}</td>
                  <td className={styles.actionCol}>
                    {deletingId === item.id ? (
                      <div className={styles.confirmRow}>
                        <span className={styles.confirmText}>Delete this record?</span>
                        <button
                          type="button"
                          className={styles.confirmCancel}
                          onClick={() => setDeletingId(null)}
                          disabled={deleting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className={styles.confirmDelete}
                          onClick={() => confirmDelete(item.id)}
                          disabled={deleting}
                        >
                          {deleting ? 'Deleting…' : 'Delete'}
                        </button>
                      </div>
                    ) : (
                      <div className={styles.rowActions}>
                        <button type="button" className={styles.rowBtn} onClick={() => startEdit(item)}>
                          <Icon name="edit" size={14} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className={[styles.rowBtn, styles.rowBtnDanger].join(' ')}
                          onClick={() => setDeletingId(item.id)}
                        >
                          <Icon name="trash" size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
