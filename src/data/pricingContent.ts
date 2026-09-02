// Free/Pro pricing sourced from docs/pivot-checklist/04-membership.md (Pro:
// USD 29/year) and the free-tier copy already live in AuthSwitch ("The free
// foundation includes your JO1N ID, profile, three work records and public
// contact route. Paid tools unlock expanded records, deeper intelligence,
// professional packs and deal support."). Pro Max ($49/year) and the
// free/Pro/Pro Max tier split itself came directly from the user, not the
// pivot docs — not yet reflected there.
//
// Perks intentionally excluded per the pivot doc: "Marketplace Access" (not
// available yet), "Exclusive Events" (keep the copy in mind, don't display
// until real events exist), and "Cancel anytime" (don't promise cancellation
// before subscriptions are actually billable — full payment system is LATER
// per docs/pivot-checklist/17-do-not-build-guardrails.md).
export const pricingPlans = [
  {
    name: 'JO1N ID',
    price: '0',
    yearlyPrice: '0',
    period: 'forever',
    features: [
      'Your JO1N ID & public profile',
      'Showcase up to 3 artworks',
      'Public contact route',
      'Early access to new features',
    ],
    description: 'Start with identity. Build value as you grow.',
    buttonText: 'Continue Free',
    href: '/register',
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '29',
    yearlyPrice: '29',
    period: 'year',
    features: [
      'Unlimited artwork showcase',
      'Artwork approval & certification (up to 10 artworks)',
      'Private Professional Insights',
      'Professional Artwork Pack generation',
      'Deal & enquiry support',
    ],
    description: 'For artists and buyers who want deeper tools and professional support.',
    buttonText: 'Get Started',
    href: '/register',
    isPopular: true,
  },
  {
    name: 'Pro Max',
    price: '49',
    yearlyPrice: '49',
    period: 'year',
    features: ['Everything in Pro', 'Certificate of authenticity for every artwork'],
    description: 'For artists who want every artwork individually certified.',
    buttonText: 'Get Started',
    href: '/register',
    isPopular: false,
  },
];
