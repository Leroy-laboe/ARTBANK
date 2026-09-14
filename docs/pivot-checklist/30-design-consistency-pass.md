# 30 — Design consistency and polish pass (public site)

Status: implemented 2026-09-14. Scope: the public-facing site only — home,
`/artists`, `/artists/:handle`, `/marketplace`, `/rooms/:id`, `/a/:id`,
`/terms` `/privacy` `/cookies`, the Coming Soon placeholder, and the shared
header and footer. The signed-in workspaces (`src/components/artspace/*`,
`src/components/buyer/*`, the guardian screens) were not touched; they are a
separate surface and deserve their own pass.

The brief was to make the site read as one deliberately designed product
rather than a sequence of individually designed sections, without redesigning
anything or changing the brand.

---

## 1. What was actually wrong

Measured, not assumed — every figure below came from the live DOM.

### Typography was the biggest single problem

**Nine different `clamp()` formulas were doing one job.** Every section on the
homepage set its own headline size:

| Section | Formula | Rendered at 1440px |
| --- | --- | --- |
| ArtspaceOverview | `clamp(30px, 3.5vw, 46px)` | 46 |
| BuyerSourcing | `clamp(30px, 3.5vw, 46px)` | 46 |
| DisciplineBrowser | `clamp(28px, 3.4vw, 43px)` | 43 |
| FeaturedArtistBand | `clamp(27px, 3vw, 38px)` | 38 |
| JoinStandard | `clamp(26px, 3.1vw, 38px)` | 38 |
| MarketIntelligence | `clamp(27px, 2.8vw, 37px)` | 37 |
| DailyBrief | `clamp(26px, 3vw, 36px)` | 36 |
| JenaisisBand | `clamp(25px, 2.55vw, 36px)` | 36 |

Eight rendered sizes for one role. The same role also carried **seven
line-heights** (1.14 / 1.15 / 1.16 / 1.18 / 1.2 / 1.22 / 1.25), **three
letter-spacings** (−0.015em / −0.01em / none) and **four eyebrow gaps** (14 /
16 / 18px).

`--t-section` already existed in `globals.css` but had **no desktop
consumer** — it only fired at 1068px and below. The tokens were there; nothing
above tablet used them.

**Twelve steps between 10px and 15.5px** for body and label text: 10, 10.5,
11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5. And **seven more between 16
and 22** for card and panel titles. The half-pixel steps were never a
decision — they are what happens when a section is sized by eye in isolation.

**Display headings rendering at body leading.** `/artists` set a 46px title
with no `line-height`, so it inherited `body`'s 1.55 and rendered on a **71px
line**. `/marketplace` was 42px on 65px; Coming Soon 38px on 59px. Every
homepage heading set ~1.15 for itself, so this only affected the pages that
didn't.

### Vertical rhythm had no system

Nine live bands, **nine different top paddings** (34 / 52 / 60 / 68 / 74 / 78
/ 84 / 88) and **eight different bottoms**. `--sec-y` existed and, like
`--t-section`, had no desktop consumer.

### The three main pages sat on three different grids

| Page | Content runs |
| --- | --- |
| `/` | 120 → 1360 |
| `/artists` | 80 → 1360 |
| `/marketplace` | 40 → 1400 |

`/artists` carried the global `.container` class *and* a `padding: 28px 0 0`
that zeroed its 40px gutter. `/marketplace` ignored `.container` entirely and
declared `max-width: 1560px` locally. Both run the identical
`264px 1fr 300px` grid.

That was not only an alignment problem. It is what broke the creator card's
footer: at `.container` width the four-up grid gets ~145px per card, and
`CreatorCard`'s footer row had no `gap` and nothing allowed to shrink, so the
country name and "2.4K Followers" collided and the follower count wrapped
mid-phrase. `RealArtistCard` — the same card, in the same grid, directly
above it — had already been given the fix.

### Eleven near-duplicate button classes

Five label sizes (13 / 13.5 / 14 / 14.5 / 15), three weights (500 / 600 /
700), three radii, six paddings, and heights from 40px to 52px — across
`.btn`, `.cta`, `.ctaPrimary`, `.ctaGhost`, `.primary`, `.secondary`,
`.applyBtn` (×2, byte-identical), `.createBtn`, `.enterBtn`, `.viewAll` and
`.profileBtn`.

### Mobile listing pages were desktop stacked, not recomposed

