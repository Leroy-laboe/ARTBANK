import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { RecordOverviewTab } from '../components/artspace/RecordOverviewTab';
import { RecordPassportTab } from '../components/artspace/RecordPassportTab';
import { RecordInterestTab } from '../components/artspace/RecordInterestTab';
import { RecordOpportunitiesTab } from '../components/artspace/RecordOpportunitiesTab';
import { RecordRightsTab } from '../components/artspace/RecordRightsTab';
import { RecordEarningsTab } from '../components/artspace/RecordEarningsTab';
import { RecordHistoryTab } from '../components/artspace/RecordHistoryTab';
import { SmartLinkPanel } from '../components/artspace/SmartLinkPanel';
import { Icon } from '../components/ui/Icon';
import { getArtworkRecord, type ArtworkRecord } from '../services/artworkRecord';
import { updateArtworkDetails } from '../services/artwork';
import { smartLinkUrl } from '../services/smartLink';
import styles from './ArtworkRecordPage.module.css';

/** The artwork record — the "Living Creative Asset Passport" of
 *  docs/pivot-checklist/11-artwork-record-passport.md.
 *
 *  Seven tabs, as the spec lists them, all reading the real record. This is
 *  where View, Edit and the Passport cell in My Works land. */

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  private: 'Private',
};

const availabilityLabel: Record<string, string> = {
  available: 'Available',
  on_view: 'On View',
  reserved: 'Reserved',
  sold: 'Sold',
  licensing_available: 'Licensing only',
  unavailable: 'Unavailable',
};

const coaLabel: Record<string, string> = {
  not_requested: 'No certificate',
  pending_review: 'COA in review',
  issued: 'COA issued',
};

