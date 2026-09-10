import { supabase } from '../lib/supabaseClient';
import { PAGE_SIZE, THREAD_PAGE_SIZE } from './pagination';
import { type Conversation, type MessageCategory, type MessageDay } from '../data/artspaceMessages';
import type { MonogramTone } from '../data/artspaceInterest';

/** What a verified guardian sees of the specific conversations they're cc'd
 *  on for one minor — never everything the minor does, just the contact
 *  that actually named them. guardian_cc_id has granted read access at the
 *  database level since 0014 (conversations) and 0014 (messages); this is
 *  the first screen that actually queries it, closing the gap where
 *  approving a guardian unlocked messaging but gave the guardian nowhere to
 *  see it happen. No RLS change needed — "Participants read their
 *  conversations" already covers this exactly. */

type Row = {
  id: string;
  category: string;
  purpose: string | null;
  last_message_at: string;
  artwork_id: string | null;
  artist_id: string;
  buyer_id: string;
  artworks: { title: string } | null;
  artist: {
    id: string;
    display_name: string | null;
    artist_name: string | null;
    organization: string | null;
    country: string | null;
  } | null;
  buyer: {
    id: string;
    display_name: string | null;
    organization: string | null;
    country: string | null;
  } | null;
  messages: { id: string; body: string; created_at: string; read_at: string | null; sender_id: string }[] | null;
};

const SELECT = `
  id, category, purpose, last_message_at, artwork_id, artist_id, buyer_id,
  artworks(title),
  artist:users!conversations_artist_id_fkey(id, display_name, artist_name, organization, country),
  buyer:users!conversations_buyer_id_fkey(id, display_name, organization, country),
  messages(id, body, created_at, read_at, sender_id)
`;

const categoryLabel: Record<string, MessageCategory> = {
  new_enquiry: 'New Enquiry',
  purchase: 'Purchase',
  licence: 'Licence',
  exhibition: 'Exhibition',
  commission: 'Commission',
  collaboration: 'Collaboration',
  support: 'Support',
};

const tones: MonogramTone[] = ['ink', 'gold', 'forest'];

function monogram(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function shortTime(iso: string): string {
  const date = new Date(iso);
  const hours = (Date.now() - date.getTime()) / 3_600_000;
  if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (hours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** The guardian is neither party, so "self/other" doesn't apply — the
 *  correspondent shown is always whichever side isn't the minor. */
function toConversation(row: Row, minorId: string, index: number): Conversation {
  const minorIsArtist = row.artist_id === minorId;
  const other = minorIsArtist ? row.buyer : row.artist;
  const name = other?.display_name ?? other?.organization ?? 'Unknown contact';
  const messages = [...(row.messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const latest = messages[messages.length - 1];

  return {
    id: row.id,
    name,
    monogram: monogram(name),
    tone: tones[index % tones.length],
    verified: true,
    descriptor: [other?.organization ?? 'Contact', other?.country].filter(Boolean).join(' • '),
    preview: latest?.body.split('\n')[0] ?? 'No messages yet.',
    time: shortTime(row.last_message_at),
    // A guardian's own read state isn't tracked — this is an observed
    // transcript, not an inbox with unread mail of their own.
    unread: 0,
    starred: false,
    category: categoryLabel[row.category] ?? 'New Enquiry',
    artwork: row.artworks?.title ?? null,
    artworkId: row.artwork_id,
    counterpartId: other?.id ?? null,
    purpose: row.purpose ?? '—',
  };
}

function toThread(row: Row): MessageDay[] {
  const messages = [...(row.messages ?? [])].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  const days: MessageDay[] = [];
  for (const m of messages) {
    const date = new Date(m.created_at).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    let day = days.find((d) => d.date === date);
    if (!day) {
      day = { date, messages: [] };
      days.push(day);
    }
    day.messages.push({
      id: m.id,
      // Everything reads as "in" — from a read-only observer, calling
      // either side "out" would misleadingly claim the guardian sent it.
      direction: 'in',
      paragraphs: m.body.split('\n').filter((p) => p.trim() !== ''),
      time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: Boolean(m.read_at),
    });
  }
  return days;
}

export type GuardianMessagesResult = {
  conversations: Conversation[];
  threads: Record<string, MessageDay[]>;
};

/** Every conversation this guardian is cc'd on for this specific minor. No
 *  extra authorization check needed here beyond the query itself — RLS only
 *  ever returns a row if guardian_cc_id already equals the caller, and
 *  guardian_cc_id is only ever set by resolve_guardian_cc() for a verified
 *  guardian in the first place. */
export async function listGuardianConversations(minorId: string): Promise<GuardianMessagesResult> {
  if (!supabase) return { conversations: [], threads: {} };

  const { data, error } = await supabase
    .from('conversations')
    .select(SELECT)
    .or(`artist_id.eq.${minorId},buyer_id.eq.${minorId}`)
    .order('last_message_at', { ascending: false })
    // Same two ceilings as the artist and buyer mailboxes — see messages.ts.
    .order('created_at', { ascending: false, referencedTable: 'messages' })
    .limit(PAGE_SIZE)
    .limit(THREAD_PAGE_SIZE, { referencedTable: 'messages' });

  if (error || !data) return { conversations: [], threads: {} };

  const rows = data as unknown as Row[];
  return {
    conversations: rows.map((row, i) => toConversation(row, minorId, i)),
    threads: Object.fromEntries(rows.map((row) => [row.id, toThread(row)])),
  };
}
