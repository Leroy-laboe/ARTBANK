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
  /** Which filter this artist answers to. */
  discipline: Exclude<DisciplineFilter, 'All'>;
  /** What the card itself prints, which is often narrower than the filter
   *  bucket — a sculptor, a weaver and a woodworker all filter under Craft
   *  but shouldn't all be labelled "Craft" on their own card. */
  tag: string;
  imageUrl: string;
};

/** The three figures set beside the heading. Copy, not computed: the counts
 *  describe the whole platform, not the six artists shown below. */
export const disciplineStats: { value: string; label: string }[] = [
  { value: '6,800+', label: 'Verified creatives' },
  { value: '50+', label: 'Disciplines' },
  { value: 'Global', label: 'Community' },
];

export const disciplineArtists: DisciplineArtist[] = [
  {
    name: 'Maya Tan',
    role: 'Visual Artist',
    location: 'Kuala Lumpur',
    discipline: 'Visual Art',
    tag: 'Visual Art',
    imageUrl: photo('photo-1607746882042-944635dfe10e', 600, 400),
  },
  {
    name: 'Rafiq Noor',
    role: 'Sculptor',
    location: 'Penang',
    discipline: 'Craft',
    tag: 'Sculpture',
    imageUrl: photo('photo-1506794778202-cad84cf45f1d', 600, 400),
  },
  {
    name: 'Tara Gupta',
    role: 'Photographer',
    location: 'Singapore',
    discipline: 'Photography',
    tag: 'Photography',
    imageUrl: photo('photo-1517841905240-472988babdf9', 600, 400),
  },
  {
    name: 'Raj Patel',
    role: 'Graphic Designer',
    location: 'Kuala Lumpur',
    discipline: 'Design',
    tag: 'Design',
    imageUrl: photo('photo-1500648767791-00dcc994a43e', 600, 400),
  },
  {
    name: 'Azzura Othman',
    role: 'Textile Artist',
    location: 'Johor Bahru',
    discipline: 'Craft',
    tag: 'Craft',
    imageUrl: photo('photo-1531891437562-4301cf35b7e4', 600, 400),
  },
  {
    name: 'Nabil Yusof',
    role: 'Wood Artist',
    location: 'Terengganu',
    discipline: 'Craft',
    tag: 'Woodwork',
    imageUrl: photo('photo-1472099645785-5658abf4ff4e', 600, 400),
  },
];

/* ── Featured artist band ── */

/** One canvas in the featured artist's collection. The band hangs these
 *  beside her portrait as selectable panels, so each needs the wall-label
 *  detail a gallery would print: medium, year and size. */
export type FeaturedWork = {
  id: string;
  title: string;
  medium: string;
  year: number;
  dimensions: string;
  imageUrl: string;
};

