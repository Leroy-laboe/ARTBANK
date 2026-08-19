import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { ValuePillars } from '../components/home/ValuePillars';
import { DisciplineBrowser } from '../components/home/DisciplineBrowser';
import { FeaturedArtistBand } from '../components/home/FeaturedArtistBand';
import { ArtspaceOverview } from '../components/home/ArtspaceOverview';
import { BuyerSourcing } from '../components/home/BuyerSourcing';
import { MarketIntelligence } from '../components/home/MarketIntelligence';
import { DailyBrief } from '../components/home/DailyBrief';
import { JenaisisBand } from '../components/home/JenaisisBand';
import { JoinStandard } from '../components/home/JoinStandard';

/* The pre-pivot sections (CuratedCollections, SpotlightSection, WhyArtbank,
   MembershipCta, Testimonials) are intentionally left in the codebase but no
   longer composed here — kept in case any of them are wanted back. */

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ValuePillars />
        <DisciplineBrowser />
        <FeaturedArtistBand />
        <ArtspaceOverview />
        <BuyerSourcing />
        <MarketIntelligence />
        <DailyBrief />
        <JenaisisBand />
        <JoinStandard />
      </main>
      <Footer />
    </>
  );
}
