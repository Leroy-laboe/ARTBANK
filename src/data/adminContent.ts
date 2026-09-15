// Content for the Admin Portal — the screen an admin account lands on after
// signing in. Hand-authored mock data, same as the rest of src/data: nothing
// here is wired to a backend yet. The four real functions and the queue that
// surfaces them come from docs/pivot-checklist/29-feature-admin-functions.md.

import type {
  AdminActivityItem,
  AdminGlanceStat,
  AdminNavItem,
  AdminQueueItem,
  AdminQuickAction,
  AdminStat,
} from '../types/admin';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Shell: nav + admin identity ── */

export const adminPrimaryNav: AdminNavItem[] = [
  { icon: 'home', label: 'Overview', to: '/admin' },
  { icon: 'upload', label: 'Upload Artwork', to: '/admin/upload' },
  { icon: 'link', label: 'Link Artworks', to: '/admin/link' },
  { icon: 'file-text', label: 'COA Review', to: '/admin/coa' },
  { icon: 'message', label: 'Flagged Conversations', to: '/admin/flagged', badge: 3 },
  { icon: 'calendar', label: 'Opportunities', to: '/admin/opportunities' },
];

export const adminSecondaryNav: AdminNavItem[] = [
  { icon: 'users', label: 'Users', to: '/admin/users' },
  { icon: 'settings', label: 'System Settings', to: '/admin/settings' },
];

/** Demo identity — same "real once signed in, demo otherwise" pattern as
 *  artspaceArtist / useArtist. */
export const demoAdmin = {
  name: 'Alex Chen',
  roleLabel: 'Administrator',
  avatarUrl: photo('photo-1580489944761-15a19d654956', 160, 160),
  unreadNotifications: 3,
};

/* ── Hero band ── */

export const adminHero = {
  eyebrow: 'Admin Dashboard',
  title: 'Keeping Art Moving Forward.',
  description: 'Review, verify and support a trusted creative ecosystem.',
  quote: 'Art connects people. Our work keeps it real.',
  imageUrl: photo('photo-1577720580479-7d839d829c73', 1400, 500),
};

/* ── Stat cards ── */

export const adminStats: AdminStat[] = [
  {
    id: 'unclaimed',
    icon: 'upload',
    value: '12',
    label: 'Unclaimed Artworks',
    note: 'Awaiting account linking',
    tone: 'success',
  },
  {
    id: 'coa-pending',
    icon: 'file-text',
    value: '8',
    label: 'COAs Pending Review',
    note: 'Require assessment',
    tone: 'gold',
  },
  {
    id: 'open-reports',
    icon: 'flag',
    value: '5',
    label: 'Open Reports',
    note: 'Require investigation',
    tone: 'danger',
  },
  {
    id: 'uploads',
    icon: 'image',
    value: '34',
    label: 'Artworks Uploaded',
    note: 'This month',
    tone: 'success',
    change: '+12%',
  },
];

/* ── Requires Your Attention ── */

export const adminQueue: AdminQueueItem[] = [
  {
    id: 'q1',
    type: 'report',
    imageUrl: photo('photo-1541701494587-cb58502866ab', 120, 120),
    title: 'Reported conversation',
    detailLines: ['Inappropriate message', 'Mia Carter ↔ Daniel Park'],
    date: '12 Oct 2024 • 3 messages',
    action: { label: 'Review', variant: 'primary' },
  },
  {
    id: 'q2',
    type: 'coa',
    imageUrl: photo('photo-1502920917128-1aa500764cbd', 120, 120),
    title: 'COA request',
    detailLines: ['Coastal Memory', 'by Taylor Kim • 3 evidence files'],
    date: '14 Oct 2024',
    action: { label: 'Review', variant: 'primary' },
  },
  {
    id: 'q3',
    type: 'match',
    imageUrl: photo('photo-1519608487953-e999c86e7455', 120, 120),
    title: 'Suggested artwork match',
    detailLines: ['Untitled (Series 2)', 'Uploaded by admin • 13 Oct 2024', 'Suggested user: jordan.ellis@gmail.com'],
    date: '13 Oct 2024',
    action: { label: 'Confirm', variant: 'primary' },
  },
  {
    id: 'q4',
    type: 'unclaimed',
    imageUrl: photo('photo-1577720580479-7d839d829c73', 120, 120),
    title: 'New unclaimed artwork',
    detailLines: ['City Reflections', 'Uploaded by admin • 12 Oct 2024', 'Entrant name: Samira Khan'],
    date: '12 Oct 2024',
    action: { label: 'View', variant: 'ghost' },
  },
];

/* ── Quick Actions ── */

export const adminQuickActions: AdminQuickAction[] = [
  {
    id: 'upload',
    icon: 'upload',
    label: 'Upload artwork for someone',
    detail: 'Create a new artwork record',
    to: '/admin/upload',
  },
  {
    id: 'link',
    icon: 'link',
    label: 'Link unclaimed artwork',
    detail: 'Match to a registered user',
    to: '/admin/link',
  },
  {
    id: 'coa',
    icon: 'file-text',
    label: 'Review COA queue',
    detail: 'Assess submitted evidence',
    to: '/admin/coa',
  },
  {
    id: 'flagged',
    icon: 'message',
    label: 'Moderate flagged conversations',
    detail: 'Review reports and take action',
    to: '/admin/flagged',
  },
  {
    id: 'opportunity',
    icon: 'calendar',
    label: 'Add opportunity',
    detail: 'Create and verify new opportunity',
    to: '/admin/opportunities',
  },
];

export const adminQuote = {
  lines: ['More creators.', 'More opportunities.', 'A brighter tomorrow.'],
  imageUrl: photo('photo-1620121692029-d088224ddc74', 700, 500),
};

/* ── Recent Admin Activity ── */

export const adminActivity: AdminActivityItem[] = [
  { id: 'a1', tone: 'success', text: 'Updated COA status to issued', time: '2 hours ago' },
  { id: 'a2', tone: 'success', text: 'Linked artwork to user (jordan.ellis@gmail.com)', time: '4 hours ago' },
  { id: 'a3', tone: 'muted', text: 'Reviewed reported conversation', time: '6 hours ago' },
  { id: 'a4', tone: 'muted', text: 'Uploaded artwork (Competition entry)', time: '1 day ago' },
  { id: 'a5', tone: 'muted', text: 'Added new opportunity', time: '1 day ago' },
];

/* ── Platform at a Glance ── */

export const adminGlanceRanges = ['Last 30 days', 'Last 90 days', 'This year'];

export const adminGlanceStats: AdminGlanceStat[] = [
  { id: 'artworks', icon: 'image', value: '248', label: 'Total Artworks', change: '+18%' },
  { id: 'artists', icon: 'users', value: '186', label: 'Registered Artists', change: '+12%' },
  { id: 'buyers', icon: 'message', value: '92', label: 'Active Buyers', change: '+20%' },
  { id: 'opportunities', icon: 'calendar', value: '15', label: 'Opportunities', change: '+7%' },
];
