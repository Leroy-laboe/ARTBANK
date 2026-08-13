# 02. Navigation

> Source: PDF page 2 — "Navigation changes"
> Files likely touched: `src/components/layout/Header.tsx`, `src/data/homeContent.ts` (`navLinks`), `src/App.tsx`

## Top nav changes

- [ ] **KEEP** — Home → stays as **Home**
- [ ] **HIDE** — Marketplace → do not show until functional (keep the route/code, remove from nav)
- [ ] **CHANGE** — Creators → rename to **Artists** (nav label + route; consider renaming `CreatorsPage` concept accordingly, or at minimum the label/route)
- [ ] **DELETE** — MRI Rankings → **remove completely** (nav item *and* the route/page — see [17-do-not-build-guardrails.md](17-do-not-build-guardrails.md))
- [ ] **HIDE** — ARTCHIVE → repurpose into a gallery for famous deceased artists (e.g. David Hockney…); do not show in nav until that content exists
- [ ] **HIDE** — ARTICON → move its content into a future Opportunities/Events section; remove from nav for now
- [ ] **HIDE** — ARTCADEMY → external learning recommendations will live inside HGI instead; remove from nav for now
- [ ] **ADD** — No buyer-specific page currently exists → add **For Buyers**
- [ ] **CHANGE** — "Login / Sign Up" → **Open JO1N ID**

## Final nav bar

```
Home · How It Works · Artists · For Buyers · Pricing · Open JO1N ID
```

## Notes

- `src/App.tsx` currently routes `/mri-rankings` to `MriRankingsPage` — this route (and the nav link) needs to come out per this brief. Confirm with the team whether to delete the page's code outright or just unroute it; the brief's "do not build" list treats public ranking as a permanently excluded feature, not a "later" one, so full removal is the safer read.
- "How It Works" and "Pricing" are new nav destinations with no current equivalent page — need new routes.
