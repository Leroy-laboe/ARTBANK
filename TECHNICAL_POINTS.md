# ARTBANK — Technical Points

**What to claim, and how to defend it.**

Every point below is a real decision in the codebase, with the file or migration that proves it. Phrased so you can say *"I did X, because Y"* — the *why* is what earns credit in a technical evaluation, not the *what*.

---

## 1. The architectural decision that shapes everything

**"There is no application server in the live path. All authorization is enforced by the database."**

The browser talks directly to PostgREST using the anon key plus the signed-in user's JWT. There is no Express/Fastify tier in between.

**Why I did it:** a hard deadline with 26 specification documents behind it. A conventional three-tier build means writing, testing and deploying an API endpoint for every feature before a single screen works. Supabase generates the API from the schema.

**What it cost me:** there is nowhere to put `if (user.id !== artwork.artist_id) throw`. Every authorization rule had to become a Row Level Security policy — 35+ of them across 21 tables — and every business rule had to become a `CHECK` constraint or a trigger.

**Why I'd argue that's better, not just cheaper:** a rule written as a policy applies to *every* client, forever, including me in the SQL editor. A rule in JavaScript protects nobody from a second client, a background job, or a data migration.

**The honest cost:** no second line of defence. A missing policy is a public table. Migration `0023` exists because a read policy became "decorative" when I added a `visibility` column and didn't update it — and I caught it.

---

## 2. Business rules as database constraints

The strongest single thing in this project. Three examples, and you should know all three cold.

### The identity triple — `interest_entries`, migration `0012`

```sql
check (
  (is_identified = true  and viewer_id is not null and identity_sharing_consent = true) or
  (is_identified = false and viewer_id is null)
)
```

**Say:** *"An enquiry that claims to be identified but has nobody attached physically cannot be stored. And an anonymous row has no identity to leak, because there's nothing there to leak."*

That's the product's central promise — identity before access — expressed as something the database enforces rather than something my interface promises.

### Nothing auto-submits — `opportunity_applications`, migration `0013`

```sql
check (status <> 'submitted' or (approved_by is not null and submitted_at is not null))
```

**Say:** *"A submitted application must name a human approver and carry a timestamp. Even an accidental bulk UPDATE can't apply on an artist's behalf."*

### Guardian routing — `conversations`, migration `0014`

A `BEFORE INSERT OR UPDATE` trigger, not a constraint.

**Say:** *"A CHECK constraint can't run subqueries, and this rule needs two: is either party a minor, and is the named guardian actually **that** minor's linked guardian. So it's a trigger — which turns out to be the better answer anyway, because it holds for anything writing to the table, not just my UI."*

### And one thing defined by its absence

`artwork_history_events` has a read policy and an insert policy and **no update or delete policy at all**.

**Say:** *"A provenance log that can be rewritten isn't provenance."*

---

## 3. The payment security model

This is your most sophisticated piece. Learn the shape of it.

**The rule (migration `0024`):** no client may ever write `status = 'paid'`.

```sql
with check (
  artist_id = public.current_user_id()
  and status in ('agreed', 'awaiting_payment', 'cancelled')
)
```

**Say:** *"`WITH CHECK` constrains the row **after** the update. So an artist can move a deal between the states they legitimately control and can never land it on paid. A browser can start a checkout; it cannot be trusted to say the money arrived, or anyone with the anon key could mark their own order paid."*

**The nuanced relaxation (migration `0025`):**

```sql
or (status = 'paid' and payment_route = 'request')
```

**Say:** *"I relaxed it in exactly one direction. An artist confirming a bank transfer is asserting something about their own bank account — the same trust level the offline route always had. An artist marking a **card** payment paid would be asserting something about Stripe's system, and only a verified webhook can do that. Same table, same user, different claim."*

**Why the buyer's report is its own table:**

**Say:** *"The buyer needed to say 'I've sent it'. But RLS grants whole rows, not columns — giving them update permission on the deal so they could stamp one field would also let them rewrite the amount. So `payment_reports` is a row they own, sitting beside a row they can't touch."*

**Webhook idempotency, enforced by the schema:**

```sql
create unique index payments_provider_ref_key
  on public.payments (provider, provider_payment_id)
  where provider_payment_id is not null;
```

**Say:** *"Payment providers retry webhook deliveries. A retry must not become a second payment row — so the insert conflicts, rather than me having to remember to check."*

