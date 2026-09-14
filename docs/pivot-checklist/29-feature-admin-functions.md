# 29 — Admin functions

Status: functional spec, for interface design. Derived from the schema deep
dive in [25](25-database-schema-plan.md); no route, page, or RLS policy exists
for any of this yet.

`users.role = 'admin'` already exists in the schema. Everything below is what
that role needs a screen for. Four real functions, one soft one, grouped as
screens an admin interface would actually have.

---

## 1. Upload an artwork for someone without an account

**Why it exists:** competition entries and similar cases where a real artwork
needs a record before the person behind it has signed up.

**What the admin sees:** a form, not a list — this is a creation screen.

**What the admin does:** fills in the artwork the same way an artist would on
their own upload flow (title, year, medium, dimensions, images, discipline),
plus one extra field: the entrant's name, since there's no account to pull it
from.

**Fields involved:**
- `artist_display_name` — the entrant's name, typed in by the admin
- `artist_id` — left null
- `uploaded_by` — the admin's own user id, set automatically
- everything else — identical to a normal artwork row

**Design note:** this needs to support doing it more than once in a row —
the schema plan calls out competitions as a recurring case, not a one-off
backfill. A "save and add another" path, or a small batch/CSV entry, is worth
considering rather than one form per artwork with full navigation between
each.

---

## 2. Link an unclaimed artwork to a real account

**Why it exists:** the entrant from #1 eventually registers, and their
artwork needs to move from "uploaded by admin, no owner" to actually theirs.

**What the admin sees:** a list of artworks where `artist_id` is null,
each showing its `artist_display_name` and upload date. A search or filter
by name.

**What the admin does:** picks an artwork from that list, searches for the
matching registered user (by name or email), and confirms the link.

**Fields involved:**
- `artist_id` — set to the matched user's id
- `artist_display_name` — kept as-is afterward, for historical display

**Design note:** the doc suggests auto-matching by email when the
competition collected one. If that data exists, the list could pre-suggest a
match rather than requiring a manual search every time — worth a "suggested
match" state versus "needs manual search."

---

## 3. Review Certificate of Authenticity (COA) requests

**Why it exists:** `artworks.coa_status` has three values —
`not_requested`, `pending_review`, `issued` — and a COA is only meant to be
issued "after a defined evidence review." Nothing in the schema assigns that
review to anyone; this is the gap admin fills.

**What the admin sees:** a queue of artworks currently `pending_review`,
each showing the artist, the artwork, and whatever evidence was submitted
(the schema has an `artwork_evidence_files` table for this — provenance
documents, receipts, certificates, photos).

**What the admin does:** opens one artwork's evidence, and moves its status
to `issued` (approve) or back to `not_requested` (reject / needs more).

**Fields involved:**
- `coa_status` — the field the admin changes
- `artwork_evidence_files` — what the admin reviews to decide
- likely wants a rejection reason field, even though the schema doesn't
  currently have one — worth flagging back to the schema doc if this gets
  built, since "sent back with no reason" is a bad artist experience

**Design note:** this is the one function here with real subjectivity in the
decision (is the evidence sufficient?), so the review screen carries more
weight than the other three — it needs the evidence genuinely readable
(full-size images, legible documents), not a cramped queue row.

---

## 4. Moderate flagged conversations

**Why it exists:** `conversation_flags` records when a user reports, blocks,
or archives a conversation, with a reason — but nothing in the schema
describes what happens after that flag is raised.

**What the admin sees:** a queue of open flags, each showing who flagged it,
what action they took (`report` / `block` / `archive`), their stated reason,
and the conversation itself in context (the actual messages).

**What the admin does:** reads the conversation, then resolves the flag —
at minimum: dismiss (no issue found) or escalate (some consequence for one
or both parties). What "escalate" actually does — warn, suspend messaging,
suspend the account — isn't decided yet and would need its own scope.

**Fields involved:**
- `conversation_flags` — the queue itself (`flagged_by`, `action`, `reason`,
  `created_at`)
- `conversations` / `messages` — read-only, for context

**Design note:** a `block` flag (one party blocking the other) is probably
lower urgency than a `report` flag (something's actually wrong) — the queue
should likely be sortable or grouped by `action`, not one flat list.

---

## 5. Verify opportunity organizers *(soft — worth confirming before building)*

**Why it exists:** `opportunities.organizer_verified` is a boolean that
nothing currently sets. Opportunities aren't posted by artists themselves,
so whoever curates them into the system is presumably also the one vetting
the organizer — that reads as admin, but the schema doc never actually
says so.

**What the admin would see/do:** if opportunities are admin-curated
end-to-end, this folds into "add an opportunity" rather than being a
separate screen — the verified flag just gets set at creation time. If
opportunities come from somewhere else (a partner submitting them, say),
this needs its own review step instead.

**Design note:** don't build a separate verification screen for this until
it's confirmed how opportunities actually get into the system in the first
place — that answer changes whether this is one checkbox on a creation form
or its own queue.

---

## Not included

**Guardian-link disputes.** Nothing in the schema requires admin involvement
in `guardian_links`, and no real case has come up yet. Leaving this out
until one does, rather than designing a screen for a scenario nobody's hit.

---

## Suggested admin shell

Four real screens, one list-shaped:

1. **Upload artwork** — form
2. **Link artworks** — list + search/match action
3. **COA review** — queue + evidence viewer + approve/reject
4. **Flagged conversations** — queue + conversation viewer + resolve action

All four are gated the same way: `users.role = 'admin'`, one admin-only
route tree, none of it reachable from the artist/buyer/guardian navigation.
