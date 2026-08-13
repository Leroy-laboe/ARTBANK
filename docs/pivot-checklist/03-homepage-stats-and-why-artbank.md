# 03. Homepage Stats, Artwork Sections & "Why Artbank"

> Source: PDF pages 2–3 — "Homepage statistics and artwork sections", "Replace the 'Why Artbank' section"
> Due: 13–14 Aug 2026
> Files likely touched: `src/components/home/StatsBar.tsx`, `src/components/home/WhyArtbank.tsx`, `src/components/home/CuratedCollections.tsx`, `src/components/creator/CreatorSpotlight.tsx`, `src/data/homeContent.ts`

## Statistics and artwork sections

- [x] **DELETE** — "1M+ verified creators" → show no number until it's real and verified
- [x] **DELETE** — "250K+ artworks" → show no number until it's real and verified
- [x] **DELETE** — "150+ countries" → show no number until it's real and verified
- [x] **DELETE** — "500K+ collectors" → show no number until it's real and verified
- [x] **DELETE** — "RM2.4B artwork value" → remove completely
- [ ] **DELETE** — "1,248–2,045 artworks per collection" → remove invented collection totals
- [ ] **CHANGE** — Famous artwork images presented as "collections" → use only properly licensed or artist-authorized work

## Creator Spotlight

- [ ] **DELETE** — "Creator Spotlight" using a stock portrait → use a consenting real pilot artist, or explicitly label the section **"Demo Profile"**
- [ ] **DELETE** — "92.4 MRI score" → no public artist score of any kind
- [ ] **DELETE** — "24.8K followers" → no public follower competition
- [ ] **DELETE** — "87 artworks" → use the artist's real artwork count only
- [ ] **DELETE** — Likes shown on artwork cards → replace with private interest information (not shown publicly)
- [ ] **CHANGE** — "Buy Now" → **Contact Artist** or **Request Availability**

## Replace the "Why Artbank" section entirely

| Before | After |
|---|---|
| VERI5 Verification | **JO1N ID** — Your lasting professional identity |
| MRI Rankings | **Professional Readiness** — Private guidance, never artistic ranking |
| ARTCHIVE | **Asset Passport** — Evidence, rights and artwork history |
| ARTCADE Marketplace | **Interest Ledger** — See consented serious viewers and enquiries |
| ARTICON | **Opportunities** — Exhibitions, commissions, licences and collaborations |
| ARTCADEMY | **HGI Guidance** — Career actions, JO1NID report and relevant learning links |

- [ ] Swap all six "Why Artbank" pillars per the table above (new labels + new descriptions, not just relabeling — the concepts themselves change)

## Notes

- "MRI Rankings" is deleted here as a *homepage pillar*, on top of being deleted from nav ([02](02-navigation.md)) and the do-not-build list ([17](17-do-not-build-guardrails.md)) — every trace of it needs to go.
- "Professional Readiness" is a private, artist-only concept (lives inside ArtSpace — see [08-today-dashboard.md](08-today-dashboard.md)) — the homepage pillar should describe it, not expose actual scores/data publicly.
- [x] The stats bar (all five numbers above) was removed as a whole section rather than kept empty/zeroed — `StatsBar.tsx`/`.module.css` deleted, usage removed from `HomePage.tsx`. `heroStats` is left (unused) in `src/data/homeContent.ts` in case a verified-numbers version of this section comes back later.
