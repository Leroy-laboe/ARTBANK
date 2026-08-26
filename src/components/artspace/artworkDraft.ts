import type { ArtworkType, PriceType } from '../../data/artspaceAddArtwork';

/** Everything step 1 of Add Artwork collects.
 *
 *  Numbers are kept as strings while the artist is typing — a half-entered
 *  "20" shouldn't be coerced to a number mid-keystroke — and converted once on
 *  save. Nothing here has a default the artist didn't choose, except the
 *  artwork type and unit, which need a starting position. */
export type ArtworkDraft = {
  title: string;
  year: string;
  medium: string;
  height: string;
  width: string;
  depth: string;
  unit: 'cm' | 'in';
  category: string;
  tags: string[];
  description: string;
  collection: string;
  materials: string;
  artworkType: ArtworkType;
  editionSize: string;
  coaPromised: boolean;
  creationLocation: string;
  dateCreated: string;
  isSigned: boolean;
  ownershipConfirmed: boolean;

  /* ── Step 3: pricing and availability ── */
  priceType: PriceType;
  currency: string;
  price: string;
  priceMax: string;
  compareAtPrice: string;
  availabilityStatus: string;
  readyToShipIn: string;
  shipsFrom: string;
  shippingRegions: string[];
  allowInternationalShipping: boolean;
  includesCoa: boolean;
  isPhysical: boolean;
  allowLayaway: boolean;

  /* ── Step 5: rights, visibility and publishing ── */
  /** Ids from `permittedUses` in data/artspaceAddArtwork. Empty means no use
   *  is permitted beyond displaying the record — see 0020's column comment. */
  permittedUses: string[];
  rightsNote: string;
  visibility: 'public' | 'private' | 'unlisted';
  rightsConfirmed: boolean;
};

export type DraftErrors = Partial<Record<keyof ArtworkDraft | 'dimensions', string>>;

export const emptyDraft: ArtworkDraft = {
  title: '',
  year: '',
  medium: '',
  height: '',
  width: '',
  depth: '',
  unit: 'cm',
  category: '',
  tags: [],
  description: '',
  collection: '',
  materials: '',
  artworkType: 'original',
  editionSize: '',
  coaPromised: false,
  creationLocation: '',
  dateCreated: '',
  isSigned: false,
  ownershipConfirmed: false,

  priceType: 'fixed',
  currency: 'USD',
  price: '',
  priceMax: '',
  compareAtPrice: '',
  availabilityStatus: 'available',
  readyToShipIn: '1 – 2 weeks',
  shipsFrom: '',
  shippingRegions: [],
  allowInternationalShipping: true,
  includesCoa: false,
  // Defaults to physical: the label reads "Uncheck if this is a digital
  // artwork", so an unchecked default would mis-describe most work.
  isPhysical: true,
  allowLayaway: false,

  // Nothing is permitted by default, and a new record starts private. Both
  // are permission-first defaults: the artist opens the record up, rather
  // than discovering it was already open.
  permittedUses: [],
  rightsNote: '',
  visibility: 'private',
  rightsConfirmed: false,
};

/** Composes the display string every other screen shows, e.g. "80 × 60 cm"
 *  or "80 × 60 × 5 cm". */
export function formatDimensions(draft: ArtworkDraft): string {
  const parts = [draft.height, draft.width, draft.depth].filter((n) => n.trim() !== '');
  if (parts.length < 2) return '';
  return `${parts.join(' × ')} ${draft.unit}`;
}

/** Validates step 1. Required fields come from the design's asterisks, plus
 *  the ownership confirmation the brief requires before a record exists. */
export function validateDetails(draft: ArtworkDraft): DraftErrors {
  const errors: DraftErrors = {};
  const year = Number(draft.year);
  const thisYear = new Date().getFullYear();

  if (!draft.title.trim()) errors.title = 'Give your artwork a title.';

  if (!draft.year.trim()) {
    errors.year = 'Enter the year it was created.';
  } else if (!Number.isInteger(year) || year < 1000 || year > thisYear) {
    errors.year = `Enter a year between 1000 and ${thisYear}.`;
  }

  if (!draft.medium) errors.medium = 'Choose a medium.';
  if (!draft.category) errors.category = 'Choose a category.';

  if (!draft.height.trim() || !draft.width.trim()) {
    errors.dimensions = 'Height and width are both required.';
  } else if ([draft.height, draft.width, draft.depth].some((n) => n.trim() !== '' && !(Number(n) > 0))) {
    errors.dimensions = 'Dimensions must be numbers greater than zero.';
  }

  if (!draft.description.trim()) {
    errors.description = 'Describe the work — this is what people read first.';
  }

  if (!draft.ownershipConfirmed) {
    errors.ownershipConfirmed = 'Please confirm you are the creator or rights holder.';
  }

  return errors;
}