`/artists` at 393px was **8,427px** tall and opened on a full filter
panel — category list, country, art style, career stage, Apply, Reset — for
roughly 1,000px before the first artist appeared. Then eight creator cards
one per row. The homepage had been recomposed for the phone (doc 28); the
listing pages never were.

### Dead code

- `@media (max-width: 640px) { .enterBtn { display: none } }` in the header,
  unreachable: `.enterBtn` lives inside `.desktopOnly`, which is already
  `display: none` from 1100px.
- `.headline` in `FeaturedArtistBand.module.css` — a tier override for a
  class with no base rule and no JSX usage.
- Six `.title` tier overrides that restated the base rule exactly.

---

## 2. What was standardised

All tokens live in `src/styles/globals.css`.

### Display type — two levels, not eight

```
--t-section:     clamp(38px, 3.4vw, 46px)   → 38px tablet → 30px mobile
--t-section-sm:  clamp(31px, 2.75vw, 36px)  → 31px tablet → 25px mobile
--t-section-lh / --t-section-sm-lh / --t-display-ls / --eyebrow-gap
```

Level 1 is the page's load-bearing bands (ArtSpace, buyer sourcing,
discipline browser). Level 2 is the quieter bands between them. Keeping two
real steps is what stops every band reading as equally important — the brief
said not to make every section look identical.

The desktop values stayed `clamp()` on purpose: fluidity between 1069px and
~1400px was already approved (doc 28), and this preserves it while collapsing
nine formulas into two. Nothing grew except DisciplineBrowser (43 → 46); the
cap is 36px specifically because MarketIntelligence and JenaisisBand carry
documented one-line caps on a gold phrase, so the shared cap had to sit at or
below the lower of the two.

### Text and sub-heading scale — six steps and two, not twelve and seven

```
--t-title: 19px   --t-title-sm: 16px
--t-body: 15.5px  --t-lead: 15px  --t-sm: 14px
--t-label: 13px   --t-caption: 12px  --t-micro: 11px  --t-overline: 10px
```

`--t-overline` survives as its own step because uppercase tracked micro-labels
are a real role here (the market band's facts, the Jenaisis rail note, stat
labels). 168 declarations moved onto this scale.

Global `h1–h4` now carries `line-height: 1.2`, so a heading that doesn't set
its own gets display leading instead of body leading. This fixes the three
pages above and prevents the next one.

### Vertical rhythm — two band depths

```
--sec-y:       80px → 64px → 52px
--sec-y-tight: 52px → 44px → 40px
```

`--sec-y-tight` is for the connective stripes that are deliberately shallower
than the sections they separate (MarketIntelligence says so in its own
comment). Every other live band is on `--sec-y`.

### Controls — one footprint, two sizes

```
--t-ctrl: 14px   --t-ctrl-sm: 13px   --ctrl-weight: 600
--ctrl-pad: 14px 24px   --ctrl-pad-sm: 9px 18px   --ctrl-h: 48px
```

Padding-sized buttons land at ~47px and height-sized band CTAs at 48px — they
agree to within a pixel, where before they ranged 40 to 52. Fill, border and
radius deliberately stay with each section: the forest rectangle in the buyer
band and the gold pill in the Jenaisis band are doing different jobs.

The four `ShinyButton` placements read their size from the same tokens as the
buttons they sit beside, so the pairs can't drift apart again.

### Containers — two, named

```
--container:      1280px   (marketing bands, header, footer, prose)
--container-wide: 1560px   (the two listing pages)
```

A `.container-wide` utility sits beside `.container` in `globals.css` with the
same gutter steps (40 / 24 / 20). Both listing pages now use it, so they share
one grid, and the artists CTA band that closes `/artists` was split into a
wrapper plus a card so it can carry a gutter at all — previously the container
and the card were one element and the card's own 36px padding won.

### Radius — one system

`--radius-sm: 8px` / `--radius-md: 14px` / `--radius-lg: 22px` /
`--radius-full` / `50%`. The strays that were real surfaces (6, 9, 10, 14px)
moved onto it.

### Cards — `--card-pad: 14px 16px 16px`

The four public card types already shared a shell (surface, 1px border,
`--radius-md`, `translateY(-3px)` + `--shadow-md` hover). Only the body
padding had drifted, into two values. `CreatorCard` also got
`RealArtistCard`'s footer-row fix ported across.

### Breakpoints

Every live public component is now on the doc 28 tiers (1069 / 1068 / 734 /
430). Off-tier queries at 560, 640, 900, 480 and 720 are gone.

### Mobile listing pages

