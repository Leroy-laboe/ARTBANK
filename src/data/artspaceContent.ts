// Content for the ArtSpace dashboard — the private area an artist lands on
// after signing in. Hand-authored mock data, same as the rest of src/data:
// nothing here is wired to a backend yet.
//
// Module order follows docs/pivot-checklist/08-today-dashboard.md:
// Needs Your Decision → Real Interest → Artworks at Work → Best Opportunity
// → Money and Rights → Professional Readiness.

import type { IconName } from '../components/ui/Icon';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Shell: primary nav + account menu ── */

export type ArtspaceNavItem = {
  icon: IconName;
  label: string;
  to: string;
  /** Unread/pending count, rendered as a pill on the right of the row. */
  badge?: number;
};

/** The five primary destinations. Deliberately five — see
 *  docs/pivot-checklist/07-artspace-shell-and-navigation.md. */
export const artspacePrimaryNav: ArtspaceNavItem[] = [
  { icon: 'home', label: 'Today', to: '/artspace' },
  { icon: 'image', label: 'My Works', to: '/artspace/works' },
  { icon: 'eye', label: 'Interest', to: '/artspace/interest' },
  { icon: 'briefcase', label: 'Opportunities', to: '/artspace/opportunities' },
  { icon: 'message', label: 'Messages', to: '/artspace/messages', badge: 3 },
];

/** Profile and settings live here rather than in the primary nav. */
export const artspaceAccountNav: ArtspaceNavItem[] = [
  { icon: 'user', label: 'Public Profile', to: '/artspace/profile' },
  { icon: 'credit-card', label: 'Billing', to: '/artspace/billing' },
  { icon: 'lock', label: 'Privacy', to: '/artspace/privacy' },
  { icon: 'shield-check', label: 'Security', to: '/artspace/security' },
  { icon: 'help-circle', label: 'Help Center', to: '/artspace/help' },
];

/* ── The signed-in artist ── */

export const artspaceArtist = {
  firstName: 'Maya',
  name: 'Maya Tan',
  discipline: 'Contemporary Painter',
  location: 'Kuala Lumpur, Malaysia',
  joinId: 'AT-MY-25-0001',
  memberSince: 'May 2025',
  avatarUrl: photo('photo-1494790108377-be9c29b29330', 160, 160),
  greeting: 'Good morning',
  statusLine: 'Here’s what’s happening with your art and opportunities today.',
  unreadNotifications: 5,
};

/* ── 1. Needs Your Decision ── */

export type DecisionItem = {
  id: string;
  icon: IconName;
  title: string;
  context: string;
  meta: string;
  action: string;
};

/** Capped at three by the spec — this module shows urgency, not a queue. */
export const needsDecision: DecisionItem[] = [
  {
    id: 'commission-proposal',
    icon: 'handshake',
    title: 'Commission Proposal',
    context: 'Brand Campaign Artwork',
    meta: 'Received 2 hours ago',
    action: 'Review',
  },
  {
    id: 'license-agreement',
    icon: 'file-text',
    title: 'License Agreement',
    context: 'Hotel Art Collection',
    meta: 'Waiting for your response',
    action: 'Respond',
  },
  {
    id: 'artwork-information',
    icon: 'pencil',
    title: 'Artwork Information',
    context: 'Fragments of Quiet #3',
    meta: 'Missing dimensions',
    action: 'Complete',
  },
];

/* ── 2. Real Interest ── */

export type InterestLevel = 'High' | 'Medium' | 'Low';

export type InterestItem = {
  id: string;
  name: string;
  detail: string;
  level: InterestLevel;
  time: string;
  avatarUrl: string;
};

export const realInterest: InterestItem[] = [
  {
    id: 'galerie-lumiere',
    name: 'Galerie Lumière',
    detail: 'Exhibition interest · Rhythm of Memory',
    level: 'High',
    time: '2h ago',
    avatarUrl: photo('photo-1506794778202-cad84cf45f1d', 80, 80),
  },
  {
    id: 'studio-a',
    name: 'Studio A',
    detail: 'Commission enquiry · New series',
    level: 'High',
    time: '5h ago',
    avatarUrl: photo('photo-1544005313-94ddf0286df2', 80, 80),
  },
  {
    id: 'private-collector',
    name: 'Private Collector',
    detail: 'Acquisition interest · Echoes',
    level: 'Medium',
    time: '1d ago',
    avatarUrl: photo('photo-1500648767791-00dcc994a43e', 80, 80),
  },
];

