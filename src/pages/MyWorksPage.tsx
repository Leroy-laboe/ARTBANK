import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { WorksTable } from '../components/artspace/WorksTable';
import { WorksGrid } from '../components/artspace/WorksGrid';
import { ArtspacePagination } from '../components/artspace/ArtspacePagination';
import { StatsOverviewPanel } from '../components/artspace/StatsOverviewPanel';
import { QuickActionsPanel } from '../components/artspace/QuickActionsPanel';
import { WorksFiltersPanel } from '../components/artspace/WorksFiltersPanel';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import { listMyWorks, setArtworkStatus } from '../services/artwork';
import { exportWorksCsv } from '../lib/exportCsv';
import type { WorkAction } from '../components/artspace/workActions';
import type { Work } from '../data/artspaceWorks';
import { portfolioOverview, works as demoWorks, worksQuickActions, worksTabs } from '../data/artspaceWorks';
import styles from './MyWorksPage.module.css';

/** My Works — the artwork management screen, not an image gallery. Every row
 *  carries status, availability, documentation, interest and recorded
 *  earnings (docs/pivot-checklist/09-my-works.md). */
const PER_PAGE = 7;

export function MyWorksPage() {
  const navigate = useNavigate();
  const { profile } = useSession();
  const [notice, setNotice] = useState<string | null>(null);
  const [allRows, setAllRows] = useState<Work[]>(demoWorks);
  const [tab, setTab] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  // Real rows once migration 0011 has run and the artist owns artworks;
  // the demo set until then, so the screen never renders empty.
  useEffect(() => {
    let active = true;
    listMyWorks(profile).then((result) => {
      if (active) setAllRows(result.works);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  const visible = useMemo(() => {
    let rows = allRows;
    if (tab === 'published') rows = rows.filter((w) => w.status === 'Published');
    else if (tab === 'on-view') rows = rows.filter((w) => w.availability === 'On View');
    else if (tab === 'in-progress') rows = rows.filter((w) => w.status === 'In Progress');
    else if (tab === 'unavailable') rows = rows.filter((w) => w.availability === 'Unavailable');
    else if (tab === 'archived') rows = rows.filter((w) => w.status === 'Archived');
    // "All Works" hides archived pieces unless the rail toggle asks for them.
    else if (!showArchived) rows = rows.filter((w) => w.status !== 'Archived');
    return rows;
  }, [allRows, tab, showArchived]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const pageRows = visible.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Changing filters can leave you past the last page.
  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const say = useCallback((message: string) => {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }, []);

  /** One place where every artwork action lands, wherever it was triggered. */
  const handleAction = useCallback(
    async (work: Work, action: WorkAction) => {
      switch (action) {
        case 'view':
        case 'passport':
          navigate(`/artspace/works/${work.id}`);
          return;
        case 'edit':
          navigate(`/artspace/works/${work.id}?edit=1`);
          return;
        case 'share': {
          const url = `${window.location.origin}/artspace/works/${work.id}`;
          try {
            await navigator.clipboard.writeText(url);
            say(`Link to “${work.title}” copied.`);
          } catch {
            say('Could not copy the link — your browser blocked clipboard access.');
          }
          return;
        }
        case 'publish':
        case 'unpublish':
        case 'archive': {
          const next =
            action === 'publish' ? 'Published' : action === 'unpublish' ? 'Draft' : 'Archived';
          // Update immediately so the table responds, then persist.
          setAllRows((rows) =>
            rows.map((w) => (w.id === work.id ? { ...w, status: next as Work['status'] } : w)),
          );
          try {
            await setArtworkStatus(work.id, next.toLowerCase() as 'draft' | 'published' | 'archived');
            say(`“${work.title}” is now ${next.toLowerCase()}.`);
          } catch {
            say(`Showing “${work.title}” as ${next.toLowerCase()} — not saved, no database yet.`);
          }
        }
      }
    },
    [navigate, say],
  );

  const handleExport = () => {
    exportWorksCsv(visible);
    say(`Exported ${visible.length} artwork${visible.length === 1 ? '' : 's'} as CSV.`);
  };

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected((prev) => (prev.length === pageRows.length ? [] : pageRows.map((w) => w.id)));

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} searchPlaceholder="Search artworks..." />

        <ArtspacePageHeader
          title="My Works"
          subtitle="Manage your artworks, track their status, interest, opportunities and earnings."
          actions={
            <>
              <button type="button" className={styles.export} onClick={handleExport}>
                <Icon name="upload" size={15} />
                Export
              </button>

              <div className={styles.viewToggle} role="group" aria-label="View">
                <button
                  type="button"
                  className={[styles.viewBtn, view === 'table' && styles.viewBtnActive].filter(Boolean).join(' ')}
                  onClick={() => setView('table')}
                  aria-pressed={view === 'table'}
                  aria-label="Table view"
                >
                  <Icon name="list" size={16} />
                </button>
                <button
                  type="button"
                  className={[styles.viewBtn, view === 'grid' && styles.viewBtnActive].filter(Boolean).join(' ')}
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                >
                  <Icon name="grid-dots" size={16} />
                </button>
              </div>
            </>
          }
        />

        {notice && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <ArtspaceTabs
              tabs={worksTabs}
              active={tab}
              onChange={setTab}
              label="Filter artworks by status"
            />

            <section className={styles.tableCard}>
              {view === 'table' ? (
                <WorksTable
                  works={pageRows}
                  selected={selected}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                  onAction={handleAction}
                />
              ) : (
                <WorksGrid works={pageRows} onAction={handleAction} />
              )}

              <ArtspacePagination
                from={visible.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}
                to={Math.min(page * PER_PAGE, visible.length)}
                total={visible.length}
                unit="artworks"
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </section>
          </div>

          <aside className={styles.rightCol}>
            <StatsOverviewPanel
              title="Portfolio Overview"
              stats={portfolioOverview.stats}
              ranges={portfolioOverview.ranges}
              columns={3}
              linkTo="/artspace/profile"
            />
            <QuickActionsPanel actions={worksQuickActions} />
            <WorksFiltersPanel
              showArchived={showArchived}
              onShowArchivedChange={setShowArchived}
              onClear={() => {
                setTab('all');
                setShowArchived(false);
                setSelected([]);
              }}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
