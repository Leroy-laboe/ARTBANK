# 05. Footer & Legal

> Source: PDF pages 4–5 — "Footer and legal changes"
> Files likely touched: `src/components/layout/Footer.tsx`, `src/data/homeContent.ts` (`footerLinks`), `src/App.tsx` (new routes)

## Changes

- [ ] **FIX** — 22 footer links currently lead nowhere → every visible link must open a real page (audit the whole footer, not just the legal links below)
- [ ] **BUILD** — Terms of Service (`#`) → build a working Terms page
- [ ] **BUILD** — Privacy Policy (`#`) → build a working Privacy page
- [ ] **BUILD** — Cookie Policy (`#`) → build a working Cookie page
- [ ] **BUILD** — Contact (`#`) → build a working Contact page
- [ ] **FIX or DELETE** — Social links (`#`) → link only to official Artbank accounts (delete any that don't exist yet)
- [ ] **FIX or HIDE** — Newsletter signup has no working submission → connect to a real email system, or hide the field entirely until it does
- [ ] **CHANGE** — "©2025" → **"©2026 Artbank. All rights reserved."**

## Notes

- This is explicitly called out as blocking: "Zero visible 404 pages" and "no dead buttons or placeholder links" are both completion-test requirements (see [00-overview-and-timeline.md](00-overview-and-timeline.md)) — the footer is the single biggest source of dead links on the current site, so treat this file as high priority even though it looks like small copy work.
- Four new real pages need routes: Terms, Privacy, Cookies, Contact.
