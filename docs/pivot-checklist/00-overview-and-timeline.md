# 00. Overview — Artbank Pivot Checklist

> Source: `Artbank_Staff_Quick_Brief_v1.0.pdf` (internal, v1.0)
> This is the index. Work through the files below in order — each one is a self-contained checklist for one area of the site/product.

## ⚠️ Read this first — conflicts with current code

This brief is not a cosmetic pass. It is a **product pivot**: away from a public marketplace/leaderboard site and toward a private, artist-first tool built around a "JO1N ID" identity and an "ArtSpace" dashboard. Two things in the current codebase directly conflict with it:

- **The MRI Rankings page (`src/pages/MriRankingsPage.tsx`) is explicitly slated for deletion.** See [17-do-not-build-guardrails.md](17-do-not-build-guardrails.md) and [02-navigation.md](02-navigation.md) — "MRI Rankings → DELETE, remove completely" and "Public artist ranking / MRI score → DELETE". This is the page we just built together; it should not be extended further, and it needs to come out of the nav and homepage.
- **The Marketplace page is being hidden, not deleted** — "do not show until functional" (nav) and "Marketplace Access → not available yet" (membership). Leave the code in place but remove it from navigation.

Everything else in `src/pages/` (`HomePage`, `CreatorsPage` → rename concept to "Artists") gets content/copy changes rather than deletion. The big net-new build is `ArtSpace`, a private authenticated dashboard that doesn't exist in the codebase yet.

## File map

| # | File | Covers |
|---|---|---|
| 01 | [01-homepage-copy-and-order.md](01-homepage-copy-and-order.md) | Homepage headline/hero copy + final section order |
| 02 | [02-navigation.md](02-navigation.md) | Top nav items, final nav bar |
| 03 | [03-homepage-stats-and-why-artbank.md](03-homepage-stats-and-why-artbank.md) | Homepage stat numbers, artwork sections, "Why Artbank" replacement |
| 04 | [04-membership.md](04-membership.md) | Membership/pricing section |
| 05 | [05-footer-and-legal.md](05-footer-and-legal.md) | Footer links, legal pages, social, newsletter, copyright |
| 06 | [06-functions-to-build-by-21-aug.md](06-functions-to-build-by-21-aug.md) | Cross-cutting "must work by 21 Aug" checklist (14 items) |
| 07 | [07-artspace-shell-and-navigation.md](07-artspace-shell-and-navigation.md) | Rename Dashboard → ArtSpace, final 5-item nav |
| 08 | [08-today-dashboard.md](08-today-dashboard.md) | ArtSpace "Today" screen |
| 09 | [09-my-works.md](09-my-works.md) | ArtSpace "My Works" + artwork card |
| 10 | [10-add-artwork.md](10-add-artwork.md) | Add Artwork flow |
| 11 | [11-artwork-record-passport.md](11-artwork-record-passport.md) | Artwork record / "Living Creative Asset Passport" |
| 12 | [12-interest-ledger.md](12-interest-ledger.md) | Interest Ledger |
| 13 | [13-buyer-card.md](13-buyer-card.md) | Buyer Card |
| 14 | [14-opportunities.md](14-opportunities.md) | Opportunities |
| 15 | [15-messages.md](15-messages.md) | Messages |
| 16 | [16-public-profile-access.md](16-public-profile-access.md) | Public profile access |
| 17 | [17-do-not-build-guardrails.md](17-do-not-build-guardrails.md) | **Read before building anything** — explicit do-not-build list |
| 18 | [18-feature-artwork-readiness-scan.md](18-feature-artwork-readiness-scan.md) | Priority feature 1 (NOW) |
| 19 | [19-feature-smart-artwork-link-qr.md](19-feature-smart-artwork-link-qr.md) | Priority feature 2 (NOW) |
| 20 | [20-feature-buyer-intent-card.md](20-feature-buyer-intent-card.md) | Priority feature 3 (NOW) |
| 21 | [21-feature-private-viewing-room.md](21-feature-private-viewing-room.md) | Priority feature 4 (NOW) |
| 22 | [22-feature-artwork-action-plan.md](22-feature-artwork-action-plan.md) | Priority feature 5 (NOW) |
| 23 | [23-feature-professional-artwork-pack.md](23-feature-professional-artwork-pack.md) | Priority feature 6 (NOW) |
| 24 | [24-feature-basic-tier-additions.md](24-feature-basic-tier-additions.md) | Priority features 7–10 (BASIC VERSION tier) |
| 25 | [25-database-schema-plan.md](25-database-schema-plan.md) | **Not from the PDF** — translates 09–24 into an actual DB schema plan, table by table, with open questions to settle before writing migrations |

## Deadline

**21 August 2026** — "Approved working dashboard prototype." Build order across that window (marketing site first, then ArtSpace screen by screen, then the 6 priority features):

| Date | Build |
|---|---|
| 12–13 Aug | ArtSpace shell, navigation and account menu |
| 13–14 Aug | Today dashboard |
| 14–15 Aug | My Works and artwork cards |
| 15–16 Aug | Add Artwork flow |
| 16–17 Aug | Artwork record and Passport preview |
| 17–18 Aug | Interest Ledger and Buyer Card |
| 18–19 Aug | Opportunities and HGI recommendation |
| 19 Aug | Messages |
| 20 Aug | Public-profile connection and Guardian restrictions |
| 20–21 Aug | Mobile testing, error states and corrections |
| **21 Aug** | **Approved working dashboard prototype** |

Homepage/nav/membership/footer copy changes are separately due **13–14 Aug** (see each file's own due dates).

## Completion test

The prototype isn't done until every row here passes:

- [ ] **Navigation** — all five ArtSpace destinations open
- [ ] **Add Artwork** — user can complete and save a record
- [ ] **Today** — shows one clear next action
- [ ] **My Works** — artwork can be found, viewed and edited
- [ ] **Interest** — anonymous and identified viewers are separated
- [ ] **Opportunities** — every match explains why
- [ ] **Messages** — enquiry includes identity, purpose and artwork
- [ ] **Guardian** — minor cannot receive uncontrolled adult contact
- [ ] **Claims** — no fake statistics, rankings or earnings anywhere
- [ ] **Mobile** — entire journey works on a phone
- [ ] **Buttons** — no dead buttons or placeholder links
- [ ] **Demo data** — every sample is clearly labelled "Demo"

## The demo sequence to build toward

This is the exact story the prototype needs to be able to perform end-to-end:

1. Artist adds one artwork.
2. Artbank identifies four missing professional items.
3. Artist completes them.
4. Artbank generates the Smart Artwork Link, QR and Professional Pack.
5. Artist shares the link on Instagram.
6. A buyer presents their identity and requests availability.
7. Artist sees who the buyer is, what they want and which artwork interested them.
8. Artist sends a Private Viewing Room.
9. The enquiry moves into negotiation.
10. The entire activity appears in the artwork's history.

> "That is the practical 'wow': Artbank turns an Instagram artwork post into a documented creative asset, an identified buyer relationship and a professional commercial journey."

## Reference

A prototype build exists for visual/UX reference: https://artbank-artspace-prototype.jefferyyapofficial.chatgpt.site/
