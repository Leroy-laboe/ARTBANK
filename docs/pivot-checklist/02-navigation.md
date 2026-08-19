# 02. Navigation

> Source: PDF page 2 — "Navigation changes"
> Files likely touched: `src/components/layout/Header.tsx`, `src/data/homeContent.ts` (`navLinks`), `src/App.tsx`

## Top nav changes

- [x] **KEEP** — Home → stays as **Home**
- [x] **HIDE** — Marketplace → do not show until functional (keep the route/code, remove from nav)
- [x] **CHANGE** — Creators → rename to **Artists** (nav label + route; consider renaming `CreatorsPage` concept accordingly, or at minimum the label/route) — nav label, `/artists` route and the page `<h1>` are done; the page's *internal* copy and filenames (`CreatorsPage.tsx`, `CreatorCard.tsx`, `creatorsListings.ts`, "Verified Creators" badge, search placeholder) still say "creators"
- [x] **DELETE** — MRI Rankings → **remove completely** (nav item *and* the route/page — see [17-do-not-build-guardrails.md](17-do-not-build-guardrails.md))
- [x] **HIDE** — ARTCHIVE → repurpose into a gallery for famous deceased artists (e.g. David Hockney…); do not show in nav until that content exists — hidden from nav; the deceased-artists gallery itself is not built
- [x] **HIDE** — ARTICON → move its content into a future Opportunities/Events section; remove from nav for now — hidden; the move into Opportunities/Events is not done
- [x] **HIDE** — ARTCADEMY → external learning recommendations will live inside HGI instead; remove from nav for now — hidden; the HGI side is not done
- [x] **ADD** — No buyer-specific page currently exists → add **For Buyers** — added as a `ComingSoonPage` placeholder; no real content yet
- [ ] **CHANGE** — "Login / Sign Up" → **Open JO1N ID** — **deliberately not done.** The team's decision is to keep the current "Enter ArtSpace" / "Create JO1NID" buttons wired to the interim Supabase auth until JO1N ID is live.

## Also added (not in the PDF table, but required by its "Final nav bar" line)

- [x] **ADD** — **How It Works** → new `/how-it-works` route, `ComingSoonPage` placeholder
- [x] **ADD** — **Pricing** → new `/pricing` route, `ComingSoonPage` placeholder; `/membership` now redirects here

## Final nav bar

```
Home · How It Works · Artists · For Buyers · Pricing · Open JO1N ID
```

## Notes

- MRI Rankings was **fully deleted**, not just unrouted: `MriRankingsPage`, `src/components/rankings/` (8 components) and `src/data/mriRankingsContent.ts` are gone. The brief's "do not build" list treats public ranking as permanently excluded, so full removal was the safer read. Recoverable from git history if that turns out wrong.
- "HIDE" was implemented as *out of the nav, route still resolves* — `/marketplace`, `/archive`, `/articon` and `/academy` all still load by direct URL. Unhiding is a one-line change to `navLinks`.
- Old paths redirect rather than 404: `/creators` → `/artists`, `/membership` → `/pricing`.
- `footerLinks` in `src/data/homeContent.ts` was also updated — it still listed Marketplace, Creators and ARTCHIVE, which contradicted hiding them. (All footer links are `href="#"` placeholders regardless.)
- Still carrying MRI traces elsewhere: the "Why ARTBANK" pillar, the `MRI Analytics` membership perk, and `mriScore` on creator/artwork cards. See [03](03-homepage-stats-and-why-artbank.md) / [04](04-membership.md).
