import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Hero } from '../components/home/Hero';
import { StatsBar } from '../components/home/StatsBar';
import { CuratedCollections } from '../components/home/CuratedCollections';
import { SpotlightSection } from '../components/home/SpotlightSection';
import { WhyArtbank } from '../components/home/WhyArtbank';
import { MembershipCta } from '../components/home/MembershipCta';
import { Testimonials } from '../components/home/Testimonials';

export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <CuratedCollections />
        <SpotlightSection />
        <WhyArtbank />
        <MembershipCta />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