Content leads, the rail follows, filters sit last as a utility rather than a
gate. The creator grid stays two-up on small phones (portraits with two short
lines stay legible at ~166px). `/artists` at 393px went **8,427px →
4,569px**, a 46% reduction, with nothing made smaller.

---

## 3. Results

No horizontal overflow and no JavaScript errors at 1440 / 1280 / 1069 / 1068 /
834 / 734 / 430 / 393 / 360 on any public page.

| Page | Desktop before → after | Phone before → after |
| --- | --- | --- |
| `/` | 7,124 → 7,090 | 10,946 → 10,700 |
| `/artists` | 2,193 → 2,175 | 8,427 → 4,569 |
| `/marketplace` | 1,842 → 1,835 | 8,131 (unchanged by choice) |

Distinct rendered headline sizes on the homepage: **8 → 2**.

`npm run build` passes. `npm run lint` reports one pre-existing
`exhaustive-deps` warning in `SmartArtworkLinkPage.tsx`, untouched by this
pass.

---

## 4. Deliberately left alone

**The two dashboard mockups' internals.** `ArtspaceOverview` and
`BuyerSourcing` each render a fake product UI at reduced scale. Their 62
remaining hardcoded font-sizes (8–11.5px) and their 2–11px radii are a
*picture* of a product, not text and not surfaces. Normalising them onto the
site's scale would break the illusion the sections depend on. Their real copy
columns are on the scale.

**Marketplace stays one-up on small phones.** It makes that page 8,131px, but
a full-width artwork is the right presentation for an art marketplace and the
brief was explicit that artwork stays dominant. The artists grid goes two-up
because portraits are a different case.

**JenaisisBand's asymmetric band padding** (78px top / 42px bottom). Its
comments record the proportions as measured off the design, and its right rail
hangs off those exact numbers with matching negative margins. Making it
symmetric would be a redesign, not a consistency fix.

**The header's composition.** It was reverted to an approved state and
excluded from doc 28 by request. Only its type moved onto the scale — the nav
was 13.5px while the two buttons beside it were 13px, on every page.

**The five dead pre-pivot homepage sections** (CuratedCollections,
MembershipCta, SpotlightSection, Testimonials, WhyArtbank). Kept in the
codebase but not composed into `HomePage`; touching them would be noise. They
hold most of the remaining off-tier breakpoints.

**Decorative marks** — the Jenaisis monogram, serif rank numerals, stat
figures and anything in `--font-hand`. They are marks, not headings, and are
not on the type scale.

**`/pricing` and `/login`.** Both are Tailwind surfaces, which is why they
still show rem-derived sizes (11.2, 12.8, 13.3, 14.4, 17.6px). Per CLAUDE.md
Tailwind is reserved for these screens; bringing them onto the CSS-Module
scale would mean converting them, which the brief ruled out.

**Section transitions.** Audited and found already consistent: the site
carries band-to-band transitions by colour, with only two hairlines on the
whole homepage (ValuePillars' bottom border separating two `--bg` bands, which
earns its keep, and JoinStandard's top border). A rule was briefly added to
FeaturedArtistBand and then removed — adding decoration that wasn't there is
the opposite of what the brief asked for.

---

## 5. Still needs human visual judgement

1. **Filters on mobile should probably be a disclosure or a sheet**, not a
   panel at the bottom of the page. Moving them out of the way was the
   CSS-only fix; making them a `<details>` (the idiom the footer already uses)
   or a bottom sheet needs a call on the interaction, and touches both
   sidebar components.

2. **DisciplineBrowser's headline grew 43 → 46px.** It's the one heading this
   pass made larger. Worth a look at 1280–1440 to confirm it still sits right
   against the stats row beside it.

3. **`--sec-y: 80px` is a judgement call.** The old values averaged ~78px so
   nothing moved much, but whether the page wants more air between bands is a
   design decision, not a measurement. The token makes it a one-line change.

4. **`/marketplace` at 8,131px on a phone.** The one-up artwork grid is
   defensible but it is a long page. A two-up grid with a full-width featured
   row, or a horizontal rail per collection, would be the alternative.

5. **The 1068/1069 boundary on the listing pages** jumps `/artists` from
   4,558px to 4,965px because the three columns stack. That's inherent to the
   stack, but the tablet composition of those two pages has never been
   designed deliberately the way the homepage's was.

6. **Header and footer stay on `--container` (1280) while the listing pages
   use `--container-wide` (1560).** Chrome on one grid, listing content on
   another, is a defensible and now-consistent choice, but it does mean the
   footer's edge sits inboard of the cards above it on those two pages.
