import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { randomToken } from './oidc.js';

/**
 * Service-role client: bypasses RLS. Every table it touches has RLS enabled
 * with no permissive policies, so the anon key can reach none of it — this
 * API is the only door, and authorization is enforced here in code.
 */
export const db = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export type User = {
  id: string;
  jo1n_identity_id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  status: string;
  created_at: string;
  last_login_at: string | null;
};

/**
 * Finds or creates the local profile for a JO1N identity.
 *
 * Matches on jo1n_identity_id — never on email, which users can change at the
 * IdP and which would otherwise let a re-registered address inherit someone
 * else's account.
 */
export async function upsertUserFromIdentity(claims: {
  sub: string;
  email?: string;
  name?: string;
}): Promise<User> {
  const { data: existing, error: findError } = await db
    .from('users')
    .select('*')
    .eq('jo1n_identity_id', claims.sub)
    .maybeSingle();

  if (findError) throw findError;

  if (existing) {
    const { data, error } = await db
      .from('users')
      .update({
        email: claims.email ?? existing.email,
        last_login_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return data as User;
  }

  if (!claims.email) throw new Error('Cannot create a user without an email claim');

  const { data, error } = await db
    .from('users')
    .insert({
      jo1n_identity_id: claims.sub,
      email: claims.email,
      // JO1N ID's userinfo returns the email as `name` when it has nothing
      // better, so don't store that as a display name.
      display_name: claims.name && claims.name !== claims.email ? claims.name : null,
      last_login_at: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as User;
}

export async function createSession(params: {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  userAgent?: string;
  ip?: string;
}) {
  const id = randomToken(32);
  const now = Date.now();

  const { error } = await db.from('sessions').insert({
    id,
    user_id: params.userId,
    access_token: params.accessToken,
    refresh_token: params.refreshToken ?? null,
    access_expires_at: new Date(now + params.expiresIn * 1000).toISOString(),
    user_agent: params.userAgent ?? null,
    ip: params.ip ?? null,
    expires_at: new Date(now + config.session.ttlDays * 86_400_000).toISOString(),
  });

  if (error) throw error;
  return id;
}

export type Session = {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  access_expires_at: string;
  expires_at: string;
  revoked_at: string | null;
  refreshing_at: string | null;
  user: User;
};

export async function getSessionWithUser(sessionId: string) {
  const { data, error } = await db
    .from('sessions')
    .select('*, user:users(*)')
    .eq('id', sessionId)
    .is('revoked_at', null)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();

  if (error) throw error;
  return data as Session | null;
}

/**
 * Tries to claim the right to refresh this session's tokens.
 *
 * JO1N ID rotates refresh tokens and treats reuse of a consumed one as an
 * attack — it revokes the whole family and kills the session. So exactly one
 * request may call the IdP. The conditional update is the lock: it only
 * matches when nobody holds the claim, or when a previous holder died and
 * left it stale, and Postgres settles the race for us.
 *
 * Returns true if we won and should refresh.
 */
export async function claimRefresh(sessionId: string, staleAfterMs = 15_000) {
  const staleBefore = new Date(Date.now() - staleAfterMs).toISOString();

  const { data, error } = await db
    .from('sessions')
    .update({ refreshing_at: new Date().toISOString() })
    .eq('id', sessionId)
    .or(`refreshing_at.is.null,refreshing_at.lt.${staleBefore}`)
    .select('id');

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function updateSessionTokens(params: {
  sessionId: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}) {
  const { error } = await db
    .from('sessions')
    .update({
      access_token: params.accessToken,
      // Rotation means a new refresh token arrives every time. Keep the old
      // one only if the IdP genuinely omitted a replacement.
      ...(params.refreshToken ? { refresh_token: params.refreshToken } : {}),
      access_expires_at: new Date(Date.now() + params.expiresIn * 1000).toISOString(),
      refreshing_at: null,
      last_seen_at: new Date().toISOString(),
    })
    .eq('id', params.sessionId);

  if (error) throw error;
}

/** Releases the claim without recording new tokens (i.e. the refresh failed). */
export async function releaseRefreshClaim(sessionId: string) {
  await db.from('sessions').update({ refreshing_at: null }).eq('id', sessionId);
}

export async function revokeSession(sessionId: string) {
  await db
    .from('sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId);
}

export async function saveAuthFlow(params: {
  state: string;
  codeVerifier: string;
  nonce: string;
  redirectTo?: string;
}) {
  const { error } = await db.from('auth_flows').insert({
    state: params.state,
    code_verifier: params.codeVerifier,
    nonce: params.nonce,
    redirect_to: params.redirectTo ?? null,
    // Short window: an authorization round-trip is seconds, not minutes.
    expires_at: new Date(Date.now() + 10 * 60_000).toISOString(),
  });
  if (error) throw error;
}

/** Single-use: reading a flow consumes it, so a replayed callback finds nothing. */
export async function consumeAuthFlow(state: string) {
  const { data, error } = await db
    .from('auth_flows')
    .delete()
    .eq('state', state)
    .gt('expires_at', new Date().toISOString())
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return data as { code_verifier: string; nonce: string; redirect_to: string | null } | null;
}
