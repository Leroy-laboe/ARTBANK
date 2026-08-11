import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { RankingsFilterSidebar } from '../components/rankings/RankingsFilterSidebar';
import { RankingsIntro } from '../components/rankings/RankingsIntro';
import { RankingsStatsBar } from '../components/rankings/RankingsStatsBar';
import { TopRankingsPanel } from '../components/rankings/TopRankingsPanel';
import { ScoreDistributionPanel } from '../components/rankings/ScoreDistributionPanel';
import { RisingStarsPanel } from '../components/rankings/RisingStarsPanel';
import { TrendingTagsPanel } from '../components/rankings/TrendingTagsPanel';
import { RankingsFeaturesBar } from '../components/rankings/RankingsFeaturesBar';
import styles from './MriRankingsPage.module.css';

export function MriRankingsPage() {
  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.layout}`}>
          <RankingsFilterSidebar />

          <div className={styles.mainCol}>
            <RankingsIntro />
            <RankingsStatsBar />

            <div className={styles.panelsRow}>
              <TopRankingsPanel />
              <ScoreDistributionPanel />
              <div className={styles.rightStack}>
                <RisingStarsPanel />
                <TrendingTagsPanel />
              </div>
            </div>
          </div>
        </div>

        <RankingsFeaturesBar />
      </main>
      <Footer />
    </>
  );
}
