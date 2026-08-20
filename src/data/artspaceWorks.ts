// Content for ArtSpace → My Works. Hand-authored mock data, same as the rest
// of src/data — nothing here is wired to a backend yet.
//
// Field set follows docs/pivot-checklist/09-my-works.md: every artwork carries
// status, availability, passport/COA state, identified interest, opportunity
// count and recorded earnings. No likes, no public popularity signals.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Enumerations ── */

/** Artwork condition, per the spec's Draft · Published · Private · Archived. */
export type WorkStatus = 'Draft' | 'Published' | 'In Progress' | 'Private' | 'Archived';

export type WorkAvailability = 'Available' | 'On View' | 'Reserved' | 'Sold' | 'Unavailable';

/** Passport/COA evidence state. "Draft" means the record is still incomplete —
 *  the spec forbids showing an unexplained "Verified" badge. */
export type PassportState = 'Verified' | 'Draft' | 'In Review';

export type InterestLevel = 'High' | 'Medium' | 'Low' | 'None';

export type Work = {
  id: string;
  title: string;
  year: number;
  medium: string;
  dimensions: string;
  imageUrl: string;
  status: WorkStatus;
  availability: WorkAvailability;
  /** Qualifier shown under the availability label, e.g. "(Gallery)". */
  availabilityNote?: string;
  passport: PassportState;
  /** Identified viewers — not views, not likes. See 12-interest-ledger.md. */
  interestCount: number;
  interestLevel: InterestLevel;
  opportunities: number;
  /** Recorded earnings only. null renders as an em dash, never a projection. */
  earnings: number | null;
  earningsNote: string;
  updated: string;
};

export const works: Work[] = [
  {
    id: 'rhythm-of-memory',
    title: 'Rhythm of Memory',
    year: 2024,
    medium: 'Acrylic on Canvas',
    dimensions: '80 × 60 cm',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 120, 120),
    status: 'Published',
    availability: 'Available',
    passport: 'Verified',
    interestCount: 12,
    interestLevel: 'High',
    opportunities: 3,
    earnings: 2450,
    earningsNote: 'From 2 txns',
    updated: 'May 8, 2025',
  },
  {
    id: 'fragments-of-quiet-2',
    title: 'Fragments of Quiet #2',
    year: 2024,
    medium: 'Mixed Media',
    dimensions: '100 × 80 cm',
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 120, 120),
    status: 'Published',
    availability: 'On View',
    availabilityNote: '(Gallery)',
    passport: 'Verified',
    interestCount: 8,
    interestLevel: 'High',
    opportunities: 2,
    earnings: 1200,
    earningsNote: 'From 1 txn',
    updated: 'May 6, 2025',
  },
  {
    id: 'echoes',
    title: 'Echoes',
    year: 2023,
    medium: 'Oil on Canvas',
    dimensions: '90 × 70 cm',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 120, 120),
    status: 'Published',
    availability: 'Available',
    passport: 'Verified',
    interestCount: 6,
    interestLevel: 'Medium',
    opportunities: 1,
    earnings: 850,
    earningsNote: 'From 1 txn',
    updated: 'May 5, 2025',
  },
  {
    id: 'golden-silence',
    title: 'Golden Silence',
    year: 2023,
    medium: 'Acrylic on Canvas',
    dimensions: '60 × 60 cm',
    imageUrl: photo('photo-1549887534-1541e9326642', 120, 120),
    status: 'Published',
    availability: 'Available',
    passport: 'Verified',
    interestCount: 10,
    interestLevel: 'High',
    opportunities: 2,
    earnings: 1750,
    earningsNote: 'From 2 txns',
    updated: 'Apr 28, 2025',
  },
  {
    id: 'unfolding-light',
    title: 'Unfolding Light',
    year: 2023,
    medium: 'Mixed Media',
    dimensions: '120 × 90 cm',
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 120, 120),
    status: 'In Progress',
    availability: 'Unavailable',
    passport: 'Draft',
    interestCount: 2,
    interestLevel: 'Low',
    opportunities: 0,
    earnings: null,
    earningsNote: 'No earnings',
    updated: 'Apr 27, 2025',
  },
  {
    id: 'stillness-within',
    title: 'Stillness Within',
    year: 2022,
    medium: 'Oil on Canvas',
    dimensions: '70 × 50 cm',
    imageUrl: photo('photo-1577720580479-7d839d829c73', 120, 120),
    status: 'Published',
    availability: 'Available',
    passport: 'Verified',
    interestCount: 5,
    interestLevel: 'Medium',
    opportunities: 1,
    earnings: 620,
    earningsNote: 'From 1 txn',
    updated: 'Apr 20, 2025',
  },
  {
    id: 'monochrome-study-1',
    title: 'Monochrome Study #1',
    year: 2022,
    medium: 'Charcoal on Paper',
    dimensions: '50 × 70 cm',
    imageUrl: photo('photo-1580136579312-94651dfd596d', 120, 120),
    status: 'Archived',
    availability: 'Unavailable',
    passport: 'Verified',
    interestCount: 0,
    interestLevel: 'None',
    opportunities: 0,
    earnings: 0,
    earningsNote: 'No earnings',
    updated: 'Mar 15, 2025',
  },
];

