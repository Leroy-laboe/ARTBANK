import type { IconName } from '../components/ui/Icon';

export const marketplaceStats: { icon: IconName; value: string; label: string }[] = [
  { icon: 'image', value: '12,540+', label: 'Artworks' },
  { icon: 'user', value: '1,250+', label: 'Verified Creators' },
  { icon: 'globe', value: '150+', label: 'Countries' },
  { icon: 'layers', value: 'RM 2.4B+', label: 'Total Artwork Value' },
];

export const categories: { icon: IconName; label: string; count: number }[] = [
  { icon: 'brush', label: 'Paintings', count: 1245 },
  { icon: 'cube', label: 'Sculptures', count: 324 },
  { icon: 'camera', label: 'Photography', count: 876 },
  { icon: 'monitor', label: 'Digital Art', count: 421 },
  { icon: 'pencil', label: 'Drawings', count: 598 },
  { icon: 'layers', label: 'Mixed Media', count: 312 },
  { icon: 'stack', label: 'Prints', count: 629 },
];

export const availability: { key: 'buy-now' | 'auction' | 'on-hold'; label: string; count: number }[] = [
  { key: 'buy-now', label: 'Buy Now', count: 1025 },
  { key: 'auction', label: 'Auction', count: 312 },
  { key: 'on-hold', label: 'On Hold', count: 86 },
];

export const toolbarTabs = ['All Artworks', 'Buy Now', 'Auctions', 'New Arrivals', 'Recently Sold'];

export const sortOptions = ['Most Popular', 'Price: Low to High', 'Price: High to Low', 'Highest MRI', 'Newest'];

export const trendingCreators = [
  {
    name: 'Wei Lun Khor',
    mriScore: 92.4,
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Ahmad Zaki',
    mriScore: 91.1,
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Yasmin Ahmad',
    mriScore: 89.7,
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Chong Fei',
    mriScore: 88.9,
    imageUrl: 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?w=100&h=100&fit=crop&auto=format&q=80',
  },
  {
    name: 'Liew Tuck Seng',
    mriScore: 88.1,
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&auto=format&q=80',
  },
];

export const curatedPicks = [
  {
    title: 'Emerging Talents',
    count: '328 Artworks',
    imageUrl: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=200&h=200&fit=crop&auto=format&q=80',
  },
  {
    title: 'Contemporary Icons',
    count: '412 Artworks',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=200&h=200&fit=crop&auto=format&q=80',
  },
  {
    title: 'Cultural Heritage',
    count: '256 Artworks',
    imageUrl: 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=200&h=200&fit=crop&auto=format&q=80',
  },
  {
    title: 'Investment Picks',
    count: '189 Artworks',
    imageUrl: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=200&h=200&fit=crop&auto=format&q=80',
  },
];

export const trustPoints: { icon: IconName; title: string; description: string }[] = [
  { icon: 'shield-check', title: 'Verified & Secure', description: 'All artworks and creators are verified by VERIS' },
  { icon: 'globe', title: 'Global Shipping', description: 'Secure delivery to your door worldwide' },
  { icon: 'check-circle', title: 'Buyer Protection', description: '14-day return policy for eligible purchases' },
  { icon: 'credit-card', title: 'Secure Payments', description: 'Encrypted transactions and secure payments' },
  { icon: 'headset', title: 'Expert Support', description: 'Our art specialists are here to help you' },
];

export const featuredCollection = {
  eyebrow: 'Featured Collection',
  title: 'Timeless Masterpieces',
  description: 'Curated works that define generations and transcend time.',
  imageUrl:
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
};