export const featuredArtist = {
  eyebrow: 'Featured artist',
  // Split so the closing phrase can carry the gold accent the band's heading
  // is set in — the two halves read as one sentence.
  titleLead: 'Maya Tan turns material memory into',
  titleAccent: 'quiet, collectable form.',
  description:
    'Exploring the tension between nature and construction, Maya’s work meditates on time, erosion and the beauty of what lasts.',
  quote: 'I’m not interested in perfect surfaces. I’m interested in what’s hidden underneath.',
  meta: 'Kuala Lumpur, Malaysia · Visual Artist',
  cta: 'Discover Maya Tan',
  // Same portrait as her card in the discipline grid and the buyer matches
  // panel — she appears in three places and should be recognisably one person.
  // It's shot against a near-black ground on purpose: the band stands her in
  // front of the paintings, so anything bright behind her would float there
  // as a lit rectangle instead of sinking into the gallery wall.
  imageUrl: photo('photo-1607746882042-944635dfe10e', 800, 1000),
  // Her collection, hung beside the portrait. Same images and details she
  // already carries in artspaceActivity and the buyer catalogue, for the same
  // reason the portrait is shared: one artist, one body of work.
  works: [
    {
      id: 'tide-and-limestone',
      title: 'Tide and Limestone',
      medium: 'Oil on linen',
      year: 2025,
      dimensions: '120 × 90 cm',
      imageUrl: photo('photo-1515405295579-ba7b45403062', 760, 1010),
    },
    {
      id: 'stone-series-03',
      title: 'Stone Series — 03',
      medium: 'Mixed media on board',
      year: 2025,
      dimensions: '80 × 80 cm',
      imageUrl: photo('photo-1558865869-c93f6f8482af', 760, 1010),
    },
    {
      id: 'earthbound',
      title: 'Earthbound',
      medium: 'Acrylic and ash on canvas',
      year: 2024,
      dimensions: '150 × 110 cm',
      imageUrl: photo('photo-1487147264018-f937fba0c817', 760, 1010),
    },
    {
      id: 'silent-harmony',
      title: 'Silent Harmony',
      medium: 'Acrylic on canvas',
      year: 2024,
      dimensions: '60 × 80 cm',
      imageUrl: photo('photo-1536924940846-227afb31e2a5', 760, 1010),
    },
  ] satisfies FeaturedWork[],
};

/* ── ArtSpace overview (dashboard preview) ── */

/** What ArtSpace does for an artist, as the four promises made beside the
 *  dashboard preview. */
export const artspaceFeatures: { icon: IconName; badge: IconName; title: string; description: string }[] = [
  {
    icon: 'image',
    badge: 'plus',
    title: 'Showcase Your Work',
    description:
      'Organise, present and manage your artworks with ease. Keep your portfolio professional and up to date.',
  },
  {
    icon: 'globe',
    badge: 'sparkles',
    title: 'Discover Opportunities',
    description:
      'Get matched with real opportunities from galleries, collectors and organisations.',
  },
  {
    icon: 'trend-up',
    badge: 'arrow-right',
    title: 'Track Your Progress',
    description:
      'See your reach, enquiries and earnings in one place. Understand what’s working and grow your career.',
  },
  {
    icon: 'users',
    badge: 'user-plus',
    title: 'Build Your Network',
    description:
      'Connect with collectors, galleries and collaborators. Grow meaningful relationships in the art world.',
  },
];

/* The dashboard preview below is presentation only — a still of ArtSpace, not
   a live view. Everything it renders comes from the constants here. */

/** The name the preview is greeted by. One place to change it, since the
 *  same figure appears in the greeting and the avatar. */
export const artspaceDemoUser = 'Leroy';

export const artspaceNavGroups: {
  label: string;
  items: { icon: IconName; label: string; badge?: string }[];
}[] = [
  {
    label: 'ArtSpace',
    items: [
      { icon: 'home', label: 'Today' },
      { icon: 'image', label: 'My Works' },
      { icon: 'globe', label: 'Opportunities' },
      { icon: 'mail', label: 'Messages', badge: '3' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: 'user', label: 'Profile' },
      { icon: 'credit-card', label: 'Billing' },
      { icon: 'sliders', label: 'Settings' },
    ],
  },
];

export const artspaceStats: {
  icon: IconName;
  value: string;
  label: string;
  delta?: string;
  link?: string;
}[] = [
  { icon: 'mail', value: '2', label: 'New enquiries', delta: '+100%' },
  { icon: 'eye', value: '5', label: 'Profile views', delta: '+40%' },
  { icon: 'globe', value: '1', label: 'Active opportunity', link: 'View details' },
];

export const artspaceReadiness = {
  label: 'Portfolio readiness',
  percent: 82,
  action: 'Complete 2 steps',
};

/** The enquiries waiting on the artist. Capped on purpose — the panel's whole
 *  point is that it never grows into another inbox. */
