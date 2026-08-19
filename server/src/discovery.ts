import { config, type Jo1nEndpoints } from './config.js';

type OpenIdConfiguration = {
  issuer?: string;
  authorization_endpoint?: string;
  token_endpoint?: string;
  jwks_uri?: string;
  userinfo_endpoint?: string;
};

/**
 * Refuses to send credentials over plaintext.
 *
 * We authenticate to the token endpoint with HTTP Basic, so an http:// URL
 * there would put the client secret on the wire in the clear. JO1N ID's
 * production discovery is currently known to emit http:// for the authorize
 * and token endpoints, so this is a live hazard, not a hypothetical one.
 *
 * If the issuer is https and a discovered endpoint is http on the *same* host,
 * we upgrade it and warn. A different host over http is refused outright —
 * that is indistinguishable from being redirected somewhere hostile.
 */
function enforceTransport(raw: string, label: string, log: { warn: (m: string) => void }): string {
  const issuer = new URL(config.jo1n.issuer);
  // A plaintext issuer means local development; leave those alone.
  if (issuer.protocol !== 'https:') return raw;

  const url = new URL(raw);
  if (url.protocol === 'https:') return raw;

  if (url.protocol === 'http:') {
    if (url.host !== issuer.host) {
      throw new Error(
        `Discovery advertised ${label} as plaintext http:// on a different host ` +
          `(${url.host} vs issuer ${issuer.host}) — refusing to use it.`,
      );
    }
    url.protocol = 'https:';
    log.warn(`Discovery advertised ${label} over http:// — upgraded to https.`);
    return url.toString();
  }

  throw new Error(`Discovery advertised ${label} with unsupported protocol ${url.protocol}`);
}

/**
 * Reads JO1N ID's discovery document once at boot and resolves the endpoints
 * we need.
 *
 * Preferring discovery over hardcoded paths means a change on the IdP side
 * doesn't need a matching release here. Explicit env vars still win, so a
 * local or misconfigured instance can be pointed by hand.
 */
export async function resolveEndpoints(log: {
  info: (msg: string) => void;
  warn: (msg: string) => void;
}): Promise<Jo1nEndpoints> {
  const fallback = (path: string) => `${config.jo1n.issuer}${path}`;

  let doc: OpenIdConfiguration = {};
  const url = `${config.jo1n.issuer}/.well-known/openid-configuration`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    doc = (await res.json()) as OpenIdConfiguration;
    log.info(`Loaded JO1N ID discovery from ${url}`);

    // OIDC requires the document's issuer to equal the one we asked about.
    // A mismatch means tokens we later verify against config.jo1n.issuer
    // would be rejected, so it's worth surfacing loudly rather than at login.
    if (doc.issuer && doc.issuer !== config.jo1n.issuer) {
      log.warn(
        `Discovery issuer "${doc.issuer}" does not match JO1N_ISSUER "${config.jo1n.issuer}" — ` +
          `ID token verification will fail until these agree.`,
      );
    }
  } catch (err) {
    log.warn(
      `Could not read discovery at ${url} (${(err as Error).message}) — ` +
        `falling back to configured/default endpoints.`,
    );
  }

  // userinfo_endpoint is currently absent from JO1N ID's production document,
  // so the fallback below is doing real work, not just defending in theory.
  if (!doc.userinfo_endpoint) {
    log.warn('Discovery omitted userinfo_endpoint — falling back to /oauth2/userinfo.');
  }

  const resolved: Jo1nEndpoints = {
    authorize:
      config.jo1n.authorizeUrl ?? doc.authorization_endpoint ?? fallback('/oauth2/authorize'),
    token: config.jo1n.tokenUrl ?? doc.token_endpoint ?? fallback('/oauth2/token'),
    jwks: config.jo1n.jwksUrl ?? doc.jwks_uri ?? fallback('/.well-known/jwks.json'),
    userinfo: config.jo1n.userinfoUrl ?? doc.userinfo_endpoint ?? fallback('/oauth2/userinfo'),
    // Not an OIDC endpoint, so never present in discovery.
    register: config.jo1n.registerUrl ?? fallback('/api/v1/auth/register'),
  };

  return {
    authorize: enforceTransport(resolved.authorize, 'authorization_endpoint', log),
    token: enforceTransport(resolved.token, 'token_endpoint', log),
    jwks: enforceTransport(resolved.jwks, 'jwks_uri', log),
    userinfo: enforceTransport(resolved.userinfo, 'userinfo_endpoint', log),
    register: enforceTransport(resolved.register, 'register endpoint', log),
  };
}
