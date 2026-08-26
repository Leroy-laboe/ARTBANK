import type { IconName } from '../components/ui/Icon';

export const creatorCategories: { icon: IconName; label: string; count: number }[] = [
  { icon: 'brush', label: 'Painters', count: 4258 },
  { icon: 'cube', label: 'Sculptors', count: 1102 },
  { icon: 'camera', label: 'Photographers', count: 2341 },
  { icon: 'monitor', label: 'Digital Artists', count: 1896 },
  { icon: 'pencil', label: 'Illustrators', count: 1245 },
  { icon: 'layers', label: 'Mixed Media', count: 1698 },
  { icon: 'stack', label: 'Printmakers', count: 856 },
];

export const careerStages: { key: 'emerging' | 'established' | 'master'; label: string; count: number }[] = [
  { key: 'emerging', label: 'Emerging', count: 5293 },
  { key: 'established', label: 'Established', count: 4103 },
  { key: 'master', label: 'Master', count: 1144 },
];

export const creatorSortOptions = ['Most Followed', 'Newest', 'Most Artworks', 'Alphabetical'];

export const trendingStyles = [
  { label: 'Contemporary', count: 2540 },
  { label: 'Abstract', count: 2130 },
  { label: 'Realism', count: 1890 },
  { label: 'Surrealism', count: 1220 },
  { label: 'Minimalism', count: 980 },
  { label: 'Pop Art', count: 870 },
];

export const creatorsCollage = [
  { imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=520&fit=crop&auto=format&q=80' },
  { imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=420&h=560&fit=crop&auto=format&q=80' },
  { imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=520&fit=crop&auto=format&q=80' },
];
