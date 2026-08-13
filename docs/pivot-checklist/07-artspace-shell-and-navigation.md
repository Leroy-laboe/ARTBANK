# 07. ArtSpace Shell & Navigation

> Source: PDF page 7 — "Dashboard name and navigation"
> Due: build order 12–13 Aug 2026 (first ArtSpace milestone)
> This is net-new: there is no dashboard/authenticated area in the current codebase at all.

## Changes

- [ ] **CHANGE** — Generic "Dashboard" → name it **ArtSpace**
- [ ] **DELETE** — Many separate menu items → keep only **five** primary destinations (see final nav below)
- [ ] **CHANGE** — "Home" → **Today**
- [ ] **CHANGE** — "Portfolio" → **My Works**
- [ ] **MERGE** — "Analytics" as its own menu item → place relevant statistics inside each destination instead of a standalone analytics screen
- [ ] **DELETE** — "Rankings" → no public artist ranking, anywhere (see [17-do-not-build-guardrails.md](17-do-not-build-guardrails.md))
- [ ] **DELETE FOR NOW** — "Marketplace" as a dashboard menu item → future function, not in this build
- [ ] **MERGE** — "Certificates" as its own menu item → place inside each artwork record instead
- [ ] **MERGE** — "Earnings" as a main menu item → show inside Today and inside artwork records instead
- [ ] **MOVE** — "Profile" as a main menu item → move under the account menu
- [ ] **MOVE** — "Settings" as a main menu item → move under the account menu

## Final ArtSpace navigation

```
Today · My Works · Interest · Opportunities · Messages
```

- [ ] Persistent button on every ArtSpace screen: **+ Add Artwork**
- [ ] Account menu (separate from primary nav): **Public Profile · Billing · Privacy · Security · Help · Log Out**

## Notes

- This is the foundation everything else in ArtSpace builds on top of — do this first. Every other ArtSpace file ([08](08-today-dashboard.md)–[16](16-public-profile-access.md)) assumes this shell/nav exists.
- No auth/account system exists yet (`src/services/auth.ts` is empty). Role selection (Artist/Buyer/Guardian/Partner, per [06](06-functions-to-build-by-21-aug.md)) needs to be decided before this shell can gate access correctly.
