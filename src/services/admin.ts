import { supabase } from '../lib/supabaseClient';
import { slugFor } from './artwork';
import { PAGE_SIZE } from './pagination';
import type { Profile } from '../types/user';
import type {
  AdminCoaCase,
  AdminEvidenceFile,
  AdminFlagCategory,
  AdminFlaggedConversation,
  AdminRegisteredUser,
  AdminUnclaimedArtwork,
  AdminUploadedArtwork,
} from '../types/admin';
import {
  adminUnclaimedArtworks as demoUnclaimed,
} from '../data/adminLinkArtworks';
import { adminCoaQueue as demoCoaQueue } from '../data/adminCoaQueue';
import { adminFlaggedConversations as demoFlagged } from '../data/adminFlaggedConversations';

/** Reads and writes the tables behind the Admin Portal — requires migration
 *  0035, which adds `is_admin()` and the admin-wide RLS policies every query
 *  here depends on. Until that migration runs (or with no Supabase project at
 *  all) every read falls back to the same hand-authored demo set the pages
 *  shipped with, same pattern as messages.ts / artwork.ts. Callers get
 *  `isDemo` so the UI can label it rather than passing it off as real. */

function formatAdminDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Turns a failed admin write into something actionable — chiefly "migration
 *  0035 hasn't run", which otherwise reads as a mystery permission error. */
export function describeAdminError(err: unknown): string {
  const raw = err as { message?: string; code?: string } | null;
  const message = raw?.message ?? '';

  if (raw?.code === '42703' || /column .* does not exist/i.test(message)) {
    return `The database is missing a column this needs — ${message}. Run supabase/migrations/0035_admin_functions.sql.`;
  }
  if (raw?.code === '42501' || /row-level security/i.test(message)) {
    return 'The database refused this — check that your account has role = admin and that migration 0035 has run.';
  }
  return message || 'Something went wrong. Please try again.';
}

/* ── Function #1: upload an artwork for someone without an account ───────── */

export type NewEntrantArtwork = {
  entrantName: string;
  title: string;
  year: number | null;
  medium: string;
  discipline: string;
  description: string;
  height: number | null;
  width: number | null;
  unit: 'cm' | 'in';
};

/** Creates a complete, published record with no `artist_id` — the entrant has
 *  no account yet, so `artist_display_name` (typed in by the admin) is all
 *  there is to attribute it to. `uploaded_by` is the admin's own id, which is
 *  what already lets them manage this row under the pre-existing "Artists
 *  manage their own artworks" policy (0011) — 0035's admin-wide policy only
 *  matters once a *different* admin needs to touch it. */
export async function createArtworkForEntrant(
  profile: Profile,
  input: NewEntrantArtwork,
): Promise<string> {
  if (!supabase) throw new Error('No database is configured, so this record cannot be saved yet.');

  const id = slugFor(input.title);
  const dimensions =
    input.height && input.width ? `${input.height} × ${input.width} ${input.unit}` : '';

  const { error } = await supabase.from('artworks').insert({
    id,
    title: input.title,
    artist: input.entrantName,
    artist_display_name: input.entrantName,
    artist_id: null,
    uploaded_by: profile.id,
    year: input.year,
    medium: input.medium || null,
    dimensions,
    height: input.height,
    width: input.width,
    dimension_unit: input.unit,
    category: input.discipline,
    description: input.description || null,
    coa_status: 'not_requested',
    status: 'published',
    visibility: 'public',
    availability: 'unavailable',
    smart_link_slug: id,
  });

  if (error) throw error;

  // Provenance log entry. Best-effort, same as the artist-side upload flow —
  // a failed history write shouldn't lose the record itself.
  await supabase.from('artwork_history_events').insert({
    artwork_id: id,
    event_type: 'upload',
    description: `Uploaded by an admin on behalf of ${input.entrantName}.`,
  });

  return id;
}

/* ── Managing an admin's own entrant uploads ──────────────────────────────
 * Not one of the doc's four numbered functions, but the natural follow-on to
 * #1: an admin needs to see, correct and remove what they've uploaded on
 * behalf of someone. All three read/write under the pre-existing "Artists
 * manage their own artworks" policy (uploaded_by = current_user_id()) —
 * unlike most of this file, none of this needs migration 0035, since it
 * never touches a record a *different* admin created. */

type UploadedRow = {
  id: string;
  title: string;
  artist_display_name: string | null;
  artist_id: string | null;
  year: number | null;
  medium: string | null;
  category: string | null;
  height: number | null;
  width: number | null;
  dimension_unit: string | null;
  description: string | null;
  created_at: string;
  artwork_images: { url: string; is_primary: boolean; position: number }[] | null;
};