export function ArtworkRecordPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [record, setRecord] = useState<ArtworkRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ?edit=1 comes from "Edit details" in My Works, so that action lands on the
  // form rather than making the artist find it.
  const editing = params.get('edit') === '1';

  const load = useCallback(async () => {
    setLoading(true);
    const result = await getArtworkRecord(id);
    setRecord(result);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const say = (message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  };

  const setEditing = (on: boolean) => {
    const next = new URLSearchParams(params);
    if (on) next.set('edit', '1');
    else next.delete('edit');
    setParams(next, { replace: true });
  };

  async function handleSave(patch: {
    title: string;
    year: string;
    medium: string;
    dimensions: string;
    category: string;
    description: string;
    materials: string;
    creationLocation: string;
  }) {
    if (!record) return;
    setSaving(true);
    try {
      await updateArtworkDetails(record.artwork.id, {
        title: patch.title.trim(),
        year: patch.year.trim() ? Number(patch.year) : null,
        medium: patch.medium.trim(),
        dimensions: patch.dimensions.trim(),
        category: patch.category.trim(),
        description: patch.description.trim(),
        materials: patch.materials.split(',').map((m) => m.trim()).filter(Boolean),
        creationLocation: patch.creationLocation.trim() || null,
        availabilityNote: record.artwork.availabilityNote,
      });
      setEditing(false);
      await load();
      say('Changes saved.');
    } catch (err) {
      const message = (err as { message?: string } | null)?.message ?? '';
      say(message ? `Could not save. ${message}` : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  }

  // The permanent public URL from docs/pivot-checklist/
  // 19-feature-smart-artwork-link-qr.md — anyone can open this, signed in or
  // not. SmartLinkPanel generates the QR for the same address.
  const shareUrl = record ? smartLinkUrl(record.artwork.id) : '';

  if (loading) {
    return (
      <div className={styles.shell}>
        <ArtspaceSidebar />
        <main className={styles.body}>
          <ArtspaceTopbar showGreeting={false} />
          <p className={styles.state}>Loading this record…</p>
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className={styles.shell}>
        <ArtspaceSidebar />
        <main className={styles.body}>
          <ArtspaceTopbar showGreeting={false} />
          <div className={styles.state}>
            <h1 className={styles.stateTitle}>That artwork isn’t here</h1>
            <p className={styles.stateNote}>
              No record with the id <code>{id}</code> belongs to this account. It may have been
              deleted, or the link may be wrong.
            </p>
            <Link to="/artspace/works" className={styles.stateLink}>
              Back to My Works
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const { artwork, images, interest, deals, matches } = record;
  const cover = images.find((i) => i.isPrimary) ?? images[0];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'passport', label: 'Passport' },
    { id: 'interest', label: 'Interest', count: interest.identified.length },
    { id: 'opportunities', label: 'Opportunities', count: matches.length },
    { id: 'rights', label: 'Rights' },
    { id: 'earnings', label: 'Earnings', count: deals.length },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} searchPlaceholder="Search artworks..." />

        <Link to="/artspace/works" className={styles.back}>
          <Icon name="chevron-left" size={15} />
          My Works
        </Link>

        {record.isDemo && (
          <p className={styles.demo} role="status">
            Showing a demo record — this build isn’t connected to a database.
          </p>
        )}

        <header className={styles.head}>
          {cover ? (
            <img src={cover.url} alt="" className={styles.cover} />
          ) : (
            <div className={styles.coverEmpty}>
              <Icon name="image" size={22} />
            </div>
          )}

          <div className={styles.headCopy}>
            <h1 className={styles.title}>{artwork.title}</h1>
            <p className={styles.meta}>
              {[artwork.year, artwork.medium, artwork.dimensions].filter(Boolean).join(' • ') ||
                'Details incomplete'}
            </p>

            <div className={styles.chips}>
              <span className={styles.chip}>{statusLabel[artwork.status] ?? artwork.status}</span>
              <span className={styles.chip}>
                {availabilityLabel[artwork.availability] ?? artwork.availability}
                {artwork.availabilityNote ? ` ${artwork.availabilityNote}` : ''}
              </span>
              <span className={styles.chip}>{coaLabel[artwork.coaStatus] ?? artwork.coaStatus}</span>
              <span className={styles.chip}>{artwork.visibility}</span>
            </div>
          </div>

          <div className={styles.headActions}>
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                setTab('overview');
                setEditing(true);
              }}
            >
              <Icon name="pencil" size={14} />
              Edit
            </button>
            <button
              type="button"
              className={styles.action}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(shareUrl);
                  say('Share link copied.');
                } catch {
                  say('Your browser blocked clipboard access.');
                }
              }}
            >
              <Icon name="copy" size={14} />
              Share
            </button>
            <Link to={`/artspace/works/${record.artwork.id}/pack`} className={styles.action}>
              <Icon name="file-text" size={14} />
              Generate Pack
            </Link>
          </div>
        </header>

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        <ArtspaceTabs
          tabs={tabs}
          active={tab}
          onChange={setTab}
          label="Artwork record sections"
        />

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {tab === 'overview' && (
              <RecordOverviewTab
                // Remounts on save so the form starts from the saved values
                // rather than keeping stale local state.
                key={artwork.updatedAt ?? artwork.id}
                record={record}
                editing={editing}
                saving={saving}
                onStartEdit={() => setEditing(true)}
                onCancelEdit={() => setEditing(false)}
                onSave={handleSave}
              />
            )}
            {tab === 'passport' && <RecordPassportTab record={record} />}
            {tab === 'interest' && <RecordInterestTab record={record} />}
            {tab === 'opportunities' && <RecordOpportunitiesTab record={record} />}
            {tab === 'rights' && <RecordRightsTab record={record} />}
            {tab === 'earnings' && <RecordEarningsTab record={record} onChanged={load} />}
            {tab === 'history' && <RecordHistoryTab record={record} />}
          </div>

          <aside className={styles.rightCol}>
            <SmartLinkPanel
              artworkId={record.artwork.id}
              totalVisits={record.linkStats.total}
              bySource={record.linkStats.bySource}
            />

            <section className={styles.factsCard}>
              <h2 className={styles.factsTitle}>At a glance</h2>
              <dl className={styles.facts}>
                <div>
                  <dt>Identified interest</dt>
                  <dd>{interest.identified.length}</dd>
                </div>
                <div>
                  <dt>Anonymous viewers</dt>
                  <dd>{interest.anonymousCount}</dd>
                </div>
                <div>
                  <dt>Opportunities</dt>
                  <dd>{matches.length}</dd>
                </div>
                <div>
                  <dt>Recorded earnings</dt>
                  <dd>
                    {deals.length === 0
                      ? '—'
                      : `${deals[0].currency} ${deals
                          .reduce((sum, d) => sum + d.amount, 0)
                          .toLocaleString('en-US')}`}
                  </dd>
                </div>
                <div>
                  <dt>Added</dt>
                  <dd>
                    {new Date(artwork.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                className={styles.factsLink}
                onClick={() => navigate('/artspace/works')}
              >
                Back to all works
                <Icon name="arrow-right" size={13} />
              </button>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
