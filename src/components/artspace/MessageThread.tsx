import { useState, type FormEvent } from 'react';
import { Icon } from '../ui/Icon';
import { DealBanner } from './DealBanner';
import { StageProgress } from './StageProgress';
import type { DealSummary } from '../../services/deals';
import type { ConversationStage } from '../../services/interest';
import { thread as demoThread, type Conversation, type MessageDay } from '../../data/artspaceMessages';
import type { MonogramTone } from '../../data/artspaceInterest';
import styles from './MessageThread.module.css';

const toneClass: Record<MonogramTone, string> = {
  forest: styles.toneForest,
  gold: styles.toneGold,
  ink: styles.toneInk,
};

/** The open conversation.
 *
 *  Note the descriptor line carries organisation and country only — personal
 *  email and phone are deliberately never rendered in a thread, so contact
 *  stays inside Artbank (docs/pivot-checklist/15-messages.md). */
export function MessageThread({
  conversation,
  days,
  onSend,
  onRecordSale,
  deal,
  side = 'artist',
  onReport,
  onConfirm,
  busy,
  stage,
  readOnly,
}: {
  conversation: Conversation;
  /** The loaded thread. Falls back to the demo exchange so the panel is
   *  never blank while the tables are still empty. */
  days?: MessageDay[];
  /** Given, the composer sends. Omitted, it stays a preview — which is what
   *  a demo thread is, and posting into one would go nowhere. */
  onSend?: (body: string) => Promise<void> | void;
  /** Given, the header offers "Record a Sale". Only the artist's side passes
   *  this: 0012's RLS lets the artist record a deal and nobody else, so
   *  showing the button to a buyer would offer them a refusal. */
  onRecordSale?: () => void;
  /** The deal recorded against this conversation's artwork, if any. Shown as
   *  a banner so the thread reflects what happened rather than reading like
   *  an open negotiation forever. */
  deal?: DealSummary | null;
  /** Which end is reading. Only changes the banner's wording. */
  side?: 'artist' | 'buyer';
  /** Passed straight to the banner — the payment handshake on a `request`
   *  deal. The thread does not act on them, it just hosts the banner that
   *  does. */
  onReport?: () => void;
  onConfirm?: () => void;
  busy?: boolean;
  /** Interest-to-Deal Progress — omitted on a demo thread, where there is no
   *  real interest_entries row behind it to read a stage from. */
  stage?: ConversationStage;
  /** True for a guardian's view: distinct from a demo thread, which shows a
   *  disabled composer as a stated preview of what sending looks like. A
   *  guardian genuinely cannot reply here, so a composer with a Send button
   *  sitting there — even disabled — claims an ability that doesn't exist. */
  readOnly?: boolean;
}) {
  const thread = days && days.length > 0 ? days : demoThread;
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!onSend || !body || sending) return;

    setSending(true);
    try {
      await onSend(body);
      setDraft('');
    } finally {
      setSending(false);
    }
  }
  return (
    <div className={styles.pane}>
      <header className={styles.head}>
        {conversation.avatarUrl ? (
          <img src={conversation.avatarUrl} alt="" className={styles.avatar} />
        ) : (
          <span
            className={[styles.monogram, toneClass[conversation.tone ?? 'ink']].join(' ')}
            aria-hidden="true"
          >
            {conversation.monogram}
          </span>
        )}

        <div className={styles.who}>
          <p className={styles.name}>
            {conversation.name}
            {conversation.verified && (
              <Icon name="badge-check" size={14} className={styles.verified} aria-label="Identity verified" />
            )}
          </p>
          <p className={styles.descriptor}>{conversation.descriptor}</p>
        </div>

        {/* Only where there is an artwork to record against — a general
            enquiry has no record to attach a figure to. */}
        {onRecordSale && conversation.artworkId && !deal && (
          <button type="button" className={styles.recordBtn} onClick={onRecordSale}>
            <Icon name="handshake" size={15} />
            Record a Sale
          </button>
        )}

        <button
          type="button"
          className={[styles.headBtn, conversation.starred && styles.headBtnActive].filter(Boolean).join(' ')}
          aria-label={conversation.starred ? 'Unstar conversation' : 'Star conversation'}
        >
          <Icon name="star" size={17} />
        </button>
        <button type="button" className={styles.headBtn} aria-label="Conversation actions">
          <Icon name="more-vertical" size={17} />
        </button>
      </header>

      {stage && (
        <div className={styles.stageRow}>
          <StageProgress stage={stage} />
        </div>
      )}

      {deal && (
        <DealBanner
          deal={deal}
          side={side}
          onReport={onReport}
          onConfirm={onConfirm}
          busy={busy}
        />
      )}

      <div className={styles.scroll}>
        {thread.map((day) => (
          <section key={day.date}>
            <p className={styles.dateRule}>
              <span>{day.date}</span>
            </p>

            {day.messages.map((message) => (
              <div
                className={[styles.bubbleRow, message.direction === 'out' && styles.bubbleRowOut]
                  .filter(Boolean)
                  .join(' ')}
                key={message.id}
              >
                <div
                  className={[styles.bubble, message.direction === 'out' ? styles.out : styles.in].join(' ')}
                >
                  {message.paragraphs.map((paragraph, i) => (
                    <p className={styles.text} key={i}>
                      {paragraph}
                    </p>
                  ))}

                  {message.attachment && (
                    <div className={styles.attachment}>
                      <span className={styles.fileIcon}>
                        <Icon name="file-text" size={17} />
                      </span>
                      <span className={styles.fileCopy}>
                        <span className={styles.fileName}>{message.attachment.name}</span>
                        <span className={styles.fileMeta}>
                          {message.attachment.size} • {message.attachment.kind}
                        </span>
                      </span>
                      <button
                        type="button"
                        className={styles.download}
                        aria-label={`Download ${message.attachment.name}`}
                      >
                        <Icon name="download" size={15} />
                      </button>
                    </div>
                  )}

                  <p className={styles.meta}>
                    {message.time}
                    {message.direction === 'out' && message.read && (
                      <Icon name="check-double" size={13} className={styles.receipt} aria-label="Read" />
                    )}
                  </p>
                </div>
              </div>
            ))}
          </section>
        ))}
      </div>

      {readOnly ? (
        <p className={styles.readOnlyNotice}>
          <Icon name="eye" size={13} />
          You're seeing this because you're this person's verified guardian — you can't reply
          here.
        </p>
      ) : (
        <form className={styles.composer} onSubmit={submit}>
          <input
            type="text"
            className={styles.input}
            placeholder="Type your message..."
            aria-label="Type your message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            disabled={!onSend || sending}
          />

          <div className={styles.composerBar}>
            <div className={styles.tools}>
              <button type="button" className={styles.tool} aria-label="Attach a file">
                <Icon name="paperclip" size={17} />
              </button>
              <button type="button" className={styles.tool} aria-label="Attach an image">
                <Icon name="image" size={17} />
              </button>
              <button type="button" className={styles.tool} aria-label="Insert an emoji">
                <Icon name="smile" size={17} />
              </button>
              <button type="button" className={styles.tool} aria-label="Use a saved reply">
                <Icon name="sparkles" size={17} />
              </button>
            </div>

            <button
              type="submit"
              className={styles.send}
              disabled={!onSend || sending || draft.trim() === ''}
            >
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