export async function listMyUploadedArtworks(
  profile: Profile,
): Promise<{ items: AdminUploadedArtwork[]; isDemo: boolean }> {
  if (!supabase) return { items: [], isDemo: true };

  const { data, error } = await supabase
    .from('artworks')
    .select(
      `id, title, artist_display_name, artist_id, year, medium, category,
       height, width, dimension_unit, description, created_at,
       artwork_images(url, is_primary, position)`,
    )
    .eq('uploaded_by', profile.id)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) return { items: [], isDemo: true };

  const rows = (data ?? []) as unknown as UploadedRow[];
  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      imageUrl: coverUrl(row.artwork_images),
      entrantName: row.artist_display_name ?? 'Unknown entrant',
      year: row.year ? String(row.year) : '',
      medium: row.medium ?? '',
      discipline: row.category ?? '',
      height: row.height,
      width: row.width,
      unit: (row.dimension_unit as 'cm' | 'in') ?? 'cm',
      description: row.description ?? '',
      uploadedDate: formatAdminDate(row.created_at),
      claimed: row.artist_id !== null,
    })),
    isDemo: false,
  };
}

export type EntrantArtworkPatch = Partial<NewEntrantArtwork>;

export async function updateEntrantArtwork(
  artworkId: string,
  patch: EntrantArtworkPatch,
): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');

  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.entrantName !== undefined) {
    row.artist_display_name = patch.entrantName;
    row.artist = patch.entrantName;
  }
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.year !== undefined) row.year = patch.year;
  if (patch.medium !== undefined) row.medium = patch.medium || null;
  if (patch.discipline !== undefined) row.category = patch.discipline;
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.height !== undefined) row.height = patch.height;
  if (patch.width !== undefined) row.width = patch.width;
  if (patch.unit !== undefined) row.dimension_unit = patch.unit;
  if (patch.height !== undefined || patch.width !== undefined || patch.unit !== undefined) {
    const height = patch.height ?? null;
    const width = patch.width ?? null;
    const unit = patch.unit ?? 'cm';
    row.dimensions = height && width ? `${height} × ${width} ${unit}` : '';
  }

  const { error } = await supabase.from('artworks').update(row).eq('id', artworkId);
  if (error) throw error;
}

/** Deletes the record entirely, including its files. `artwork_images` and
 *  `artwork_evidence_files` rows cascade automatically (both FKs are ON
 *  DELETE CASCADE — 0011, 0015), but a cascade only clears the *rows*; the
 *  actual objects in storage have to be removed separately, so the paths are
 *  read before the delete rather than after. */
export async function deleteArtworkRecord(artworkId: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const client = supabase;

  const [images, evidence] = await Promise.all([
    client.from('artwork_images').select('storage_path').eq('artwork_id', artworkId),
    client.from('artwork_evidence_files').select('storage_path').eq('artwork_id', artworkId),
  ]);

  const { error } = await client.from('artworks').delete().eq('id', artworkId);
  if (error) throw error;

  const imagePaths = (images.data ?? [])
    .map((r) => r.storage_path as string | null)
    .filter((p): p is string => Boolean(p));
  const evidencePaths = (evidence.data ?? [])
    .map((r) => r.storage_path as string | null)
    .filter((p): p is string => Boolean(p));

  // Best-effort: the record is already gone either way, and a stray file in
  // storage is a smaller problem than blocking the delete on cleanup.
  if (imagePaths.length > 0) await client.storage.from('artwork-images').remove(imagePaths);
  if (evidencePaths.length > 0) await client.storage.from('artwork-documents').remove(evidencePaths);
}

/* ── Function #2: link an unclaimed artwork to a real account ────────────── */

type UnclaimedRow = {
  id: string;
  title: string;
  artist_display_name: string | null;
  created_at: string;
  artwork_images: { url: string; is_primary: boolean; position: number }[] | null;
};

function coverUrl(images: UnclaimedRow['artwork_images']): string {
  if (!images || images.length === 0) return '';
  const primary = images.find((i) => i.is_primary);
  if (primary) return primary.url;
  return [...images].sort((a, b) => a.position - b.position)[0].url;
}

export async function listUnclaimedArtworks(): Promise<{
  items: AdminUnclaimedArtwork[];
  isDemo: boolean;
}> {
  if (!supabase) return { items: demoUnclaimed, isDemo: true };

  const { data, error } = await supabase
    .from('artworks')
    .select('id, title, artist_display_name, created_at, artwork_images(url, is_primary, position)')
    .is('artist_id', null)
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) return { items: demoUnclaimed, isDemo: true };

  const rows = (data ?? []) as unknown as UnclaimedRow[];
  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      imageUrl: coverUrl(row.artwork_images),
      entrantName: row.artist_display_name ?? 'Unknown entrant',
      uploadedDate: formatAdminDate(row.created_at),
      // No captured entrant email in the schema yet, so there is nothing to
      // auto-suggest a match from — every row goes through the manual search
      // below rather than a fabricated "suggested" state.
      matchState: 'none',
    })),
    isDemo: false,
  };
}

