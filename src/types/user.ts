export type UserRole = 'artist' | 'buyer' | 'guardian' | 'partner' | 'admin';

/** Mirrors public.users — see supabase/migrations/0006_users_and_sessions.sql
 *  and 0007_update_user_roles_and_guardian_links.sql. */
export interface Profile {
  id: string;
  authUserId: string | null;
  jo1nIdentityId: string | null;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  status: 'active' | 'suspended' | 'deleted';
  country: string | null;
  /** ISO 3166-1 alpha-2, lowercase — set only when `country` was chosen from
   *  src/data/countries.ts (migration 0022). null for older free-text values
   *  that predate the picker; there is no flag to show until it's re-saved. */
  countryCode: string | null;
  organization: string | null;
  collectingInterests: string[] | null;
  isMinor: boolean;
  createdAt: string;

  /* ── Public profile (migration 0021) ── */
  artistName: string | null;
  nationality: string | null;
  website: string | null;
  /** The address the artist chose to publish. Never show `email`, which is
   *  the account address. */
  publicEmail: string | null;
  shortBio: string | null;
  artistStatement: string | null;
  coverUrl: string | null;
  mediums: string[];
  yearsActive: string | null;
  education: string | null;
  awards: string | null;
  /** {platform_id: url} — presentation only. */
  socialLinks: Record<string, string>;
  profileHandle: string | null;
  profileVisibility: 'public' | 'members' | 'private';
  showContactInformation: boolean;
  allowEnquiries: boolean;
  showArtworkPrices: boolean;
}
