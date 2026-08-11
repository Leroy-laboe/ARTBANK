# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # tsc -b type-check, then vite build
npm run lint      # oxlint (see .oxlintrc.json — react/typescript/oxc plugins)
npm run preview   # preview a production build
```

There is no test runner configured in this project (no test script, no test files).

## Architecture

Vite + React 19 + TypeScript, client-rendered, no SSR/meta-framework. Routing is `react-router-dom` v7 with a `BrowserRouter`.

**Entry point:** `src/main.tsx` → `src/App.tsx` (root component with `BrowserRouter`/`Routes`) → `src/styles/globals.css` (imported once, globally).

**`src/app/` is dead scaffold** — `App.tsx`, `providers.tsx`, `routes.tsx` in that folder are empty files left over from an earlier structure. The real app root is `src/App.tsx` at the `src` top level, not `src/app/App.tsx`. Don't add code to `src/app/`; treat `src/App.tsx` as the single source of truth for routes.

Routes are registered directly in `src/App.tsx`. Unbuilt sections use `<ComingSoonPage title="..." />` as a placeholder — when building out a new nav section, replace its `ComingSoonPage` route with a real page rather than adding a parallel route.

### Page composition pattern

Every route is one file in `src/pages/`, and every page is a flat composition of `Header`, a sequence of section/panel components, and `Footer` — pages hold no markup of their own beyond a layout `<div>`/`<aside>` grid. Example shape (see `src/pages/CreatorsPage.tsx`, `src/pages/MarketplacePage.tsx`):

```tsx
<>
  <Header />
  <main>
    <div className={styles.layout}>       {/* sidebar + main + right rail grid */}
      <FilterSidebar />
      <div className={styles.mainCol}>...cards mapped from a data array...</div>
      <aside className={styles.rightCol}>...stacked info panels...</aside>
    </div>
    <SomeCtaBand />
  </main>
  <Footer />
</>
```

Local page-only state (e.g. grid/list `view` toggle) lives in the page component via `useState` and is passed down as props — there is no global state library or context store.

### Component conventions

- One component per file, named export (`export function Foo()`), PascalCase filename matching the export.
- Every component with meaningful styling gets a co-located CSS Module: `Foo.tsx` + `Foo.module.css`, imported as `import styles from './Foo.module.css'`. No Tailwind, no CSS-in-JS, no global class soup — `styles.xxx` composition only (see `Button.tsx` for the `[styles.a, condition && styles.b].filter(Boolean).join(' ')` idiom for conditional classes).
- Components take typed data via props (`{ creator: CreatorProfile }`, `{ artwork: Artwork }`), not by reaching into data files themselves — data files are imported at the page or list level and mapped into cards.
- `src/components/ui/` holds the two cross-page primitives: `Button` (variants `primary | secondary | gold | ghost`, polymorphic — renders `<Link>` if given `to`, `<a>` if given `href`, else `<button>`) and `Icon`.

### Icons

`src/components/ui/Icon.tsx` is a single hand-drawn SVG icon set (24×24 viewBox, stroke-based, `currentColor`) exposed as `<Icon name="..." size={18} />`. `IconName` is a closed string-literal union — check it before assuming an icon exists; adding a new glyph means adding both the union member and a `paths[...]` entry. There is no icon library dependency (no lucide/heroicons/etc).

### Data layer

`src/data/*.ts` holds typed, hand-authored mock arrays (creators, listings, homepage content) — this is a design/prototype-stage app with no live backend wired to the UI. Types live separately in `src/types/*.ts` (`creator.ts`, `artwork.ts`) and are imported into the matching `src/data/*.ts` file. Follow the existing split: a `data/xContent.ts` for page copy/stats/nav config, and a `data/xListings.ts` for the card-array feeding a grid.

Images are hotlinked URLs, not local assets (despite `src/assets/images/` existing) — Unsplash (`https://images.unsplash.com/...?w=&h=&fit=crop&auto=format&q=80`) for photography, `flagcdn.com` for country flags, Wikimedia for a couple of reference artworks. When a card has no `imageUrl`, components fall back to an inline `gradient` (CSS `linear-gradient(...)` string stored on the data object) — see `ArtworkCard.tsx`'s `imageUrl ? undefined : { background: artwork.gradient }` pattern. Match this fallback pattern for any new card type rather than requiring an image.

**Supabase is scaffolded but not wired up.** `src/lib/supabaseClient.ts` exports `supabase`/`isSupabaseConfigured`, reading `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`, but `src/services/api.ts`, `services/artwork.ts`, `services/auth.ts`, and `types/user.ts` are all empty files, and nothing in `src/components`/`src/pages` imports from `services/` or `supabaseClient`. Don't assume a service layer exists — check whether a given `services/*.ts` file actually has content before relying on it.

### Design tokens (`src/styles/globals.css`)

All color/type/spacing tokens are CSS custom properties on `:root` — always reuse these rather than hardcoding hex values or font stacks:

- Color: `--ink` / `--ink-soft` / `--muted` / `--muted-2` (text), `--bg` / `--surface` (backgrounds), `--border` / `--border-soft`, `--gold` / `--gold-light` / `--gold-dark` / `--gold-bg` (accent), `--dark` / `--dark-2` / `--dark-border` / `--cream-text` (dark sections), `--success`.
- Type: `--font-serif` (Playfair Display — headings only, applied globally to `h1–h4`) and `--font-sans` (Inter — body default).
- Layout: `--container` (1280px, used via the global `.container` class), `--radius-sm/md/lg/full`, `--shadow-sm/md/lg`.
- Global utility classes already defined: `.container` (max-width wrapper, responsive padding), `.eyebrow` (uppercase gold kicker text), `.visually-hidden`.

Breakpoints are ad hoc per-component `@media` queries (commonly `1300px`, `1100px`, `900px`, `720px`, `480px` — see `CreatorsPage.module.css`), not a shared breakpoint system.