/** Registered users the admin can search when linking an unclaimed artwork by
 *  hand — requires 0035's "Admins read all users" policy. Empty query
 *  returns the most recently created accounts rather than everyone. */
export async function searchRegisteredUsers(query: string): Promise<AdminRegisteredUser[]> {
  if (!supabase) return [];

  let builder = supabase
    .from('users')
    .select('id, display_name, email')
    .order('created_at', { ascending: false })
    .limit(10);

  const q = query.trim();
  if (q) {
    const escaped = q.replace(/[%,]/g, '');
    builder = builder.or(`display_name.ilike.%${escaped}%,email.ilike.%${escaped}%`);
  }

  const { data, error } = await builder;
  if (error || !data) return [];

  return (data as { id: string; display_name: string | null; email: string }[]).map((row) => ({
    id: row.id,
    name: row.display_name ?? row.email,
    email: row.email,
  }));
}

export async function linkArtworkToUser(artworkId: string, userId: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('artworks')
    .update({ artist_id: userId, updated_at: new Date().toISOString() })
    .eq('id', artworkId);
  if (error) throw error;
}

/* ── Function #3: review COA requests ─────────────────────────────────────── */

type CoaRow = {
  id: string;
  title: string;
  artist_display_name: string | null;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  description: string | null;
  artist: { display_name: string | null; email: string } | null;
  artwork_images: { url: string; is_primary: boolean; position: number }[] | null;
  artwork_evidence_files: {
    id: string;
    file_name: string | null;
    file_type: string | null;
    file_size: number | null;
    storage_path: string | null;
    uploaded_at: string;
  }[] | null;
};