export const artspaceDecisions: { kind: string; artwork: string; from: string; when: string }[] = [
  { kind: 'Acquisition enquiry', artwork: 'Echoes', from: 'Nyasha', when: '3h ago' },
  { kind: 'Acquisition enquiry', artwork: 'Fragments of Quiet #2', from: 'Nyasha', when: '13d ago' },
];

export const artspaceActionPlan: { status: string; artwork: string; step: string }[] = [
  { status: 'Presentable', artwork: 'Fragments of Quiet #2', step: 'Add ownership statement' },
  { status: 'Presentable', artwork: 'Golden Silence', step: 'Add ownership statement' },
  { status: 'Presentable', artwork: 'Echoes', step: 'Add ownership statement' },
];

export const artspaceActivity: { title: string; detail: string; time: string; imageUrl: string }[] = [
  {
    title: 'Tide and Limestone',
    detail: 'Artwork updated',
    time: '2h ago',
    // Same three works as featuredArtist.works above — they're both on the
    // homepage, so the thumbnails have to be the same paintings.
    imageUrl: photo('photo-1515405295579-ba7b45403062', 80, 80),
  },
  {
    title: 'Stone Series — 03',
    detail: 'New enquiry',
    time: '1d ago',
    imageUrl: photo('photo-1558865869-c93f6f8482af', 80, 80),
  },
  {
    title: 'Earthbound',
    detail: 'Shortlisted by a collector',
    time: '2d ago',
    imageUrl: photo('photo-1487147264018-f937fba0c817', 80, 80),
  },
];

/* ── For buyers ── */

/** What the platform offers a buyer, as the four promises made beside the
 *  dashboard preview. */
export const buyerFeatures: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'search',
    title: 'Explore Curated Artworks',
    description:
      'Discover original pieces from verified artists worldwide, with full context and details.',
  },
  {
    icon: 'bookmark',
    title: 'Save & Organise',
    description: 'Keep track of artworks you love and build curated collections.',
  },
  {
    icon: 'message',
    title: 'Make Informed Enquiries',
    description: 'Connect directly with artists through secure and transparent communication.',
  },
  {
    icon: 'building',
    title: 'Built for Collectors & Institutions',
    description:
      'Whether you’re an individual collector or an organisation, find art that fits your vision.',
  },
];

/* The buyer dashboard below is presentation only — a still of the collector
   side, not a live view. Everything it renders comes from the constants
   here. */

export const buyerDemoUser = { name: 'Nyasha', role: 'Collector' };

/** Two runs, split by a rule the way the real sidebar separates browsing from
 *  the things that sit underneath it. */
export const buyerNavGroups: { icon: IconName; label: string; badge?: string }[][] = [
  [
    { icon: 'home', label: 'Discover' },
    { icon: 'users', label: 'Artists' },
    { icon: 'heart', label: 'Following' },
    { icon: 'bookmark', label: 'Saved Works' },
    { icon: 'bag', label: 'Purchases' },
    { icon: 'mail', label: 'My Enquiries' },
    { icon: 'message', label: 'Messages', badge: '2' },
  ],
  [
    { icon: 'cube', label: 'Viewing Rooms' },
    { icon: 'help-circle', label: 'Help Center' },
  ],
];

export const buyerTrust: { icon: IconName; title: string; note: string }[] = [
  { icon: 'shield-check', title: 'Verified Artists', note: 'Every artist is verified' },
  { icon: 'sparkles', title: 'Original Artworks', note: '100% original creations' },
  { icon: 'lock', title: 'Secure & Private', note: 'Your privacy matters' },
  { icon: 'users', title: 'Meaningful Connections', note: 'Real people, real intent' },
];

/** Deliberately not Maya's works — this is the buyer's view of the wider
 *  catalogue, so it has to show artists the homepage hasn't already spent a
 *  section on. */