---

## 4. Concurrency — your best pure-engineering story

**The problem:** the identity provider rotates refresh tokens. Every refresh mints a new one and consumes the old, and presenting an already-consumed token is treated as a **reuse attack** — it revokes the whole token family and kills the session.

Two browser tabs hitting an expired token at the same moment would both read the same stored token, both call the provider, and the second would look exactly like an attacker replaying a consumed one. The user gets logged out through no fault of their own — and it's a race, so it's intermittent and horrible to debug.

**The solution — a distributed lock from a conditional UPDATE** (`server/src/db.ts`, migration `0010`):

```sql
UPDATE sessions SET refreshing_at = now()
WHERE id = :id AND (refreshing_at IS NULL OR refreshing_at < :staleBefore)
RETURNING id
```

Only one caller's update returns a row — **Postgres settles the race**. That caller talks to the provider; losers poll the row for up to 1.5 seconds and take the winner's result. A staleness window means a crashed lock-holder doesn't deadlock the session forever.

**The line that lands:** *"An in-memory mutex would have looked correct and been wrong, because it wouldn't survive more than one server process. Using the database as the coordination point is the thing I actually learned."*

---

## 5. OIDC integration (`server/`)

Written, type-checking, **not connected** — say that plainly before anyone finds it. The provider isn't live; the switch-over point is one file (`src/lib/session.tsx`).

Points worth claiming:

| Detail | Why it matters |
|---|---|
| **PKCE (S256) + `state` + `nonce`** | All minted server-side, parked in `auth_flows` |
| **Consuming the flow *is* the state validation** | `DELETE … RETURNING` — an unknown, expired or already-used value returns nothing, blocking CSRF and replay with one mechanism |
| **Audience checked on the ID token** | Skipping it would let a token minted for a sibling app log someone into ARTBANK |
| **Transport enforcement in `discovery.ts`** | The token endpoint uses HTTP Basic, so an `http://` URL there puts the client secret on the wire in clear text. Same-host HTTP is upgraded with a warning; a *different* host over HTTP is refused outright — indistinguishable from being redirected somewhere hostile |
| **Identity matched on `sub`, never email** | Email is changeable at the provider; matching on it would let a re-registered address inherit someone else's account |
| **Opaque session cookies** | The browser holds a random 32-byte id in an `httpOnly` cookie. The provider's tokens stay server-side and never reach client JavaScript |
| **Registration proxy returns the provider's vague message** | So it can't reveal whether an email is already registered |

---

## 6. Migration strategy — 25 migrations, all re-runnable

**Expand and contract.** Migration `0011` drops `price`, `currency`, `likes`, `verified` — but deliberately **keeps** `image_url`, marked deprecated with a Postgres column comment, because `artworksRepo.ts` still selected it and dropping it would have broken the homepage the moment the migration ran.

**Say:** *"Expand now, contract later once nothing reads it."*

**A documented reversal.** Migration `0019` puts back the price columns `0011` removed, and its header reads `⚠️ DELIBERATE REVERSAL, made on the project owner's instruction` — with what changed, what did *not* get reversed, and how to undo it.

**Say:** *"A changed requirement recorded as a changed requirement, not hidden as a silent edit."*

**Surviving a half-migrated database.** The schema is applied through the Supabase dashboard, so the deployed database can legitimately be a migration behind the code. `fetchProfileRow` tries three column sets in order — post-`0022`, post-`0021`, pre-`0021` — falling back on error.

**Say:** *"Without that, one missing column fails every profile read and locks the user out of their own signed-in session. Much worse than a profile missing its newest field."*

And `sendIntent` retries its insert without `viewer_role` if that column doesn't exist yet — *"losing a serious enquiry over a field the artist would like but doesn't need is the wrong trade."*

---

## 7. Data modelling decisions you should be able to defend

**`status` and `visibility` are separate axes on `artworks`.**
Status is how *finished* the record is (draft/published/archived). Visibility is *who may see it* (public/private/unlisted). Collapsing them makes "published but temporarily hidden" impossible — and that's exactly the state an artist wants when a piece is at a gallery.

**One row, two screens.**
The buyer's *My Enquiries* and the artist's *Interest Ledger* read the same `interest_entries` row from opposite ends — filtered by `viewer_id` versus `artist_id`. No sync step, no duplicated status column, no possibility of disagreement.

