// Content for the buyer workspace — the private area a `buyer` account lands
// on after signing in, at /collect. The artist's counterpart is ArtSpace
// (src/data/artspaceContent.ts); this is the other side of the same
// conversation, and the two are deliberately built from the same vocabulary.
//
// Hand-authored mock data, same as the rest of src/data. Everything here is
// the fallback the screens render when there is no Supabase project, no
// session, or nothing published yet — src/services/buyer.ts returns it with
// `isDemo: true` so the UI can label it rather than pass it off as real.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Shell: primary nav + account menu ── */

export type BuyerNavItem = {
  icon: IconName;
  label: string;
  to: string;
  /** Unread/pending count, rendered as a pill on the right of the row. */
  badge?: number;
};

/** Five primary destinations, mirroring ArtSpace's five. Saved Works and
 *  Viewing Rooms are the two the brief names explicitly for this side —
 *  docs/pivot-checklist/13-buyer-card.md and 21-feature-private-viewing-room.md. */
export const buyerPrimaryNav: BuyerNavItem[] = [
  { icon: 'home', label: 'Discover', to: '/collect' },
  { icon: 'users', label: 'Artists', to: '/collect/artists' },
  { icon: 'bookmark', label: 'Saved Works', to: '/collect/saved' },
  { icon: 'handshake', label: 'Purchases', to: '/collect/purchases' },
  { icon: 'mail', label: 'My Enquiries', to: '/collect/enquiries' },
  { icon: 'message', label: 'Messages', to: '/collect/messages' },
];

export const buyerAccountNav: BuyerNavItem[] = [
  { icon: 'lock', label: 'Viewing Rooms', to: '/collect/rooms' },
  { icon: 'help-circle', label: 'Help Center', to: '/collect/help' },
];

/* ── Discover ── */

export const discoverHero = {
  titleLead: 'Discover Art',
  titleRest: 'that ',
  titleAccent: 'Speaks to You',
  blurb: 'Explore original artworks from verified artists worldwide.',
  cta: 'Explore Artworks',
  imageUrl: photo('photo-1549887534-1541e9326642', 900, 500),
};

export type TrustTile = { icon: IconName; title: string; note: string };

/** The four promises the buyer side is built on. Note what is absent: no
 *  ranking, no popularity, no valuation — see
 *  docs/pivot-checklist/17-do-not-build-guardrails.md. */
export const buyerTrustTiles: TrustTile[] = [
  { icon: 'shield-check', title: 'Verified Artists', note: 'Every artist is verified' },
  { icon: 'brush', title: 'Original Artworks', note: '100% original creations' },
  { icon: 'lock', title: 'Secure & Private', note: 'Your privacy matters' },
  { icon: 'handshake', title: 'Meaningful Connections', note: 'Real people, real intent' },
];

/** "Connected & Synchronized" — the two columns of the flow diagram: what the
 *  buyer does on the left, what the artist receives on the right. */
export const intentFlow = {
  eyebrow: 'Connected & Synchronized',
  blurb: 'When you show interest, save, or enquire, the artist sees your verified intent.',
  buyerHeading: 'Buyer Action',
  artistHeading: 'Artist Sees',
  buyerSteps: [
    { icon: 'eye' as IconName, label: 'Views Artwork' },
    { icon: 'bookmark' as IconName, label: 'Saves Artwork' },
    { icon: 'calendar' as IconName, label: 'Requests Availability (or Contacts Artist)' },
  ],
  artistSteps: [
    { icon: 'bell' as IconName, label: 'New Interest Received' },
    { icon: 'user' as IconName, label: 'Buyer Intent Card (with details)' },
    { icon: 'message' as IconName, label: 'Artist Responds' },
  ],
  footer: 'Meaningful connections. Real people. Real intent.',
};

export const buyerTrustBand: TrustTile[] = [
  { icon: 'badge-check', title: 'Verified Identities', note: 'Every user is verified' },
  { icon: 'lock', title: 'Private & Secure', note: 'Your data is protected' },
  { icon: 'shield-check', title: 'Serious Intent Only', note: 'No likes. No spam. Just real interest.' },
  { icon: 'bell', title: 'Built for Artists & Collectors', note: 'A better way to connect and collect art.' },
];