/** Validates step 3. "Upon request" deliberately needs no number — that is
 *  the whole point of choosing it. */
export function validatePricing(draft: ArtworkDraft): DraftErrors {
  const errors: DraftErrors = {};
  const price = Number(draft.price);
  const priceMax = Number(draft.priceMax);
  const compare = Number(draft.compareAtPrice);

  if (draft.priceType === 'fixed') {
    if (!draft.price.trim()) errors.price = 'Enter a price.';
    else if (!(price > 0)) errors.price = 'Price must be more than zero.';
  }

  if (draft.priceType === 'range') {
    if (!draft.price.trim() || !draft.priceMax.trim()) {
      errors.price = 'Enter both a minimum and a maximum.';
    } else if (!(price > 0) || !(priceMax > 0)) {
      errors.price = 'Both figures must be more than zero.';
    } else if (priceMax < price) {
      errors.priceMax = 'The maximum must be at least the minimum.';
    }
  }

  if (draft.compareAtPrice.trim()) {
    if (!(compare > 0)) {
      errors.compareAtPrice = 'Compare-at price must be more than zero.';
    } else if (draft.priceType !== 'on_request' && price > 0 && compare <= price) {
      // A crossed-out price that is lower than the real one reads as a
      // discount that does not exist.
      errors.compareAtPrice = 'Compare-at price should be higher than the price.';
    }
  }

  if (!draft.availabilityStatus) errors.availabilityStatus = 'Choose an availability status.';
  if (!draft.shipsFrom.trim()) errors.shipsFrom = 'Say where the artwork ships from.';
  if (draft.shippingRegions.length === 0) {
    errors.shippingRegions = 'Choose at least one region you will ship to.';
  }

  return errors;
}

/** Validates step 5. Visibility always has a value, so the only thing that can
 *  block a publish is the rights confirmation — which the brief requires to be
 *  an explicit act, not a pre-ticked box. */
export function validateReview(draft: ArtworkDraft): DraftErrors {
  const errors: DraftErrors = {};

  if (!draft.rightsConfirmed) {
    errors.rightsConfirmed =
      'Confirm the rights statement before publishing.';
  }

  return errors;
}

/** Where the record has got to, against the nine required steps in
 *  docs/pivot-checklist/10-add-artwork.md.
 *
 *  The spec asks that the Artwork Readiness Scan be able to point at exactly
 *  which step is incomplete, so the checklist is computed here rather than
 *  described in the Review screen's markup — one source both can use. */
export type ReviewItem = { id: string; label: string; done: boolean; step: string };

export function reviewChecklist(
  draft: ArtworkDraft,
  counts: { images: number; documents: number },
): ReviewItem[] {
  return [
    { id: 'images', label: 'Artwork images uploaded', done: counts.images > 0, step: 'images' },
    { id: 'basics', label: 'Title, year, medium and dimensions', done: Boolean(draft.title.trim() && draft.year.trim() && draft.medium && formatDimensions(draft)), step: 'details' },
    { id: 'story', label: 'Description and story', done: Boolean(draft.description.trim()), step: 'details' },
    { id: 'ownership', label: 'Creator and ownership statement', done: draft.ownershipConfirmed, step: 'details' },
    { id: 'availability', label: 'Availability and earning routes', done: Boolean(draft.availabilityStatus), step: 'availability' },
    { id: 'rights', label: 'Rights and permitted uses', done: draft.rightsConfirmed, step: 'review' },
    // Evidence is genuinely optional — a record without documents is still a
    // record, it just won't support a Passport review yet.
    { id: 'evidence', label: 'Evidence and supporting files', done: counts.documents > 0, step: 'documents' },
    { id: 'visibility', label: 'Visibility chosen', done: Boolean(draft.visibility), step: 'review' },
  ];
}
