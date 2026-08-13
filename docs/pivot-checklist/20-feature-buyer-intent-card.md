# 20. Feature — Buyer Intent Card

> Source: PDF pages 17, 19–20 — priority feature #3, detailed on "3. Buyer Intent Card"
> Priority: **3 of 10** · Build tier: **NOW** · Build order position: **3rd**
> Depends on: [12-interest-ledger.md](12-interest-ledger.md), [13-buyer-card.md](13-buyer-card.md), [19-feature-smart-artwork-link-qr.md](19-feature-smart-artwork-link-qr.md)

## What it is

- **What the artist sees:** buyer identity, purpose, artwork, budget range and deadline.
- **What the buyer sees:** a short, professional enquiry form.
- **Why it impresses:** removes the "who is this person and what do they want?" problem entirely.

## When to require it

> Require this card whenever the viewer requests **price, availability, licensing, or private access.**

## Fields

| Field | Required? |
|---|---|
| Name | Yes |
| Role | Yes |
| Country | Yes |
| Purpose | Yes |
| Artwork | Yes |
| Message | Yes |
| Organization | When applicable |
| Budget range | Optional |
| Intended use | Required for licensing |
| Decision timeline | Optional |
| Identity sharing consent | Yes |

- [ ] Name (required)
- [ ] Role (required)
- [ ] Country (required)
- [ ] Purpose (required)
- [ ] Artwork (required)
- [ ] Message (required)
- [ ] Organization (conditional)
- [ ] Budget range (optional)
- [ ] Intended use (required only for licensing purpose)
- [ ] Decision timeline (optional)
- [ ] Identity sharing consent (required)

## Artist-side result

The artist should receive a clean, human-readable summary, e.g.:

> "Sarah Chen, Independent Collector from Singapore, requested availability for *Silent Harmony*."

## Notes

- This is the *form*; [13-buyer-card.md](13-buyer-card.md) is the resulting persistent *identity record*. Confirm whether submitting this card creates/updates a Buyer Card automatically.
