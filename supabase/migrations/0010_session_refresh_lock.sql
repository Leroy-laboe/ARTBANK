-- Serialises refresh-token rotation for a session.
--
-- JO1N ID rotates on every refresh: each call mints a brand-new refresh token,
-- and presenting an already-consumed one is treated as a reuse attack — it
-- revokes the entire token family and kills the session.
--
-- That makes a concurrent refresh actively dangerous. Two in-flight requests
-- would both read the same stored token, both call the IdP, and the second
-- would look like an attacker replaying a consumed token — logging the user
-- out through no fault of their own.
--
-- This column is the claim: a request conditionally stamps it before calling
-- the IdP, and only the winner proceeds. Losers wait and re-read the row.
alter table public.sessions
  add column if not exists refreshing_at timestamptz;
