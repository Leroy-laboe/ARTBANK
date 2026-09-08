import QRCode from 'qrcode';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** The Smart Artwork Link — docs/pivot-checklist/19-feature-smart-artwork-link-qr.md.
 *  "One shareable link with viewer-source statistics" instead of scattered
 *  Instagram DMs. The read side of this (SmartLinkPanel's stats) has existed
 *  since artwork_link_visits was created in 0015; nothing has ever written to
 *  it, because there was no public page to open it from. This is that page's
 *  service layer.
 *
 *  What this does NOT cover: a social-media preview card. That needs
 *  server-rendered meta tags — a crawler reads whatever <head> the server
 *  returns before any JavaScript runs, and this is a client-only SPA that
 *  serves the same index.html to every route. Faking it client-side would
 *  just be wrong on every platform that actually unfurls the link. */

export type LinkSource = 'instagram' | 'threads' | 'rednote' | 'qr' | 'direct';

const knownSources: LinkSource[] = ['instagram', 'threads', 'rednote', 'qr', 'direct'];

/** Reads the `?src=` query param a shared link was tagged with, falling back
 *  to 'direct' for a bare link or an unrecognised value rather than rejecting it. */
export function sourceFromParam(value: string | null): LinkSource {
  return knownSources.includes(value as LinkSource) ? (value as LinkSource) : 'direct';
}

export function smartLinkUrl(artworkId: string, source?: LinkSource): string {
  const url = `${window.location.origin}/a/${artworkId}`;
  return source ? `${url}?src=${source}` : url;
}

/** Records that the link was opened. Anonymous unless the visitor is signed
 *  in — the same split the Interest ledger uses everywhere else. Anyone may
 *  insert (0015's policy): that's the point of a public share link. */
export async function logArtworkLinkVisit(
  artworkId: string,
  source: LinkSource,
  profile: Profile | null,
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('artwork_link_visits')
    .insert({ artwork_id: artworkId, source, viewer_id: profile?.id ?? null });
  // Best-effort: a failed visit log should never block someone from viewing
  // the artwork they followed a link to see.
}

/** "Present Yourself to Artist" — the lightest action on the page. Not an
 *  enquiry (no message, no purpose, nothing for the artist to act on) — just
 *  an identified visit, which is what turns "27 visits from Instagram" into
 *  "two viewers presented themselves" on the artist's side. */
export async function presentYourself(artworkId: string, profile: Profile): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('artwork_link_visits')
    .insert({ artwork_id: artworkId, source: 'direct', viewer_id: profile.id });
  if (error) throw error;
}

/** A scannable QR for the link, generated entirely client-side — no network
 *  call, no third-party QR service seeing what's being shared. */
export async function generateQrDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, { width: 320, margin: 1, color: { dark: '#15110c', light: '#ffffff' } });
}
