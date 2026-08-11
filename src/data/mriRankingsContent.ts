import type { IconName } from '../components/ui/Icon';

export interface RankedCreator {
  rank: number;
  name: string;
  country: string;
  countryFlag: string;
  mriScore: number;
  trend: 'up' | 'down' | 'flat';
  imageUrl: string;
}

const MY_FLAG = 'https://flagcdn.com/w40/my.png';

export const podiumTop3: RankedCreator[] = [
  {
    rank: 1,
    name: 'Wei Lun Khor',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 96.8,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=380&fit=crop&auto=format&q=80',
  },
  {
    rank: 2,
    name: 'Nadia Safiya',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 94.2,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=380&fit=crop&auto=format&q=80',
  },
  {
    rank: 3,
    name: 'Ahmad Zaki',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 93.1,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=380&fit=crop&auto=format&q=80',
  },
];

export const top10Creators: RankedCreator[] = [
  ...podiumTop3,
  {
    rank: 4,
    name: 'Yasmin Ahmad',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 91.1,
    trend: 'down',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 5,
    name: 'Chong Fei',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 90.3,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 6,
    name: 'Iskandar Rahman',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 88.7,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 7,
    name: 'Liew Tuck Seng',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 87.8,
    trend: 'down',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 8,
    name: 'Aina Mikhail',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 86.4,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 9,
    name: 'Farid Abdullah',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 85.2,
    trend: 'flat',
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    rank: 10,
    name: 'Chang Mei Ling',
    country: 'Malaysia',
    countryFlag: MY_FLAG,
    mriScore: 84.1,
    trend: 'up',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&auto=format&q=80',
  },
];

export const rankingTypes: { icon: IconName; label: string }[] = [
  { icon: 'star', label: 'Top Creators' },
  { icon: 'trend-up', label: 'Rising Stars' },
  { icon: 'building', label: 'Top Institutions' },
  { icon: 'users', label: 'Top Collectors' },
];

export const mriGlobalStats: { icon: IconName; value: string; label: string }[] = [
  { icon: 'user', value: '12,540+', label: 'Creators Ranked' },
  { icon: 'globe', value: '150+', label: 'Countries' },
  { icon: 'image', value: '8.2M+', label: 'Artworks Analyzed' },
  { icon: 'layers', value: 'RM 2.4B+', label: 'Total Market Impact' },
  { icon: 'stack', value: '10M+', label: 'Data Points' },
  { icon: 'shield-check', value: '99.9%', label: 'Rank Accuracy' },
];

export const scoreDistribution = {
  average: 67.4,
  changePct: 6.2,
  tiers: [
    { label: 'Top 10%', sub: 'Score ≥ 90' },
    { label: 'Top 25%', sub: 'Score ≥ 75' },
    { label: 'Top 50%', sub: 'Score ≥ 50' },
  ],
  bars: [
    { range: '0-20', pct: 2 },
    { range: '20-40', pct: 4 },
    { range: '40-60', pct: 11 },
    { range: '60-80', pct: 20 },
    { range: '80-100', pct: 24 },
  ],
  scaleMax: 30,
};

export const risingStars: { name: string; mriScore: number; changePct: number; imageUrl: string }[] = [
  {
    name: 'Farid Abdullah',
    mriScore: 78.6,
    changePct: 24.5,
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=120&h=120&fit=crop&auto=format&q=80',
  },
  {
    name: 'Nura Zainal',
    mriScore: 76.3,
    changePct: 21.8,
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&auto=format&q=80',
  },
  {
    name: 'Khalid Hassan',
    mriScore: 74.9,
    changePct: 19.3,
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&auto=format&q=80',
  },
  {
    name: 'Zara Ismail',
    mriScore: 73.1,
    changePct: 18.7,
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&auto=format&q=80',
  },
  {
    name: 'Hafiz Rahman',
    mriScore: 72.4,
    changePct: 16.2,
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&h=120&fit=crop&auto=format&q=80',
  },
];

export const trendingTags = [
  'Contemporary',
  'Abstract',
  'Portrait',
  'Digital Art',
  'Sculpture',
  'Mixed Media',
  'Realism',
  'Street Art',
  'Landscape',
];

export const mriFeatures: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'shield-check',
    title: 'Data-Driven',
    description: 'Our rankings are based on verifiable market data, exhibition history, and peer recognition.',
  },
  {
    icon: 'globe',
    title: 'Global Coverage',
    description: 'Tracking creators and institutions across 150+ countries worldwide.',
  },
  {
    icon: 'trend-up',
    title: 'Transparent Methodology',
    description: 'MRI scores are calculated using a proprietary algorithm with multi-factor analysis.',
  },
  {
    icon: 'refresh',
    title: 'Updated Continuously',
    description: 'Real-time updates ensure our rankings reflect the latest market movements.',
  },
  {
    icon: 'award',
    title: 'Trusted Globally',
    description: 'Used by collectors, institutions, and media as the benchmark for art reputation.',
  },
];
