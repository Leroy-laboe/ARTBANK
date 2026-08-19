import {
  claimRefresh,
  getSessionWithUser,
  releaseRefreshClaim,
  revokeSession,
  updateSessionTokens,
  type Session,
} from './db.js';
import { refreshTokens } from './oidc.js';

/** Refresh this far ahead of expiry, so a request in flight doesn't land on
 *  a token that died mid-call. JO1N access tokens live 900s. */
const EXPIRY_SKEW_MS = 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isFresh(session: Session) {
  return new Date(session.access_expires_at).getTime() - EXPIRY_SKEW_MS > Date.now();
}

/**
 * Returns a currently-valid JO1N access token for this session, refreshing it
 * if needed, or null if the session can no longer be renewed.
 *
 * Only needed when calling JO1N ID on the user's behalf — /api/me answers from
 * our own tables and never touches this.
 *
 * The claim/loser dance exists because JO1N rotates refresh tokens and treats
 * reuse as an attack: two concurrent refreshes would revoke the token family
 * and log the user out. Only the claim winner talks to the IdP; losers wait
 * for it to land and re-read the row.
 */
export async function getValidAccessToken(sessionId: string): Promise<string | null> {
  const session = await getSessionWithUser(sessionId);
  if (!session) return null;
  if (isFresh(session)) return session.access_token;
  if (!session.refresh_token) return null;

  const won = await claimRefresh(sessionId);

  if (!won) {
    // Someone else is refreshing. Give them a moment, then take their result.
    for (let attempt = 0; attempt < 10; attempt++) {
      await sleep(150);
      const latest = await getSessionWithUser(sessionId);
      if (!latest) return null;
      if (isFresh(latest)) return latest.access_token;
    }
    return null;
  }

  try {
    const tokens = await refreshTokens(session.refresh_token);
    await updateSessionTokens({
      sessionId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
    });
    return tokens.access_token;
  } catch {
    // A failed refresh means the token was revoked, expired, or flagged for
    // reuse. None of those are recoverable — end the session rather than
    // leaving a husk that fails on every subsequent call.
    await releaseRefreshClaim(sessionId);
    await revokeSession(sessionId);
    return null;
  }
}
