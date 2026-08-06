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
  { name: 'Wei Lun Khor', mriScore: 92.4, gradient: 'linear-gradient(160deg, #cbb693 0%, #6b5335 100%)' },
  { name: 'Ahmad Zaki', mriScore: 91.1, gradient: 'linear-gradient(160deg, #e0a542 0%, #7a4a2a 100%)' },
  { name: 'Yasmin Ahmad', mriScore: 89.7, gradient: 'linear-gradient(160deg, #b98a52 0%, #6b4a2c 100%)' },
  { name: 'Chong Fei', mriScore: 88.9, gradient: 'linear-gradient(160deg, #c81d3f 0%, #7e1027 100%)' },
  { name: 'Liew Tuck Seng', mriScore: 88.1, gradient: 'linear-gradient(160deg, #cfe3e8 0%, #37525c 100%)' },
];

export const curatedPicks = [
  { title: 'Emerging Talents', count: '328 Artworks', gradient: 'linear-gradient(160deg, #e58a3f 0%, #a3491f 45%, #1f1712 100%)' },
  { title: 'Contemporary Icons', count: '412 Artworks', gradient: 'linear-gradient(160deg, #cfcac0 0%, #948d80 55%, #423c33 100%)' },
  { title: 'Cultural Heritage', count: '256 Artworks', gradient: 'linear-gradient(160deg, #e7ddc8 0%, #b3a17c 55%, #4a3f2b 100%)' },
  { title: 'Investment Picks', count: '189 Artworks', gradient: 'linear-gradient(160deg, #7b2ff7 0%, #26124f 55%, #d13ba8 100%)' },
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
  gradient: 'linear-gradient(135deg, #4a3f33 0%, #241c14 55%, #100c08 100%)',
};
