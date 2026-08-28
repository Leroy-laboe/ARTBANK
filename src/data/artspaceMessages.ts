// Content for ArtSpace → Messages.
//
// Per docs/pivot-checklist/15-messages.md these are structured professional
// conversations, not freeform DMs: each one carries a category, the artwork
// it concerns and the enquiry's purpose. Personal email and phone numbers are
// never surfaced in a thread — all contact stays inside Artbank.

import type { IconName } from '../components/ui/Icon';
import type { MonogramTone } from './artspaceInterest';

const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* ── Vocabulary ── */

/** The spec's fixed category list. Conversations are always one of these —
 *  there is no uncategorised "general chat". */
export type MessageCategory =
  | 'New Enquiry'
  | 'Purchase'
  | 'Licence'
  | 'Exhibition'
  | 'Commission'
  | 'Collaboration'
  | 'Support';

export type Conversation = {
  id: string;
  name: string;
  /** Short logo-style initials for correspondents with no photo. */
  monogram?: string;
  tone?: MonogramTone;
  avatarUrl?: string;
  verified: boolean;
  /** Organisation type and country, e.g. "Gallery • Singapore". */
  descriptor: string;
  preview: string;
  time: string;
  unread: number;
  starred: boolean;
  category: MessageCategory;
  /** The artwork this conversation is about. The spec requires every message
   *  to carry its artwork context rather than floating free. */
  artwork: string | null;
  /** The same artwork's id. Carried alongside the title because recording a
   *  deal from inside the thread needs the record, not its name. Null on a
   *  general enquiry, and on every demo row. */
  artworkId?: string | null;
  /** The other party's public.users id — the buyer when read from ArtSpace,
   *  the artist when read from /collect. Null on demo rows. */
  counterpartId?: string | null;
  /** Why they got in touch. */
  purpose: string;
};

export const conversations: Conversation[] = [
  {
    id: 'the-substation',
    name: 'The Substation',
    monogram: 'TS',
    tone: 'ink',
    verified: true,
    descriptor: 'Gallery • Singapore',
    preview: 'We would love to feature Rhythm of Memory in our…',
    time: '2:30 PM',
    unread: 2,
    starred: false,
    category: 'Exhibition',
    artwork: 'Rhythm of Memory',
    purpose: 'Solo exhibition, November 2025',
  },
  {
    id: 'art-collectors-group',
    name: 'Art Collectors Group',
    monogram: 'AC',
    tone: 'gold',
    verified: true,
    descriptor: 'Collector group • Malaysia',
    preview: 'Thanks for sharing the additional details. Our team will review…',
    time: '11:15 AM',
    unread: 1,
    starred: false,
    category: 'Purchase',
    artwork: 'Fragments of Quiet #2',
    purpose: 'Corporate collection acquisition',
  },
  {
    id: 'design-haus',
    name: 'Design Haus',
    monogram: 'DH',
    tone: 'ink',
    verified: true,
    descriptor: 'Design studio • Dubai, UAE',
    preview: 'The mockup looks fantastic. When would be a good time…',
    time: 'Yesterday',
    unread: 0,
    starred: false,
    category: 'Commission',
    artwork: 'Fragments of Quiet #2',
    purpose: 'Hospitality art project',
  },
  {
    id: 'sophie-laurent',
    name: 'Sophie Laurent',
    avatarUrl: photo('photo-1494790108377-be9c29b29330', 96, 96),
    verified: true,
    descriptor: 'Private collector • France',
    preview: 'I’m very interested in Echoes. Could we discuss the price?',
    time: 'May 7',
    unread: 0,
    starred: false,
    category: 'Purchase',
    artwork: 'Echoes',
    purpose: 'Acquisition enquiry',
  },
  {
    id: 'galerie-lumiere',
    name: 'Galerie Lumière',
    monogram: 'GL',
    tone: 'ink',
    verified: true,
    descriptor: 'Gallery • France',
    preview: 'Invitation: Emerging Artists Exhibition 2025',
    time: 'May 6',
    unread: 0,
    starred: true,
    category: 'Exhibition',
    artwork: null,
    purpose: 'Group exhibition invitation',
  },
  {
    id: 'michael-chen',
    name: 'Michael Chen',
    avatarUrl: photo('photo-1506794778202-cad84cf45f1d', 96, 96),
    verified: true,
    descriptor: 'Brand consultant • Singapore',
    preview: 'Following up on the licensing inquiry for our project.',
    time: 'May 5',
    unread: 0,
    starred: false,
    category: 'Licence',
    artwork: 'Echoes',
    purpose: 'Brand campaign licence',
  },
  {
    id: 'art-dubai',
    name: 'Art Dubai',
    monogram: 'AD',
    tone: 'ink',
    verified: true,
    descriptor: 'Art fair • Dubai, UAE',
    preview: 'Thank you for your application. We’ll be in touch soon.',
    time: 'May 4',
    unread: 0,
    starred: false,
    category: 'New Enquiry',
    artwork: null,
    purpose: 'Open call application',
  },
];

