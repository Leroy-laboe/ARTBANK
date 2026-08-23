import { useRef, useState, type DragEvent } from 'react';
import { Icon } from '../ui/Icon';
import { RowMenu } from './RowMenu';
import {
  formatBytes,
  IMAGE_LIMITS,
  imageRoles,
  type ArtworkImage,
  type ImageRole,
} from '../../services/artworkImages';
import styles from './ImageUploadCard.module.css';

/** Step 2 of the guided flow: the artwork's images.
 *
 *  Reordering is done with explicit move controls rather than drag-and-drop,
 *  so it works from the keyboard and on touch without a pointer. */
export function ImageUploadCard({
  images,
  uploading,
  error,
  onAdd,
  onRemove,
  onSetCover,
  onSetRole,
  onMove,
}: {
  images: ArtworkImage[];
  uploading: boolean;
  error: string | null;
  onAdd: (files: FileList | File[]) => void;
  onRemove: (image: ArtworkImage) => void;
  onSetCover: (image: ArtworkImage) => void;
  onSetRole: (image: ArtworkImage, role: ImageRole) => void;
  onMove: (image: ArtworkImage, direction: -1 | 1) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [reordering, setReordering] = useState(false);

  const full = images.length >= IMAGE_LIMITS.maxFiles;

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) onAdd(event.dataTransfer.files);
  };

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Upload Images</h2>
          <p className={styles.subtitle}>
            Add high-quality images of your artwork. You can reorder them after upload.
          </p>
        </div>
        <span className={styles.tipsLink}>
          Tips for great images
          <Icon name="info" size={14} />
        </span>
      </header>

      {/* ── Dropzone ── */}
      <div
        className={[styles.dropzone, dragOver && styles.dropzoneActive, full && styles.dropzoneFull]
          .filter(Boolean)
          .join(' ')}
        onDragOver={(e) => {
          e.preventDefault();
          if (!full) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <Icon name="upload" size={26} className={styles.dropIcon} />
        <p className={styles.dropTitle}>
          {full ? 'You’ve reached the image limit' : 'Drag and drop your images here'}
        </p>
        {!full && <p className={styles.dropOr}>or</p>}

        <input
          ref={inputRef}
          type="file"
          className={styles.fileInput}
          accept={IMAGE_LIMITS.accept.join(',')}
          multiple
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files);
            e.target.value = '';
          }}
        />

        {!full && (
          <button
            type="button"
            className={styles.chooseBtn}
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : 'Choose Files'}
          </button>
        )}

        <p className={styles.dropHint}>
          {IMAGE_LIMITS.acceptLabel} • Max 20MB per file • Recommended min.{' '}
          {IMAGE_LIMITS.recommendedMinPx}px
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ── Uploaded ── */}
      {images.length > 0 && (
        <>
          <div className={styles.listHead}>
            <div>
              <h3 className={styles.listTitle}>
                Uploaded Images ({images.length}/{IMAGE_LIMITS.maxFiles})
              </h3>
              <p className={styles.listNote}>
                You can upload up to {IMAGE_LIMITS.maxFiles} images.
              </p>
            </div>
            <button
              type="button"
              className={[styles.reorderBtn, reordering && styles.reorderBtnActive]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setReordering((v) => !v)}
              aria-pressed={reordering}
            >
              <Icon name="sliders" size={15} />
              {reordering ? 'Done Reordering' : 'Reorder Images'}
            </button>
          </div>

          <ul className={styles.grid}>
            {images.map((image, index) => (
              <li className={styles.tile} key={image.id}>
                <div className={styles.thumbWrap}>
                  <img src={image.url} alt={image.fileName} className={styles.thumb} />
                  <span className={styles.index}>{index + 1}</span>

                  <span className={styles.menu}>
                    <RowMenu
                      label={`Actions for ${image.fileName}`}
                      items={[
                        {
                          id: 'cover',
                          label: 'Set as cover image',
                          icon: 'image',
                          onSelect: () => onSetCover(image),
                        },
                        ...imageRoles
                          .filter((r) => r.id !== 'cover' && r.id !== image.role)
                          .slice(0, 4)
                          .map((r) => ({
                            id: `role-${r.id}`,
                            label: `Label as ${r.label}`,
                            icon: 'tag' as const,
                            onSelect: () => onSetRole(image, r.id),
                          })),
                        {
                          id: 'remove',
                          label: 'Remove image',
                          icon: 'trash',
                          destructive: true,
                          onSelect: () => onRemove(image),
                        },
                      ]}
                    />
                  </span>

                  <span
                    className={[styles.role, image.isPrimary && styles.roleCover]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {imageRoles.find((r) => r.id === image.role)?.label ?? 'Detail'}
                  </span>

                  {reordering && (
                    <span className={styles.moveBar}>
                      <button
                        type="button"
                        onClick={() => onMove(image, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${image.fileName} earlier`}
                      >
                        <Icon name="chevron-left" size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onMove(image, 1)}
                        disabled={index === images.length - 1}
                        aria-label={`Move ${image.fileName} later`}
                      >
                        <Icon name="chevron-right" size={15} />
                      </button>
                    </span>
                  )}
                </div>

                <p className={styles.fileName}>{image.fileName}</p>
                <p className={styles.fileSize}>{formatBytes(image.fileSize)}</p>
              </li>
            ))}
          </ul>

          <p className={styles.recommendations}>
            <Icon name="shield-check" size={17} className={styles.recIcon} />
            <span>
              <strong>Image recommendations</strong>
              Use natural lighting, avoid heavy filters, and ensure the artwork fills most of the
              frame.
            </span>
          </p>
        </>
      )}
    </section>
  );
}