export const buyerFeaturedWorks: {
  title: string;
  artist: string;
  detail: string;
  price: string;
  imageUrl: string;
}[] = [
  {
    title: 'Whispers of Light',
    artist: 'Aisha Rahman',
    detail: 'Mixed Media on Canvas · 55 × 55 cm',
    price: 'Price on request',
    imageUrl: photo('photo-1541961017774-22349e4a1262', 420, 420),
  },
  {
    title: 'Tides of Memory',
    artist: 'Daniel Kwan',
    detail: 'Acrylic on Canvas · 80 × 60 cm',
    price: 'Price on request',
    imageUrl: photo('photo-1549490349-8643362247b5', 420, 420),
  },
  {
    title: 'Stillness Within',
    artist: 'Mei Lin Tan',
    detail: 'Oil on Canvas · 70 × 50 cm',
    price: 'Price on request',
    imageUrl: photo('photo-1508739773434-c26b3d09e071', 420, 420),
  },
  {
    title: 'Urban Echoes',
    artist: 'Ravi Sharma',
    detail: 'Digital Art Print · 90 × 70 cm',
    price: 'Price on request',
    imageUrl: photo('photo-1500462918059-b1a0cb512f1d', 420, 420),
  },
];

/** The painting shown inside the dashboard's own banner, and the gallery
 *  interior the whole still is set against. */
export const buyerBannerArt = photo('photo-1577720580479-7d839d829c73', 520, 420);
export const buyerRoomPhoto = photo('photo-1518998053901-5348d3961a04', 900, 700);

/* ── Market intelligence ── */

export const marketSignals: {
  rank: string;
  tag: string;
  value: string;
  label: string;
  note: string;
  imageUrl: string;
}[] = [
  {
    rank: '01',
    tag: 'Rising',
    value: '+34%',
    label: 'Site-specific installations',
    note: 'Buyer enquiries accelerating.',
    imageUrl: photo('photo-1487958449943-2429e8be8625', 300, 560),
  },
  {
    rank: '02',
    tag: 'Emerging',
    value: '2.1×',
    label: 'Southeast Asian artists',
    note: 'Growing institutional interest.',
    imageUrl: photo('photo-1464822759023-fed622ff2c3b', 300, 560),
  },
  {
    rank: '03',
    tag: 'Watch',
    value: '+27%',
    label: 'Sustainable art practices',
    note: 'Appearing in more sourcing briefs.',
    imageUrl: photo('photo-1600585154340-be6161a56a0c', 300, 560),
  },
];

/** What the reading is built from, set under the signals so the numbers above
 *  arrive with their sample size attached rather than as bare claims. */
export const marketFacts: { icon: IconName; value: string; label: string }[] = [
  { icon: 'file-text', value: '248', label: 'Enquiries analysed' },
  { icon: 'grid-dots', value: '17', label: 'Categories tracked' },
  { icon: 'clock', value: 'Last 90 days', label: 'Updated from buyer activity' },
];

/** The organic texture washed across the top-right of the band. */
export const marketTexture = photo('photo-1533134486753-c833f0ed4866', 800, 800);

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
  kicker: 'Your creative AI partner',
  // Split so the second sentence can carry the gold — the two halves are one
  // claim, stated then answered.
  titleLead: 'Not another chatbot.',
  titleAccent: 'A next-action guide for creative work.',
  description: 'Get clarity. Get direction. Get things done.',
  tags: [
    { icon: 'compass', label: 'Human guidance' },
    { icon: 'bolt', label: 'Action-oriented' },
    { icon: 'layers', label: 'Creative cognition' },
  ] satisfies { icon: IconName; label: string }[],
  cta: 'Chat with Jenaisis',
  // Two lines, set rather than left to wrap — the break belongs after the
  // comma, and at this letter-spacing a width cap lands it anywhere.
  ctaNote: ['Ideas to action,', 'with context.'],
  /** The four rungs set down the right edge — what Jenaisis carries forward. */
  ladder: ['People', 'Ideas', 'Creative work', 'Further'],
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

