import { useEffect, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { NeedsDecisionPanel } from '../components/artspace/NeedsDecisionPanel';
import { RealInterestPanel } from '../components/artspace/RealInterestPanel';
import { ArtworksAtWorkPanel } from '../components/artspace/ArtworksAtWorkPanel';
import { BestOpportunityPanel } from '../components/artspace/BestOpportunityPanel';
import { MoneyRightsPanel } from '../components/artspace/MoneyRightsPanel';
import { ProfessionalReadinessPanel } from '../components/artspace/ProfessionalReadinessPanel';
import { ArtistIdentityCard } from '../components/artspace/ArtistIdentityCard';
import { ReadinessScoreCard } from '../components/artspace/ReadinessScoreCard';
import { QuickActionsPanel } from '../components/artspace/QuickActionsPanel';
import { HelpResourcesPanel } from '../components/artspace/HelpResourcesPanel';
import { quickActions } from '../data/artspaceContent';
import { useSession } from '../lib/sessionContext';
import { loadDashboard, type DashboardResult } from '../services/dashboard';
import styles from './ArtspacePage.module.css';

/** Today — the screen an artist lands on after signing in. Unlike the public
 *  pages this one has no Header/Footer: the ArtSpace sidebar is the shell.
 *
 *  Every figure comes from loadDashboard, which counts rather than estimates.
 *  Where it could not read the data it says so in the banner below rather than
 *  passing sample figures off as the artist's own. */
export function ArtspacePage() {
  const { profile } = useSession();
  const [data, setData] = useState<DashboardResult | null>(null);

  useEffect(() => {
    let active = true;
    loadDashboard(profile).then((result) => {
      if (active) setData(result);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar />

        {data?.isDemo && (
          <p className={styles.demoNotice} role="status">
            Showing sample figures — these are not your records yet.
          </p>
        )}

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            {/* Nothing renders until the read resolves. The panels each fall
                back to sample content when handed nothing, which is right for
                a fresh clone but wrong here: a signed-in artist should never
                see a stranger's earnings flash up as their own. */}
            {data && (
              <>
                <NeedsDecisionPanel items={data.needsDecision} />

                <div className={styles.pair}>
                  <RealInterestPanel items={data.realInterest} />
                  <ArtworksAtWorkPanel works={data.artworksAtWork} />
                </div>

                <div className={styles.pair}>
                  <BestOpportunityPanel opportunity={data.bestOpportunity} />
                  <MoneyRightsPanel money={data.money} />
                </div>

                <ProfessionalReadinessPanel readiness={data.readiness} />
              </>
            )}
          </div>

          <aside className={styles.rightCol}>
            <ArtistIdentityCard />
            {data && <ReadinessScoreCard readiness={data.readiness} />}
            <QuickActionsPanel actions={quickActions} />
            <HelpResourcesPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
