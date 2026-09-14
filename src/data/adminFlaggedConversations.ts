// Data for Admin → Flagged Conversations — docs/pivot-checklist/
// 29-feature-admin-functions.md's function #4: reviewing conversation_flags
// (report / block / archive) and resolving them.

import type { AdminFlaggedConversation } from '../types/admin';

export const adminFlaggedConversations: AdminFlaggedConversation[] = [
  {
    id: 'f1',
    category: 'report',
    reasonLabel: 'Inappropriate message',
    participants: ['Mia Carter', 'Daniel Park'],
    date: '12 Oct 2024',
    messages: [
      { id: 'm1', sender: 'Daniel Park', time: '12 Oct, 09:10', text: 'Hi Mia, love the new series — what would it take to buy the whole set outright, off the books?' },
      { id: 'm2', sender: 'Mia Carter', time: '12 Oct, 09:14', text: 'Everything goes through the platform, sorry — happy to talk pricing here though.' },
      { id: 'm3', sender: 'Daniel Park', time: '12 Oct, 09:16', text: "Come on, I'll make it worth your while directly. No fees, no paperwork." },
    ],
  },
  {
    id: 'f2',
    category: 'report',
    reasonLabel: 'Harassment claim',
    participants: ['Alex Rivera', 'Chris Lee'],
    date: '10 Oct 2024',
    messages: [
      { id: 'm4', sender: 'Chris Lee', time: '10 Oct, 14:22', text: 'This piece would look much better in my collection. Are you open to a different kind of arrangement?' },
      { id: 'm5', sender: 'Alex Rivera', time: '10 Oct, 14:24', text: "I'm not interested. Please keep messages professional." },
      { id: 'm6', sender: 'Chris Lee', time: '10 Oct, 14:31', text: "Don't be like that, I'm a serious collector. You should be flattered." },
    ],
  },
  {
    id: 'f3',
    category: 'report',
    reasonLabel: 'Spam / unwanted contact',
    participants: ['Priya Shah', 'Unknown Buyer'],
    date: '9 Oct 2024',
    messages: [
      { id: 'm7', sender: 'Unknown Buyer', time: '9 Oct, 11:02', text: 'Check out my gallery for a much better deal on prints just like yours!' },
      { id: 'm8', sender: 'Unknown Buyer', time: '9 Oct, 11:03', text: 'Link in my profile, act fast before it closes.' },
    ],
  },
  {
    id: 'f4',
    category: 'block',
    reasonLabel: 'Blocked after repeated messages',
    participants: ['Samira Khan', 'Jordan Ellis'],
    date: '7 Oct 2024',
    messages: [
      { id: 'm9', sender: 'Jordan Ellis', time: '7 Oct, 16:40', text: 'Following up again on the commission — any update?' },
      { id: 'm10', sender: 'Samira Khan', time: '7 Oct, 16:52', text: "I already said I'm not taking commissions right now." },
    ],
  },
  {
    id: 'f5',
    category: 'archive',
    reasonLabel: 'Archived by both parties',
    participants: ['Taylor Kim', 'Daniel Park'],
    date: '3 Oct 2024',
    messages: [
      { id: 'm11', sender: 'Daniel Park', time: '3 Oct, 10:05', text: 'Thanks for the piece, it arrived safely and looks wonderful.' },
      { id: 'm12', sender: 'Taylor Kim', time: '3 Oct, 10:20', text: "So glad to hear it! Thanks for collecting my work." },
    ],
  },
];
