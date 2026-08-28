import { supabase } from '../lib/supabaseClient';
import {
  conversations as demoConversations,
  thread as demoThread,
  type Conversation,
  type MessageCategory,
  type MessageDay,
} from '../data/artspaceMessages';
import type { MonogramTone } from '../data/artspaceInterest';
import type { Profile } from '../types/user';

/** Reads conversations and their messages. Requires migrations 0014 and 0016.
 *
 *  Only organisation and country ever reach the UI as a descriptor — personal
 *  email and phone are never surfaced in a thread, so contact stays inside
 *  Artbank (docs/pivot-checklist/15-messages.md).
 *
 *  One conversation has two sides, and each reads the same rows from the
 *  opposite end: ArtSpace filters by artist_id and shows the buyer, /collect
 *  filters by buyer_id and shows the artist. `side` picks which, so both
 *  workspaces share one mapper and cannot drift apart. */

export type MessageSide = 'artist' | 'buyer';

/** Which column identifies "me", and which embedded user is "them". */
const sides: Record<MessageSide, { self: string; other: string }> = {
  artist: { self: 'artist_id', other: 'conversations_buyer_id_fkey' },
  buyer: { self: 'buyer_id', other: 'conversations_artist_id_fkey' },
};

type ConversationRow = {
  id: string;
  category: string;
  purpose: string | null;
  last_message_at: string;
  artwork_id: string | null;
  artworks: { title: string } | null;
  users: { id: string; display_name: string | null; country: string | null; organization: string | null } | null;
  messages: { id: string; body: string; created_at: string; read_at: string | null; sender_id: string }[] | null;
};

const selectFor = (side: MessageSide) => `
  id, category, purpose, last_message_at, artwork_id,
  artworks(title),
  users!${sides[side].other}(id, display_name, country, organization),
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

export function shortTime(iso: string): string {
  const date = new Date(iso);
  const hours = (Date.now() - date.getTime()) / 3_600_000;
  if (hours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (hours < 48) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function toConversation(row: ConversationRow, index: number, selfId: string): Conversation {
  const name = row.users?.display_name ?? row.users?.organization ?? 'Unknown contact';
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
    descriptor: [row.users?.organization ?? 'Contact', row.users?.country].filter(Boolean).join(' • '),
    preview: latest?.body.split('\n')[0] ?? 'No messages yet.',
    time: shortTime(row.last_message_at),
    // Unread means someone else sent it and it hasn't been read.
    unread: messages.filter((m) => m.sender_id !== selfId && !m.read_at).length,
    starred: false,
    category: categoryLabel[row.category] ?? 'New Enquiry',
    artwork: row.artworks?.title ?? null,
    // Ids as well as names: recording a deal from inside the thread needs the
    // artwork record and the other party, not their labels.
    artworkId: row.artwork_id,
    counterpartId: row.users?.id ?? null,
    purpose: row.purpose ?? '—',
  };
}

/** Groups a thread by calendar day, which is what the date rules render. */
function toThread(row: ConversationRow, selfId: string): MessageDay[] {
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
      direction: m.sender_id === selfId ? 'out' : 'in',
      paragraphs: m.body.split('\n').filter((p) => p.trim() !== ''),
      time: new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      read: Boolean(m.read_at),
    });
  }
  return days;
}

export type MessagesResult = {
  conversations: Conversation[];
  threads: Record<string, MessageDay[]>;
  isDemo: boolean;
};

export async function loadMessages(
  profile: Profile | null,
  side: MessageSide = 'artist',
): Promise<MessagesResult> {
  const demo: MessagesResult = {
    conversations: demoConversations,
    threads: { [demoConversations[0].id]: demoThread },
    isDemo: true,
  };

  if (!supabase || !profile) return demo;

  const { data, error } = await supabase
    .from('conversations')
    .select(selectFor(side))
    .eq(sides[side].self, profile.id)
    .order('last_message_at', { ascending: false });

  // A read that FAILED and a mailbox that is EMPTY are not the same thing.
  // The first means we cannot see the data — no migrations, no permission —
  // and standing in demo content is the kind thing to do. The second is a
  // real answer, and dressing it up as someone else's conversations tells a
  // signed-in artist they have mail they do not have.
  if (error) return demo;

  const rows = (data ?? []) as unknown as ConversationRow[];

  return {
    conversations: rows.map((row, i) => toConversation(row, i, profile.id)),
    threads: Object.fromEntries(rows.map((row) => [row.id, toThread(row, profile.id)])),
    isDemo: false,
  };
}

export async function sendMessage(conversationId: string, senderId: string, body: string) {
  if (!supabase) throw new Error('No database is configured, so messages cannot be sent yet.');
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body });
  if (error) throw error;
}

/* ── Notifications ─────────────────────────────────────────────────────── */

export type MessageNotification = {
  id: string;
  name: string;
  preview: string;
  time: string;
  unread: number;
};

type NotificationRow = {
  id: string;
  users: { display_name: string | null; organization: string | null } | null;
  messages: { body: string; created_at: string; read_at: string | null; sender_id: string }[] | null;
};

/** The bell's badge count and its dropdown, from one query.
 *
 *  "Unread" here means exactly what messages.read_at tracks — there is no
 *  broader notifications table. Interest and opportunities have no read state
 *  in the schema, so they are deliberately not folded into this count rather
 *  than approximated by recency. */
export async function getUnreadMessageSummary(
  profile: Profile | null,
  side: MessageSide = 'artist',
  limit = 5,
): Promise<{ count: number; items: MessageNotification[] }> {
  if (!supabase || !profile) return { count: 0, items: [] };

  const { data, error } = await supabase
    .from('conversations')
    .select(
      `id, users!${sides[side].other}(display_name, organization), messages(body, created_at, read_at, sender_id)`,
    )
    .eq(sides[side].self, profile.id);

  if (error || !data) return { count: 0, items: [] };

  const rows = data as unknown as NotificationRow[];
  let count = 0;
  const items: MessageNotification[] = [];

  for (const row of rows) {
    const unread = (row.messages ?? []).filter((m) => m.sender_id !== profile.id && !m.read_at);
    count += unread.length;
    if (unread.length === 0) continue;

    const latest = [...unread].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

    items.push({
      id: row.id,
      name: row.users?.display_name ?? row.users?.organization ?? 'Unknown contact',
      preview: latest.body.split('\n')[0],
      time: shortTime(latest.created_at),
      unread: unread.length,
    });
  }

  items.sort((a, b) => b.unread - a.unread);
  return { count, items: items.slice(0, limit) };
}
