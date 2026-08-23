import { Icon } from '../ui/Icon';
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
}: {
  conversation: Conversation;
  /** The loaded thread. Falls back to the demo exchange so the panel is
   *  never blank while the tables are still empty. */
  days?: MessageDay[];
}) {
  const thread = days && days.length > 0 ? days : demoThread;
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

      <form className={styles.composer} onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          className={styles.input}
          placeholder="Type your message..."
          aria-label="Type your message"
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

          <button type="submit" className={styles.send}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
