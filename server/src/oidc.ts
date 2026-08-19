import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import { config, type Jo1nEndpoints } from './config.js';

// Resolved once at boot from discovery — see initOidc().
let endpoints: Jo1nEndpoints | null = null;
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export function initOidc(resolved: Jo1nEndpoints) {
  endpoints = resolved;
  // Built here rather than at module load so the JWKS URL can come from
  // discovery. jose handles caching and key rotation internally.
  jwks = createRemoteJWKSet(new URL(resolved.jwks));
}

function eps(): Jo1nEndpoints {
  if (!endpoints) throw new Error('OIDC not initialised — call initOidc() at boot');
  return endpoints;
}

/** base64url without padding, per RFC 7636. */
function base64url(buf: Buffer) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomToken(bytes = 32) {
  return base64url(randomBytes(bytes));
}

/** PKCE S256: challenge = BASE64URL(SHA256(verifier)). */
export function pkceChallenge(verifier: string) {
  return base64url(createHash('sha256').update(verifier).digest());
}

export function buildAuthorizeUrl(params: {
  state: string;
  nonce: string;
  codeChallenge: string;
}) {
  const url = new URL(eps().authorize);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', config.jo1n.clientId);
  url.searchParams.set('redirect_uri', config.jo1n.redirectUri);
  // `profile` is what now gates name/role at JO1N's userinfo, and `email`
  // gates the email claim — request both or those claims come back empty.
  url.searchParams.set('scope', 'openid profile email');
  url.searchParams.set('state', params.state);
  url.searchParams.set('nonce', params.nonce);
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  return url.toString();
}

export type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
};

function basicAuthHeader() {
  return `Basic ${Buffer.from(`${config.jo1n.clientId}:${config.jo1n.clientSecret}`).toString('base64')}`;
}

/**
 * JO1N ID is strict about two things at the token endpoint: the body must be
 * application/x-www-form-urlencoded (anything else is rejected outright), and
 * client credentials go in an HTTP Basic header — its client-auth middleware
 * prefers Basic over body and refuses secrets in the query string.
 */
async function postToken(body: URLSearchParams, label: string): Promise<TokenResponse> {
  const res = await fetch(eps().token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`${label} failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as TokenResponse;
}

export function exchangeCode(code: string, codeVerifier: string) {
  return postToken(
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.jo1n.redirectUri,
      code_verifier: codeVerifier,
    }),
    'Token exchange',
  );
}

export function refreshTokens(refreshToken: string) {
  return postToken(
    new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    'Token refresh',
  );
}

export type IdTokenClaims = JWTPayload & {
  sub: string;
  email?: string;
  name?: string;
  full_name?: string;
  role?: string;
};

/**
 * Verifies the ID token against JO1N ID's published keys and checks issuer,
 * audience and nonce. Skipping audience would let a token minted for another
 * app in the ecosystem log someone into ARTBANK.
 */
export async function verifyIdToken(idToken: string, expectedNonce: string) {
  if (!jwks) throw new Error('OIDC not initialised — call initOidc() at boot');

  const { payload } = await jwtVerify(idToken, jwks, {
    issuer: config.jo1n.issuer,
    audience: config.jo1n.clientId,
  });

  if (payload.nonce !== expectedNonce) {
    throw new Error('ID token nonce mismatch — possible replay');
  }
  return payload as IdTokenClaims;
}

/** Fallback when no id_token comes back: ask the IdP who the token belongs to. */
export async function fetchUserinfo(accessToken: string): Promise<IdTokenClaims> {
  const res = await fetch(eps().userinfo, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`userinfo failed (${res.status})`);
  return (await res.json()) as IdTokenClaims;
}

/** JO1N ID's password-registration API. Now accepts an optional full name. */
export async function registerIdentity(payload: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const res = await fetch(eps().register, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: res.status, data };
}
