import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { ConversationList } from '../components/artspace/ConversationList';
import { MessageThread } from '../components/artspace/MessageThread';
import { StatsOverviewPanel } from '../components/artspace/StatsOverviewPanel';
import { QuickActionsPanel } from '../components/artspace/QuickActionsPanel';
import { FoldersPanel } from '../components/artspace/FoldersPanel';
import { MessageTipsPanel } from '../components/artspace/MessageTipsPanel';
import {
  conversations,
  messageOverview,
  messageQuickActions,
  messageTabs,
} from '../data/artspaceMessages';
import { useSession } from '../lib/sessionContext';
import { loadMessages, sendMessage } from '../services/messages';
import type { Conversation, MessageDay } from '../data/artspaceMessages';
import styles from './MessagesPage.module.css';

/** Messages — structured professional conversations, not freeform DMs. Every
 *  conversation carries its category, artwork and purpose, and no personal
 *  contact details are ever surfaced in a thread.
 *  See docs/pivot-checklist/15-messages.md. */
export function MessagesPage() {
  const { profile } = useSession();
  const [params] = useSearchParams();
  const [rows, setRows] = useState<Conversation[]>(conversations);
  const [threads, setThreads] = useState<Record<string, MessageDay[]>>({});
  const [tab, setTab] = useState('all');
  const [folder, setFolder] = useState('inbox');
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isDemo, setIsDemo] = useState(true);

  const load = useCallback(async () => {
    const result = await loadMessages(profile);
    setRows(result.conversations);
    setThreads(result.threads);
    setIsDemo(result.isDemo);
  }, [profile]);

  useEffect(() => {
    let active = true;
    loadMessages(profile).then((result) => {
      if (!active) return;
      setRows(result.conversations);
      setThreads(result.threads);
      setIsDemo(result.isDemo);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  // ?c=<conversationId> is how the topbar's notification dropdown opens a
  // specific thread. Falls back to the first conversation once rows have
  // loaded and nothing in the URL points anywhere in particular.
  useEffect(() => {
    if (rows.length === 0) return;
    const requested = params.get('c');
    const match = requested && rows.some((c) => c.id === requested) ? requested : rows[0].id;
    setActiveId(match);
  }, [rows, params]);

  const visible = useMemo(() => {
    if (tab === 'unread') return rows.filter((c) => c.unread > 0);
    if (tab === 'starred') return rows.filter((c) => c.starred);
    // Archiving writes a conversation_flags row; nothing is archived yet.
    if (tab === 'archive') return [];
    return rows;
  }, [rows, tab]);

  const active = rows.find((c) => c.id === activeId) ?? rows[0];

  // The composer used to be inert on both sides. Now that MessageThread can
  // send, the artist's half sends too — leaving it disabled while the buyer's
  // works would be a one-way conversation.
  const handleSend = useCallback(
    async (body: string) => {
      if (!profile || !active) return;
      await sendMessage(active.id, profile.id, body);
      await load();
    },
    [active, load, profile],
  );

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />

        <ArtspacePageHeader
          title="Messages"
          subtitle="Communicate with galleries, collectors and partners."
        />

        <div className={styles.tabRow}>
          <ArtspaceTabs
            tabs={messageTabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            label="Filter messages"
          />
        </div>

        <div className={styles.layout}>
          <section className={styles.mailbox}>
            <ConversationList items={visible} activeId={active.id} onSelect={setActiveId} />
            <MessageThread
              conversation={active}
              days={threads[active.id]}
              onSend={isDemo ? undefined : handleSend}
            />
          </section>

          <aside className={styles.rightCol}>
            <StatsOverviewPanel
              title="Message Overview"
              stats={messageOverview.stats}
              ranges={messageOverview.ranges}
              linkTo="/artspace/messages"
            />
            <QuickActionsPanel actions={messageQuickActions} />
            <FoldersPanel active={folder} onSelect={setFolder} />
            <MessageTipsPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
