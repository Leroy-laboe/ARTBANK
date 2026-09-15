// Demo fallback for Admin → Users. Real data comes from services/admin.ts's
// listUsers(), which requires migration 0035's "Admins read all users"
// policy — this is only what renders with no backend configured.

import type { AdminUserRow } from '../types/admin';

export const adminUsers: AdminUserRow[] = [
  { id: 'u1', name: 'Taylor Kim', email: 'taylor.kim@gmail.com', avatarUrl: null, role: 'artist', status: 'active', joinedDate: '3 Jan 2026' },
  { id: 'u2', name: 'Jordan Ellis', email: 'jordan.ellis@gmail.com', avatarUrl: null, role: 'artist', status: 'active', joinedDate: '18 Jan 2026' },
  { id: 'u3', name: 'Mia Carter', email: 'mia.carter@gmail.com', avatarUrl: null, role: 'buyer', status: 'active', joinedDate: '2 Feb 2026' },
  { id: 'u4', name: 'Daniel Park', email: 'daniel.park@gmail.com', avatarUrl: null, role: 'buyer', status: 'suspended', joinedDate: '9 Feb 2026' },
  { id: 'u5', name: 'Priya Shah', email: 'priya.shah@gmail.com', avatarUrl: null, role: 'guardian', status: 'active', joinedDate: '20 Feb 2026' },
];
