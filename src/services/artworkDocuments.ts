import { supabase } from '../lib/supabaseClient';

/** Evidence and supporting files behind an artwork record — step 7 of
 *  docs/pivot-checklist/10-add-artwork.md.
 *
 *  Files go to the **private** `artwork-documents` bucket, so nothing here has
 *  a public URL: viewing one means minting a short-lived signed URL. That is
 *  the difference from artworkImages.ts, and it is deliberate — these are
 *  ownership proofs and invoices, not pictures of the work.
 *
 *  Requires migration 0020. */

export const DOCUMENT_LIMITS = {
  maxFiles: 12,
  maxBytes: 15 * 1024 * 1024,
  accept: [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  acceptLabel: 'PDF, JPG, PNG or Word',
};

export type DocumentType =
  | 'ownership'
  | 'certificate'
  | 'exhibition'
  | 'condition'
  | 'invoice'
  | 'appraisal'
  | 'other';

/** `strengthens` says what the document does for a Passport review, so the
 *  artist can tell which upload is worth the effort. */
export const documentTypes: { id: DocumentType; label: string; strengthens: string }[] = [
  { id: 'ownership', label: 'Ownership proof', strengthens: 'Shows the work is yours to record.' },
  { id: 'certificate', label: 'Certificate of authenticity', strengthens: 'Supports a COA request.' },
  { id: 'exhibition', label: 'Exhibition record', strengthens: 'Adds where the work has been shown.' },
  { id: 'condition', label: 'Condition report', strengthens: 'Documents the current physical state.' },
  { id: 'invoice', label: 'Invoice or receipt', strengthens: 'Evidence of a past sale or commission.' },
  { id: 'appraisal', label: 'Appraisal', strengthens: 'A third-party assessment you already hold.' },
  { id: 'other', label: 'Other supporting file', strengthens: 'Anything else that backs the record.' },
];

export type ArtworkDocument = {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  documentType: DocumentType;
  storagePath: string | null;
  uploadedAt: string;
};

type DocumentRow = {
  id: string;
  file_url: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  document_type: string;
  storage_path: string | null;
  uploaded_at: string;
};

const SELECT = 'id, file_url, file_name, file_type, file_size, document_type, storage_path, uploaded_at';

function fromRow(row: DocumentRow): ArtworkDocument {
  return {
    id: row.id,
    fileName: row.file_name ?? 'document',
    fileType: row.file_type ?? '',
    fileSize: Number(row.file_size ?? 0),
    documentType: (row.document_type as DocumentType) ?? 'other',
    storagePath: row.storage_path,
    uploadedAt: row.uploaded_at,
  };
}

/** Checks a file before it costs the artist an upload. Returns null if fine. */
export function documentRejectionReason(file: File, existingCount: number): string | null {
  if (existingCount >= DOCUMENT_LIMITS.maxFiles) {
    return `You can attach up to ${DOCUMENT_LIMITS.maxFiles} documents.`;
  }
  if (!DOCUMENT_LIMITS.accept.includes(file.type)) {
    return `${file.name} isn’t a supported format. Use ${DOCUMENT_LIMITS.acceptLabel}.`;
  }
  if (file.size > DOCUMENT_LIMITS.maxBytes) {
    return `${file.name} is over 15MB.`;
  }
  return null;
}

export async function listArtworkDocuments(artworkId: string): Promise<ArtworkDocument[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('artwork_evidence_files')
    .select(SELECT)
    .eq('artwork_id', artworkId)
    .order('uploaded_at', { ascending: true });
  if (error || !data) return [];
  return (data as DocumentRow[]).map(fromRow);
}

export async function uploadArtworkDocument(
  artworkId: string,
  file: File,
  documentType: DocumentType,
): Promise<ArtworkDocument> {
  if (!supabase) throw new Error('No storage is configured, so documents cannot be uploaded yet.');

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'pdf';
  const storagePath = `${artworkId}/${Date.now()}-${documentType}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('artwork-documents')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  // The bucket is private, so file_url holds the storage path rather than a
  // URL anyone could open. Viewing goes through documentUrl() below.
  const { data, error } = await supabase
    .from('artwork_evidence_files')
    .insert({
      artwork_id: artworkId,
      file_url: storagePath,
      storage_path: storagePath,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      document_type: documentType,
    })
    .select(SELECT)
    .single();

  if (error || !data) {
    // Don't leave the file behind if its row failed to save.
    await supabase.storage.from('artwork-documents').remove([storagePath]);
    throw error ?? new Error('Could not save the document.');
  }

  // Evidence arriving is a provenance event. Best-effort: a failed history
  // write shouldn't lose the upload.
  await supabase
    .from('artwork_history_events')
    .insert({
      artwork_id: artworkId,
      event_type: 'evidence',
      description: `${documentTypes.find((t) => t.id === documentType)?.label ?? 'Document'} added.`,
    });

  return fromRow(data as DocumentRow);
}

export async function deleteArtworkDocument(doc: ArtworkDocument): Promise<void> {
  if (!supabase) throw new Error('No storage is configured.');
  const { error } = await supabase.from('artwork_evidence_files').delete().eq('id', doc.id);
  if (error) throw error;
  if (doc.storagePath) {
    await supabase.storage.from('artwork-documents').remove([doc.storagePath]);
  }
}

export async function setDocumentType(id: string, documentType: DocumentType): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('artwork_evidence_files')
    .update({ document_type: documentType })
    .eq('id', id);
  if (error) throw error;
}

/** A short-lived link to a private document. Expires in five minutes, so a
 *  copied URL doesn't turn into a permanent public one. */
export async function documentUrl(doc: ArtworkDocument): Promise<string | null> {
  if (!supabase || !doc.storagePath) return null;
  const { data, error } = await supabase.storage
    .from('artwork-documents')
    .createSignedUrl(doc.storagePath, 300);
  if (error || !data) return null;
  return data.signedUrl;
}
