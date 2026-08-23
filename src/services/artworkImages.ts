import { supabase } from '../lib/supabaseClient';

/** Uploads and manages the image files behind an artwork record.
 *
 *  Files go to the public `artwork-images` storage bucket; one row per file
 *  lands in public.artwork_images. Requires migrations 0011 and 0018. */

export const IMAGE_LIMITS = {
  maxFiles: 10,
  maxBytes: 20 * 1024 * 1024,
  accept: ['image/jpeg', 'image/png', 'image/webp'],
  acceptLabel: 'JPG, PNG or WebP',
  recommendedMinPx: 2000,
};

export type ImageRole = 'cover' | 'front' | 'back' | 'side' | 'detail' | 'framed' | 'in_situ' | 'signature';

export const imageRoles: { id: ImageRole; label: string }[] = [
  { id: 'cover', label: 'Cover Image' },
  { id: 'front', label: 'Front View' },
  { id: 'back', label: 'Back View' },
  { id: 'side', label: 'Side View' },
  { id: 'detail', label: 'Detail' },
  { id: 'framed', label: 'Framed' },
  { id: 'in_situ', label: 'In Situ' },
  { id: 'signature', label: 'Signature' },
];

export type ArtworkImage = {
  id: string;
  url: string;
  storagePath: string | null;
  position: number;
  isPrimary: boolean;
  role: ImageRole;
  fileName: string;
  fileSize: number;
};

type ImageRow = {
  id: string;
  url: string;
  storage_path: string | null;
  position: number;
  is_primary: boolean;
  role: string;
  file_name: string | null;
  file_size: number | null;
};

function fromRow(row: ImageRow): ArtworkImage {
  return {
    id: row.id,
    url: row.url,
    storagePath: row.storage_path,
    position: row.position,
    isPrimary: row.is_primary,
    role: (row.role as ImageRole) ?? 'detail',
    fileName: row.file_name ?? 'image',
    fileSize: Number(row.file_size ?? 0),
  };
}

const SELECT = 'id, url, storage_path, position, is_primary, role, file_name, file_size';

/** Checks a file before it costs the artist an upload. Returns null if fine. */
export function rejectionReason(file: File, existingCount: number): string | null {
  if (existingCount >= IMAGE_LIMITS.maxFiles) {
    return `You can upload up to ${IMAGE_LIMITS.maxFiles} images.`;
  }
  if (!IMAGE_LIMITS.accept.includes(file.type)) {
    return `${file.name} isn’t a supported format. Use ${IMAGE_LIMITS.acceptLabel}.`;
  }
  if (file.size > IMAGE_LIMITS.maxBytes) {
    return `${file.name} is over 20MB.`;
  }
  return null;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

export async function listArtworkImages(artworkId: string): Promise<ArtworkImage[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('artwork_images')
    .select(SELECT)
    .eq('artwork_id', artworkId)
    .order('position', { ascending: true });
  if (error || !data) return [];
  return (data as ImageRow[]).map(fromRow);
}

/** Uploads one file and records it. The first image on a record becomes the
 *  cover automatically — a record with images but no cover has nothing to
 *  show on a card. */
export async function uploadArtworkImage(
  artworkId: string,
  file: File,
  position: number,
): Promise<ArtworkImage> {
  if (!supabase) throw new Error('No storage is configured, so images cannot be uploaded yet.');

  const extension = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const storagePath = `${artworkId}/${Date.now()}-${position}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from('artwork-images')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: publicUrl } = supabase.storage.from('artwork-images').getPublicUrl(storagePath);

  const isFirst = position === 0;
  const { data, error } = await supabase
    .from('artwork_images')
    .insert({
      artwork_id: artworkId,
      url: publicUrl.publicUrl,
      storage_path: storagePath,
      position,
      is_primary: isFirst,
      role: isFirst ? 'cover' : 'detail',
      file_name: file.name,
      file_size: file.size,
    })
    .select(SELECT)
    .single();

  if (error || !data) {
    // Don't leave the file behind if its row failed to save.
    await supabase.storage.from('artwork-images').remove([storagePath]);
    throw error ?? new Error('Could not save the image.');
  }

  return fromRow(data as ImageRow);
}

export async function deleteArtworkImage(image: ArtworkImage): Promise<void> {
  if (!supabase) throw new Error('No storage is configured.');
  const { error } = await supabase.from('artwork_images').delete().eq('id', image.id);
  if (error) throw error;
  if (image.storagePath) {
    await supabase.storage.from('artwork-images').remove([image.storagePath]);
  }
}

/** Exactly one image is the cover, so the previous one is cleared first. */
export async function setCoverImage(artworkId: string, imageId: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  await supabase
    .from('artwork_images')
    .update({ is_primary: false })
    .eq('artwork_id', artworkId);
  const { error } = await supabase
    .from('artwork_images')
    .update({ is_primary: true, role: 'cover' })
    .eq('id', imageId);
  if (error) throw error;
}

export async function setImageRole(imageId: string, role: ImageRole): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase.from('artwork_images').update({ role }).eq('id', imageId);
  if (error) throw error;
}

/** Persists the order after a move. Positions are rewritten from the array
 *  index so they stay contiguous. */
export async function saveImageOrder(images: ArtworkImage[]): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured.');
  await Promise.all(
    images.map((image, index) =>
      client.from('artwork_images').update({ position: index }).eq('id', image.id),
    ),
  );
}
