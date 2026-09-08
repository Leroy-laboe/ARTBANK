import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { Icon } from '../components/ui/Icon';
import { ConversationList } from '../components/artspace/ConversationList';
import { MessageThread } from '../components/artspace/MessageThread';
import { RecordSaleDialog } from '../components/artspace/RecordSaleDialog';
import { confirmPayment, describeDealError, getArtworkDeal, type DealSummary } from '../services/deals';
import { getConversationStage, resolveStage, type ConversationStage } from '../services/interest';
import { StatsOverviewPanel } from '../components/artspace/StatsOverviewPanel';
import { MessageTipsPanel } from '../components/artspace/MessageTipsPanel';
import {
  conversations,
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
  const [activeId, setActiveId] = useState(conversations[0].id);
  const [isDemo, setIsDemo] = useState(true);
  const [recording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [deal, setDeal] = useState<DealSummary | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [entryStage, setEntryStage] = useState<ConversationStage | null>(null);

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

  // The deal on the open conversation's artwork, if one has been recorded.
  // Re-read on every change of thread rather than joined onto the list: only
  // the open one is shown, and RLS already limits this to deals we are party
  // to, so there is nothing to filter here.
  const active = rows.find((c) => c.id === activeId) ?? rows[0];

  useEffect(() => {
    let live = true;
    const artworkId = active?.artworkId;
    if (!artworkId || isDemo) {
      setDeal(null);
      return;
    }
    getArtworkDeal(artworkId, 'artist').then((found) => {
      if (live) setDeal(found);
    });
    return () => {
      live = false;
    };
  }, [active?.artworkId, isDemo]);

  // "Interest-to-Deal Progress" — where this specific conversation sits in
  // the pipeline, per the staff brief's placement note for Messages.
  useEffect(() => {
    let live = true;
    if (!profile || isDemo || !active) {
      setEntryStage(null);
      return;
    }
    getConversationStage(profile.id, active.counterpartId ?? null, active.artworkId ?? null).then(
      (stage) => {
        if (live) setEntryStage(stage);
      },
    );
    return () => {
      live = false;
    };
  }, [profile, active, isDemo]);

  /** Three figures, all counted from the conversations actually on screen.
   *
   *  They used to be literals — 86 / 24 / 5 / 3 — which read the same next to
   *  an empty inbox as a full one. "Starred" is gone with them: nothing in the
   *  schema records a star, so it could only ever have been invented.
   *
   *  "Awaiting Your Reply" means they wrote last, read or not, which is the
   *  thing an artist actually needs to know. Unread is a narrower question
   *  and gets its own figure. */
  const overviewStats = useMemo(() => {
    const unread = rows.reduce((total, c) => total + c.unread, 0);

    const awaiting = rows.filter((c) => {
      const days = threads[c.id];
      const last = days?.[days.length - 1]?.messages.at(-1);
      return last?.direction === 'in';
    }).length;

    return [
      {
        id: 'total',
        value: String(rows.length),
        label: rows.length === 1 ? 'Conversation' : 'Conversations',
      },
      { id: 'unread', value: String(unread), label: 'Unread Messages' },
      { id: 'awaiting', value: String(awaiting), label: 'Awaiting Your Reply' },
    ];
  }, [rows, threads]);

  /** Counted from the loaded rows, so the strip and the list always agree. */
  const tabs = useMemo(
    () => [
      { id: 'all', label: 'All Messages', count: rows.length },
      { id: 'unread', label: 'Unread', count: rows.filter((c) => c.unread > 0).length },
      { id: 'starred', label: 'Starred', count: rows.filter((c) => c.starred).length },
      // Archiving writes a conversation_flags row, and nothing does yet — so
      // this is honestly zero rather than left blank.
      { id: 'archive', label: 'Archive', count: 0 },
    ],
    [rows],
  );

  const visible = useMemo(() => {
    if (tab === 'unread') return rows.filter((c) => c.unread > 0);
    if (tab === 'starred') return rows.filter((c) => c.starred);
    // Archiving writes a conversation_flags row; nothing is archived yet.
    if (tab === 'archive') return [];
    return rows;
  }, [rows, tab]);

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
            tabs={tabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            label="Filter messages"
          />
        </div>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        <div className={styles.layout}>
          {/* An empty inbox is a real answer now that loadMessages no longer
              substitutes demo threads for one. Rendering the two panes against
              no conversation would read from `active` and crash. */}
          {!active ? (
            <section className={styles.emptyMailbox}>
              <Icon name="message" size={26} className={styles.emptyIcon} />
              <p className={styles.emptyTitle}>No messages yet</p>
              <p className={styles.emptyNote}>
                Conversations start when a buyer sends an enquiry about one of your works. They
                arrive here with the artwork and what was asked already attached.
              </p>
              <Link to="/artspace/works" className={styles.emptyLink}>
                Go to My Works
              </Link>
            </section>
          ) : (
          <section className={styles.mailbox}>
            <ConversationList items={visible} activeId={active.id} onSelect={setActiveId} />
            <MessageThread
              conversation={active}
              side="artist"
              deal={deal}
              // No stage on a demo thread — there is no real interest_entries
              // row behind it, so nothing here would be a fact rather than a
              // guess.
              stage={isDemo ? undefined : resolveStage(entryStage, deal)}
              busy={confirming}
              onConfirm={
                deal
                  ? async () => {
                      setConfirming(true);
                      try {
                        const result = await confirmPayment(profile!, deal);
                        setNotice(
                          `Payment confirmed.${result.markedSold ? ' The work is now marked sold.' : ''}`,
                        );
                        if (active?.artworkId) {
                          setDeal(await getArtworkDeal(active.artworkId, 'artist'));
                        }
                      } catch (err) {
                        setNotice(describeDealError(err));
                      } finally {
                        setConfirming(false);
                      }
                    }
                  : undefined
              }
              days={threads[active.id]}
              onSend={isDemo ? undefined : handleSend}
              // Demo threads have no real artwork or buyer behind them, so
              // there is nothing to record a deal against.
              onRecordSale={isDemo ? undefined : () => setRecording(true)}
            />
          </section>
          )}

          <aside className={styles.rightCol}>
            <StatsOverviewPanel title="Message Overview" stats={overviewStats} columns={3} />
            <MessageTipsPanel />
          </aside>
        </div>
      </main>

      {recording && active?.artworkId && (
        <RecordSaleDialog
          artworkId={active.artworkId}
          artworkTitle={active.artwork ?? 'this artwork'}
          buyerId={active.counterpartId ?? null}
          buyerName={active.name}
          onClose={() => setRecording(false)}
          onRecorded={(summary) => {
            setRecording(false);
            setNotice(summary);
            // Re-read both: the thread for anything the record changed, and
            // the deal so the banner appears without a page reload.
            void load();
            if (active?.artworkId) {
              void getArtworkDeal(active.artworkId, 'artist').then(setDeal);
            }
          }}
        />
      )}
    </div>
  );
}
