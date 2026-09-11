# 28 — Responsive recomposition of the homepage

Status: plan written 2026-09-11. Implementation follows in this document's
running log at the bottom.

The brief: keep the approved desktop design pixel-identical, and rebuild the
tablet and phone presentations as deliberately composed layouts rather than the
desktop layout with its columns dropped. Apple.com is the reference for
*responsive strategy only* — not for type, colour, shape, or voice.

---

## 1. What Apple actually does (measured, not assumed)

Loaded apple.com at 1440 / 834 / 393 with a real iPhone user agent and measured
the live DOM. Three findings drive everything below.

**The page gets shorter as the screen gets narrower.**

| Viewport | Apple page height |
| --- | --- |
| 1440px | 6,048px |
| 834px | 5,478px |
| 393px | 4,881px |

A phone page 19% shorter than the desktop page, on a screen 3.7× narrower. This
is only possible if sections are *recomposed*, never merely stacked.

**Type steps down in three deliberate sizes, not fluidly.** The same tile
headline measures 64px / 56px / 40px across those viewports, with line-height
loosening from 1.0 to 1.1 as it shrinks. Discrete steps per tier, and the
display leading is only used at display sizes.

**Imagery grows relative to the screen and is re-cropped, never letterboxed.**
The hero image is 209% of viewport width on desktop and 187% on a phone, always
`object-fit: cover`. Its rendered aspect ratio goes 5.51 → 2.05 → 1.22: a wide
letterbox strip on desktop becomes a nearly square, dominant image on a phone.
Content tiles that sit at 76–81% of viewport width on desktop go to 98–115% —
full-bleed — on tablet and phone.

Gutters measured ~16–20px on the phone, ~22px on tablet.

---

## 2. What ARTBANK does today (measured)

Same method against the local homepage, all ten sections.

| Viewport | ARTBANK page height |
| --- | --- |
| 1440px | 7,124px |
| 1069px | 8,863px |
| 834px | 11,411px |
| 393px | 15,723px |

**The phone page is 2.2× the desktop page.** Apple's is 0.81×. That single ratio
is the problem, and every item below is a contributor to it.

Per-section height, desktop → phone:

| Section | 1440px | 393px | Growth |
| --- | --- | --- | --- |
| BuyerSourcing | 1,050 | 3,559 | 3.4× |
| MarketIntelligence | 476 | 1,350 | 2.8× |
| DisciplineBrowser | 1,150 | 2,667 | 2.3× |
| ArtspaceOverview | 1,118 | 2,443 | 2.2× |
| FeaturedArtistBand | 563 | 1,336 | 2.4× |
| ValuePillars | 172 | 419 | 2.4× |
| DailyBrief | 508 | 1,044 | 2.1× |
| JenaisisBand | 448 | 695 | 1.6× |
| Hero | 831 | 988 | 1.2× |
| JoinStandard | 385 | 477 | 1.2× |

The top five are 72% of the phone page. That is where the work goes.

### Root causes found

1. **Eighteen ad-hoc breakpoints.** Across ten homepage stylesheets: 1360, 1240,
   1200, 1180, 1100, 1080, 1000, 900, 860, 820, 720, 700, 640, 620, 560, 520,
   480, plus the layout files. Every component invented its own, so no two
   sections change at the same width and no viewport was ever composed as a
   whole.

2. **Tablet has no layout of its own.** Section headings measure 46px on
   desktop, then 30px at both 834px *and* 393px — tablet inherits the phone's
   type. The hero headline does the opposite: 52px at both 1440px and 834px,
   then 36px. Tablet is always borrowing from a neighbour.

3. **Grids collapse to one column and run.** The discipline grid goes 3 → 2 → 1
   column, and at one column its six cards are 2,011px tall on their own. The
   buyer works grid does the same at 1,731px.

4. **The two dashboard mockups re-flow.** `ArtspaceOverview` and `BuyerSourcing`
   each render a full fake product UI — sidebar, top bar, stat row, content
   grid. On a phone that fake UI re-flows like a real page: the fake sidebar
   stacks above the fake main column, the fake stat row becomes four stacked
   rows. `BuyerSourcing`'s inner `.main` alone is 2,287px. A picture of a
   product should behave like a picture, not like a layout.

5. **Stat rows stack.** Four short figures become a 472px column.

### What is already correct

No horizontal overflow at any width: document width equals viewport width at
all nine tested sizes, and no element escapes a non-clipping ancestor. The
`contain: paint` work on the scrollers holds. Nothing below should regress it.

---

## 3. Policy

### Breakpoints — three tiers, and a rule for the old ones

