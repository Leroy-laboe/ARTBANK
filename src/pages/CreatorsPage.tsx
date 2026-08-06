import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CreatorFilterSidebar } from '../components/creators/CreatorFilterSidebar';
import { CreatorsIntro } from '../components/creators/CreatorsIntro';
import { CreatorsToolbar } from '../components/creators/CreatorsToolbar';
import { CreatorCard } from '../components/creators/CreatorCard';
import { CreatorsPagination } from '../components/creators/CreatorsPagination';
import { FeaturedCreatorPanel } from '../components/creators/FeaturedCreatorPanel';
import { TopCreatorsPanel } from '../components/creators/TopCreatorsPanel';
import { TrendingStylesPanel } from '../components/creators/TrendingStylesPanel';
import { CreatorsCta } from '../components/creators/CreatorsCta';
import { creatorsListings } from '../data/creatorsListings';
import styles from './CreatorsPage.module.css';

export function CreatorsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.layout}`}>
          <CreatorFilterSidebar />

          <div className={styles.mainCol}>
            <CreatorsIntro />

            <CreatorsToolbar total={12540} view={view} onViewChange={setView} />

            <div className={view === 'grid' ? styles.grid : styles.gridList}>
              {creatorsListings.map((creator) => (
                <CreatorCard creator={creator} key={creator.id} />
              ))}
            </div>

            <CreatorsPagination totalPages={1045} />
          </div>

          <aside className={styles.rightCol}>
            <FeaturedCreatorPanel />
            <TopCreatorsPanel />
            <TrendingStylesPanel />
          </aside>
        </div>

        <CreatorsCta />
      </main>
      <Footer />
    </>
  );
}
