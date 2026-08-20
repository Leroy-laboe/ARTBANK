import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import type { Profile, UserRole } from '../types/user';

/** Interim path while JO1N ID (id.jo1n.com) isn't live — Supabase's own
 *  email/password auth, wired directly from the browser. Does not touch the
 *  JO1N OIDC flow in server/, which remains the primary path once available. */

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

/** Only email, password and the artist/buyer choice are collected here. Names
 *  and the rest of the profile are deliberately left out — JO1N ID owns that
 *  data once it's live, and collecting it now would create a second source of
 *  truth to reconcile later. */
export async function signUp(email: string, password: string, role?: UserRole) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      ...(role ? { data: { role } } : {}),
      // Without this Supabase falls back to the project's default Site URL
      // (the landing page) once the confirmation link is clicked.
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function resendVerificationEmail(email: string) {
  const client = requireSupabase();
  const { error } = await client.auth.resend({ type: 'signup', email });
  if (error) throw error;
}

export async function getSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const client = requireSupabase();
  return client.auth.onAuthStateChange(callback);
}

/** Reads the caller's own public.users row — allowed by the
 *  "Users can read their own profile" RLS policy (auth.uid() = auth_user_id). */
export async function getMyProfile(): Promise<Profile | null> {
  const client = requireSupabase();
  const { data: sessionData } = await client.auth.getSession();
  if (!sessionData.session) return null;

  const { data, error } = await client
    .from('users')
    .select(
      'id, auth_user_id, jo1n_identity_id, email, display_name, avatar_url, role, status, country, organization, collecting_interests, is_minor, created_at',
    )
    .eq('auth_user_id', sessionData.session.user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    jo1nIdentityId: data.jo1n_identity_id,
    email: data.email,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    role: data.role,
    status: data.status,
    country: data.country,
    organization: data.organization,
    collectingInterests: data.collecting_interests,
    isMinor: data.is_minor,
    createdAt: data.created_at,
  };
}
