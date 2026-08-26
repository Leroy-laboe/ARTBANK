import { useEffect, useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { CreatorFilterSidebar } from '../components/creators/CreatorFilterSidebar';
import { CreatorsIntro } from '../components/creators/CreatorsIntro';
import { CreatorsToolbar } from '../components/creators/CreatorsToolbar';
import { CreatorCard } from '../components/creators/CreatorCard';
import { RealArtistCard } from '../components/creators/RealArtistCard';
import { CreatorsPagination } from '../components/creators/CreatorsPagination';
import { TrendingStylesPanel } from '../components/creators/TrendingStylesPanel';
import { CreatorsCta } from '../components/creators/CreatorsCta';
import { creatorsListings } from '../data/creatorsListings';
import { listPublicArtists, type PublicArtistSummary } from '../services/publicProfile';
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
  const [realArtists, setRealArtists] = useState<PublicArtistSummary[]>([]);

  // Real accounts that made their ArtSpace profile public. Separate from the
  // filtered/paginated mock grid below: there are too few of these yet for
  // that machinery to mean anything, and their fields (mediums, free-text
  // location) don't map onto the mock filters (category, career stage, style).
  useEffect(() => {
    let active = true;
    listPublicArtists().then((rows) => {
      if (active) setRealArtists(rows);
    });
    return () => {
      active = false;
    };
  }, []);

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

            {realArtists.length > 0 && (
              <section className={styles.realSection}>
                <h2 className={styles.realHeading}>Artists on ArtBank</h2>
                <p className={styles.realNote}>Real accounts — click through to their public profile and work.</p>
                <div className={styles.grid}>
                  {realArtists.map((artist) => (
                    <RealArtistCard artist={artist} key={artist.handle} />
                  ))}
                </div>
              </section>
            )}

            {realArtists.length > 0 && <h2 className={styles.discoverHeading}>Discover Creators</h2>}

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
