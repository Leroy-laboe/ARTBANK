import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import { config } from './config.js';
import { resolveEndpoints } from './discovery.js';
import {
  buildAuthorizeUrl,
  exchangeCode,
  fetchUserinfo,
  initOidc,
  pkceChallenge,
  randomToken,
  registerIdentity,
  verifyIdToken,
} from './oidc.js';
import {
  consumeAuthFlow,
  createSession,
  getSessionWithUser,
  revokeSession,
  saveAuthFlow,
  upsertUserFromIdentity,
} from './db.js';

const app = Fastify({ logger: true });
await app.register(cookie);

// Resolve JO1N ID's endpoints from its discovery document before serving.
initOidc(await resolveEndpoints(app.log));

/** Sets the opaque session cookie plus a non-sensitive presence hint the SPA
 *  can read synchronously before it calls /api/me. */
function setSessionCookies(reply: import('fastify').FastifyReply, sessionId: string) {
  const maxAge = config.session.ttlDays * 86_400;
  const base = {
    path: '/',
    sameSite: 'lax' as const,
    secure: config.isProd,
    maxAge,
  };
  reply.setCookie(config.session.cookieName, sessionId, { ...base, httpOnly: true });
  reply.setCookie(config.session.hintCookieName, '1', { ...base, httpOnly: false });
}

function clearSessionCookies(reply: import('fastify').FastifyReply) {
  reply.clearCookie(config.session.cookieName, { path: '/' });
  reply.clearCookie(config.session.hintCookieName, { path: '/' });
}

app.get('/health', async () => ({ ok: true }));

// ── Start login ───────────────────────────────────────────────────────────
// Mints PKCE + state + nonce, parks them server-side, and hands the browser
// to JO1N ID's hosted login. Nothing secret ever reaches the client.
app.get<{ Querystring: { redirect_to?: string } }>('/auth/login', async (request, reply) => {
  const state = randomToken(24);
  const nonce = randomToken(24);
  const codeVerifier = randomToken(48);

  await saveAuthFlow({
    state,
    codeVerifier,
    nonce,
    redirectTo: request.query.redirect_to,
  });

  return reply.redirect(
    buildAuthorizeUrl({ state, nonce, codeChallenge: pkceChallenge(codeVerifier) }),
  );
});

// ── Callback ──────────────────────────────────────────────────────────────
app.get<{ Querystring: { code?: string; state?: string; error?: string } }>(
  '/auth/callback',
  async (request, reply) => {
    const { code, state, error } = request.query;

    if (error) return reply.redirect(`${config.appUrl}/login?error=${encodeURIComponent(error)}`);
    if (!code || !state) return reply.code(400).send({ error: 'Missing code or state' });

    // Consuming the flow is what validates `state` — an unknown, expired or
    // already-used value returns nothing, which blocks CSRF and replay alike.
    const flow = await consumeAuthFlow(state);
    if (!flow) return reply.code(400).send({ error: 'Invalid or expired state' });

    const tokens = await exchangeCode(code, flow.code_verifier);

    const claims = tokens.id_token
      ? await verifyIdToken(tokens.id_token, flow.nonce)
      : await fetchUserinfo(tokens.access_token);

    const user = await upsertUserFromIdentity({
      sub: claims.sub,
      email: claims.email,
      name: claims.name,
    });

    const sessionId = await createSession({
      userId: user.id,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    });

    setSessionCookies(reply, sessionId);
    return reply.redirect(`${config.appUrl}${flow.redirect_to ?? '/'}`);
  },
);

// ── Register ──────────────────────────────────────────────────────────────
// JO1N ID owns credentials, so this proxies to its /register and returns the
// same deliberately vague message — it must not reveal whether an email is
// already taken. No session is issued: the user verifies by email, then logs in.
app.post<{ Body: { email?: string; password?: string; fullName?: string } }>(
  '/auth/register',
  async (request, reply) => {
    const { email, password, fullName } = request.body ?? {};
    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    const { status, data } = await registerIdentity({ email, password, fullName });
    return reply.code(status).send(data);
  },
);

// ── Who am I ──────────────────────────────────────────────────────────────
app.get('/api/me', async (request, reply) => {
  const sessionId = request.cookies[config.session.cookieName];
  if (!sessionId) return reply.code(401).send({ error: 'Not authenticated' });

  const session = await getSessionWithUser(sessionId);
  if (!session) {
    clearSessionCookies(reply);
    return reply.code(401).send({ error: 'Session expired' });
  }

  const { user } = session;
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    role: user.role,
  };
});

app.post('/auth/logout', async (request, reply) => {
  const sessionId = request.cookies[config.session.cookieName];
  if (sessionId) await revokeSession(sessionId);
  clearSessionCookies(reply);
  return { ok: true };
});

app.listen({ port: config.port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
