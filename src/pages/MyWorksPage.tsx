import { useMemo, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { WorksFilterTabs } from '../components/artspace/WorksFilterTabs';
import { WorksTable } from '../components/artspace/WorksTable';
import { WorksGrid } from '../components/artspace/WorksGrid';
import { WorksPagination } from '../components/artspace/WorksPagination';
import { PortfolioOverviewPanel } from '../components/artspace/PortfolioOverviewPanel';
import { QuickActionsPanel } from '../components/artspace/QuickActionsPanel';
import { WorksFiltersPanel } from '../components/artspace/WorksFiltersPanel';
import { Icon } from '../components/ui/Icon';
import { works, worksQuickActions } from '../data/artspaceWorks';
import styles from './MyWorksPage.module.css';

/** My Works — the artwork management screen, not an image gallery. Every row
 *  carries status, availability, documentation, interest and recorded
 *  earnings (docs/pivot-checklist/09-my-works.md). */
export function MyWorksPage() {
  const [tab, setTab] = useState('all');
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [page, setPage] = useState(1);

  const visible = useMemo(() => {
    let rows = works;
    if (tab === 'published') rows = rows.filter((w) => w.status === 'Published');
    else if (tab === 'on-view') rows = rows.filter((w) => w.availability === 'On View');
    else if (tab === 'in-progress') rows = rows.filter((w) => w.status === 'In Progress');
    else if (tab === 'unavailable') rows = rows.filter((w) => w.availability === 'Unavailable');
    else if (tab === 'archived') rows = rows.filter((w) => w.status === 'Archived');
    // "All Works" hides archived pieces unless the rail toggle asks for them.
    else if (!showArchived) rows = rows.filter((w) => w.status !== 'Archived');
    return rows;
  }, [tab, showArchived]);

  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleAll = () =>
    setSelected((prev) => (prev.length === visible.length ? [] : visible.map((w) => w.id)));

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
              <button type="button" className={styles.export}>
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

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <WorksFilterTabs active={tab} onChange={setTab} />

            <section className={styles.tableCard}>
              {view === 'table' ? (
                <WorksTable
                  works={visible}
                  selected={selected}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                />
              ) : (
                <WorksGrid works={visible} />
              )}

              <WorksPagination page={page} onPageChange={setPage} />
            </section>
          </div>

          <aside className={styles.rightCol}>
            <PortfolioOverviewPanel />
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
