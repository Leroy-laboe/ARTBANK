import type { IconName } from '../components/ui/Icon';

export const creatorsStats: { icon: IconName; value: string; label: string }[] = [
  { icon: 'user', value: '12,540+', label: 'Creators' },
  { icon: 'users', value: '150+', label: 'Countries' },
  { icon: 'palette', value: '250+', label: 'Art Styles' },
  { icon: 'globe', value: 'RM 2.4B+', label: 'Total Artwork Value' },
];

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

export const creatorSortOptions = ['MRI Score', 'Most Followed', 'Newest', 'Most Artworks', 'Alphabetical'];

export const topCreators = [
  {
    name: 'Wei Lun Khor',
    mriScore: 96.8,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Nadia Safiya',
    mriScore: 94.2,
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Ahmad Zaki',
    mriScore: 92.1,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Yasmin Ahmad',
    mriScore: 91.1,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Chong Fei',
    mriScore: 90.3,
    imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&h=100&fit=crop&auto=format&q=80',
  },
];

export const trendingStyles = [
  { label: 'Contemporary', count: 2540 },
  { label: 'Abstract', count: 2130 },
  { label: 'Realism', count: 1890 },
  { label: 'Surrealism', count: 1220 },
  { label: 'Minimalism', count: 980 },
  { label: 'Pop Art', count: 870 },
];

export const featuredCreator = {
  name: 'Wei Lun Khor',
  title: 'Contemporary Painter',
  mriScore: 96.8,
  rankLabel: 'Top 1%',
  rankSubLabel: 'Top Creator',
  imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=760&fit=crop&auto=format&q=80',
};

export const creatorsCollage = [
  { imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=520&fit=crop&auto=format&q=80' },
  { imageUrl: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=420&h=560&fit=crop&auto=format&q=80' },
  { imageUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=520&fit=crop&auto=format&q=80' },
];
