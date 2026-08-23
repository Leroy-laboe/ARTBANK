// Content for ArtSpace → Public Profile.
//
// This is the one profile editor (docs/pivot-checklist/16-public-profile-access.md
// consolidates the previously scattered edit controls into a single screen).
//
// Nothing private may leak here: no readiness score, no earnings, no interest
// or enquiry data. The spec deletes public earnings and statistics outright,
// so only portfolio credentials belong on the public side.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Tabs ── */

export const profileTabs = [
  { id: 'details', label: 'Profile Details' },
  { id: 'statement', label: 'Artist Statement' },
  { id: 'featured', label: 'Featured Artworks' },
  { id: 'settings', label: 'Profile Settings' },
  { id: 'social', label: 'Social Links' },
];

/* ── Profile Details ── */

export const profileDetails = {
  photoUrl: photo('photo-1494790108377-be9c29b29330', 240, 240),
  photoHint: 'JPG, PNG or WebP. Max 5MB.',
  displayName: 'Maya Tan',
  artistName: 'Maya Tan',
  location: 'Kuala Lumpur, Malaysia',
  nationality: 'Malaysian',
  nationalities: ['Malaysian', 'Singaporean', 'Indonesian', 'Thai', 'Filipino', 'Other'],
  website: 'www.mayatanart.com',
  email: 'hello@mayatanart.com',
  shortBio:
    'Contemporary artist exploring the relationship between memory, identity and place through texture, form and subtle color.',
};

/* ── Professional Information ── */

export const professionalInfo = {
  mediums: ['Acrylic Painting', 'Mixed Media', 'Oil on Canvas'],
  mediumOptions: [
    'Acrylic Painting',
    'Mixed Media',
    'Oil on Canvas',
    'Charcoal',
    'Photography',
    'Sculpture',
    'Printmaking',
    'Digital',
  ],
  yearsActive: '2018 - Present',
  education: [
    'Diploma in Fine Arts, LASALLE College of the Arts, Singapore (2017)',
    'BFA (Hons) Fine Arts, LASALLE College of the Arts, Singapore (2020)',
  ].join('\n'),
  awards: [
    '2023 – Finalist, Sovereign Asian Art Prize',
    '2022 – Selected Artist, Art Dubai Digital',
    '2021 – UOB Painting of the Year, Top 20',
  ].join('\n'),
};

/* ── Profile Completion ── */

export const profileCompletion: {
  percent: number;
  note: string;
  steps: { id: string; label: string; done: boolean }[];
} = {
  percent: 80,
  note: 'Complete the remaining sections to reach 100%',
  steps: [
    { id: 'details', label: 'Profile Details', done: true },
    { id: 'statement', label: 'Artist Statement', done: true },
    { id: 'featured', label: 'Featured Artworks', done: true },
    { id: 'social', label: 'Social Links', done: false },
    { id: 'settings', label: 'Profile Settings', done: false },
  ],
};

/* ── Public preview ── */

/** What the outside world sees. Deliberately credentials only — the counts
 *  here describe the body of work, never money or private interest. */
export const publicPreview = {
  coverUrl: photo('photo-1502920917128-1aa500764cbd', 640, 240),
  avatarUrl: photo('photo-1494790108377-be9c29b29330', 160, 160),
  name: 'Maya Tan',
  verified: true,
  location: 'Kuala Lumpur, Malaysia',
  bio: 'Contemporary artist exploring the relationship between memory, identity and place through texture, form and subtle color.',
  stats: [
    { id: 'artworks', value: '24', label: 'Artworks' },
    { id: 'exhibitions', value: '8', label: 'Exhibitions' },
    { id: 'opportunities', value: '12', label: 'Opportunities' },
  ],
};

/* ── Visibility ── */

export type VisibilityToggle = {
  id: string;
  icon: IconName;
  label: string;
  enabled: boolean;
};

export const profileVisibility = {
  levels: ['Public', 'Artbank members only', 'Private'],
  current: 'Public',
};

export const visibilityToggles: VisibilityToggle[] = [
  { id: 'contact', icon: 'mail', label: 'Show Contact Information', enabled: true },
  { id: 'enquiries', icon: 'message', label: 'Allow Enquiries', enabled: true },
  { id: 'prices', icon: 'tag', label: 'Show Artwork Prices', enabled: false },
];

/* ── Tips ── */

export const profileTips: { id: string; icon: IconName; title: string; detail: string }[] = [
  {
    id: 'statement',
    icon: 'check-circle',
    title: 'Add a strong artist statement',
    detail: 'Helps people understand your practice',
  },
  {
    id: 'featured',
    icon: 'check-circle',
    title: 'Feature your best artworks',
    detail: 'Quality over quantity',
  },
  {
    id: 'updated',
    icon: 'check-circle',
    title: 'Keep your profile updated',
    detail: 'Active profiles get more visibility',
  },
];
