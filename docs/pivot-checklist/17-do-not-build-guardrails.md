# 17. What Must NOT Be Built Now

> Source: PDF page 15 — "10. What must not be built now"
> **Read this before starting any ArtSpace or homepage work.** This is a guardrail file, not a build checklist — its purpose is to stop scope creep and stop features from silently reappearing.

## Delete from the current site (they exist today and must come out)

- [ ] **DELETE** — Public artist ranking (any leaderboard-style ranking, anywhere)
- [ ] **DELETE** — MRI score (the numeric score itself, and any UI built around it) — this includes **`src/pages/MriRankingsPage.tsx`** and its route/nav entry, built earlier in this project. See [02-navigation.md](02-navigation.md).
- [ ] **DELETE** — Likes and popularity leaderboard (likes counts on cards, "most liked" style sorting/surfacing)

## Do not build (net-new features that must not be started)

- [ ] **DO NOT BUILD** — Social feed and public comments
- [ ] **DO NOT BUILD** — Automatic artwork valuation (no algorithm that prices artwork)
- [ ] **DO NOT BUILD** — Auction and bidding
- [ ] **DO NOT BUILD** — Cryptocurrency or tokenization
- [ ] **DO NOT BUILD** — Investment or interest returns (nothing framing art as a financial investment vehicle)
- [ ] **DO NOT BUILD** — Automatic contracts or applications (every submission/application requires human — artist or guardian — approval; see [14-opportunities.md](14-opportunities.md))
- [ ] **DO NOT BUILD** — Extensive charts (data visualization should stay to short actionable cards — see [08-today-dashboard.md](08-today-dashboard.md))
- [ ] **DO NOT BUILD** — Course marketplace

## Later — not now, but not banned

These are acknowledged future work, explicitly out of scope for the 21 Aug build:

- [ ] **LATER** — International organization dashboard
- [ ] **LATER** — Full payment system
- [ ] **LATER** — Executive dashboard

## Why this file matters

Almost every "DO NOT BUILD" item here maps to something the *previous* version of this product either had or was heading toward (MRI Rankings, marketplace/auction flow, likes-driven cards). If a future task or stray instruction asks to extend any of those, check this file first and flag the conflict rather than building it.