/* ── Filter tabs ── */

export type WorksTab = { id: string; label: string; count?: number };

export const worksTabs: WorksTab[] = [
  { id: 'all', label: 'All Works' },
  { id: 'published', label: 'Published', count: 24 },
  { id: 'on-view', label: 'On View', count: 8 },
  { id: 'in-progress', label: 'In Progress', count: 5 },
  { id: 'unavailable', label: 'Unavailable', count: 3 },
  { id: 'archived', label: 'Archived', count: 7 },
];

/** The table is paginated server-side in a real build; these describe the
 *  slice the mock rows above stand for. */
export const worksPaging = {
  from: 1,
  to: 7,
  total: 47,
  page: 1,
  totalPages: 7,
};

/* ── Right rail ── */

export const portfolioOverview: {
  ranges: string[];
  stats: { id: string; value: string; label: string }[];
} = {
  ranges: ['All time', 'This year', 'Last 90 days'],
  stats: [
    { id: 'total', value: '47', label: 'Total Artworks' },
    { id: 'published', value: '24', label: 'Published' },
    { id: 'on-view', value: '8', label: 'On View' },
    { id: 'opportunities', value: '12', label: 'Opportunities' },
    { id: 'licences', value: '6', label: 'Active Licences' },
    { id: 'earnings', value: 'USD 6,870', label: 'Earnings to Date' },
  ],
};

export const worksQuickActions: { id: string; icon: IconName; label: string }[] = [
  { id: 'add-artwork', icon: 'plus', label: 'Add New Artwork' },
  { id: 'upload-multiple', icon: 'upload', label: 'Upload Multiple Artworks' },
  { id: 'manage-availability', icon: 'calendar', label: 'Manage Availability' },
  { id: 'manage-licences', icon: 'file-text', label: 'Manage Licences' },
  { id: 'export-portfolio', icon: 'download', label: 'Export Portfolio (PDF)' },
];

export const worksFilterGroups: { id: string; label: string; options: string[] }[] = [
  { id: 'status', label: 'Status', options: ['All Statuses', 'Published', 'In Progress', 'Draft', 'Private', 'Archived'] },
  { id: 'availability', label: 'Availability', options: ['All Availability', 'Available', 'On View', 'Reserved', 'Sold', 'Unavailable'] },
  { id: 'passport', label: 'Passport / COA', options: ['All', 'Verified', 'In Review', 'Draft'] },
  { id: 'sort', label: 'Sort by', options: ['Last Updated', 'Title A–Z', 'Year', 'Most Interest', 'Earnings'] },
];
