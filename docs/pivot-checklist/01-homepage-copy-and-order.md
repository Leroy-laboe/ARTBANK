# 01. Homepage Copy & Section Order

> Source: PDF pages 1, 6 — "Homepage changes", "Final homepage order"
> Due: 13–14 Aug 2026
> Files likely touched: `src/pages/HomePage.tsx`, `src/data/homeContent.ts`, `src/components/home/*`

## Copy changes

- [x] **CHANGE** — "The Global Creator Bank of Creative Value" → **"Make Every Artwork Easier to Prove, Present and Earn From"** *(due 13 Aug)*
- [x] **CHANGE** — "Verified. Ranked. Remembered." → **"Documented. Discoverable. Opportunity-Ready."** *(due 13 Aug)*
- [x] **CHANGE** — Collector/marketplace-focused description → **"Artbank helps artists document their work, build a trusted professional identity, discover opportunities and turn serious interest into earnings."** *(due 13 Aug)*
- [x] **CHANGE** — "Explore Marketplace" (button label) → **"See How Artbank Works"** *(due 13 Aug)*
- [ ] **BUILD** — Both hero buttons currently do nothing → wire them to real, working pages *(due 14 Aug)*

## Hero credibility/trust elements

> These are items 7–13 of the original "Homepage changes" table (page 1). They were missed in the first draft of this checklist — added retroactively once we hit them in `Hero.tsx`.

- [x] **DELETE** — Sotheby's, Christie's, MoMA, The Met, Louvre and British Council logos → removed (no written partnership permission on file) *(due 13 Aug)*
- [x] **DELETE** — "Trusted by leading institutions worldwide" label → removed completely *(due 13 Aug)*
- [x] **DELETE** — "500K+ collectors and creators worldwide" pill → removed until supported by real data *(due 13 Aug)*
- [ ] **DELETE** — Auction countdown and "RM 8,500" bid (hero badge card) → replace with a sample Artwork Record clearly labelled "Demonstration" *(due 14 Aug)*
- [ ] **DELETE** — "VERIS VERIFIED" badge (hero badge card) → use **Creator Attested** or **Document Reviewed** only once that process actually exists *(due 14 Aug)*
- [ ] **DELETE** — MRI score "96.8" and "Top 1% Creator" (hero badge card) → replace with private **Professional Readiness** inside ArtSpace, not shown publicly *(due 14 Aug)*
- [ ] **CHANGE** — RM currency throughout → use **USD** once pricing is approved *(due 14 Aug)*

## Final homepage section order

Rebuild the homepage as this exact sequence top to bottom:

1. [ ] Artist-first headline (hero, using the copy above)
2. [ ] Open JO1N ID (primary CTA)
3. [ ] How Artbank Works
4. [ ] JO1N ID (identity explainer — see [03](03-homepage-stats-and-why-artbank.md) "Why Artbank" replacement)
5. [ ] Asset Passport and COA
6. [ ] Interest Ledger
7. [ ] Opportunities
8. [ ] Dealroom and Earnings
9. [ ] Real pilot artist (replaces the fake "Creator Spotlight" — see [03](03-homepage-stats-and-why-artbank.md))
10. [ ] Membership (see [04-membership.md](04-membership.md))
11. [ ] Final Open JO1N ID button
12. [ ] Legal footer (see [05-footer-and-legal.md](05-footer-and-legal.md))

## Notes

- "Open JO1N ID" appears twice by design (early CTA + closing CTA) — this is intentional per the doc, not a duplicate to remove.
- The current homepage's stat bar, "Why Artbank" grid, and Creator Spotlight all need content changes covered separately in [03-homepage-stats-and-why-artbank.md](03-homepage-stats-and-why-artbank.md) — this file only covers the headline/hero copy and overall section order.
- [x] Removed the "Watch introduction" play-button overlay from the hero photo. This isn't in the original brief table — requested directly during implementation — but it's the same kind of unverified/decorative claim (there's no real intro video) that the rest of this file is stripping out, so it's logged here rather than left untracked.
- [x] Hero secondary button: "Become a Creator" → **"Become an Artist"**. Not its own line in the original brief table, but a direct instance of the Creators → Artists rename in [02-navigation.md](02-navigation.md) — flagging that other "Creator" wording elsewhere on the site (copy, other buttons, `CreatorsPage`/`CreatorCard` naming) likely needs the same pass.
