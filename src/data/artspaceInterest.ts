// Content for ArtSpace → Interest, the interest ledger.
//
// Hard rule from docs/pivot-checklist/12-interest-ledger.md: anonymous
// viewers are NEVER revealed. Everyone modelled in this file is an identified
// viewer who consented to share their identity. Raw anonymous traffic is a
// separate count (see `anonymousViews`) and is deliberately never given a
// name, an avatar or a row.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Shared vocabulary ── */

/** What the viewer wants, per the spec's intent list. */
export type InterestPurpose = 'Purchase' | 'Licence' | 'Exhibit' | 'Commission' | 'Collaborate';

/** What the artist can do next, per the spec's next-action list. */
export type NextAction = 'Reply' | 'Invite' | 'Qualify' | 'Decline' | 'Block';

/** Monogram background for people and organisations with no photo. */
export type MonogramTone = 'forest' | 'gold' | 'ink';

export type EnquiryStatus = 'New' | 'Replied' | 'Awaiting';

/* ── Tabs ── */

export const interestTabs = [
  { id: 'all', label: 'All Interest' },
  { id: 'enquiries', label: 'Enquiries', count: 12 },
  { id: 'following', label: 'Following', count: 24 },
  { id: 'shortlisted', label: 'Shortlisted', count: 9 },
];

/* ── New Enquiries ── */

export type Enquiry = {
  id: string;
  name: string;
  monogram: string;
  tone: MonogramTone;
  verified: boolean;
  location: string;
  artwork: string;
  purpose: InterestPurpose;
  /** How the purpose is worded to the artist for this specific enquiry. */
  purposeLabel: string;
  preview: string;
  time: string;
  status: EnquiryStatus;
  nextAction: NextAction;
};

export const enquiries: Enquiry[] = [
  {
    id: 'hotelier-gallery',
    name: 'Hotelier Gallery',
    monogram: 'HG',
    tone: 'forest',
    verified: true,
    location: 'Singapore',
    artwork: 'Rhythm of Memory',
    purpose: 'Exhibit',
    purposeLabel: 'Exhibition use',
    preview: 'We’re curating an exhibition in Singapore in November and would like to discuss…',
    time: '2h ago',
    status: 'New',
    nextAction: 'Reply',
  },
  {
    id: 'art-collector',
    name: 'Art Collector',
    monogram: 'AC',
    tone: 'gold',
    verified: true,
    location: 'Kuala Lumpur, Malaysia',
    artwork: 'Fragments of Quiet #2',
    purpose: 'Purchase',
    purposeLabel: 'Acquisition',
    preview: 'Is this piece available for acquisition? Please share more details.',
    time: '1d ago',
    status: 'New',
    nextAction: 'Qualify',
  },
  {
    id: 'blue-arc-advisory',
    name: 'Blue Arc Advisory',
    monogram: 'BA',
    tone: 'ink',
    verified: false,
    location: 'Dubai, UAE',
    artwork: 'Echoes',
    purpose: 'Licence',
    purposeLabel: 'Corporate collection',
    preview: 'We are building a new office collection and would love to explore this work.',
    time: '2d ago',
    status: 'Replied',
    nextAction: 'Invite',
  },
];

/* ── People Following You ── */

export type Follower = {
  id: string;
  name: string;
  role: string;
  location: string;
  verified: boolean;
  avatarUrl?: string;
  monogram?: string;
  tone?: MonogramTone;
};

export const followers: Follower[] = [
  {
    id: 'sophia-lee',
    name: 'Sophia Lee',
    role: 'Curator',
    location: 'Seoul, South Korea',
    verified: true,
    avatarUrl: photo('photo-1494790108377-be9c29b29330', 96, 96),
  },
  {
    id: 'daniel-kim',
    name: 'Daniel Kim',
    role: 'Art Consultant',
    location: 'Tokyo, Japan',
    verified: true,
    avatarUrl: photo('photo-1506794778202-cad84cf45f1d', 96, 96),
  },
  {
    id: 'modern-maison',
    name: 'Modern Maison',
    role: 'Design Studio',
    location: 'London, UK',
    verified: true,
    monogram: 'MM',
    tone: 'forest',
  },
  {
    id: 'aisha-rahman',
    name: 'Aisha Rahman',
    role: 'Collector',
    location: 'Dubai, UAE',
    verified: true,
    avatarUrl: photo('photo-1500648767791-00dcc994a43e', 96, 96),
  },
  {
    id: 'golden-circle',
    name: 'Golden Circle',
    role: 'Private Collector Group',
    location: 'Hong Kong',
    verified: true,
    monogram: 'GC',
    tone: 'gold',
  },
];

/* ── Recent Viewers ── */