```
Desktop   ≥ 1069px      approved, frozen
Tablet    735–1068px    intentional intermediate layout
Mobile    ≤ 734px       composed for the phone
Small     ≤ 430px       adjustments only, never new composition
```

The existing breakpoints above 1068px (1360, 1240, 1200, 1180, 1100, 1080) are
*desktop fluidity* and are already approved. **They stay exactly as they are.**
Only the queries that fire at 1068px and below get reorganised onto the two
tiers. That keeps the promise — nothing changes at desktop widths — while still
collapsing the mess where it actually causes harm.

### Shared mechanics, defined once in `globals.css`

- **Type scale.** Three steps per role, set as custom properties on `:root` and
  re-declared at each tier, so a section heading is one token instead of ten
  independent font-size declarations.
- **Section rhythm.** One vertical spacing token per tier, replacing the ten
  different section paddings.
- **Gutters.** 20px on the phone, 24px on tablet, matching the existing
  `.container`.
- **Swipe rails.** Each is `overflow-x: auto` + `scroll-snap-type: x mandatory`
  + `contain: paint` (which the scroller work already proved is what stops a
  strip from widening the layout viewport), with cards at
  `scroll-snap-align: start` and 86% of the container so ~14% of the next card
  shows. Scrollbar hidden visually, keys and focus untouched.

  *Implementation note:* this started as a shared utility class in
  `globals.css` and was removed again. Every rail needs its negative bleed
  margin tied to its own section's padding, so the shared class carried almost
  nothing and each rail is defined with its section instead.

### Constraints carried through every section

- Desktop markup and desktop CSS untouched.
- No duplicated components. Recomposition happens in CSS, plus small
  presentational wrappers where a rail genuinely needs one element more.
- Carousels must not scroll the page sideways — `contain: paint` on every rail.
- Touch targets ≥ 44px.
- `prefers-reduced-motion` respected on any new smooth-scroll behaviour.

---

## 4. Section-by-section

### Hero
- **Desktop** unchanged: full-bleed photograph, copy overlaid left.
- **Tablet** headline gains its own step (52 → 44px) instead of holding desktop
  size until it snaps to 36. Copy column widens toward the centre.
- **Mobile** unchanged in composition — the overlay treatment was built and
  approved recently and already reads well. Only the headline step and the CTA
  hierarchy change: the secondary action becomes a text-and-arrow link so one
  button carries the weight.

### ValuePillars
- **Desktop** unchanged, four across.
- **Tablet** two by two.
- **Mobile** a compact two-column grid rather than four stacked rows. These are
  four short labels; they do not deserve 419px.

### DisciplineBrowser — the creator discovery section
- **Desktop** unchanged: three-column grid of six creator cards, filter chips,
  search, stats.
- **Tablet** two columns, chips stay on one scrollable line.
- **Mobile** the grid becomes a **swipe rail**: cards at 86% width, snapping,
  next card peeking. Card content is reduced to image, name, discipline, and
  the profile action — the location and tag overlays stay on the image where
  they cost no height. Stats become one compact row. "View all creators" is
  promoted to a full-width link under the rail. Expected saving: ~1,400px.

### FeaturedArtistBand
- **Desktop** unchanged: the editorial split with its absolutely positioned
  portrait and artwork wall.
- **Tablet** a balanced arrangement — portrait above, copy below at controlled
  width, gallery rail already present.
- **Mobile** deliberate editorial order: portrait image as one dominant crop,
  then eyebrow, headline, quote, CTA, then the artwork rail. The existing
  absolute positioning is neutralised at this tier rather than allowed to
  collapse. No stack of full-screen images.

### ArtspaceOverview and BuyerSourcing — the dashboard sections
Both share one fix, which is the largest single win on the page.

- **Desktop** unchanged: copy column beside the full dashboard mockup.
- **Tablet** copy above, mockup below at full container width, features two by
  two.
- **Mobile** the mockup **stops re-flowing**. It keeps its desktop internal
  layout at a fixed design width and is scaled down as one object inside a
  container with a fixed aspect ratio and `overflow: hidden`, cropped to the
  region that carries the meaning — the stat row and the content grid, not the
  fake sidebar. It reads as a picture of the product, which is what it is.
  Feature lists show the strongest items first; the buyer works grid becomes a
  swipe rail. Expected saving: ~3,500px across the two.

### MarketIntelligence
- **Desktop** unchanged: the stripe with signals on the right.
- **Tablet** signals two across under the copy.
- **Mobile** signals become a swipe rail; the facts row becomes a compact
  two-column block instead of a stack.

### DailyBrief, JenaisisBand, JoinStandard
- **Desktop** unchanged.
- **Tablet/Mobile** rhythm and type tokens only, plus CTA hierarchy on the dark
  bands: one dominant message, one button. These are already close.

