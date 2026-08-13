# 24. Features — Basic-Tier Additions (Priorities 7–10)

> Source: PDF pages 17–18 — priority features #7–10 (summary table only; no dedicated deep-dive section exists in the brief for these four, unlike features 1–6)
> Build tier: priority 7 is marked **NOW** in the feature-priority table; priorities 8–10 are marked **BASIC VERSION**. The "Build order before 21 August" list (page 22) sequences all four *after* the six features in [18](18-feature-artwork-readiness-scan.md)–[23](23-feature-professional-artwork-pack.md).
> Build order position: 7th, 8th, 9th, 10th (in the order below)

Because the brief gives less detail on these four, treat this file as a starting spec — confirm scope with the team before building rather than assuming these bullet points are exhaustive.

---

## 7. Interest-to-Deal Progress *(NOW)*

- **What the artist sees:** a pipeline — **Viewer → Enquiry → Qualified → Viewing Room → Negotiation → Completed**
- **What the buyer sees:** clear status and the required next step
- **Why it impresses:** makes commercial progress visible without needing to build a full payment system

- [ ] Build the 6-stage pipeline: Viewer, Enquiry, Qualified, Viewing Room, Negotiation, Completed
- [ ] Surface current stage + next required step per active buyer relationship
- [ ] Placement: **Messages** (per [23-feature-professional-artwork-pack.md](23-feature-professional-artwork-pack.md) placement table)

## 8. Artwork History Timeline *(BASIC VERSION)*

- **What the artist sees:** upload, evidence, exhibition, enquiry, licence and sale events
- **What the buyer sees:** a clear record of the artwork's history
- **Why it impresses:** begins building provenance and long-term trust

- [ ] Build an append-only event timeline per artwork: upload, evidence added, exhibition, enquiry, licence, sale
- [ ] Placement: **History** tab on the artwork record ([11-artwork-record-passport.md](11-artwork-record-passport.md)) and **Artwork Record** area generally ([23](23-feature-professional-artwork-pack.md) placement table)

## 9. Buyer Save List *(BASIC VERSION)*

- **What the artist sees:** a notification that an identified buyer saved a work
- **What the buyer sees:** a private shortlist of artists and artworks
- **Why it impresses:** gives buyers a reason to create an Artbank/JO1N ID

- [ ] Build a "save" action on artwork pages for identified buyers
- [ ] Artist-side notification when a save happens
- [ ] Placement: **Buyer workspace — Saved Works and Viewing Rooms** ([23](23-feature-professional-artwork-pack.md) placement table)

## 10. HGI Response Assistant *(BASIC VERSION)*

- **What the artist sees:** HGI drafts a professional response based on enquiry type
- **What the buyer sees:** faster, clearer replies from artists
- **Why it impresses:** helps inexperienced artists behave professionally

- [ ] Draft-assist a reply based on the message category ([15-messages.md](15-messages.md): New Enquiry, Purchase, Licence, Exhibition, Commission, Collaboration, Support)
- [ ] Artist reviews/edits before sending — this must not auto-send (consistent with the "artist confirms every fact" / "artist approves submission" principle used elsewhere — see [10](10-add-artwork.md), [14](14-opportunities.md))

## Notes

- These four are explicitly lower priority than [18](18-feature-artwork-readiness-scan.md)–[23](23-feature-professional-artwork-pack.md) — if the 21 Aug deadline is at risk, these are the first candidates to cut or stub out with "coming soon" states, per the doc's own BASIC VERSION framing for 8–10.
