import { useRef, useState, type DragEvent } from 'react';
import { Icon } from '../ui/Icon';
import { formatBytes } from '../../services/artworkImages';
import {
  DOCUMENT_LIMITS,
  documentTypes,
  type ArtworkDocument,
  type DocumentType,
} from '../../services/artworkDocuments';
import styles from './DocumentUploadCard.module.css';

/** Step 4 of the guided flow: evidence and supporting files.
 *
 *  The type is chosen *before* the upload rather than corrected afterwards —
 *  an untyped pile of files is exactly what a Passport review can't use. */
export function DocumentUploadCard({
  documents,
  uploading,
  error,
  onAdd,
  onRemove,
  onSetType,
  onOpen,
}: {
  documents: ArtworkDocument[];
  uploading: boolean;
  error: string | null;
  onAdd: (files: FileList | File[], type: DocumentType) => void;
  onRemove: (doc: ArtworkDocument) => void;
  onSetType: (doc: ArtworkDocument, type: DocumentType) => void;
  onOpen: (doc: ArtworkDocument) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [pendingType, setPendingType] = useState<DocumentType>('ownership');

  const full = documents.length >= DOCUMENT_LIMITS.maxFiles;

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    if (event.dataTransfer.files.length > 0) onAdd(event.dataTransfer.files, pendingType);
  };

  const chosen = documentTypes.find((t) => t.id === pendingType);

  return (
    <section className={styles.card}>
      <header className={styles.head}>
        <div>
          <h2 className={styles.title}>Evidence &amp; Supporting Files</h2>
          <p className={styles.subtitle}>
            Optional. These stay private to you and back a Passport review later.
          </p>
        </div>
        <span className={styles.privateTag}>
          <Icon name="lock" size={13} />
          Private
        </span>
      </header>

      {/* ── What kind of document ── */}
      <label className={styles.typeField}>
        <span className={styles.typeLabel}>What are you adding?</span>
        <span className={styles.selectWrap}>
          <select
            className={styles.select}
            value={pendingType}
            onChange={(e) => setPendingType(e.target.value as DocumentType)}
          >
            {documentTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
          <Icon name="chevron-down" size={14} className={styles.caret} />
        </span>
      </label>
      {chosen && <p className={styles.typeHint}>{chosen.strengthens}</p>}

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
        <Icon name="file-text" size={26} className={styles.dropIcon} />
        <p className={styles.dropTitle}>
          {full ? 'You’ve reached the document limit' : 'Drag and drop your documents here'}
        </p>
        {!full && <p className={styles.dropOr}>or</p>}

        <input
          ref={inputRef}
          type="file"
          className={styles.fileInput}
          accept={DOCUMENT_LIMITS.accept.join(',')}
          multiple
          onChange={(e) => {
            if (e.target.files) onAdd(e.target.files, pendingType);
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
          {DOCUMENT_LIMITS.acceptLabel} • Max 15MB per file • Up to{' '}
          {DOCUMENT_LIMITS.maxFiles} documents
        </p>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* ── Attached ── */}
      {documents.length > 0 && (
        <>
          <div className={styles.listHead}>
            <h3 className={styles.listTitle}>
              Attached Documents ({documents.length}/{DOCUMENT_LIMITS.maxFiles})
            </h3>
          </div>

          <ul className={styles.list}>
            {documents.map((doc) => (
              <li className={styles.row} key={doc.id}>
                <span className={styles.fileIcon}>
                  <Icon name="file-text" size={17} />
                </span>

                <div className={styles.rowCopy}>
                  <p className={styles.fileName}>{doc.fileName}</p>
                  <p className={styles.fileMeta}>{formatBytes(doc.fileSize)}</p>
                </div>

                <label className={styles.rowType}>
                  <span className="visually-hidden">Document type for {doc.fileName}</span>
                  <select
                    value={doc.documentType}
                    onChange={(e) => onSetType(doc, e.target.value as DocumentType)}
                  >
                    {documentTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Icon name="chevron-down" size={13} />
                </label>

                <div className={styles.rowActions}>
                  <button
                    type="button"
                    className={styles.rowBtn}
                    onClick={() => onOpen(doc)}
                    aria-label={`Open ${doc.fileName}`}
                  >
                    <Icon name="eye" size={15} />
                  </button>
                  <button
                    type="button"
                    className={[styles.rowBtn, styles.rowBtnDanger].join(' ')}
                    onClick={() => onRemove(doc)}
                    aria-label={`Remove ${doc.fileName}`}
                  >
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className={styles.assurance}>
        <Icon name="shield-check" size={17} className={styles.assuranceIcon} />
        <span>
          <strong>These files are never published</strong>
          They are visible only to you and to a reviewer you ask for a Passport. They are not
          shown alongside your artwork.
        </span>
      </p>
    </section>
  );
}
