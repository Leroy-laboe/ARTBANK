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
import styles from './ArtspacePage.module.css';

/** Today — the screen an artist lands on after signing in. Unlike the public
 *  pages this one has no Header/Footer: the ArtSpace sidebar is the shell. */
export function ArtspacePage() {
  return (
    <div className={styles.shell}>
      <ArtspaceSidebar />

      <main className={styles.body}>
        <ArtspaceTopbar />

        <div className={styles.layout}>
          <div className={styles.mainCol}>
            <NeedsDecisionPanel />

            <div className={styles.pair}>
              <RealInterestPanel />
              <ArtworksAtWorkPanel />
            </div>

            <div className={styles.pair}>
              <BestOpportunityPanel />
              <MoneyRightsPanel />
            </div>

            <ProfessionalReadinessPanel />
          </div>

          <aside className={styles.rightCol}>
            <ArtistIdentityCard />
            <ReadinessScoreCard />
            <QuickActionsPanel />
            <HelpResourcesPanel />
          </aside>
        </div>
      </main>
    </div>
  );
}
