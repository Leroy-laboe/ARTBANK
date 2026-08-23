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
 *  Artbank (docs/pivot-checklist/15-messages.md). */

type ConversationRow = {
  id: string;
  category: string;
  purpose: string | null;
  last_message_at: string;
  artworks: { title: string } | null;
  users: { display_name: string | null; country: string | null; organization: string | null } | null;
  messages: { id: string; body: string; created_at: string; read_at: string | null; sender_id: string }[] | null;
};

const SELECT = `
  id, category, purpose, last_message_at,
  artworks(title),
  users!conversations_buyer_id_fkey(display_name, country, organization),
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

function toConversation(row: ConversationRow, index: number, artistId: string): Conversation {
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
    unread: messages.filter((m) => m.sender_id !== artistId && !m.read_at).length,
    starred: false,
    category: categoryLabel[row.category] ?? 'New Enquiry',
    artwork: row.artworks?.title ?? null,
    purpose: row.purpose ?? '—',
  };
}

/** Groups a thread by calendar day, which is what the date rules render. */
function toThread(row: ConversationRow, artistId: string): MessageDay[] {
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
      direction: m.sender_id === artistId ? 'out' : 'in',
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

export async function loadMessages(profile: Profile | null): Promise<MessagesResult> {
  const demo: MessagesResult = {
    conversations: demoConversations,
    threads: { [demoConversations[0].id]: demoThread },
    isDemo: true,
  };

  if (!supabase || !profile) return demo;

  const { data, error } = await supabase
    .from('conversations')
    .select(SELECT)
    .eq('artist_id', profile.id)
    .order('last_message_at', { ascending: false });

  if (error || !data || data.length === 0) return demo;

  const rows = data as unknown as ConversationRow[];

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
