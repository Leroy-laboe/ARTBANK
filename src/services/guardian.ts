import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Guardian linking and approval. Requires migrations 0026 and 0030.
 *
 *  Every read and write here goes through a Postgres function rather than a
 *  table policy — guardian_links stays service-role-only at the table level
 *  (0007), so the only way to touch a row is through one of these narrow,
 *  security-definer functions. See docs/pivot-checklist/15-messages.md's hard
 *  rule: a minor cannot receive uncontrolled adult contact, and an unapproved
 *  request must not count as a guardian.
 *
 *  0030: naming a guardian never requires them to already have an account —
 *  a real guardian usually doesn't. `hasAccount` on MyGuardianLink is false
 *  until whoever owns that email actually signs up, at which point it's
 *  claimed automatically. */

export type MyGuardianLink = {
  /** Null until the guardian has an account — there's nothing to name them
   *  by yet beyond the email that was entered. */
  guardianName: string | null;
  guardianEmail: string;
  hasAccount: boolean;
  verifiedAt: string | null;
  createdAt: string;
};

export type GuardianRequest = {
  minorId: string;
  minorName: string;
  minorEmail: string;
  verifiedAt: string | null;
  createdAt: string;
};

type GuardianLinkRow = {
  guardian_name: string | null;
  guardian_email: string;
  has_account: boolean;
  verified_at: string | null;
  created_at: string;
};

type GuardianRequestRow = {
  minor_id: string;
  minor_name: string;
  minor_email: string;
  verified_at: string | null;
  created_at: string;
};

const errorText: Record<string, string> = {
  cannot_link_self: "You can't name yourself as your own guardian.",
  not_signed_in: 'You need to be signed in to do that.',
};

function friendlyError(error: { message: string }): Error {
  return new Error(errorText[error.message] ?? error.message);
}

/** Names (or replaces) the caller's guardian by email. Marks the caller as a
 *  minor immediately and resets any existing link back to unverified — a
 *  changed guardian has to be approved again, not inherited from the old one. */
export async function requestGuardianLink(guardianEmail: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase.rpc('request_guardian_link', { guardian_email: guardianEmail });
  if (error) throw friendlyError(error);
}

/** The caller's own guardian, or null if they haven't named one. */
export async function getMyGuardianLink(profile: Profile | null): Promise<MyGuardianLink | null> {
  if (!supabase || !profile) return null;

  const { data, error } = await supabase.rpc('my_guardian_link');
  if (error || !data || data.length === 0) return null;

  const row = (data as unknown as GuardianLinkRow[])[0];
  return {
    guardianName: row.guardian_name,
    guardianEmail: row.guardian_email,
    hasAccount: row.has_account,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  };
}

/** Everyone who has named the caller as their guardian, verified or not. */
export async function getGuardianRequests(profile: Profile | null): Promise<GuardianRequest[]> {
  if (!supabase || !profile) return [];

  const { data, error } = await supabase.rpc('my_guardian_requests');
  if (error || !data) return [];

  return (data as unknown as GuardianRequestRow[]).map((row) => ({
    minorId: row.minor_id,
    minorName: row.minor_name,
    minorEmail: row.minor_email,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
  }));
}

export async function approveGuardianLink(minorId: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase.rpc('approve_guardian_link', { target_minor_id: minorId });
  if (error) throw friendlyError(error);
}