**Derived, never stored twice.**
Enquiry status is computed from the artist's `pipeline_stage` plus whether the artist actually replied. Interest bands, tab counts and the review checklist are all computed from source data.

**Ordering writes by importance, in the absence of transactions.**
PostgREST gives no transaction across statements, so `sendIntent` writes the interest entry **first** and the conversation second.

**Say:** *"I asked which partial failure is worse. A recorded enquiry with no thread beats a thread with no record. And it isn't hypothetical — the guardian trigger reliably refuses a conversation involving a minor, so if I'd ordered them the other way, guardian protection would have silently destroyed legitimate enquiries."*

---

## 8. PostgREST specifics — the non-obvious stuff

**Foreign-key hint disambiguation.** `conversations` references `users` twice (`artist_id`, `buyer_id`), so PostgREST refuses an ambiguous embed. You must name the constraint:

```ts
users!conversations_buyer_id_fkey(id, display_name, country, organization)
```

Same on `artworks` (`artist_id`/`uploaded_by`), `interest_entries` (`artist_id`/`viewer_id`), `artwork_deals` (`artist_id`/`buyer_id`).

**That's what makes the two-sided mailbox work.** One mapper serves both workspaces, with a `side` parameter picking which column is "me" and which FK hint is "them" — which is why the artist's and buyer's inboxes cannot drift apart.

**`.eq(col, null)` does not match nulls in SQL.** A general enquiry has `artwork_id: null`, so the thread lookup needs `.is('artwork_id', null)` — without which a second conversation opens every time.

**Counts without rows:** `{ count: 'exact', head: true }` returns a number and no data. Used for the anonymous-visitor count, so identity can't leak through a count query.

---

## 9. Type-driven design — with a real example

Every `CHECK`-constrained vocabulary in the database is modelled as a TypeScript string-literal union, so an invalid value is a **compile error** rather than a runtime constraint violation.

**The example that proves it works:** when I added `Purchased` and `Payment Due` to `EnquiryStatus`, the compiler immediately failed on `EnquiryList.tsx`:

```
error TS2739: Type '{ 'Awaiting Response'; 'In Conversation'; 'Viewing Room'; Closed; }'
is missing the following properties from type 'Record<EnquiryStatus, string>':
Purchased, "Payment Due"
```

**Say:** *"A `Record<Union, T>` map means adding a state to the union breaks every place that has to handle it. The compiler found the gap before a user did — that's the whole point of modelling the vocabulary rather than passing strings."*

`strict`, `noUnusedLocals`, `noUnusedParameters` and `noFallthroughCasesInSwitch` are all on. The project type-checks clean, frontend and server.

---

## 10. Bugs I found, and their root causes

Naming the root cause is what separates "I fixed it" from "I understood it."

| Bug | Root cause |
|---|---|
| **Every buyer landed in the artist workspace** | `WorkspaceHome` decided before the profile arrived. The `loading` flag only covered the identity check at *mount*, which has long since settled by the time someone signs in — so it read `profile: null`, indistinguishable from a failed read, and used the artist fallback |
| **Deleted demo data kept reappearing** | Four services treated `error \|\| data.length === 0` as one condition. A failed read and an empty result are different facts: the first means we can't see the data, the second is a real answer |
| **Earnings counted money that hadn't arrived** | An `awaiting_payment` deal was summing into the total. Now filtered on `status in ('agreed','paid')` |
| **A published-then-privated work stayed publicly readable** | Migration `0002`'s policy checked only `status`. `0017` added `visibility` as a second axis and didn't update the policy. The Discover feed filtered on it, but that was app-level and fetching by id bypassed it. Fixed in `0023` |
| **Deleting test accounts failed with a check violation** | `interest_entries.viewer_id` is `ON DELETE SET NULL`, and the identity CHECK refuses an identified row with no viewer. The cascade fires the constraint. Entries must be deleted before the accounts |
| **SQL scripts failing with `relation "_mine" does not exist`** | Supabase runs the SQL editor through a **transaction-mode pooler**, so consecutive statements can land on different connections. Temp tables are per-session and don't survive |

**One insight worth stating on its own:** *"On a SELECT, RLS is a filter, not a gate. A row that matches no policy isn't refused — it simply isn't in the result. That's why 'no rows' is ambiguous and has to be handled deliberately."*

---

## 11. Frontend engineering

