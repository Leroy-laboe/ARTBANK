// Content for the pivoted homepage sections that sit below the hero.
// Kept apart from homeContent.ts, which now holds only the shared nav/footer
// config plus the older sections still referenced elsewhere.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── 01/02 value band ── */

export const valuePillars: { index: string; title: string; description: string; statValue: string; statLabel: string }[] = [
  {
    index: '01',
    title: 'Trust and control over how professionals use your library.',
    description: 'Advanced rights management, so every use of your work is recorded and permissioned.',
    statValue: 'Over 120K',
    statLabel: 'rights managed',
  },
  {
    index: '02',
    title: 'Find creatives at their best, ready to be engaged.',
    description: 'Curated professionals, identity-verified and documented before they reach you.',
    statValue: 'Over 85K',
    statLabel: 'ready to engage',
  },
];

/* ── Browse by discipline ── */

export const disciplineFilters = ['All', 'Visual Art', 'Design', 'Craft', 'Photography'] as const;
export type DisciplineFilter = (typeof disciplineFilters)[number];

export type DisciplineArtist = {
  name: string;
  role: string;
  location: string;
  discipline: Exclude<DisciplineFilter, 'All'>;
  imageUrl: string;
};

export const disciplineArtists: DisciplineArtist[] = [
  {
    name: 'Maya Tan',
    role: 'Visual Artist',
    location: 'Kuala Lumpur',
    discipline: 'Visual Art',
    imageUrl: photo('photo-1494790108377-be9c29b29330', 520, 380),
  },
  {
    name: 'Rafiq Noor',
    role: 'Sculptor',
    location: 'Penang',
    discipline: 'Craft',
    imageUrl: photo('photo-1506794778202-cad84cf45f1d', 520, 380),
  },
  {
    name: 'Tara Gupta',
    role: 'Photographer',
    location: 'Singapore',
    discipline: 'Photography',
    imageUrl: photo('photo-1517841905240-472988babdf9', 520, 380),
  },
  {
    name: 'Raj Patel',
    role: 'Graphic Designer',
    location: 'Kuala Lumpur',
    discipline: 'Design',
    imageUrl: photo('photo-1500648767791-00dcc994a43e', 520, 380),
  },
  {
    name: 'Azzura Othman',
    role: 'Textile Artist',
    location: 'Johor Bahru',
    discipline: 'Craft',
    imageUrl: photo('photo-1531891437562-4301cf35b7e4', 520, 380),
  },
  {
    name: 'Nabil Yusof',
    role: 'Wood Artist',
    location: 'Terengganu',
    discipline: 'Craft',
    imageUrl: photo('photo-1472099645785-5658abf4ff4e', 520, 380),
  },
];

/* ── Featured artist band ── */

export const featuredArtist = {
  eyebrow: 'Featured artist',
  title: 'Maya Tan turns material memory into quiet, collectable form.',
  description:
    'Exploring the tension between nature and construction, Maya’s work meditates on time, erosion and the beauty of what lasts.',
  quote: 'I’m not interested in perfect surfaces. I’m interested in what’s hidden underneath.',
  meta: 'Kuala Lumpur, Malaysia · Visual Artist',
  cta: 'Discover Maya Tan',
  // Same portrait as her card in the discipline grid and the buyer matches
  // panel — she appears in three places and should be recognisably one person.
  imageUrl: photo('photo-1494790108377-be9c29b29330', 800, 1000),
};

/* ── ArtSpace overview (dashboard preview) ── */

export const artspaceNav: { icon: IconName; label: string }[] = [
  { icon: 'layers', label: 'Overview' },
  { icon: 'image', label: 'Artworks' },
  { icon: 'globe', label: 'Opportunities' },
  { icon: 'mail', label: 'Enquiries' },
  { icon: 'trend-up', label: 'Analytics' },
  { icon: 'user', label: 'Profile' },
  { icon: 'sliders', label: 'Settings' },
];

export const artspaceActivity: { title: string; detail: string; time: string; imageUrl: string }[] = [
  {
    title: 'Tide and Limestone',
    detail: 'Artwork updated',
    time: '2h ago',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 80, 80),
  },
  {
    title: 'Stone Series — 03',
    detail: 'New enquiry',
    time: '1d ago',
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 80, 80),
  },
  {
    title: 'Earthbound',
    detail: 'Shortlisted by a collector',
    time: '2d ago',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 80, 80),
  },
];

/** Relative heights (%) for the profile-views bars — a static preview, not a chart. */
export const artspaceViewsBars = [38, 52, 44, 66, 58, 82, 74, 96];

/* ── For buyers ── */

export const buyerSteps = [
  'Post a brief with your project goals and get matched with the right creative talent.',
  'Review curated matches, each one documented and verified.',
  'Start a conversation securely, with identity presented up front.',
  'Move forward with clarity and confidence.',
];

export const buyerMatches: { name: string; role: string; location: string; match: number; imageUrl: string }[] = [
  {
    name: 'Maya Tan',
    role: 'Visual Artist',
    location: 'Kuala Lumpur',
    match: 95,
    imageUrl: photo('photo-1494790108377-be9c29b29330', 96, 96),
  },
  {
    name: 'Rafiq Noor',
    role: 'Sculptor',
    location: 'Penang',
    match: 92,
    imageUrl: photo('photo-1506794778202-cad84cf45f1d', 96, 96),
  },
  {
    name: 'Azzura Othman',
    role: 'Textile Artist',
    location: 'Johor Bahru',
    match: 87,
    imageUrl: photo('photo-1531891437562-4301cf35b7e4', 96, 96),
  },
];

/* ── Market intelligence ── */

export const marketSignals: { value: string; label: string }[] = [
  { value: '+34%', label: 'Increase in enquiries for site-specific installations' },
  { value: '2.1x', label: 'More demand for emerging Southeast Asian artists' },
  { value: '+27%', label: 'Increase in briefs for sustainable art practices' },
];

/* ── Daily brief ── */

export const dailyBriefFeature = {
  tag: 'Feature',
  title: 'Creative value is moving beyond gallery walls — and brands need better records to use it.',
  description:
    'Understand how documentation and provenance are shaping the next decade of creative work.',
  imageUrl: photo('photo-1544967082-d9d25d867d66', 640, 420),
};

export const dailyBriefItems = [
  'Regional hotel groups are commissioning local artists for long-term installations.',
  'A new Southeast Asia art prize opens for applications.',
  'How collectors are evaluating emerging talent this year.',
];

/* ── Jenaisis band ── */

export const jenaisis = {
  eyebrow: 'Jenaisis HGI',
  title: 'Not another chatbot. A next-action guide for creative work.',
  description: 'Get clarity. Get direction. Get things done.',
  tags: ['Human guidance', 'Action-oriented', 'Creative cognition'],
  cta: 'Chat with Jenaisis',
};

/* ── Closing CTA ── */

export const joinStandard = {
  eyebrow: 'Join the professional standard',
  lines: [
    'Every artist deserves a professional identity.',
    'Every creative work deserves a useful record.',
  ],
  description: 'Build your ArtBank. Connect with opportunity.',
};
