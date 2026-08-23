import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CreatorFilterSidebar } from '../components/creators/CreatorFilterSidebar';
import { CreatorsIntro } from '../components/creators/CreatorsIntro';
import { CreatorsToolbar } from '../components/creators/CreatorsToolbar';
import { CreatorCard } from '../components/creators/CreatorCard';
import { CreatorsPagination } from '../components/creators/CreatorsPagination';
import { TrendingStylesPanel } from '../components/creators/TrendingStylesPanel';
import { CreatorsCta } from '../components/creators/CreatorsCta';
import { creatorsListings } from '../data/creatorsListings';
import { defaultCreatorFilters, type CreatorFilters } from '../types/creator';
import styles from './CreatorsPage.module.css';

function applyFilters(filters: CreatorFilters) {
  const query = filters.search.trim().toLowerCase();

  return creatorsListings.filter((creator) => {
    if (query && !`${creator.name} ${creator.title}`.toLowerCase().includes(query)) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(creator.category)) return false;
    if (filters.country !== 'All Countries' && creator.country !== filters.country) return false;
    if (filters.style !== 'All Styles' && creator.style !== filters.style) return false;
    if (filters.stages.length > 0 && !filters.stages.includes(creator.careerStage)) return false;
    return true;
  });
}

export function CreatorsPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState<CreatorFilters>(defaultCreatorFilters);

  const filteredCreators = applyFilters(filters);

  return (
    <>
      <Header />
      <main>
        <div className={`container ${styles.layout}`}>
          <CreatorFilterSidebar
            filters={filters}
            onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))}
            onReset={() => setFilters(defaultCreatorFilters)}
          />

          <div className={styles.mainCol}>
            <CreatorsIntro />

            <CreatorsToolbar total={filteredCreators.length} view={view} onViewChange={setView} />

            <div id="creators-grid" className={view === 'grid' ? styles.grid : styles.gridList}>
              {filteredCreators.map((creator) => (
                <CreatorCard creator={creator} key={creator.id} />
              ))}
            </div>

            {filteredCreators.length === 0 && (
              <p className={styles.emptyState}>No creators match these filters yet.</p>
            )}

            {/* Only 8 mock creators exist, so results never exceed one page
                yet — CreatorsPagination always renders "1 2 3 … N" regardless
                of real page count, so showing it here would be its own fake
                control. Bring it back once there's enough data to paginate. */}
            {filteredCreators.length > 12 && <CreatorsPagination totalPages={Math.ceil(filteredCreators.length / 12)} />}
          </div>

          <aside className={styles.rightCol}>
            <TrendingStylesPanel />
          </aside>
        </div>

        <CreatorsCta />
      </main>
      <Footer />
    </>
  );
}