/* ── Artworks ── */

export type BuyerAvailability =
  | 'Available'
  | 'On View'
  | 'Reserved'
  | 'Sold'
  | 'Licensing Available'
  | 'Unavailable';

/** Evidence state, never a bare "verified" tick. Mirrors artworks.coa_status:
 *  not_requested to None, pending_review to In Review, issued to Verified. */
export type BuyerPassport = 'Verified' | 'In Review' | 'None';

export const passportCopy: Record<BuyerPassport, { title: string; note: string }> = {
  Verified: { title: 'Passport Verified', note: 'Evidence reviewed by ArtBank' },
  'In Review': { title: 'Passport In Review', note: 'Evidence is with ArtBank' },
  None: { title: 'No Passport Yet', note: 'No evidence has been submitted' },
};

export type BuyerArtwork = {
  id: string;
  title: string;
  artistId: string | null;
  artistName: string;
  /** Set only when the artist chose a public handle, which is what makes
   *  /artists/{handle} reachable at all. */
  artistHandle: string | null;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  imageUrl: string;
  /** Already formatted, because whether a price may be shown at all is the
   *  artist's setting (users.show_artwork_prices) and whether there is one to
   *  show is the record's (artworks.price_type). Neither decision belongs in
   *  a card. "Price on request" is a real answer, not a missing value. */
  priceLabel: string;
  availability: BuyerAvailability;
  passport: BuyerPassport;
  saved: boolean;
  /** ISO, only on rows that came from a save list. Drives "Recently Added". */
  savedAt?: string;
};

export const discoverArtworks: BuyerArtwork[] = [
  {
    id: 'silent-harmony',
    title: 'Silent Harmony',
    artistId: null,
    artistName: 'Maya Tan',
    artistHandle: null,
    year: 2024,
    medium: 'Acrylic on Canvas',
    dimensions: '60 × 80 cm',
    imageUrl: photo('photo-1549887534-1541e9326642', 600, 600),
    priceLabel: 'USD 1,800',
    availability: 'Available',
    passport: 'Verified',
    saved: false,
  },
  {
    id: 'golden-quiet',
    title: 'Golden Quiet',
    artistId: null,
    artistName: 'Daniel Cho',
    artistHandle: null,
    year: 2023,
    medium: 'Oil on Linen',
    dimensions: '50 × 70 cm',
    imageUrl: photo('photo-1577720580479-7d839d829c73', 600, 600),
    priceLabel: 'USD 2,200',
    availability: 'Available',
    passport: 'In Review',
    saved: true,
  },
  {
    id: 'between-lines',
    title: 'Between Lines',
    artistId: null,
    artistName: 'Aisha Rahman',
    artistHandle: null,
    year: 2024,
    medium: 'Mixed Media',
    dimensions: '70 × 100 cm',
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 600, 600),
    priceLabel: 'USD 2,600',
    availability: 'Available',
    passport: 'Verified',
    saved: false,
  },
  {
    id: 'ocean-memory',
    title: 'Ocean Memory',
    artistId: null,
    artistName: 'Ethan Wong',
    artistHandle: null,
    year: 2023,
    medium: 'Acrylic on Canvas',
    dimensions: '60 × 90 cm',
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 600, 600),
    priceLabel: 'USD 1,600',
    availability: 'Reserved',
    passport: 'None',
    saved: false,
  },
  {
    id: 'whispers',
    title: 'Whispers',
    artistId: null,
    artistName: 'Aisha Rahman',
    artistHandle: null,
    year: 2022,
    medium: 'Charcoal on Paper',
    dimensions: '40 × 55 cm',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 600, 600),
    priceLabel: 'Price on request',
    availability: 'Sold',
    passport: 'Verified',
    saved: false,
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    artistId: null,
    artistName: 'Maya Tan',
    artistHandle: null,
    year: 2024,
    medium: 'Ink and Gouache',
    dimensions: '30 × 42 cm',
    imageUrl: photo('photo-1580136579312-94651dfd596d', 600, 600),
    priceLabel: 'USD 900',
    availability: 'Available',
    passport: 'In Review',
    saved: true,
  },
  {
    id: 'low-tide',
    title: 'Low Tide',
    artistId: null,
    artistName: 'Ethan Wong',
    artistHandle: null,
    year: 2022,
    medium: 'Oil on Board',
    dimensions: '45 × 45 cm',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 600, 600),
    priceLabel: 'USD 1,200',
    availability: 'Available',
    passport: 'None',
    saved: true,
  },
  {
    id: 'second-light',
    title: 'Second Light',
    artistId: null,
    artistName: 'Daniel Cho',
    artistHandle: null,
    year: 2021,
    medium: 'Acrylic on Canvas',
    dimensions: '80 × 80 cm',
    imageUrl: photo('photo-1544005313-94ddf0286df2', 600, 600),
    priceLabel: 'USD 3,100',
    availability: 'Licensing Available',
    passport: 'Verified',
    saved: true,
  },
];