function orderedImages(images: CoaRow['artwork_images']): string[] {
  if (!images || images.length === 0) return [];
  return [...images]
    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.position - b.position)
    .map((i) => i.url);
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${bytes} B`;
}

/** Evidence files carry a `storagePath` rather than a resolved url — the
 *  `artwork-documents` bucket is private, so the URL has to be minted with
 *  resolveEvidenceUrl() at the point it's actually opened. */
export async function listCoaQueue(): Promise<{ items: AdminCoaCase[]; isDemo: boolean }> {
  if (!supabase) return { items: demoCoaQueue, isDemo: true };

  const { data, error } = await supabase
    .from('artworks')
    .select(
      `id, title, artist_display_name, year, medium, dimensions, description,
       artist:users!artist_id(display_name, email),
       artwork_images(url, is_primary, position),
       artwork_evidence_files(id, file_name, file_type, file_size, storage_path, uploaded_at)`,
    )
    .eq('coa_status', 'pending_review')
    .order('updated_at', { ascending: true })
    .limit(PAGE_SIZE);

  if (error) return { items: demoCoaQueue, isDemo: true };

  const rows = (data ?? []) as unknown as CoaRow[];
  return {
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      artistName: row.artist?.display_name ?? row.artist_display_name ?? 'Unknown artist',
      artistEmail: row.artist?.email ?? '—',
      year: row.year ? String(row.year) : '—',
      medium: row.medium ?? '—',
      dimensions: row.dimensions ?? '—',
      description: row.description ?? '',
      images: orderedImages(row.artwork_images),
      evidenceFiles: (row.artwork_evidence_files ?? []).map(
        (file): AdminEvidenceFile => ({
          id: file.id,
          name: file.file_name ?? 'file',
          sizeLabel: formatBytes(file.file_size ?? 0),
          uploadedDate: formatAdminDate(file.uploaded_at),
          kind: file.file_type?.startsWith('image/') ? 'image' : 'document',
          // Placeholder — resolveEvidenceUrl() below fills in a real, signed
          // one when the case is opened. storage_path travels in `url` until
          // then so the caller has something to hand that function.
          url: file.storage_path ?? '',
        }),
      ),
    })),
    isDemo: false,
  };
}

/** Mints a 5-minute signed URL for one evidence file, same TTL as the
 *  artist-side documentUrl() in artworkDocuments.ts. Called once per file
 *  when a COA case is actually opened, not for the whole queue up front. */
export async function resolveEvidenceUrl(storagePath: string): Promise<string | null> {
  if (!supabase || !storagePath) return null;
  const { data, error } = await supabase.storage
    .from('artwork-documents')
    .createSignedUrl(storagePath, 300);
  if (error || !data) return null;
  return data.signedUrl;
}

export async function approveCoa(artworkId: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('artworks')
    .update({ coa_status: 'issued', coa_rejection_reason: null, updated_at: new Date().toISOString() })
    .eq('id', artworkId);
  if (error) throw error;
}

export async function rejectCoa(artworkId: string, reason: string): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('artworks')
    .update({
      coa_status: 'not_requested',
      coa_rejection_reason: reason.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', artworkId);
  if (error) throw error;
}

/* ── Function #4: moderate flagged conversations ──────────────────────────── */

type FlagRow = {
  id: string;
  action: AdminFlagCategory;
  reason: string | null;
  created_at: string;
  conversations: {
    id: string;
    artist: { id: string; display_name: string | null; email: string } | null;
    buyer: { id: string; display_name: string | null; email: string } | null;
    messages: { id: string; body: string; created_at: string; sender_id: string }[] | null;
  } | null;
};

const actionFallbackLabel: Record<AdminFlagCategory, string> = {
  report: 'Reported conversation',
  block: 'Blocked conversation',
  archive: 'Archived conversation',
};

export async function listFlaggedConversations(): Promise<{
  items: AdminFlaggedConversation[];
  isDemo: boolean;
}> {
  if (!supabase) return { items: demoFlagged, isDemo: true };

  const { data, error } = await supabase
    .from('conversation_flags')
    .select(
      `id, action, reason, created_at,
       conversations (
         id,
         artist:users!conversations_artist_id_fkey(id, display_name, email),
         buyer:users!conversations_buyer_id_fkey(id, display_name, email),
         messages(id, body, created_at, sender_id)
       )`,
    )
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(PAGE_SIZE);

  if (error) return { items: demoFlagged, isDemo: true };

  const rows = (data ?? []) as unknown as FlagRow[];
  return {
    items: rows
      .filter((row) => row.conversations)
      .map((row) => {
        const convo = row.conversations!;
        const artistName = convo.artist?.display_name ?? convo.artist?.email ?? 'Unknown';
        const buyerName = convo.buyer?.display_name ?? convo.buyer?.email ?? 'Unknown';
        const senderName = (senderId: string) =>
          senderId === convo.artist?.id ? artistName : senderId === convo.buyer?.id ? buyerName : 'Unknown';

        const messages = [...(convo.messages ?? [])].sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        return {
          id: row.id,
          category: row.action,
          reasonLabel: row.reason?.trim() || actionFallbackLabel[row.action],
          participants: [artistName, buyerName],
          date: formatAdminDate(row.created_at),
          messages: messages.map((m) => ({
            id: m.id,
            sender: senderName(m.sender_id),
            time: new Date(m.created_at).toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            }),
            text: m.body,
          })),
        };
      }),
    isDemo: false,
  };
}

/* ── Overview stats ────────────────────────────────────────────────────── */

export type AdminOverviewCounts = {
  unclaimedCount: number;
  coaPendingCount: number;
  openFlagsCount: number;
  uploadsThisMonth: number;
};

/** The four headline figures on the Overview screen and the "Flagged
 *  Conversations" sidebar badge. Each is a plain count query, so this stays
 *  separate from listUnclaimedArtworks() / listCoaQueue() / listFlagged
 *  Conversations() rather than deriving counts from their full result sets —
 *  a count query is one round trip regardless of how many rows exist, a full
 *  list read is not. */
export async function getOverviewCounts(): Promise<{ counts: AdminOverviewCounts; isDemo: boolean }> {
  const demo: AdminOverviewCounts = {
    unclaimedCount: 12,
    coaPendingCount: 8,
    openFlagsCount: 5,
    uploadsThisMonth: 34,
  };
  if (!supabase) return { counts: demo, isDemo: true };

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [unclaimed, coaPending, openFlags, uploads] = await Promise.all([
    supabase.from('artworks').select('id', { count: 'exact', head: true }).is('artist_id', null),
    supabase
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .eq('coa_status', 'pending_review'),
    supabase
      .from('conversation_flags')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'open'),
    supabase
      .from('artworks')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString()),
  ]);

  if (unclaimed.error || coaPending.error || openFlags.error || uploads.error) {
    return { counts: demo, isDemo: true };
  }

  return {
    counts: {
      unclaimedCount: unclaimed.count ?? 0,
      coaPendingCount: coaPending.count ?? 0,
      openFlagsCount: openFlags.count ?? 0,
      uploadsThisMonth: uploads.count ?? 0,
    },
    isDemo: false,
  };
}

export async function resolveFlag(
  flagId: string,
  resolution: 'dismissed' | 'escalated',
  profile: Profile,
): Promise<void> {
  if (!supabase) throw new Error('No database is configured.');
  const { error } = await supabase
    .from('conversation_flags')
    .update({ status: resolution, resolved_by: profile.id, resolved_at: new Date().toISOString() })
    .eq('id', flagId);
  if (error) throw error;
}
