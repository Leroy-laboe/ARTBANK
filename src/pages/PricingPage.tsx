import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Pricing } from '../components/blocks/pricing';
import { pricingPlans } from '../data/pricingContent';

export function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <Pricing
          plans={pricingPlans}
          title="Membership Plans"
          description="Start free with your JO1N ID, or unlock deeper tools with ARTBANK Membership."
          showBillingToggle={false}
        />
      </main>
      <Footer />
    </>
  );
}