/* ── The open thread ── */

export type Attachment = { name: string; size: string; kind: string };

export type Message = {
  id: string;
  direction: 'in' | 'out';
  paragraphs: string[];
  attachment?: Attachment;
  time: string;
  /** Outgoing only — whether the other side has read it. */
  read?: boolean;
};

export type MessageDay = { date: string; messages: Message[] };

export const thread: MessageDay[] = [
  {
    date: 'May 8, 2025',
    messages: [
      {
        id: 'm1',
        direction: 'in',
        paragraphs: [
          'Hello Maya,',
          'We came across your artwork “Rhythm of Memory” and would love to feature it in our upcoming solo exhibition in November.',
          'Would you be open to discussing this opportunity?',
        ],
        time: '10:24 AM',
      },
      {
        id: 'm2',
        direction: 'out',
        paragraphs: [
          'Hello The Substation team,',
          'Thank you so much for your interest! I’d be delighted to learn more about the exhibition. Please share the details.',
        ],
        time: '10:35 AM',
        read: true,
      },
      {
        id: 'm3',
        direction: 'in',
        paragraphs: ['Great! Here are the details of the exhibition and our proposal.'],
        attachment: { name: 'Exhibition_Proposal_Nov2025.pdf', size: '1.2 MB', kind: 'PDF' },
        time: '10:38 AM',
      },
    ],
  },
  {
    date: 'May 9, 2025',
    messages: [
      {
        id: 'm4',
        direction: 'out',
        paragraphs: [
          'Thank you for the information. Everything looks exciting! I’ll review and get back to you shortly.',
        ],
        time: '9:12 AM',
        read: true,
      },
      {
        id: 'm5',
        direction: 'in',
        paragraphs: ['Perfect! Let us know if you need anything else.'],
        time: '9:20 AM',
      },
    ],
  },
];

/* ── Tabs, paging and rail ── */

/** Counts are deliberately absent: MessagesPage fills them from the
 *  conversations it actually loaded. Baking a number in here is how the strip
 *  ended up claiming three unread beside an empty inbox. */
export const messageTabs = [
  { id: 'all', label: 'All Messages' },
  { id: 'unread', label: 'Unread' },
  { id: 'starred', label: 'Starred' },
  { id: 'archive', label: 'Archive' },
];


export const messageTip = {
  title: 'Message Tips',
  body: 'Keep all communication on ArtBank to protect your privacy and track opportunities effectively.',
};

/** Safety controls the spec requires on every conversation. Surfaced from the
 *  thread's overflow menu. */
export const conversationActions: { id: string; icon: IconName; label: string }[] = [
  { id: 'archive', icon: 'archive', label: 'Archive conversation' },
  { id: 'block', icon: 'lock', label: 'Block sender' },
  { id: 'report', icon: 'x-circle', label: 'Report conversation' },
];
