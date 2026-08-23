// Options and copy for ArtSpace → Add Artwork.
//
// Per docs/pivot-checklist/10-add-artwork.md this is a guided step-by-step
// flow, and nothing is auto-populated: the artist confirms every fact
// themselves. No field here is pre-filled from a guess.

import type { IconName } from '../components/ui/Icon';

/* ── The flow ── */

export type AddArtworkStep = {
  id: string;
  label: string;
  /** Which of the spec's nine required steps this screen covers. */
  covers: string;
};

export const addArtworkSteps: AddArtworkStep[] = [
  { id: 'details', label: 'Details', covers: 'Title, year, medium, dimensions, description, ownership' },
  { id: 'images', label: 'Images', covers: 'Upload artwork images' },
  { id: 'availability', label: 'Pricing & Availability', covers: 'Availability and possible earning routes' },
  { id: 'documents', label: 'Documents', covers: 'Evidence and supporting files' },
  { id: 'review', label: 'Review', covers: 'Rights, visibility, review and publish' },
];

/* ── Field options ── */

export const mediums = [
  'Acrylic on Canvas',
  'Oil on Canvas',
  'Mixed Media',
  'Watercolour',
  'Charcoal on Paper',
  'Ink on Paper',
  'Photography',
  'Sculpture',
  'Printmaking',
  'Digital',
];

export const categories = [
  'Visual Arts',
  'Painting',
  'Drawing',
  'Photography',
  'Sculpture',
  'Mixed Media',
  'Printmaking',
  'Digital Art',
];

export const dimensionUnits = ['cm', 'in'] as const;

export type ArtworkType = 'original' | 'limited_edition' | 'open_edition';

export const artworkTypes: { id: ArtworkType; label: string; detail: string }[] = [
  { id: 'original', label: 'Original', detail: 'Unique, one-of-a-kind artwork' },
  { id: 'limited_edition', label: 'Limited Edition', detail: 'Part of a limited series' },
  { id: 'open_edition', label: 'Open Edition', detail: 'Reproductions / prints' },
];

/** Collections are the artist's own groupings. Empty until they make some —
 *  nothing is invented on their behalf. */
export const collections: string[] = [];

export const DESCRIPTION_LIMIT = 1000;

/* ── Ownership ──────────────────────────────────────────────────────────
 * The brief requires the form to state that adding a record does not
 * transfer ownership, and says the exact wording should be checked by
 * someone rather than improvised. Treat this as a placeholder pending that
 * review, not as approved legal copy. */
export const ownershipStatement = {
  heading: 'Ownership stays with you',
  body:
    'Adding this record to Artbank does not transfer ownership, copyright or any ' +
    'right to sell your work. You keep everything. Artbank stores and presents the ' +
    'record on your behalf, and every use has to be permissioned by you.',
  confirmLabel: 'I confirm I am the creator or rights holder of this artwork',
  /** Flag for reviewers: this wording has not been checked by anyone yet. */
  needsLegalReview: true,
};

/* ── Right rail ── */

export const guidelines: { id: string; icon: IconName; title: string; detail: string }[] = [
  { id: 'accurate', icon: 'check-circle', title: 'Be accurate', detail: 'Provide correct details about your artwork.' },
  { id: 'images', icon: 'camera', title: 'High quality images', detail: 'Use clear, well-lit photos of your artwork.' },
  { id: 'complete', icon: 'check-circle', title: 'Complete information', detail: 'Complete all required fields to increase visibility.' },
  { id: 'original', icon: 'shield-check', title: 'Original work', detail: 'Ensure the artwork is your original creation.' },
];

export const visibilityTips: { id: string; icon: IconName; title: string; detail?: string }[] = [
  { id: 'description', icon: 'check', title: 'Write a compelling description' },
  { id: 'tags', icon: 'check', title: 'Add relevant tags and categories' },
  { id: 'dimensions', icon: 'check', title: 'Include dimensions and materials' },
  { id: 'quality', icon: 'check', title: 'Upload high quality images' },
];

/** Step 2's checklist. Same shape as the visibility tips so both render
 *  through TipsPanel. */
export const imageGuidelines: { id: string; icon: IconName; title: string }[] = [
  { id: 'lit', icon: 'check-circle', title: 'Use clear, well-lit photos' },
  { id: 'angles', icon: 'check-circle', title: 'Show the artwork from multiple angles' },
  { id: 'colours', icon: 'check-circle', title: 'Upload accurate colors and details' },
  { id: 'focus', icon: 'check-circle', title: 'Ensure the artwork is in focus' },
  { id: 'watermarks', icon: 'check-circle', title: 'Avoid watermarks and text overlays' },
];

export const imageHelpNote = {
  title: 'Need Help?',
  body: 'Check our image guide for more tips on taking great photos of your artwork.',
  linkLabel: 'View image guide',
};

/* ── Step 3: Pricing & Availability ──────────────────────────────────────
 * Note: the pivot brief removed upfront pricing (see 0019's header). These
 * options exist because the design for this step asks for them. */

export type PriceType = 'fixed' | 'range' | 'on_request';

export const priceTypes: { id: PriceType; label: string; detail: string }[] = [
  { id: 'fixed', label: 'Fixed Price', detail: 'Set a single price for your artwork.' },
  { id: 'range', label: 'Price Range', detail: 'Set a minimum and maximum price.' },
  { id: 'on_request', label: 'Upon Request', detail: 'Buyers will need to contact you for the price.' },
];

export const currencies = ['USD', 'MYR', 'SGD', 'EUR', 'GBP', 'AED'];

export const availabilityStatuses: { id: string; label: string; hint: string }[] = [
  { id: 'available', label: 'Available', hint: 'Your artwork will be visible for purchase.' },
  { id: 'on_view', label: 'On View', hint: 'Currently exhibited — enquiries still reach you.' },
  { id: 'reserved', label: 'Reserved', hint: 'Held for a buyer, shown but not purchasable.' },
  { id: 'sold', label: 'Sold', hint: 'Kept on your profile as part of your history.' },
  { id: 'licensing_available', label: 'Licensing only', hint: 'Not for sale, but licensable.' },
  { id: 'unavailable', label: 'Unavailable', hint: 'Hidden from buyers entirely.' },
];

export const readyToShipOptions = [
  'Ready to ship',
  '1 – 2 weeks',
  '2 – 4 weeks',
  '1 – 2 months',
  'Made to order',
];

export const shippingRegions = [
  'Malaysia',
  'Singapore',
  'Asia',
  'Europe',
  'North America',
  'Middle East',
  'Australia & NZ',
  'Worldwide',
];

export const pricingTips: { id: string; icon: IconName; title: string }[] = [
  { id: 'research', icon: 'check-circle', title: 'Research similar artworks to price competitively.' },
  { id: 'experience', icon: 'check-circle', title: 'Consider your experience, size, and materials.' },
  { id: 'update', icon: 'check-circle', title: 'You can always update your price later.' },
];

export const shippingTips: { id: string; icon: IconName; title: string }[] = [
  { id: 'pack', icon: 'check-circle', title: 'Pack your artwork securely.' },
  { id: 'tracked', icon: 'check-circle', title: 'Use tracked and insured shipping.' },
  { id: 'measure', icon: 'check-circle', title: 'Provide accurate size and weight.' },
];

export const supportNote = {
  title: 'Need Help?',
  body: 'Our support team is here to help you with any questions.',
  linkLabel: 'Visit Help Center',
};
