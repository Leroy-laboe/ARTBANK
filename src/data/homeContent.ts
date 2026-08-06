import type { IconName } from '../components/ui/Icon';
import type { Creator } from '../types/creator';

export const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Marketplace', href: '/marketplace' },
  { label: 'Creators', href: '/creators' },
  { label: 'MRI Rankings', href: '/mri-rankings' },
  { label: 'ARTCHIVE', href: '/archive' },
  { label: 'ARTICON', href: '/articon' },
  { label: 'ARTCADEMY', href: '/academy' },
  { label: 'Membership', href: '/membership' },
];

export const trustedBy: { name: string; icon?: IconName }[] = [
  { name: "Sotheby's" },
  { name: 'CHRISTIE’S' },
  { name: 'MoMA' },
  { name: 'THE MET' },
  { name: 'Louvre' },
  { name: 'British Council', icon: 'grid-dots' },
];

export const heroStats = [
  { icon: 'shield-check' as IconName, value: '1M+', label: 'Verified Creators' },
  { icon: 'image' as IconName, value: '250K+', label: 'Artworks' },
  { icon: 'globe' as IconName, value: '150+', label: 'Countries' },
  { icon: 'user' as IconName, value: '500K+', label: 'Collectors' },
  { icon: 'layers' as IconName, value: 'RM 2.4B+', label: 'Total Artwork Value' },
];

export const collections = [
  {
    id: 'col-1',
    title: 'Timeless Masterpieces',
    count: '1,248 Artworks',
    gradient: 'linear-gradient(160deg, #cbb693 0%, #6b5335 55%, #241c14 100%)',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/500px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  },
  {
    id: 'col-2',
    title: 'Emerging Talents',
    count: '2,045 Artworks',
    gradient: 'linear-gradient(160deg, #e58a3f 0%, #a3491f 45%, #1f1712 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=520&fit=crop&auto=format&q=80',
  },
  {
    id: 'col-3',
    title: 'Sculptures & 3D Art',
    count: '1,023 Artworks',
    gradient: 'linear-gradient(160deg, #cfcac0 0%, #948d80 55%, #423c33 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?w=400&h=520&fit=crop&auto=format&q=80',
  },
  {
    id: 'col-4',
    title: 'Photography Excellence',
    count: '1,876 Artworks',
    gradient: 'linear-gradient(160deg, #e9ecef 0%, #9aa4ab 55%, #384049 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=520&fit=crop&auto=format&q=80',
  },
  {
    id: 'col-5',
    title: 'Digital & New Media',
    count: '1,129 Artworks',
    gradient: 'linear-gradient(160deg, #7b2ff7 0%, #26124f 55%, #d13ba8 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=520&fit=crop&auto=format&q=80',
  },
  {
    id: 'col-6',
    title: 'Cultural Heritage',
    count: '1,553 Artworks',
    gradient: 'linear-gradient(160deg, #e7ddc8 0%, #b3a17c 55%, #4a3f2b 100%)',
    imageUrl: 'https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400&h=520&fit=crop&auto=format&q=80',
  },
];

export const spotlightCreator: Creator = {
  id: 'creator-1',
  name: 'Wei Lun Khor',
  title: 'Contemporary Painter',
  bio: 'I explore the intersection of memory and identity through layered textures and monochromatic harmony.',
  mriScore: 92.4,
  artworkCount: 87,
  followers: '24.8K',
  gradient: 'linear-gradient(160deg, #4a3f33 0%, #201a14 70%, #0c0a08 100%)',
  imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=760&fit=crop&auto=format&q=80',
};

export const whyArtbank: { icon: IconName; title: string; description: string }[] = [
  {
    icon: 'shield-check',
    title: 'VERIS Verification',
    description: 'Multi-layer identity and authenticity verification for every creator and artwork.',
  },
  {
    icon: 'layers',
    title: 'MRI Rankings',
    description: 'Transparent, data-driven ranking system that recognizes true impact and influence.',
  },
  {
    icon: 'image',
    title: 'ARTCHIVE',
    description: 'Permanent digital archive preserving creator legacy for future generations.',
  },
  {
    icon: 'bag',
    title: 'ARTCADE Marketplace',
    description: 'Trusted marketplace for collecting, selling and investing in creative value.',
  },
  {
    icon: 'globe',
    title: 'ARTICON',
    description: 'Creator economy built on identity, opportunity and global collaboration.',
  },
  {
    icon: 'graduation-cap',
    title: 'ARTCADEMY',
    description: 'Learn, grow and connect through world-class creative education and resources.',
  },
];

export const membershipPerks: { icon: IconName; label: string }[] = [
  { icon: 'bag', label: 'Marketplace Access' },
  { icon: 'user', label: 'Creator Profile' },
  { icon: 'layers', label: 'MRI Analytics' },
  { icon: 'graduation-cap', label: 'Courses & Workshops' },
  { icon: 'clock', label: 'Early Access' },
  { icon: 'crown', label: 'Exclusive Events' },
];

export const testimonialAvatars = [
  'linear-gradient(160deg,#e8c9a0,#8a5a34)',
  'linear-gradient(160deg,#c9d6e8,#4a6a8a)',
  'linear-gradient(160deg,#2a2620,#5a5248)',
  'linear-gradient(160deg,#e8d6c9,#a3714a)',
  'linear-gradient(160deg,#d94f4f,#7a1f1f)',
  'linear-gradient(160deg,#c9b8e8,#5a3f8a)',
  'linear-gradient(160deg,#a3c9a0,#345a34)',
  'linear-gradient(160deg,#e8e0c9,#8a7a3f)',
];

export const footerLinks = {
  platform: ['Marketplace', 'Creators', 'MRI Rankings', 'ARTCHIVE'],
  resources: ['ARTCADEMY', 'Membership', 'Help Center', 'Guides'],
  company: ['About Us', 'Careers', 'Press', 'Contact'],
};