/** The demo save list is the subset flagged `saved` above, so toggling a
 *  heart on Discover and opening Saved Works agree with each other even with
 *  no database behind them. */
export const savedArtworks: BuyerArtwork[] = discoverArtworks
  .filter((a) => a.saved)
  .map((a, i) => ({ ...a, savedAt: new Date(Date.UTC(2025, 4, 22 - i * 3)).toISOString() }));

/* ── The artwork record, as a buyer sees it ── */

export type ArtworkSpec = { label: string; value: string };

export type BuyerArtworkDetail = BuyerArtwork & {
  description: string | null;
  /** Medium, Dimensions, Year, Type, Signed, Ships From — built from
   *  whichever of those columns the artist actually filled in. */
  specs: ArtworkSpec[];
  rightsNote: string | null;
  permittedUses: string[];
  artistAvatarUrl: string | null;
  artistCountry: string | null;
  artistCountryCode: string | null;
  artistMemberSince: string | null;
  /** Published, publicly-visible works only — the same figure the public
   *  profile shows, and deliberately the only statistic on this card. Spec 16
   *  deletes public statistics; a response rate would have to be invented. */
  artistWorks: number;
  /** False when the artist turned enquiries off in their profile settings. */
  allowEnquiries: boolean;
};

export const demoArtworkDetail: BuyerArtworkDetail = {
  ...discoverArtworks[0],
  imageUrl: photo('photo-1549887534-1541e9326642', 1000, 1000),
  description:
    'Silent Harmony explores the balance between chaos and stillness. Layers of texture and neutral tones reflect the quiet moments we often overlook.',
  specs: [
    { label: 'Medium', value: 'Acrylic on Canvas' },
    { label: 'Dimensions', value: '60 × 80 cm' },
    { label: 'Year', value: '2024' },
    { label: 'Type', value: 'Original' },
    { label: 'Signed', value: 'Yes' },
    { label: 'Ships From', value: 'Kuala Lumpur, Malaysia' },
  ],
  rightsNote: 'Reproduction requires written permission from the artist.',
  permittedUses: ['Editorial coverage', 'Exhibition display'],
  artistAvatarUrl: photo('photo-1494790108377-be9c29b29330', 160, 160),
  artistCountry: 'Kuala Lumpur, Malaysia',
  artistCountryCode: 'my',
  artistMemberSince: 'Jan 2023',
  artistWorks: 36,
  allowEnquiries: true,
};

/* ── Enquiries ── */

/** Where an enquiry has got to. Read from interest_entries.pipeline_stage,
 *  which is the artist's ledger — the buyer sees the same row, so the two
 *  sides can never disagree about what was asked or when. */
export type EnquiryStatus =
  | 'Awaiting Response'
  | 'In Conversation'
  | 'Viewing Room'
  /** A deal was recorded and settled. Distinct from 'Closed', which is what an
   *  enquiry that went nowhere looks like — telling a buyer their purchase was
   *  "Closed" reads as a rejection. */
  | 'Purchased'
  | 'Payment Due'
  | 'Closed';

