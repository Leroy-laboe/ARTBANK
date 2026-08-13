# 06. Functions to Build by 21 August

> Source: PDF page 5 — "Functions to build by 21 August"
> This is a cross-cutting summary checklist. Each item is detailed further in one of the other files — use this one as the top-level "is the whole thing done" view.

- [ ] **1.** Login button does nothing → working **Open JO1N ID** screen
- [ ] **2.** No role selection → **Artist · Buyer · Guardian · Partner**
- [ ] **3.** No artist onboarding → profile, practice, location, goals and social links
- [ ] **4.** No artwork onboarding → **Add Artwork Record** (see [10-add-artwork.md](10-add-artwork.md))
- [ ] **5.** No public artist profile → profile with Contact, Follow, works and credentials (see [16-public-profile-access.md](16-public-profile-access.md))
- [ ] **6.** No artwork record → artwork details, availability and Passport preview (see [11-artwork-record-passport.md](11-artwork-record-passport.md))
- [ ] **7.** No private dashboard → **ArtSpace** prototype (see [07-artspace-shell-and-navigation.md](07-artspace-shell-and-navigation.md))
- [ ] **8.** No artist navigation → Today · My Works · Interest · Opportunities · Messages
- [ ] **9.** No viewer identification → Interest Ledger and Buyer Card prototype (see [12](12-interest-ledger.md), [13](13-buyer-card.md))
- [ ] **10.** No structured contact → Contact Artist enquiry form
- [ ] **11.** No guardian protection → guardian-controlled minor account
- [ ] **12.** No legal pages → Terms, Privacy, Cookies and Contact (see [05-footer-and-legal.md](05-footer-and-legal.md))
- [ ] **13.** Seven main routes return 404 → zero visible 404 pages
- [ ] **14.** Main buttons do nothing → every visible button works

## Notes

- This list is the doc's own "does everything actually work" gate — treat it as the acceptance criteria alongside the Completion Test in [00-overview-and-timeline.md](00-overview-and-timeline.md).
- Role selection (#2) and Guardian protection (#11) are new account-system concepts not present anywhere in the current codebase (there's no auth system at all yet — `src/services/auth.ts` is an empty stub). This is a real backend/auth build, not just UI.
