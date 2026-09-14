import { useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { describeAdminError, listFlaggedConversations, resolveFlag } from '../services/admin';
import { useSession } from '../lib/sessionContext';
import type { AdminFlagCategory, AdminFlaggedConversation } from '../types/admin';
import styles from './AdminFlaggedConversationsPage.module.css';

const tabs: { id: AdminFlagCategory; label: string }[] = [
  { id: 'report', label: 'Reports' },
  { id: 'block', label: 'Blocks' },
  { id: 'archive', label: 'Archives' },
];

/** Admin → Flagged Conversations — docs/pivot-checklist/
 *  29-feature-admin-functions.md's function #4: reading a flagged
 *  conversation in context and resolving it. "Escalate" is left as a single
 *  action here — what it actually does (warn, suspend messaging, suspend the
 *  account) is explicitly out of scope per the doc until that gets its own
 *  design. Requires migration 0035's status/resolved_by/resolved_at columns
 *  and admin-wide read policies; falls back to the demo set otherwise. */
export function AdminFlaggedConversationsPage() {
  const { profile } = useSession();
  const [items, setItems] = useState<AdminFlaggedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [tab, setTab] = useState<AdminFlagCategory>('report');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    listFlaggedConversations().then((result) => {
      if (!active) return;
      setItems(result.items);
      setIsDemo(result.isDemo);
      setSelectedId(result.items.find((item) => item.category === 'report')?.id ?? null);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => items.filter((item) => item.category === tab), [items, tab]);
  const selected = items.find((item) => item.id === selectedId) ?? filtered[0] ?? null;

  function selectTab(next: AdminFlagCategory) {
    setTab(next);
    const first = items.find((item) => item.category === next);
    setSelectedId(first?.id ?? null);
  }

  async function resolve(resolution: 'dismissed' | 'escalated') {
    if (!selected) return;
    setSaveError(null);

    if (!isDemo) {
      if (!profile) {
        setSaveError('Sign in as an admin to resolve a flag.');
        return;
      }
      setSaving(true);
      try {
        await resolveFlag(selected.id, resolution, profile);
      } catch (err) {
        setSaveError(describeAdminError(err));
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    const remaining = items.filter((item) => item.id !== selected.id);
    setItems(remaining);
    const next = remaining.find((item) => item.category === tab);
    setSelectedId(next?.id ?? null);
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />
        <AdminPageHeader
          title="Flagged Conversations"
          subtitle="Review reported, blocked or archived conversations."
        />

        {isDemo && !loading && (
          <p className={styles.demoNotice} role="status">
            Showing sample conversations — these aren't real flags yet.
          </p>
        )}
        {saveError && (
          <p className={styles.saveErrorBanner} role="alert">
            <Icon name="x-circle" size={14} />
            {saveError}
          </p>
        )}

        <div className={styles.tabs} role="tablist">
          {tabs.map((option) => {
            const count = items.filter((item) => item.category === option.id).length;
            return (
              <button
                key={option.id}
                type="button"
                role="tab"
                aria-selected={tab === option.id}
                className={[styles.tab, tab === option.id && styles.tabActive].filter(Boolean).join(' ')}
                onClick={() => selectTab(option.id)}
              >
                {option.label}
                <span className={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className={styles.loadingNote}>Loading flagged conversations…</p>
        ) : (
          <div className={styles.layout}>
            <div className={styles.list}>
              {filtered.length === 0 ? (
                <p className={styles.listEmpty}>Nothing here right now.</p>
              ) : (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[styles.listItem, item.id === selected?.id && styles.listItemActive]
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => setSelectedId(item.id)}
                  >
                    <p className={styles.listReason}>{item.reasonLabel}</p>
                    <p className={styles.listParticipants}>{item.participants.join(' ↔ ')}</p>
                    <p className={styles.listDate}>{item.date}</p>
                  </button>
                ))
              )}
            </div>

            <div className={styles.viewer}>
              {!selected ? (
                <div className={styles.viewerEmpty}>
                  <Icon name="check-circle" size={26} className={styles.viewerEmptyIcon} />
                  <p>All caught up on {tabs.find((t) => t.id === tab)?.label.toLowerCase()}.</p>
                </div>
              ) : (
                <>
                  <header className={styles.viewerHead}>
                    <div>
                      <p className={styles.viewerReason}>{selected.reasonLabel}</p>
                      <p className={styles.viewerMeta}>
                        Conversation between {selected.participants.join(' and ')} • {selected.date}
                      </p>
                    </div>
                  </header>

                  <div className={styles.thread}>
                    {selected.messages.length === 0 ? (
                      <p className={styles.noMessages}>No messages in this conversation.</p>
                    ) : (
                      selected.messages.map((message) => (
                        <div className={styles.messageRow} key={message.id}>
                          <p className={styles.messageMeta}>
                            <span className={styles.messageSender}>{message.sender}</span>
                            <span className={styles.messageTime}>{message.time}</span>
                          </p>
                          <p className={styles.messageText}>{message.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={styles.actions}>
                    <Button variant="ghost" onClick={() => resolve('dismissed')} disabled={saving}>
                      Dismiss (No Issue Found)
                    </Button>
                    <button
                      type="button"
                      className={styles.escalate}
                      onClick={() => resolve('escalated')}
                      disabled={saving}
                    >
                      {saving ? 'Saving…' : 'Escalate'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