export type BuyerEnquiry = {
  id: string;
  artworkId: string | null;
  artwork: string;
  artistName: string;
  artistHandle: string | null;
  imageUrl: string;
  purposeLabel: string;
  /** ISO. "Enquired on May 20, 2025" is formatted from this. */
  enquiredOn: string;
  status: EnquiryStatus;
  /** Set once a conversation exists, so the row can open the thread. */
  conversationId: string | null;
};

const on = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month, day)).toISOString();

export const buyerEnquiries: BuyerEnquiry[] = [
  {
    id: 'e-between-lines',
    artworkId: 'between-lines',
    artwork: 'Between Lines',
    artistName: 'Aisha Rahman',
    artistHandle: null,
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 160, 160),
    purposeLabel: 'Acquisition',
    enquiredOn: on(2025, 4, 22),
    status: 'Awaiting Response',
    conversationId: null,
  },
  {
    id: 'e-silent-harmony',
    artworkId: 'silent-harmony',
    artwork: 'Silent Harmony',
    artistName: 'Maya Tan',
    artistHandle: null,
    imageUrl: photo('photo-1549887534-1541e9326642', 160, 160),
    purposeLabel: 'Acquisition',
    enquiredOn: on(2025, 4, 20),
    status: 'Awaiting Response',
    conversationId: null,
  },
  {
    id: 'e-golden-quiet',
    artworkId: 'golden-quiet',
    artwork: 'Golden Quiet',
    artistName: 'Daniel Cho',
    artistHandle: null,
    imageUrl: photo('photo-1577720580479-7d839d829c73', 160, 160),
    purposeLabel: 'Acquisition',
    enquiredOn: on(2025, 4, 18),
    status: 'In Conversation',
    conversationId: null,
  },
  {
    id: 'e-ocean-memory',
    artworkId: 'ocean-memory',
    artwork: 'Ocean Memory',
    artistName: 'Ethan Wong',
    artistHandle: null,
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 160, 160),
    purposeLabel: 'Exhibition use',
    enquiredOn: on(2025, 4, 10),
    status: 'In Conversation',
    conversationId: null,
  },
  {
    id: 'e-whispers',
    artworkId: 'whispers',
    artwork: 'Whispers',
    artistName: 'Aisha Rahman',
    artistHandle: null,
    imageUrl: photo('photo-1519608487953-e999c86e7455', 160, 160),
    purposeLabel: 'Licensing',
    enquiredOn: on(2025, 3, 25),
    status: 'Closed',
    conversationId: null,
  },
];

/* ── The Buyer Intent Card ── */

/** The purposes interest_entries.purpose accepts, with the wording a buyer
 *  reads. Same five as the public profile's contact form. */
export const intentPurposes = [
  { id: 'purchase', label: 'Acquire this work', short: 'Acquisition' },
  { id: 'licence', label: 'Licence this work', short: 'Licensing' },
  { id: 'exhibit', label: 'Exhibit this work', short: 'Exhibition use' },
  { id: 'commission', label: 'Commission something similar', short: 'Commission' },
  { id: 'collaborate', label: 'Collaborate with the artist', short: 'Collaboration' },
] as const;

export type IntentPurpose = (typeof intentPurposes)[number]['id'];

/** Optional, and banded rather than a free number on purpose — the point is
 *  to tell the artist whether a conversation is worth having, not to open a
 *  negotiation before anyone has spoken. */
export const budgetBands = [
  'Under USD 1,000',
  'USD 1,000 – 2,500',
  'USD 2,500 – 5,000',
  'USD 5,000 – 10,000',
  'Over USD 10,000',
  'Prefer not to say',
];

export const decisionTimelines = [
  'Within a week',
  'Within a month',
  'Within three months',
  'No fixed timeline',
];

/* ── Viewing Rooms ── */

export const viewingRoomsIntro = {
  title: 'Viewing Rooms',
  subtitle: 'Private, curated presentations an artist has opened for you.',
  empty:
    'You have no viewing rooms yet. Request one from any artwork and the artist decides what to show, and for how long.',
};
