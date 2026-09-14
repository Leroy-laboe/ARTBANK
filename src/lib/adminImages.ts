/** Limits for AdminImageDropzone's local (no-backend) image picker. Kept out
 *  of the component file so it only exports the component — a file that
 *  exports anything else breaks Fast Refresh. */

export const ADMIN_IMAGE_LIMITS = {
  maxFiles: 6,
  maxBytes: 10 * 1024 * 1024,
  accept: ['image/jpeg', 'image/png', 'image/webp'],
};

/** Checks a file before it's accepted. Returns null if fine — same shape as
 *  services/artworkImages.ts's rejectionReason, kept local since this picker
 *  has its own (smaller) limits and no artworkId to upload against. */
export function adminImageRejectionReason(file: File, existingCount: number): string | null {
  if (existingCount >= ADMIN_IMAGE_LIMITS.maxFiles) {
    return `You can add up to ${ADMIN_IMAGE_LIMITS.maxFiles} images.`;
  }
  if (!ADMIN_IMAGE_LIMITS.accept.includes(file.type)) {
    return `${file.name} isn't a supported format. Use JPG, PNG or WebP.`;
  }
  if (file.size > ADMIN_IMAGE_LIMITS.maxBytes) {
    return `${file.name} is over 10MB.`;
  }
  return null;
}
