import { useRef, useState, type DragEvent } from 'react';
import { Icon } from '../ui/Icon';
import { ADMIN_IMAGE_LIMITS } from '../../lib/adminImages';
import styles from './AdminImageDropzone.module.css';

/** `file` is kept alongside the object-url preview so the page can upload it
 *  for real once the artwork row exists — see AdminUploadArtworkPage. */
export type AdminDraftImage = { id: string; url: string; fileName: string; file: File };

const ACCEPT = ADMIN_IMAGE_LIMITS.accept;
const MAX_FILES = ADMIN_IMAGE_LIMITS.maxFiles;

/** The Upload Artwork form's image picker. Unlike ImageUploadCard (ArtSpace's
 *  step 2) this doesn't upload as each file is added — there's no artwork id
 *  to attach them to until the form itself is submitted, so images stay
 *  local object-url previews until then. */
export function AdminImageDropzone({
  images,
  onAdd,
  onRemove,
  error,
}: {
  images: AdminDraftImage[];
  onAdd: (files: FileList | File[]) => void;
  onRemove: (image: AdminDraftImage) => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const full = images.length >= MAX_FILES;

  return (
    <div className={styles.wrap}>
      <div
        className={[styles.dropzone, dragOver && styles.dropzoneActive, full && styles.dropzoneFull]
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          setDragOver(false);
          if (!full && e.dataTransfer.files.length > 0) onAdd(e.dataTransfer.files);
        }}
      >
        <Icon name="upload" size={22} className={styles.icon} />
        <p className={styles.title}>{full ? 'Image limit reached' : 'Add images'}</p>
        {!full && (
          <button type="button" className={styles.choose} onClick={() => inputRef.current?.click()}>
            Choose Files
          </button>
        )}
        <p className={styles.hint}>JPG, PNG — max 10MB each</p>
        <input
          ref={inputRef}
          type="file"
          className={styles.input}
          accept={ACCEPT.join(',')}
          multiple
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {images.length > 0 && (
        <ul className={styles.grid}>
          {images.map((image) => (
            <li className={styles.tile} key={image.id}>
              <img src={image.url} alt={image.fileName} className={styles.thumb} />
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${image.fileName}`}
                onClick={() => onRemove(image)}
              >
                <Icon name="close" size={12} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
