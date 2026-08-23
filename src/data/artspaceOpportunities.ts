// Content for ArtSpace → Opportunities.
//
// Per docs/pivot-checklist/14-opportunities.md this is a personalised match,
// not a generic listing: every opportunity records WHY it matches and WHAT is
// still missing before the artist can apply. Nothing auto-submits — applying
// is always an explicit human action.

import type { IconName } from '../components/ui/Icon';
import type { Tip } from '../components/artspace/TipsPanel';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Vocabulary ── */

/** Where the artist stands with this opportunity. */
export type OpportunityStage =
  | 'Invited'
  | 'Applied'
  | 'Shortlisted'
  | 'Under Review'
  | 'Negotiation'
  | 'Won'
  | 'Completed'
  | 'Not a Fit';

export type MatchStrength = 'Strong' | 'Good' | 'Partial' | 'Weak';

export type Opportunity = {
  id: string;
  title: string;
  organizer: string;
  /** Organiser identity check — the spec asks for "Organization Verified". */
  organizerVerified: boolean;
  location: string;
  summary: string;
  category: string;
  medium: string;
  deadline: string;
  daysLeft: number;
  budget: string;
  /** Entry fee, where the organiser charges one. */
  fee: string | null;
  stage: OpportunityStage;
  /** Sentence shown inside the status box. */
  stageNote: string;
  featured: boolean;
  imageUrl: string;
  match: MatchStrength;
  matchScore: number;
  /** Why this matched — the spec forbids unexplained recommendations. */
  whyMatch: string;
  /** What the artist still has to complete before they can apply. Empty
   *  means nothing is blocking them. */
  missing: string[];
};

export const opportunities: Opportunity[] = [
  {
    id: 'solo-exhibition',
    title: 'Solo Exhibition Opportunity',
    organizer: 'The Substation',
    organizerVerified: true,
    location: 'Singapore',
    summary: 'Inviting contemporary artists for a solo exhibition in our main gallery in Q4 2025.',
    category: 'Visual Arts',
    medium: 'All Mediums',
    deadline: 'Jun 15, 2025',
    daysLeft: 18,
    budget: 'USD 3,000',
    fee: null,
    stage: 'Invited',
    stageNote: 'You’ve been invited to apply',
    featured: true,
    imageUrl: photo('photo-1577720580479-7d839d829c73', 400, 300),
    match: 'Strong',
    matchScore: 95,
    whyMatch: 'Medium, location and career stage match your profile.',
    missing: ['Artist statement'],
  },
  {
    id: 'corporate-collection',
    title: 'Corporate Collection Acquisition',
    organizer: 'Art Collectors Group',
    organizerVerified: true,
    location: 'Kuala Lumpur, Malaysia',
    summary: 'Seeking original artworks for our corporate collection focusing on Southeast Asian artists.',
    category: 'Painting, Mixed Media',
    medium: 'Acrylic, Oil, Mixed Media',
    deadline: 'Jun 30, 2025',
    daysLeft: 33,
    budget: 'USD 1,000 - 10,000',
    fee: null,
    stage: 'Shortlisted',
    stageNote: 'You’ve been shortlisted for this opportunity',
    featured: false,
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 400, 300),
    match: 'Strong',
    matchScore: 88,
    whyMatch: 'Your medium and region match what the collection is seeking.',
    missing: [],
  },
  {
    id: 'hospitality-art',
    title: 'Hospitality Art Project',
    organizer: 'Design Haus',
    organizerVerified: true,
    location: 'Dubai, UAE',
    summary: 'Commissioning artworks for a luxury hotel opening in early 2026.',
    category: 'Photography, Painting',
    medium: 'All Mediums',
    deadline: 'Jul 10, 2025',
    daysLeft: 43,
    budget: 'USD 5,000 - 15,000',
    fee: null,
    stage: 'Under Review',
    stageNote: 'Your application is being reviewed',
    featured: false,
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 400, 300),
    match: 'Good',
    matchScore: 82,
    whyMatch: 'Scale and commission experience match the brief.',
    missing: [],
  },
  {
    id: 'international-art-fair',
    title: 'International Art Fair',
    organizer: 'Art Dubai',
    organizerVerified: true,
    location: 'Dubai, UAE',
    summary: 'Open call for galleries and artists for the 2026 edition of Art Dubai.',
    category: 'Visual Arts',
    medium: 'All Mediums',
    deadline: 'Aug 1, 2025',
    daysLeft: 65,
    budget: 'On Request',
    fee: 'USD 20',
    stage: 'Not a Fit',
    stageNote: 'This opportunity may not be the right fit',
    featured: false,
    imageUrl: photo('photo-1580136579312-94651dfd596d', 400, 300),
    match: 'Weak',
    matchScore: 41,
    whyMatch: 'Open to galleries first; solo artists are considered second.',
    missing: ['Gallery representation', 'Exhibition history'],
  },
];

