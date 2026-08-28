import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BuyerShell } from '../components/buyer/BuyerShell';
import { BuyerTopbar } from '../components/buyer/BuyerTopbar';
import { ConversationList } from '../components/artspace/ConversationList';
import { MessageThread } from '../components/artspace/MessageThread';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { loadMessages, sendMessage } from '../services/messages';
import { getArtworkDeal, type DealSummary } from '../services/deals';
import { ReportPaymentDialog } from '../components/artspace/ReportPaymentDialog';
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
  const [deal, setDeal] = useState<DealSummary | null>(null);
  const [reporting, setReporting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

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

  // The deal on this conversation's artwork, read from the buyer's end. RLS
  // returns it only because this account is the buyer on it — the same query
  // from a stranger gets nothing.
  useEffect(() => {
    let live = true;
    const artworkId = active?.artworkId;
    if (!artworkId || isDemo) {
      setDeal(null);
      return;
    }
    getArtworkDeal(artworkId, 'buyer').then((found) => {
      if (live) setDeal(found);
    });
    return () => {
      live = false;
    };
  }, [active?.artworkId, isDemo]);

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

      {notice && (
        <p className={styles.demoNote} role="status">
          <Icon name="info" size={14} />
          {notice}
        </p>
      )}

      {!active ? (
        <section className={styles.emptyMailbox}>
          <Icon name="message" size={26} className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No messages yet</p>
          <p className={styles.emptyNote}>
            A thread opens the moment you send an enquiry about an artwork. Everything you asked
            travels with it, so the artist already knows what you want.
          </p>
          <Link to="/collect" className={styles.emptyLink}>
            Browse artworks
          </Link>
        </section>
      ) : (
      <section className={styles.mailbox}>
        <ConversationList items={rows} activeId={active.id} onSelect={setActiveId} />
        <MessageThread
          conversation={active}
          side="buyer"
          deal={deal}
          onReport={deal ? () => setReporting(true) : undefined}
          days={threads[active.id]}
          onSend={isDemo ? undefined : handleSend}
        />
      </section>
      )}

      {reporting && deal && (
        <ReportPaymentDialog
          deal={deal}
          onClose={() => setReporting(false)}
          onReported={async (summary) => {
            setReporting(false);
            setNotice(summary);
            if (active?.artworkId) setDeal(await getArtworkDeal(active.artworkId, 'buyer'));
          }}
        />
      )}
    </BuyerShell>
  );
}
