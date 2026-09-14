import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminSidebar } from '../components/admin/AdminSidebar';
import { AdminTopbar } from '../components/admin/AdminTopbar';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import {
  approveCoa,
  describeAdminError,
  listCoaQueue,
  rejectCoa,
  resolveEvidenceUrl,
} from '../services/admin';
import { isSupabaseConfigured } from '../lib/supabaseClient';
import type { AdminCoaCase } from '../types/admin';
import styles from './AdminCoaReviewPage.module.css';

type Tab = 'evidence' | 'details' | 'artist';

const tabs: { id: Tab; label: string }[] = [
  { id: 'evidence', label: 'Evidence Files' },
  { id: 'details', label: 'Artwork Details' },
  { id: 'artist', label: 'Artist' },
];

/** Admin → COA Review — docs/pivot-checklist/29-feature-admin-functions.md's
 *  function #3: moving artworks.coa_status from pending_review to issued
 *  (approve) or back to not_requested (reject / needs more), with an
 *  optional reason captured in the coa_rejection_reason column migration
 *  0035 adds. Requires that migration and a signed-in admin; falls back to
 *  the demo queue otherwise. */
export function AdminCoaReviewPage() {
  const [queue, setQueue] = useState<AdminCoaCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState<Tab>('evidence');
  const [activeImage, setActiveImage] = useState(0);
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const current = queue[index];

  useEffect(() => {
    let active = true;
    listCoaQueue().then((result) => {
      if (!active) return;
      setQueue(result.items);
      setIsDemo(result.isDemo);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  // Evidence file `url` holds a storage_path (not a real link) once loaded
  // from the live service — mint a short-lived signed URL for the case
  // that's actually open, not the whole queue up front.
  useEffect(() => {
    if (!current || isDemo || !isSupabaseConfigured) return;
    let active = true;
    Promise.all(
      current.evidenceFiles.map(async (file) => [file.id, await resolveEvidenceUrl(file.url)] as const),
    ).then((pairs) => {
      if (!active) return;
      setResolvedUrls(Object.fromEntries(pairs.filter((pair): pair is [string, string] => Boolean(pair[1]))));
    });
    return () => {
      active = false;
    };
  }, [current, isDemo]);

  async function resolve(action: 'approve' | 'reject') {
    if (!current) return;
    setSaveError(null);

    if (!isDemo) {
      setSaving(true);
      try {
        if (action === 'approve') await approveCoa(current.id);
        else await rejectCoa(current.id, rejectionReason);
      } catch (err) {
        setSaveError(describeAdminError(err));
        setSaving(false);
        return;
      }
      setSaving(false);
    }

    const remaining = queue.length - 1;
    setQueue((prev) => prev.filter((_, i) => i !== index));
    setIndex((prev) => (remaining === 0 ? 0 : Math.min(prev, remaining - 1)));
    setTab('evidence');
    setActiveImage(0);
    setRejectionReason('');
    setResolvedUrls({});
  }

  function goTo(next: number) {
    if (next < 0 || next >= queue.length) return;
    setIndex(next);
    setTab('evidence');
    setActiveImage(0);
    setRejectionReason('');
    setResolvedUrls({});
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar />

      <main className={styles.body}>
        <AdminTopbar />

        {isDemo && !loading && (
          <p className={styles.demoNotice} role="status">
            Showing a sample queue — these aren't real COA requests yet.
          </p>
        )}
        {saveError && (
          <p className={styles.saveErrorBanner} role="alert">
            <Icon name="x-circle" size={14} />
            {saveError}
          </p>
        )}

        {loading ? (
          <p className={styles.loadingNote}>Loading the COA queue…</p>
        ) : !current ? (
          <div className={styles.empty}>
            <Icon name="check-circle" size={28} className={styles.emptyIcon} />
            <p className={styles.emptyTitle}>Queue clear</p>
            <p className={styles.emptyNote}>Every COA request has been reviewed.</p>
            <Button variant="primary" to="/admin">
              Back to Overview
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.queueNav}>
              <Link to="/admin" className={styles.backLink}>
                <Icon name="chevron-left" size={14} />
                Back to queue
              </Link>
              <div className={styles.queuePos}>
                <button type="button" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous case">
                  <Icon name="chevron-left" size={15} />
                </button>
                <span>
                  {index + 1} of {queue.length}
                </span>
                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  disabled={index === queue.length - 1}
                  aria-label="Next case"
                >
                  <Icon name="chevron-right" size={15} />
                </button>
              </div>
            </div>

            <div className={styles.card}>
              <header className={styles.head}>
                {current.images[0] ? (
                  <img src={current.images[0]} alt="" className={styles.headThumb} />
                ) : (
                  <span className={styles.headThumbPlaceholder} aria-hidden="true">
                    <Icon name="image" size={18} />
                  </span>
                )}
                <div className={styles.headCopy}>
                  <p className={styles.headTitle}>{current.title}</p>
                  <p className={styles.headArtist}>by {current.artistName}</p>
                  <p className={styles.headMeta}>
                    {current.year} • {current.medium} • {current.dimensions}
                  </p>
                </div>
                <span className={styles.badge}>Pending Review</span>
              </header>

              <div className={styles.tabs} role="tablist">
                {tabs.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={tab === option.id}
                    className={[styles.tab, tab === option.id && styles.tabActive].filter(Boolean).join(' ')}
                    onClick={() => setTab(option.id)}
                  >
                    {option.label}
                    {option.id === 'evidence' && <span className={styles.tabCount}>{current.evidenceFiles.length}</span>}
                  </button>
                ))}
              </div>

              <div className={styles.tabPanel}>
                {tab === 'evidence' && (
                  <>
                    {current.images.length > 0 ? (
                      <>
                        <img src={current.images[activeImage]} alt="" className={styles.mainImage} />
                        {current.images.length > 1 && (
                          <div className={styles.thumbRow}>
                            {current.images.map((url, i) => (
                              <button
                                key={url}
                                type="button"
                                className={[styles.thumbBtn, i === activeImage && styles.thumbBtnActive]
                                  .filter(Boolean)
                                  .join(' ')}
                                onClick={() => setActiveImage(i)}
                              >
                                <img src={url} alt="" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className={styles.noImages}>No images on this record yet.</p>
                    )}

                    {current.evidenceFiles.length === 0 ? (
                      <p className={styles.noImages}>No evidence files were attached.</p>
                    ) : (
                      <ul className={styles.fileList}>
                        {current.evidenceFiles.map((file) => {
                          const href = isDemo ? file.url : resolvedUrls[file.id];
                          return (
                            <li key={file.id} className={styles.fileRow}>
                              <span className={styles.fileIcon}>
                                <Icon name={file.kind === 'image' ? 'image' : 'file-text'} size={16} />
                              </span>
                              <span className={styles.fileCopy}>
                                <span className={styles.fileName}>{file.name}</span>
                                <span className={styles.fileMeta}>
                                  {file.sizeLabel} • Uploaded {file.uploadedDate}
                                </span>
                              </span>
                              {href ? (
                                <a
                                  href={href}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={styles.download}
                                  aria-label={`Download ${file.name}`}
                                >
                                  <Icon name="download" size={15} />
                                </a>
                              ) : (
                                <span className={styles.downloadPending} aria-label="Preparing link">
                                  <Icon name="hourglass" size={14} />
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </>
                )}

                {tab === 'details' && (
                  <dl className={styles.detailsList}>
                    <div>
                      <dt>Title</dt>
                      <dd>{current.title}</dd>
                    </div>
                    <div>
                      <dt>Year</dt>
                      <dd>{current.year}</dd>
                    </div>
                    <div>
                      <dt>Medium</dt>
                      <dd>{current.medium}</dd>
                    </div>
                    <div>
                      <dt>Dimensions</dt>
                      <dd>{current.dimensions}</dd>
                    </div>
                    <div className={styles.detailsWide}>
                      <dt>Description</dt>
                      <dd>{current.description || '—'}</dd>
                    </div>
                  </dl>
                )}

                {tab === 'artist' && (
                  <div className={styles.artistCard}>
                    <div className={styles.artistAvatar}>{current.artistName.charAt(0)}</div>
                    <div>
                      <p className={styles.artistName}>{current.artistName}</p>
                      <p className={styles.artistEmail}>{current.artistEmail}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.reasonField}>
                <label className={styles.reasonLabel} htmlFor="coa-rejection-reason">
                  Rejection reason (optional)
                </label>
                <textarea
                  id="coa-rejection-reason"
                  className={styles.reasonInput}
                  rows={2}
                  placeholder="Provide a reason if sending back to the artist..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>

              <div className={styles.actions}>
                <Button variant="ghost" onClick={() => resolve('reject')} disabled={saving}>
                  Reject / Needs More
                </Button>
                <Button variant="primary" onClick={() => resolve('approve')} disabled={saving}>
                  {saving ? 'Saving…' : 'Approve & Issue COA'}
                </Button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