- **Optimistic updates with revert** — the row changes first, persists after, and reverts with an explanation on failure. Used consistently for saves, status, availability, visibility and deletes.
- **Effect cancellation** — every async `useEffect` uses an `active` flag in its cleanup, so a fast route change can't write stale state into an unmounted screen.
- **URL as state** — search term in `?q=`, open thread in `?c=`, edit mode in `?edit=1`, auth side in the path. All shareable, all survive a refresh.
- **`Promise.allSettled` for bulk actions** — partial failure is reported as partial failure, so the count on screen is always the count that saved.
- **Provider and hook in separate files** — mixing a component and a hook in one module breaks React Fast Refresh.
- **Log out navigates first, signs out second** — flipping `isAuthenticated` while still on a guarded route lets `RequireAuth` win the race and redirect to `/login` instead of home.
- **Guarded delete** — an artwork can only be deleted while it has no interest, no opportunities and no recorded earnings. Storage paths are collected *before* the row cascade removes the rows that hold them.

---

## 12. Engineering ethics as a technical constraint

The brief's *"no fake statistics"* rule turned out to change the **schema**, not the copy. This is the most distinctive thing about the codebase.

- **Earnings return `null`, not `0`**, when no deal exists — *"nothing recorded is not the same claim as zero."* Sorting puts null last rather than treating it as zero.
- **Response rate was deleted** from the buyer's artist card, because computing it honestly would require reading other people's message threads, which RLS correctly refuses to hand over.
- **`opportunity_matches.why_text` is `NOT NULL`** — a match that can't explain itself can't exist as a row.
- **The unread count uses only `messages.read_at`**, because interest and opportunities have no read state in the schema and approximating from recency would be a fabricated number.
- **Where a feature couldn't be finished honestly, the interface says so on screen** — the Smart Link panel names which parts of itself aren't built; Viewing Rooms always says "Requested", never "Open".

**Say:** *"A prototype that quietly implies capabilities it doesn't have is worse than one that names its own edges."*

---

## 13. Weaknesses — name them before you're asked

Being able to list your own gaps is worth more than pretending there are none.

| Gap | The fix |
|---|---|
| **The public-profile read policy is row-level, not column-level** | It grants whole rows, so `email`, `role` and `is_minor` are readable by anyone with the anon key. The `is_minor` exposure is the serious one. Needs a column grant or a `SECURITY DEFINER` view. Migration `0021` documents this in its own comment |
| **`interest_entries.artist_id` isn't validated against the artwork** | A crafted request could file an enquiry into an arbitrary artist's ledger. One `WITH CHECK` subquery |
| **`artwork-images` upload policy has no path scoping** | Any authenticated user can write to any path in that bucket. The other two buckets get it right — it's an inconsistency, not a design position |
| **File type and size are enforced only in the browser** | Storage policies check bucket and path, not MIME type or size |
| **No transactions across statements** | Ordering limits the damage; an `rpc` Postgres function would make it atomic |
| **No rate limiting anywhere** | — |
| **Last-write-wins on the profile editor** | No version column, so two tabs editing a bio silently overwrite |
| **No automated tests** | RLS policies first — sign in as A, try to read B's ledger, assert zero rows. Then the pure validators in `artworkDraft.ts`, then the service mappers |

---

## 14. The numbers

| | |
|---|---|
| Working days | 9 (commits across 9 dates, 5–27 August) |
| Commits | 67 |
| Pages / components | 25 / 125 |
| TypeScript | ~24,400 lines |
| CSS | ~19,600 lines (132 modules, 77 with media queries) |
| Migrations / tables | 25 / 21 |
| RLS policies | 35+ |
| Storage buckets | 3 (two public, one private with 5-minute signed URLs) |
| Icons | 87, hand-drawn, no icon library |
| Type-check · lint · build | All clean, zero warnings |
| Tests | **None** |

---

## The five sentences to have ready

1. *"There's no application server in the live path — the browser talks straight to Postgres, so all authorization is Row Level Security."*
2. *"The buyer's enquiry and the artist's ledger entry are the same database row, read from opposite ends."*
3. *"An enquiry that claims to be identified but has nobody attached physically cannot be stored — that's a CHECK constraint, not a UI rule."*
4. *"No client may write `paid`. A browser can start a checkout; it can't be trusted to say the money arrived."*
5. *"If there's no recorded sale, it says 'No earnings', not '0' — those are different claims."*