/* ── Tabs and filters ── */

export const opportunityTabs = [
  { id: 'all', label: 'All Opportunities' },
  { id: 'invitations', label: 'Invitations', count: 7 },
  { id: 'applications', label: 'Applications', count: 5 },
  { id: 'shortlisted', label: 'Shortlisted', count: 4 },
  { id: 'negotiation', label: 'Negotiation', count: 2 },
  { id: 'won', label: 'Won', count: 3 },
  { id: 'completed', label: 'Completed', count: 12 },
  { id: 'not-a-fit', label: 'Not a Fit' },
];

export const opportunityFilters: { id: string; label: string; options: string[] }[] = [
  { id: 'type', label: 'Type', options: ['All Types', 'Exhibition', 'Commission', 'Acquisition', 'Residency', 'Art Fair'] },
  { id: 'category', label: 'Category', options: ['All Categories', 'Visual Arts', 'Painting', 'Photography', 'Sculpture', 'Mixed Media'] },
  { id: 'medium', label: 'Medium', options: ['All Mediums', 'Acrylic', 'Oil', 'Mixed Media', 'Charcoal', 'Digital'] },
  { id: 'location', label: 'Location', options: ['All Locations', 'Singapore', 'Malaysia', 'UAE', 'United Kingdom', 'Japan'] },
];

export const opportunitySorts = ['Most Relevant', 'Deadline Soonest', 'Budget Highest', 'Recently Added'];

export const opportunitiesPaging = {
  from: 1,
  to: 4,
  total: 28,
  page: 1,
  totalPages: 7,
};

/* ── Right rail ── */

export const opportunitiesOverview: {
  ranges: string[];
  stats: { id: string; value: string; label: string }[];
} = {
  ranges: ['All time', 'This year', 'Last 90 days'],
  stats: [
    { id: 'total', value: '28', label: 'Total Opportunities' },
    { id: 'invitations', value: '7', label: 'Invitations' },
    { id: 'applications', value: '5', label: 'Applications' },
    { id: 'shortlisted', value: '4', label: 'Shortlisted' },
    { id: 'negotiation', value: '2', label: 'In Negotiation' },
    { id: 'won', value: '3', label: 'Won' },
  ],
};

export const topMatches: {
  id: string;
  title: string;
  organizer: string;
  location: string;
  score: number;
  imageUrl: string;
}[] = [
  {
    id: 'solo-exhibition',
    title: 'Solo Exhibition Opportunity',
    organizer: 'The Substation',
    location: 'Singapore',
    score: 95,
    imageUrl: photo('photo-1577720580479-7d839d829c73', 120, 120),
  },
  {
    id: 'corporate-collection',
    title: 'Corporate Acquisition',
    organizer: 'Art Collectors Group',
    location: '',
    score: 88,
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 120, 120),
  },
  {
    id: 'hospitality-art',
    title: 'Hospitality Art Project',
    organizer: 'Design Haus',
    location: 'Dubai',
    score: 82,
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 120, 120),
  },
];

export const opportunityTips: Tip[] = [
  {
    id: 'profile',
    icon: 'check-circle',
    title: 'Keep your profile complete',
    detail: 'Increase your chances by 40%',
  },
  {
    id: 'artworks',
    icon: 'check-circle',
    title: 'Add more high-quality artworks',
    detail: 'Showcase your best work',
  },
  {
    id: 'respond',
    icon: 'check-circle',
    title: 'Respond quickly',
    detail: 'Fast responses get noticed',
  },
];

/** Icon and tone for each stage's status box on an opportunity row. */
export const stageDisplay: Record<OpportunityStage, { icon: IconName; tone: string }> = {
  Invited: { icon: 'mail', tone: 'neutral' },
  Applied: { icon: 'file-text', tone: 'neutral' },
  Shortlisted: { icon: 'star', tone: 'info' },
  'Under Review': { icon: 'clock', tone: 'gold' },
  Negotiation: { icon: 'handshake', tone: 'gold' },
  Won: { icon: 'award', tone: 'success' },
  Completed: { icon: 'check-circle', tone: 'success' },
  'Not a Fit': { icon: 'x-circle', tone: 'muted' },
};
