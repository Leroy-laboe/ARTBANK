import { useState } from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { FilterSidebar } from '../components/marketplace/FilterSidebar';
import { MarketplaceIntro } from '../components/marketplace/MarketplaceIntro';
import { FeaturedBanner } from '../components/marketplace/FeaturedBanner';
import { MarketplaceToolbar } from '../components/marketplace/MarketplaceToolbar';
import { ListingCard } from '../components/marketplace/ListingCard';
import { TrendingPanel } from '../components/marketplace/TrendingPanel';
import { SellCtaPanel } from '../components/marketplace/SellCtaPanel';
import { CuratedPanel } from '../components/marketplace/CuratedPanel';
import { HelpPanel } from '../components/marketplace/HelpPanel';
import { TrustBar } from '../components/marketplace/TrustBar';
import { marketplaceListings } from '../data/marketplaceListings';
import styles from './MarketplacePage.module.css';

export function MarketplacePage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <>
      <Header />
      <main>
        <div className={styles.layout}>
          <FilterSidebar />

          <div className={styles.mainCol}>
            <div className={styles.introRow}>
              <MarketplaceIntro />
              <FeaturedBanner />
            </div>

            <MarketplaceToolbar view={view} onViewChange={setView} />

            <div className={view === 'grid' ? styles.grid : styles.gridList}>
              {marketplaceListings.map((listing) => (
                <ListingCard listing={listing} key={listing.id} />
              ))}
            </div>
          </div>

          <aside className={styles.rightCol}>
            <TrendingPanel />
            <SellCtaPanel />
            <CuratedPanel />
            <HelpPanel />
          </aside>
        </div>

        <TrustBar />
      </main>
      <Footer />
    </>
  );
}