export type Viewer = {
  id: string;
  name: string;
  location: string;
  verified: boolean;
  avatarUrl?: string;
  monogram?: string;
  tone?: MonogramTone;
  /** How many artworks this person viewed. */
  viewedCount: number;
  /** Thumbnails of what they looked at; overflow shows as "+N". */
  thumbs: string[];
  lastViewedDate: string;
  lastViewedTime: string;
};

export const recentViewers: Viewer[] = [
  {
    id: 'ethan-brown',
    name: 'Ethan Brown',
    location: 'New York, USA',
    verified: true,
    avatarUrl: photo('photo-1544005313-94ddf0286df2', 96, 96),
    viewedCount: 3,
    thumbs: [
      photo('photo-1541701494587-cb58502866ab', 80, 80),
      photo('photo-1502920917128-1aa500764cbd', 80, 80),
      photo('photo-1519608487953-e999c86e7455', 80, 80),
      photo('photo-1549887534-1541e9326642', 80, 80),
    ],
    lastViewedDate: 'May 8, 2025',
    lastViewedTime: '10:42 AM',
  },
  {
    id: 'isabella-rossi',
    name: 'Isabella Rossi',
    location: 'Milan, Italy',
    verified: true,
    avatarUrl: photo('photo-1534528741775-53994a69daeb', 96, 96),
    viewedCount: 2,
    thumbs: [
      photo('photo-1549887534-1541e9326642', 80, 80),
      photo('photo-1577720580479-7d839d829c73', 80, 80),
    ],
    lastViewedDate: 'May 7, 2025',
    lastViewedTime: '6:15 PM',
  },
  {
    id: 'vista-art-partners',
    name: 'Vista Art Partners',
    location: 'London, UK',
    verified: true,
    monogram: 'VA',
    tone: 'ink',
    viewedCount: 5,
    thumbs: [
      photo('photo-1541701494587-cb58502866ab', 80, 80),
      photo('photo-1519608487953-e999c86e7455', 80, 80),
      photo('photo-1580136579312-94651dfd596d', 80, 80),
      photo('photo-1513519245088-0e12902e5a38', 80, 80),
      photo('photo-1502920917128-1aa500764cbd', 80, 80),
      photo('photo-1577720580479-7d839d829c73', 80, 80),
    ],
    lastViewedDate: 'May 6, 2025',
    lastViewedTime: '3:33 PM',
  },
];

/** Anonymous traffic, kept as a bare number on purpose. These people did not
 *  consent to be identified, so they get a count and nothing else — never a
 *  row in Recent Viewers. */
export const anonymousViews = {
  count: 412,
  period: 'Last 30 days',
  note: 'Anonymous visitors are counted only — never identified.',
};

/* ── Right rail ── */

export const interestOverview: {
  ranges: string[];
  stats: { id: string; value: string; label: string }[];
} = {
  ranges: ['All time', 'This year', 'Last 90 days'],
  // Kept in step with the demo enquiries and followers above, and using the
  // same labels the real counts use (services/interest.ts buildStats). A stat
  // card claiming 68 enquiries over a list of three is the kind of mismatch
  // that makes every other number on the screen worth doubting.
  stats: [
    { id: 'enquiries', value: '3', label: 'Identified Enquiries' },
    { id: 'following', value: '5', label: 'People Following' },
    { id: 'shortlisted', value: '4', label: 'Shortlisted' },
    { id: 'serious', value: '2', label: 'Serious Interest' },
    { id: 'discussions', value: '1', label: 'In Discussion' },
    { id: 'anonymous', value: '412', label: 'Anonymous Views' },
  ],
};

/** The artist's own artworks ordered by interest. Private to them — this is
 *  not a public leaderboard, which the guardrails forbid. */
export const topInterestedArtworks: {
  id: string;
  title: string;
  interested: number;
  enquiries: number;
  imageUrl: string;
}[] = [
  {
    id: 'rhythm-of-memory',
    title: 'Rhythm of Memory',
    interested: 12,
    enquiries: 3,
    imageUrl: photo('photo-1541701494587-cb58502866ab', 120, 120),
  },
  {
    id: 'fragments-of-quiet-2',
    title: 'Fragments of Quiet #2',
    interested: 8,
    enquiries: 2,
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 120, 120),
  },
  {
    id: 'echoes',
    title: 'Echoes',
    interested: 6,
    enquiries: 1,
    imageUrl: photo('photo-1519608487953-e999c86e7455', 120, 120),
  },
];

export const interestTips: { id: string; icon: IconName; title: string; detail: string }[] = [
  {
    id: 'dimensions',
    icon: 'check-circle',
    title: 'Complete artwork dimensions',
    detail: '2 artworks missing',
  },
  {
    id: 'provenance',
    icon: 'check-circle',
    title: 'Add provenance documents',
    detail: '3 artworks can be verified',
  },
  {
    id: 'social',
    icon: 'check-circle',
    title: 'Share on social media',
    detail: 'Reach a wider audience',
  },
];
