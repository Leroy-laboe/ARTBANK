import { useEffect, useMemo, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { ArtspacePageHeader } from '../components/artspace/ArtspacePageHeader';
import { ArtspaceTabs } from '../components/artspace/ArtspaceTabs';
import { OpportunityFilters } from '../components/artspace/OpportunityFilters';
import { OpportunityList } from '../components/artspace/OpportunityList';
import { ArtspacePagination } from '../components/artspace/ArtspacePagination';
import { StatsOverviewPanel } from '../components/artspace/StatsOverviewPanel';
import { TopMatchesPanel } from '../components/artspace/TopMatchesPanel';
import { TipsPanel } from '../components/artspace/TipsPanel';
import { Icon } from '../components/ui/Icon';
import {
  opportunities,
  opportunitiesPaging,
  opportunityTabs,
  opportunityTips,
} from '../data/artspaceOpportunities';
import { useSession } from '../lib/sessionContext';
import { loadOpportunities } from '../services/opportunities';
import type { Opportunity } from '../data/artspaceOpportunities';
import styles from './OpportunitiesPage.module.css';

/** Which stages each tab collects. */
const tabStages: Record<string, string[]> = {
  invitations: ['Invited'],
  applications: ['Applied', 'Under Review'],
  shortlisted: ['Shortlisted'],
  negotiation: ['Negotiation'],
  won: ['Won'],
  completed: ['Completed'],
  'not-a-fit': ['Not a Fit'],
};

/** Opportunities — a personalised match, not a generic listing. Every entry
 *  records why it matched and what's still missing before the artist can
 *  apply, and nothing is ever submitted without them approving it.
 *  See docs/pivot-checklist/14-opportunities.md. */
export function OpportunitiesPage() {
  const { profile } = useSession();
  const [rows, setRows] = useState<Opportunity[]>(opportunities);
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;
    loadOpportunities(profile).then((result) => {
      if (active) setRows(result.opportunities);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  /** Counted from the artist's own matches, using the same stage groupings the
   *  tabs filter by — so a figure here and the tab beneath it always agree. */
  const overviewStats = useMemo(() => {
    const count = (stages: string[]) => String(rows.filter((o) => stages.includes(o.stage)).length);

    return [
      { id: 'total', value: String(rows.length), label: 'Total Opportunities' },
      { id: 'invitations', value: count(tabStages.invitations), label: 'Invitations' },
      { id: 'applications', value: count(tabStages.applications), label: 'Applications' },
      { id: 'shortlisted', value: count(tabStages.shortlisted), label: 'Shortlisted' },
      { id: 'negotiation', value: count(tabStages.negotiation), label: 'In Negotiation' },
      { id: 'won', value: count(tabStages.won), label: 'Won' },
    ];
  }, [rows]);

  const visible = useMemo(() => {
    const stages = tabStages[tab];
    return stages ? rows.filter((o) => stages.includes(o.stage)) : rows;
  }, [rows, tab]);

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar showGreeting={false} />

        <div className={styles.headRow}>
          <ArtspacePageHeader
            title="Opportunities"
            subtitle="Discover and manage opportunities for your artworks."
          />

          <button type="button" className={styles.find}>
            <Icon name="search" size={15} />
            Find Opportunities
          </button>
        </div>

        <div className={styles.tabRow}>
          <ArtspaceTabs
            tabs={opportunityTabs}
            active={tab}
            onChange={setTab}
            variant="underline"
            label="Filter opportunities by stage"
          />
        </div>

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <section className={styles.listCard}>
              <OpportunityFilters />
              <OpportunityList opportunities={visible} />
              <ArtspacePagination
                from={opportunitiesPaging.from}
                to={opportunitiesPaging.to}
                total={opportunitiesPaging.total}
                unit="opportunities"
                page={page}
                totalPages={opportunitiesPaging.totalPages}
                onPageChange={setPage}
              />
            </section>
          </div>

          <aside className={styles.rightCol}>
            {/* All-time counts, so no range picker — see InterestPage. */}
            <StatsOverviewPanel title="Opportunities Overview" stats={overviewStats} />
            <TopMatchesPanel />
            <TipsPanel
              title="Tips to Win Opportunities"
              tips={opportunityTips}
              linkTo="/artspace/help"
              linkLabel="View all tips"
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
