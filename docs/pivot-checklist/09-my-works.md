# 09. My Works

> Source: PDF page 9 — "2. My Works", "Artwork card"
> Due: build order 14–15 Aug 2026
> Depends on: [07-artspace-shell-and-navigation.md](07-artspace-shell-and-navigation.md)

## Changes

- [ ] **IMPROVE** — Simple image gallery → a professional artwork-management system (not just a grid of images)
- [ ] **DELETE** — Likes shown on cards → show meaningful interest instead (see [12-interest-ledger.md](12-interest-ledger.md))
- [ ] **DELETE** — Public popularity signals → show private artwork activity only
- [ ] **CHANGE** — "Buy Now" → **Contact Artist** or **Request Availability**
- [ ] **ADD** — Artwork condition field (didn't exist before) → **Draft · Published · Private · Archived**
- [ ] **ADD** — Availability field (didn't exist before) → **Available · Reserved · Sold · Licensing Available**
- [ ] **ADD** — Documentation status (didn't exist before) → Passport and COA status

## Artwork card — required fields

Every artwork card must show:

| Field | Example |
|---|---|
| Image | Artwork image |
| Title | Silent Harmony |
| Year | 2026 |
| Status | Published |
| Availability | Available |
| Passport | 80% complete |
| COA | Not requested |
| Interest | 3 identified viewers |
| Opportunity | 1 potential match |
| Earnings | USD 0 recorded |

- [ ] Card buttons: **View · Edit · Share · More**

## Notes

- This replaces the codebase's existing `ArtworkCard`/`ListingCard`/`CreatorCard` pattern conceptually — it's a private management card, not a public marketplace card, so it should likely be a new component rather than a reskin of the public ones.
- "Passport" and "COA" statuses tie into [11-artwork-record-passport.md](11-artwork-record-passport.md) and [18-feature-artwork-readiness-scan.md](18-feature-artwork-readiness-scan.md).
