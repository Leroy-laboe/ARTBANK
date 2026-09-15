import type { IconName } from '../components/ui/Icon';

/** Shape shared by the admin shell's nav rows — see docs/pivot-checklist/
 *  29-feature-admin-functions.md for what each destination is for. */
export type AdminNavItem = {
  icon: IconName;
  label: string;
  to: string;
  badge?: number;
};

/** One of the four top-row summary cards on the Overview screen. `tone`
 *  picks the icon's background tint. */
export type AdminStat = {
  id: string;
  icon: IconName;
  value: string;
  label: string;
  note: string;
  tone: 'success' | 'gold' | 'danger';
  /** Set for the one card that carries a period-over-period change instead
   *  of a "requires action" link. */
  change?: string;
};

export type AdminQueueItemType = 'report' | 'coa' | 'match' | 'unclaimed';

/** A row in the "Requires Your Attention" queue — the one place all four
 *  admin functions in the pivot spec surface together. */
export type AdminQueueItem = {
  id: string;
  type: AdminQueueItemType;
  imageUrl: string;
  title: string;
  detailLines: string[];
  date: string;
  action: { label: string; variant: 'primary' | 'ghost' };
};

export type AdminQuickAction = {
  id: string;
  icon: IconName;
  label: string;
  detail: string;
  to: string;
};

export type AdminActivityItem = {
  id: string;
  tone: 'success' | 'muted';
  text: string;
  time: string;
};

export type AdminGlanceStat = {
  id: string;
  icon: IconName;
  value: string;
  label: string;
  change: string;
};

/* ── Manage Uploads (admin's own entrant uploads) ── */

export type AdminUploadedArtwork = {
  id: string;
  title: string;
  imageUrl: string;
  entrantName: string;
  year: string;
  medium: string;
  discipline: string;
  height: number | null;
  width: number | null;
  unit: 'cm' | 'in';
  description: string;
  uploadedDate: string;
  /** True once an admin has linked this record to a real account
   *  (artist_id is no longer null) — see Link Artworks. */
  claimed: boolean;
};

/* ── Users ── */

export type AdminUserRole = 'artist' | 'buyer' | 'guardian' | 'partner' | 'admin';
export type AdminUserStatus = 'active' | 'suspended' | 'deleted';

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: AdminUserRole;
  status: AdminUserStatus;
  joinedDate: string;
};

/* ── Link Artworks ── */

export type AdminMatchState = 'suggested' | 'none' | 'linked';

export type AdminUnclaimedArtwork = {
  id: string;
  title: string;
  imageUrl: string;
  entrantName: string;
  uploadedDate: string;
  matchState: AdminMatchState;
  suggestedEmail?: string;
};

/** A registered user the admin can search for when linking an unclaimed
 *  artwork by hand — docs/pivot-checklist/29's "manual search" path. */
export type AdminRegisteredUser = {
  id: string;
  name: string;
  email: string;
};

/* ── COA Review ── */

export type AdminEvidenceFile = {
  id: string;
  name: string;
  sizeLabel: string;
  uploadedDate: string;
  kind: 'image' | 'document';
  url: string;
};

export type AdminCoaCase = {
  id: string;
  title: string;
  artistName: string;
  artistEmail: string;
  year: string;
  medium: string;
  dimensions: string;
  description: string;
  images: string[];
  evidenceFiles: AdminEvidenceFile[];
};

/* ── Flagged Conversations ── */

export type AdminFlagCategory = 'report' | 'block' | 'archive';

export type AdminFlagMessage = {
  id: string;
  sender: string;
  time: string;
  text: string;
};

export type AdminFlaggedConversation = {
  id: string;
  category: AdminFlagCategory;
  reasonLabel: string;
  participants: string[];
  date: string;
  messages: AdminFlagMessage[];
};
