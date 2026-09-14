// Data for Admin → Link Artworks — docs/pivot-checklist/
// 29-feature-admin-functions.md's function #2: matching an unclaimed
// artwork (artist_id null) to the registered user it actually belongs to.

import type { AdminRegisteredUser, AdminUnclaimedArtwork } from '../types/admin';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export const adminUnclaimedArtworks: AdminUnclaimedArtwork[] = [
  {
    id: 'ua1',
    title: 'Untitled (Series 2)',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 160, 160),
    entrantName: 'Jordan Ellis',
    uploadedDate: '13 Oct 2024',
    matchState: 'suggested',
    suggestedEmail: 'jordan.ellis@gmail.com',
  },
  {
    id: 'ua2',
    title: 'City Reflections',
    imageUrl: photo('photo-1549887534-1541e9326642', 160, 160),
    entrantName: 'Samira Khan',
    uploadedDate: '12 Oct 2024',
    matchState: 'none',
  },
  {
    id: 'ua3',
    title: 'Forest Study',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 160, 160),
    entrantName: 'Alex Rivera',
    uploadedDate: '11 Oct 2024',
    matchState: 'suggested',
    suggestedEmail: 'alex.rivera@gmail.com',
  },
  {
    id: 'ua4',
    title: 'Pieces of Home',
    imageUrl: photo('photo-1513519245088-0e12902e5a38', 160, 160),
    entrantName: 'Taylor Morgan',
    uploadedDate: '10 Oct 2024',
    matchState: 'none',
  },
];

/** Registered users the admin can search when there's no suggested match —
 *  a small stand-in for a real users-table lookup. */
export const adminRegisteredUsers: AdminRegisteredUser[] = [
  { id: 'u1', name: 'Samira Khan', email: 'samira.khan@gmail.com' },
  { id: 'u2', name: 'Taylor Morgan', email: 'taylor.morgan@outlook.com' },
  { id: 'u3', name: 'Priya Shah', email: 'priya.shah@gmail.com' },
  { id: 'u4', name: 'Daniel Park', email: 'daniel.park@gmail.com' },
];
