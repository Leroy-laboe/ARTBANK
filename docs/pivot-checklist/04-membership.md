# 04. Membership Section

> Source: PDF page 4 — "Membership section"
> Files likely touched: `src/pages/HomePage.tsx` (membership section), `src/components/home/MembershipCta.tsx`, `src/data/homeContent.ts` (`membershipPerks`)

## Changes

- [ ] **CHANGE** — "Join ARTBANK Membership" → **"Start with Your JO1N ID"**
- [ ] **CHANGE** — "RM99/year" → **"USD 29/year"**
- [ ] **DELETE** — "Marketplace Access" perk → not available yet, remove from the perk list
- [ ] **DELETE** — "MRI Analytics" perk → replace with **"Private Professional Insights"**
- [ ] **CHANGE** — "Courses & Workshops" perk → **"HGI Learning Recommendations"**
- [ ] **KEEP LATER** — "Exclusive Events" perk → keep in code, but only display once real events exist
- [ ] **BUILD** — "Get Started Now" currently does nothing → connect to JO1N ID registration flow
- [ ] **BUILD** — "Cancel anytime" copy → only add once subscriptions and cancellation actually work (don't ship the promise before the mechanism)

## Notes

- Currency changes from RM to USD here match the homepage-wide currency change in [01](01-homepage-copy-and-order.md)/[03](03-homepage-stats-and-why-artbank.md) territory (item #13 in the original brief's homepage table: "Use USD after prices are approved" — get pricing sign-off before shipping the number).