### Navigation and Footer
- **Header** is out of scope for this pass. It was just reverted to its
  approved state at the user's request and will be treated separately.
- **Footer** desktop unchanged. On mobile the four link columns become compact
  accordion groups, with branding, the newsletter input and legal lines kept
  visible. Expected saving: ~400px.

---

## 5. Target

| Viewport | Now | Target |
| --- | --- | --- |
| 1440px | 7,124px | 7,124px (unchanged) |
| 834px | 11,411px | ~7,500px |
| 393px | 15,723px | ~8,000px |

Desktop must come back byte-identical in screenshot comparison. Phone should
land near half its current length without anything being made tiny.

---

## 6. Test matrix

1440 / 1280 / 1069 / 1068 / 834 / 768 / 734 / 430 / 393 / 375 / 360.

At each: page height, horizontal overflow, no element outside the viewport,
carousel geometry and peek, headline wrapping, touch target sizes, and a
screenshot judged for whether it looks *designed* rather than merely fitting.
Desktop screenshots diffed against pre-change captures.

---

## Running log

### 2026-09-11 — implemented

Measured across all eleven widths in the test matrix. Full-page renders at
1440px come back byte-for-byte the same dimensions as the pre-change capture,
and all ten section heights are identical to the pixel.

| Viewport | Before | After | Change |
| --- | --- | --- | --- |
| 1440px | 7,124 | 7,124 | none |
| 1069px | 8,863 | 8,157 | −8% |
| 834px | 11,411 | 10,559 | −7% |
| 393px | 15,723 | 10,946 | **−30%** |

Per section on a phone:

| Section | Before | After |
| --- | --- | --- |
| DisciplineBrowser | 2,667 | 907 |
| BuyerSourcing | 3,559 | 2,010 |
| ArtspaceOverview | 2,443 | 1,734 |
| MarketIntelligence | 1,350 | 909 |
| DailyBrief | 1,044 | 965 |
| ValuePillars | 419 | 303 |
| Hero | 988 | 935 |

Horizontal overflow: none at any of the eleven widths, and the page cannot be
scrolled sideways at any of them. Three swipe rails on a phone, one on tablet,
none on desktop. No interactive element under 44px on a phone.

### What each change actually was

- **globals.css** gained the three tiers as tokens — type, rhythm, gutters,
  rail metrics. The desktop values in those tokens are the numbers that were
  already hard-coded in the components, so adopting a token moves nothing at
  desktop width.
- **DisciplineBrowser**: the six-card grid became a swipe rail at 86% card
  width. `display: contents` on the toolbar is what let "View all" move below
  the rail without moving an element in the markup.
- **BuyerSourcing / ArtspaceOverview**: the dashboard stills stopped
  re-flowing. They keep their columns and shrink as one object, which is what
  `.dash`'s own base rule always intended. The sidebar drops only below 430px.
  The buyer works grid and the ArtSpace stat row keep their columns.
- **MarketIntelligence**: signals became a rail; the column rule moved to the
  right edge of each card so it still divides one from the next.
- **FeaturedArtistBand**: its mobile composition was already right — it just
  started at 900px, leaving 735–900px on a squeezed desktop split that ran
  taller than the phone version. Moving the boundary to 1068px and giving
  tablet its own portrait size was the whole fix.
- **Footer**: the three link groups became `<details>` accordions, collapsed
  on a phone, forced open and untoggleable above it.

### Two things worth knowing

**The 1069–1080px band changed.** `ArtspaceOverview`, `BuyerSourcing` and
`JenaisisBand` stacked their columns at `max-width: 1080px`, which straddles
the tier boundary. They now stack at 1068px, so 1069–1080px shows the desktop
two-column composition where it used to show the stacked one. That follows
from adopting the brief's own boundary — desktop starts at 1069px — and it is
an 11px band. Nothing at 1100px or wider moved. If that band should keep its
old behaviour, the three queries go back to 1080px.

**Chrome's `::details-content`.** The footer accordions first came out 56px
short on desktop. A closed `<details>` in Chrome hides its contents with
`content-visibility: hidden` on the `::details-content` pseudo-element, which
skips their layout — overriding `display` on the list renders it but still
measures every link short. The override has to target the pseudo-element.

### Not done

- **Header** was out of scope by request — reverted to its approved state
  earlier the same day and left alone.
- **Mobile image assets.** Every crop here is `object-fit` / `object-position`
  on the existing files. Nothing needs a `<picture>` yet, but no component
  would have to be restructured to add one.
- The phone page is 1.55× the desktop page. Apple's is 0.81×. The remaining
  distance is mostly the two dashboard stills, which are 3,744px between them
  and are the two most valuable images on the page.
