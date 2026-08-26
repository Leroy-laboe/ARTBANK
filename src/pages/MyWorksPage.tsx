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
import {
  activeTabId,
  applyTab,
  defaultFilters,
  tabCount,
  worksTabDefs,
  type WorksFilters,
} from '../components/artspace/worksFilters';
import { Icon } from '../components/ui/Icon';
import { useSession } from '../lib/sessionContext';
import {
  deleteArtwork,
  listMyWorks,
  setArtworkAvailability,
  setArtworkStatus,
  setArtworkVisibility,
} from '../services/artwork';
import { exportWorksCsv } from '../lib/exportCsv';
import type { WorkAction } from '../components/artspace/workActions';
import type { Work } from '../data/artspaceWorks';
import { portfolioOverview, works as demoWorks, worksQuickActions } from '../data/artspaceWorks';
import styles from './MyWorksPage.module.css';

/** My Works — the artwork management screen, not an image gallery. Every row
 *  carries status, availability, documentation, interest and recorded
 *  earnings (docs/pivot-checklist/09-my-works.md). */
const PER_PAGE = 7;

/** Says why a write failed, rather than assuming a cause.
 *
 *  This used to report every failure as "no database yet", which stopped being
 *  true once the migrations ran — and a real permission or constraint error
 *  reported as a missing database sends you looking in the wrong place. */
function describeError(err: unknown, fallback: string): string {
  const raw = err as { message?: string; code?: string } | null;
  const message = raw?.message ?? '';

  if (/no database is configured/i.test(message)) {
    return `${fallback} Nothing is saved — this build has no database connected.`;
  }
  if (raw?.code === '42501' || /row-level security/i.test(message)) {
    return `${fallback} The database refused the change for this account.`;
  }
  if (message) return `${fallback} ${message}`;
  return fallback;
}

