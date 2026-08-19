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
  organization: string | null;
  collectingInterests: string[] | null;
  isMinor: boolean;
  createdAt: string;
}
