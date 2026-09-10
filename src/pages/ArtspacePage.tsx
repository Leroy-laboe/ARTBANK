import { useEffect, useState } from 'react';
import { ArtspaceSidebar } from '../components/artspace/ArtspaceSidebar';
import { ArtspaceTopbar } from '../components/artspace/ArtspaceTopbar';
import { NeedsDecisionPanel } from '../components/artspace/NeedsDecisionPanel';
import { ArtworkActionPlanPanel } from '../components/artspace/ArtworkActionPlanPanel';
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
import { Icon } from '../components/ui/Icon';
import { loadDashboardState, type DashboardState } from '../services/dashboard';
import styles from './ArtspacePage.module.css';

/** Today — the screen an artist lands on after signing in. Unlike the public
 *  pages this one has no Header/Footer: the ArtSpace sidebar is the shell.
 *
 *  Every figure comes from loadDashboardState, which counts rather than
 *  estimates. Three outcomes, kept distinct: sample content only when there is
 *  no session or no backend, real zeros for an artist who genuinely has
 *  nothing, and an error with a retry when a read failed — never invented
 *  figures dressed up as the artist's own. */
export function ArtspacePage() {
  const { profile } = useSession();
  const [state, setState] = useState<DashboardState | null>(null);
  /** Bumped by the retry button to re-run the effect. */
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState(null);
    loadDashboardState(profile).then((result) => {
      if (active) setState(result);
    });
    return () => {
      active = false;
    };
  }, [profile, attempt]);

  const data = state && state.status !== 'error' ? state.data : null;

  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar />

        {state?.status === 'demo' && (
          <p className={styles.demoNotice} role="status">
            Showing sample figures — these are not your records yet.
          </p>
        )}

        {/* A read that failed gets an error and a way to try again. It must
            never fall through to the sample figures below: inventing an
            artist's earnings is worse than showing them nothing. */}
        {state?.status === 'error' && (
          <div className={styles.loadError} role="alert">
            <Icon name="x-circle" size={16} />
            <div>
              <p className={styles.loadErrorTitle}>We couldn’t load your dashboard</p>
              <p className={styles.loadErrorNote}>
                Your records are safe — this was a problem reading them, not a change to them.
              </p>
            </div>
            <button type="button" className={styles.retry} onClick={() => setAttempt((n) => n + 1)}>
              Try again
            </button>
          </div>
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
                <ArtworkActionPlanPanel items={data.actionPlan} />

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