/* ── 3. Artworks at Work ── */

export type WorkStatus = 'On View' | 'In Progress' | 'Negotiation';

export type ArtworkAtWork = {
  id: string;
  title: string;
  detail: string;
  status: WorkStatus;
  date: string;
  imageUrl: string;
};

export const artworksAtWork: ArtworkAtWork[] = [
  {
    id: 'rhythm-of-memory',
    title: 'Rhythm of Memory',
    detail: 'Exhibition · Galerie Lumière',
    status: 'On View',
    date: 'May 8',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 120, 120),
  },
  {
    id: 'fragments-of-quiet-2',
    title: 'Fragments of Quiet #2',
    detail: 'Commission · Hotel Art Collection',
    status: 'In Progress',
    date: 'May 6',
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 120, 120),
  },
  {
    id: 'echoes',
    title: 'Echoes',
    detail: 'License · Brand Campaign',
    status: 'Negotiation',
    date: 'May 5',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 120, 120),
  },
];

/* ── 4. Best Opportunity ── */

export const bestOpportunity: {
  badge: string;
  title: string;
  summary: string;
  imageUrl: string;
  facts: { icon: IconName; label: string; value: string }[];
  action: string;
} = {
  badge: 'High Match',
  title: 'Hotel Art Collection',
  summary: 'Curated for boutique hotels worldwide.',
  imageUrl: photo('photo-1549887534-1541e9326642', 520, 640),
  facts: [
    { icon: 'credit-card', label: 'Budget', value: 'USD 10,000 - 15,000' },
    { icon: 'image', label: 'Format', value: 'Original Artwork' },
    { icon: 'calendar', label: 'Deadline', value: 'May 31, 2025' },
  ],
  action: 'View Opportunity',
};

/* ── 5. Money and Rights ── */

/** Recorded amounts only — no projections or estimates, per the spec. */
export const moneyAndRights: {
  earnings: { id: string; icon: IconName; label: string; value: string; note: string }[];
  rights: { id: string; label: string; value: string; note: string }[];
  imageUrl: string;
} = {
  earnings: [
    {
      id: 'completed',
      icon: 'bank',
      label: 'Completed Earnings',
      value: 'USD 8,450',
      note: 'From 3 transactions',
    },
    {
      id: 'pending',
      icon: 'hourglass',
      label: 'Pending Earnings',
      value: 'USD 5,200',
      note: 'From 2 transactions',
    },
  ],
  rights: [
    { id: 'licences', label: 'Active Licences', value: '2', note: 'On-going licences' },
    { id: 'protected', label: 'Rights Protected', value: '17', note: 'Artworks' },
  ],
  imageUrl: photo('photo-1513519245088-0e12902e5a38', 420, 420),
};

/* ── 6. Professional Readiness ── */

export const professionalReadiness: {
  score: number;
  verdict: string;
  note: string;
  tasks: { id: string; icon: IconName; title: string; detail: string; progress: number }[];
} = {
  score: 82,
  verdict: 'Strong',
  note: 'Keep building your professional presence.',
  tasks: [
    {
      id: 'dimensions',
      icon: 'image',
      title: 'Add dimensions to 4 artworks',
      detail: 'Complete artwork information',
      progress: 40,
    },
    {
      id: 'provenance',
      icon: 'shield-check',
      title: 'Add provenance for 3 artworks',
      detail: 'Strengthen your verification',
      progress: 33,
    },
    {
      id: 'biography',
      icon: 'user',
      title: 'Complete your biography',
      detail: 'Build trust with your story',
      progress: 60,
    },
  ],
};

/* ── Right rail ── */

export const quickActions: { id: string; icon: IconName; label: string }[] = [
  { id: 'add-artwork', icon: 'plus', label: 'Add New Artwork' },
  { id: 'upload-documents', icon: 'upload', label: 'Upload Documents' },
  { id: 'invite-collaborator', icon: 'users', label: 'Invite Collaborator' },
  { id: 'export-portfolio', icon: 'download', label: 'Export Portfolio (PDF)' },
];

export const helpResources: { id: string; icon: IconName; label: string; external: boolean }[] = [
  { id: 'creator-guide', icon: 'file-text', label: 'Artbank Creator Guide', external: true },
  { id: 'join-id', icon: 'file-text', label: 'Understanding Your JO1N ID', external: true },
  { id: 'licences', icon: 'file-text', label: 'Managing Licences', external: true },
  { id: 'support', icon: 'headset', label: 'Contact Support', external: false },
];
