import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { ConversationList } from '../components/artspace/ConversationList';
import { MessageThread } from '../components/artspace/MessageThread';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { loadMessages, sendMessage } from '../services/messages';
import { conversations as demoConversations } from '../data/artspaceMessages';
import type { Conversation, MessageDay } from '../data/artspaceMessages';
import styles from './BuyerMessagesPage.module.css';

/** Messages, from the buyer's end.
 *
 *  The same two panes ArtSpace uses, reading the same tables from the other
 *  side — `loadMessages(profile, 'buyer')` filters by buyer_id and shows the
 *  artist as the correspondent. Nothing is duplicated: one mapper serves both
 *  workspaces, so a thread cannot look like two different conversations
 *  depending on who opened it.
 *
 *  Personal email and phone never appear in a thread here either. That rule
 *  is not artist-specific — contact stays inside Artbank both ways
 *  (docs/pivot-checklist/15-messages.md). */
export function BuyerMessagesPage() {
  const { profile } = useSession();
  const [params] = useSearchParams();

  const [rows, setRows] = useState<Conversation[]>(demoConversations);
  const [threads, setThreads] = useState<Record<string, MessageDay[]>>({});
  const [isDemo, setIsDemo] = useState(true);
  const [activeId, setActiveId] = useState(demoConversations[0].id);

  const reload = useCallback(async () => {
    const result = await loadMessages(profile, 'buyer');
    setRows(result.conversations);
    setThreads(result.threads);
    setIsDemo(result.isDemo);
  }, [profile]);

  useEffect(() => {
    let active = true;
    loadMessages(profile, 'buyer').then((result) => {
      if (!active) return;
      setRows(result.conversations);
      setThreads(result.threads);
      setIsDemo(result.isDemo);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  // ?c=<conversationId> is how the bell, and a just-sent enquiry, open a
  // particular thread.
  useEffect(() => {
    if (rows.length === 0) return;
    const requested = params.get('c');
    setActiveId(requested && rows.some((c) => c.id === requested) ? requested : rows[0].id);
  }, [rows, params]);

  const active = rows.find((c) => c.id === activeId) ?? rows[0];

  async function handleSend(body: string) {
    if (!profile || !active) return;
    await sendMessage(active.id, profile.id, body);
    await reload();
  }

  return (
    <BuyerShell topbar={<BuyerTopbar />}>
      <ArtspacePageHeader title="Messages" subtitle="Communicate securely with artists." />

      {isDemo && (
        <p className={styles.demoNote}>
          <Icon name="info" size={14} />
          Sample conversation. Your own threads open here once an artist replies to an enquiry.
        </p>
      )}

      <section className={styles.mailbox}>
        <ConversationList items={rows} activeId={active.id} onSelect={setActiveId} />
        <MessageThread
          conversation={active}
          days={threads[active.id]}
          onSend={isDemo ? undefined : handleSend}
        />
      </section>
    </BuyerShell>
  );
}