export function MyWorksPage() {
  const navigate = useNavigate();
  const { profile } = useSession();
  const [notice, setNotice] = useState<string | null>(null);
  const [allRows, setAllRows] = useState<Work[]>(demoWorks);
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [selected, setSelected] = useState<string[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [filters, setFilters] = useState<WorksFilters>(defaultFilters);
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

    // 1. The filters. The tabs write into these too, so there is only one set
    //    of rules to apply — see worksFilters.ts. Each group's first option
    //    means "no filter".
    if (filters.status !== defaultFilters.status) {
      rows = rows.filter((w) => w.status === filters.status);
    }
    if (filters.availability !== defaultFilters.availability) {
      rows = rows.filter((w) => w.availability === filters.availability);
    }
    if (filters.passport !== defaultFilters.passport) {
      rows = rows.filter((w) => w.passport === filters.passport);
    }

    // 2. Archived works stay out of an unfiltered list unless asked for.
    //    Filtering to Archived explicitly always wins over the toggle.
    if (filters.status === defaultFilters.status && !showArchived) {
      rows = rows.filter((w) => w.status !== 'Archived');
    }

    // 3. The sort. Copied first — sort mutates, and `rows` can still be
    //    `allRows` itself when nothing above filtered.
    const sorted = [...rows];
    switch (filters.sort) {
      case 'Title A–Z':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Year':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'Most Interest':
        sorted.sort((a, b) => b.interestCount - a.interestCount);
        break;
      case 'Earnings':
        // Nothing recorded sorts last rather than as zero — the two aren't the
        // same claim anywhere else in the app either.
        sorted.sort((a, b) => (b.earnings ?? -1) - (a.earnings ?? -1));
        break;
      default:
        sorted.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
    }

    return sorted;
  }, [allRows, showArchived, filters]);

  /** The tab the current filters correspond to — '' when the combination is
   *  one no tab describes, e.g. Status: Sold. */
  const tab = activeTabId(filters);

  /** The tab strip, with counts computed from the rows actually loaded. */
  const tabs = useMemo(
    () =>
      worksTabDefs.map((def) => ({
        id: def.id,
        label: def.label,
        count: def.id === 'all' ? undefined : tabCount(allRows, def),
      })),
    [allRows],
  );

  /** The filters currently narrowing the list, named for the empty state. */
  const activeFilters = useMemo(() => {
    const active: string[] = [];
    if (filters.status !== defaultFilters.status) active.push(`status ${filters.status}`);
    if (filters.availability !== defaultFilters.availability) {
      active.push(`availability ${filters.availability}`);
    }
    if (filters.passport !== defaultFilters.passport) active.push(`passport ${filters.passport}`);
    return active.length > 0 ? active : ['the current view'];
  }, [filters]);

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

  /** One place where every artwork action lands, wherever it was triggered.
   *
   *  Each write updates the row first and persists after, so the table responds
   *  to a menu click immediately. A failed write says so rather than silently
   *  leaving the screen showing something the database doesn't agree with. */
  const handleAction = useCallback(
    async (work: Work, action: WorkAction) => {
      // Availability and visibility carry a value, so they're handled before
      // the switch over the constant actions.
      if (typeof action === 'object') {
        if (action.kind === 'availability') {
          setAllRows((rows) =>
            rows.map((w) => (w.id === work.id ? { ...w, availability: action.value } : w)),
          );
          try {
            await setArtworkAvailability(work.id, action.value);
            say(
              action.value === 'Sold'
                ? `“${work.title}” is marked sold. Recorded earnings only change when a transaction is recorded.`
                : `“${work.title}” is now ${action.value.toLowerCase()}.`,
            );
          } catch (err) {
            say(describeError(err, `Could not update “${work.title}”.`));
          }
          return;
        }

        setAllRows((rows) =>
          rows.map((w) => (w.id === work.id ? { ...w, visibility: action.value } : w)),
        );
        try {
          await setArtworkVisibility(work.id, action.value);
          say(`“${work.title}” is now ${action.value}.`);
        } catch (err) {
          say(describeError(err, `Could not update “${work.title}”.`));
        }
        return;
      }

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
        case 'delete': {
          if (
            !window.confirm(
              `Delete “${work.title}” permanently? Its images and documents go with it. This cannot be undone — Archive keeps the record instead.`,
            )
          ) {
            return;
          }
          const previous = allRows;
          setAllRows((rows) => rows.filter((w) => w.id !== work.id));
          setSelected((prev) => prev.filter((id) => id !== work.id));
          try {
            await deleteArtwork(work.id);
            say(`“${work.title}” was deleted.`);
          } catch (err) {
            // Put it back: a delete that didn't happen must not look like it did.
            setAllRows(previous);
            say(describeError(err, `Could not delete “${work.title}”.`));
          }
          return;
        }
        case 'publish':
        case 'unpublish':
        case 'archive':
        case 'restore': {
          const next =
            action === 'publish'
              ? 'Published'
              : action === 'archive'
                ? 'Archived'
                : 'Draft';
          // Update immediately so the table responds, then persist.
          setAllRows((rows) =>
            rows.map((w) => (w.id === work.id ? { ...w, status: next as Work['status'] } : w)),
          );
          try {
            await setArtworkStatus(work.id, next.toLowerCase() as 'draft' | 'published' | 'archived');
            say(
              action === 'restore'
                ? `“${work.title}” was restored as a draft.`
                : `“${work.title}” is now ${next.toLowerCase()}.`,
            );
          } catch (err) {
            say(describeError(err, `Could not update “${work.title}”.`));
          }
        }
      }
    },
    [allRows, navigate, say],
  );

  const selectedWorks = useMemo(
    () => allRows.filter((w) => selected.includes(w.id)),
    [allRows, selected],
  );

  /** Applies one change to every selected artwork.
   *
   *  Writes run in parallel and are counted rather than announced one by one —
   *  ten toasts for one click is noise. A partial failure is reported as a
   *  partial failure, so the count on screen is always the count that saved. */
  const applyToSelected = useCallback(
    async (
      label: string,
      patch: (work: Work) => Partial<Work>,
      persist: (work: Work) => Promise<void>,
    ) => {
      const targets = selectedWorks;
      if (targets.length === 0) return;

      const ids = new Set(targets.map((w) => w.id));
      setAllRows((rows) => rows.map((w) => (ids.has(w.id) ? { ...w, ...patch(w) } : w)));

      const results = await Promise.allSettled(targets.map(persist));
      const failed = results.filter((r) => r.status === 'rejected').length;
      const saved = targets.length - failed;

      setSelected([]);
      say(
        failed === 0
          ? `${saved} artwork${saved === 1 ? '' : 's'} ${label}.`
          : `${saved} of ${targets.length} ${label}. ${failed} could not be saved — reload to see what stuck.`,
      );
    },
    [selectedWorks, say],
  );

  const bulkAvailability = (value: Work['availability']) =>
    applyToSelected(
      `marked ${value.toLowerCase()}`,
      () => ({ availability: value }),
      (work) => setArtworkAvailability(work.id, value),
    );

  const bulkStatus = (value: 'Published' | 'Archived') =>
    applyToSelected(
      value === 'Published' ? 'published' : 'archived',
      () => ({ status: value }),
      (work) => setArtworkStatus(work.id, value.toLowerCase() as 'published' | 'archived'),
    );

  /** "Export Portfolio (PDF)" prints the portfolio. The browser's print
   *  dialog offers Save as PDF on every platform, so this needs no PDF
   *  library — and a print stylesheet strips the app chrome so the output is
   *  a portfolio document rather than a screenshot of a dashboard. */
  const handlePrintPortfolio = () => {
    setView('grid');
    say('Opening your print dialog — choose "Save as PDF" as the destination.');
    // Let the grid render before the print dialog captures the page.
    setTimeout(() => window.print(), 250);
  };

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
              tabs={tabs}
              active={tab}
              onChange={(id) => {
                setFilters((prev) => applyTab(prev, id));
                setPage(1);
              }}
              label="Filter artworks by status"
            />

            {selected.length > 0 && (
              <div className={styles.bulkBar} role="region" aria-label="Selected artworks">
                <p className={styles.bulkCount}>
                  <strong>{selected.length}</strong> selected
                </p>

                <div className={styles.bulkActions}>
                  <button type="button" onClick={() => bulkAvailability('Sold')}>
                    Mark Sold
                  </button>
                  <button type="button" onClick={() => bulkAvailability('Available')}>
                    Mark Available
                  </button>
                  <button type="button" onClick={() => bulkStatus('Published')}>
                    Publish
                  </button>
                  <button type="button" onClick={() => bulkStatus('Archived')}>
                    Archive
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      exportWorksCsv(selectedWorks, 'artbank-selected-works.csv');
                      say(`Exported ${selectedWorks.length} selected artworks as CSV.`);
                    }}
                  >
                    Export
                  </button>
                  <button
                    type="button"
                    className={styles.bulkClear}
                    onClick={() => setSelected([])}
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            <section className={styles.tableCard}>
              {visible.length === 0 ? (
                /* Without this the table renders an empty body and reads as
                   data loss. Name the filters actually in force, so the cause
                   is on screen next to the effect. */
                <div className={styles.emptyState}>
                  <Icon name="filter" size={22} className={styles.emptyIcon} />
                  <p className={styles.emptyTitle}>
                    {allRows.length === 0
                      ? 'No artworks yet'
                      : 'No artworks match these filters'}
                  </p>
                  <p className={styles.emptyBody}>
                    {allRows.length === 0
                      ? 'Add your first artwork and it will appear here.'
                      : `You have ${allRows.length} artwork${allRows.length === 1 ? '' : 's'}, but ${activeFilters.join(' + ')} matches none of them.`}
                  </p>
                  {allRows.length > 0 && (
                    <button
                      type="button"
                      className={styles.emptyBtn}
                      onClick={() => {
                        setFilters(defaultFilters);
                        setShowArchived(false);
                        setPage(1);
                      }}
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              ) : view === 'table' ? (
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
            <QuickActionsPanel
              actions={worksQuickActions}
              handlers={{ 'export-portfolio': handlePrintPortfolio }}
            />
            <WorksFiltersPanel
              filters={filters}
              onFiltersChange={(next) => {
                setFilters(next);
                // A narrower result set can leave you past the last page.
                setPage(1);
              }}
              showArchived={showArchived}
              onShowArchivedChange={setShowArchived}
              onClear={() => {
                setFilters(defaultFilters);
                setShowArchived(false);
                setSelected([]);
                setPage(1);
              }}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
