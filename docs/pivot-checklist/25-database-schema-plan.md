# 25. Database Schema Plan

> Not sourced from the PDF directly — this translates the concepts in files [09](09-my-works.md)–[24](24-feature-basic-tier-additions.md) into an actual Postgres/Supabase schema. Cross-references point back to the checklist file that justifies each field.
> Status: **planning only** — no migrations written yet. This is the "what should exist" document; turning it into `supabase/migrations/00XX_*.sql` is a separate, later step per table/domain.
> All four open questions from the first draft are now resolved — see each section below.

## Current state (as of migrations `0001`–`0006`)

| Table | Origin | Verdict |
|---|---|---|
| `public.artworks` | `0001`–`0005` | **Rework required** — built for the old marketplace/auction model |
| `public.users` | `0006` | **Mostly fine** — one enum needs to change |
| `public.sessions` | `0006` | Keep as-is (BFF session store, not content) |
| `public.auth_flows` | `0006` | Keep as-is (transient OIDC state, not content) |

---

## 1. `users` — modify

| Column | Action | Why |
|---|---|---|
| `role` enum `('collector','artist','gallery','admin')` | **CHANGE** → `('artist','buyer','guardian','partner','admin')` | Brief's roles are **Artist · Buyer · Guardian · Partner** ([06](06-functions-to-build-by-21-aug.md) item 2, [07](07-artspace-shell-and-navigation.md)) — `collector`/`gallery` don't match, so those get replaced. **`admin` stays** — confirmed: admin needs an account type of its own to upload artworks on behalf of people who don't have accounts yet (competition entries), via a dedicated admin page. See the finalist-rows resolution below. |
| — | **ADD** `country text` | Buyer Card requires Country ([13-buyer-card.md](13-buyer-card.md)) |
| — | **ADD** `organization text`, `collecting_interests text[]` | Buyer Card fields not covered by the base profile ([13-buyer-card.md](13-buyer-card.md)) |
| — | **ADD** `is_minor boolean not null default false` | Needed to trigger Guardian routing in Messages ([15-messages.md](15-messages.md)) |

- [ ] Migrate `role` to `('artist','buyer','guardian','partner','admin')`, remapping any existing `collector`→`buyer`, `gallery`→`partner` rows
- [ ] Add `country`, `organization`, `collecting_interests`, `is_minor`

### New table: `guardian_links`

Minors need a linked guardian account; a guardian may cover more than one minor.

```
guardian_links
  id               uuid pk
  guardian_user_id uuid references users(id)
  minor_user_id    uuid references users(id) unique   -- one guardian per minor, at a time
  relationship     text
  verified_at      timestamptz
  created_at       timestamptz default now()
```

- [ ] Create `guardian_links` — powers [06](06-functions-to-build-by-21-aug.md) item 11 ("Guardian-controlled minor account") and the Messages hard rule ([15-messages.md](15-messages.md))

---

## 2. `artworks` — heavy rework

This is almost certainly "the one table" you meant — it was built for a public marketplace with prices, likes and an unverified `verified` badge, all of which the brief explicitly kills ([17-do-not-build-guardrails.md](17-do-not-build-guardrails.md)).

### Columns to delete

| Column | Why |
|---|---|
| `likes` | Banned outright — "Likes and popularity leaderboard" is on the do-not-build list ([17](17-do-not-build-guardrails.md)); also [09-my-works.md](09-my-works.md) "DELETE — Likes shown on cards" |
| `gradient` | Placeholder-image fallback from the old card design; Add Artwork now requires real uploaded images ([10-add-artwork.md](10-add-artwork.md) step 1) |
| `verified` (boolean) | Replaced by the structured Passport/COA states — a bare true/false badge is exactly what [11-artwork-record-passport.md](11-artwork-record-passport.md) says to stop doing ("'Verified' badge without explanation → DELETE") |
| `artist` (free text) | Replace with a real FK now that accounts exist — see below |
| `price` / `currency` | **Removed entirely, not just made private.** Confirmed: price is never shown or set upfront — it's purely negotiated between artist and buyer inside the discussion/negotiation flow ([21-feature-private-viewing-room.md](21-feature-private-viewing-room.md)'s "Request Discussion", feeding `interest_entries.pipeline_stage = 'negotiation'`). There is no list price to store on the artwork itself. What *does* get recorded is the agreed outcome once a deal closes — see the new `artwork_deals` table below, which is what "recorded earnings" on Today ([08-today-dashboard.md](08-today-dashboard.md)) and the artwork's Earnings tab ([11-artwork-record-passport.md](11-artwork-record-passport.md)) actually read from. |

### Columns to change

| Column | Change | Why |
|---|---|---|
| `artist` (text) | → `artist_id uuid references users(id)`, **nullable** + new `uploaded_by uuid references users(id) not null` + new `artist_display_name text` | Real ownership via FK where an account exists. Nullable because of the finalist-rows case (below): admin can upload an artwork on behalf of someone with no account yet, storing their name in `artist_display_name` and recording `uploaded_by = <admin user id>`. Once/if that person creates an account, `artist_id` gets backfilled and `artist_display_name` becomes redundant (kept for historical display either way). |
| `status` enum `('draft','pending','published')` | → simplify to `('draft','published','archived')` for now | [09-my-works.md](09-my-works.md)'s Draft/Published/Private/Archived vs. [10-add-artwork.md](10-add-artwork.md)'s Public/Private/Unlisted visibility picker — **deferred**: these are dashboard-UI concerns, not urgent for the schema right now. Ship the minimal 3-state version; extend to a real `status`/`visibility` split later once the My Works and Add Artwork screens are actually being built and it's clear whether they're one field or two. |
| `image_url` (single) | → move to a separate `artwork_images` table | Add Artwork step 1 says "Upload artwork **images**" (plural); one column can't hold a gallery |

### Columns to add

| Column | Why |
|---|---|
| `year`, `medium`, `dimensions` | [10-add-artwork.md](10-add-artwork.md) step 2 |
| `description` text | [10-add-artwork.md](10-add-artwork.md) step 3 |
| `ownership_statement` text | [10-add-artwork.md](10-add-artwork.md) step 4 |
| `availability` enum `('available','reserved','sold','licensing_available')` | [09-my-works.md](09-my-works.md) |
| `rights_info` text | Rights and permitted uses — [10-add-artwork.md](10-add-artwork.md) step 6 |
| `coa_status` enum `('not_requested','pending_review','issued')` | [11-artwork-record-passport.md](11-artwork-record-passport.md) — "paid COA after defined evidence review" |
| `smart_link_slug` text unique | Permanent shareable URL — [19-feature-smart-artwork-link-qr.md](19-feature-smart-artwork-link-qr.md) (or just reuse `id` if it's already a friendly slug — it is, e.g. `art-1`) |

- [ ] Write the column changes above as one migration (simplified 3-value `status`, `artist_id` nullable, new `uploaded_by`/`artist_display_name`, `price`/`currency` dropped)
- [ ] Backfill the ~50 `finalist-*` rows from `0003`: set `artist_display_name` from the current `artist` text value, `uploaded_by` to a real admin user, and leave `artist_id` null until/unless that person registers

### New table: `artwork_images`

```
artwork_images
  id          uuid pk
  artwork_id  text references artworks(id)
  url         text not null
  position    int not null default 0
  is_primary  boolean not null default false
  created_at  timestamptz default now()
```

- [ ] Create `artwork_images`; backfill from the current `artworks.image_url` before dropping that column

### New table: `artwork_evidence_files`

Supporting files/evidence for the Passport (ownership proof, exhibition history docs, etc.) — [10-add-artwork.md](10-add-artwork.md) step 7, [18-feature-artwork-readiness-scan.md](18-feature-artwork-readiness-scan.md).

```
artwork_evidence_files
  id          uuid pk
  artwork_id  text references artworks(id)
  file_url    text not null
  file_type   text
  uploaded_at timestamptz default now()
```

- [ ] Create `artwork_evidence_files`

### New table: `artwork_history_events`

Append-only provenance log — [24-feature-basic-tier-additions.md](24-feature-basic-tier-additions.md) #8 (Artwork History Timeline), surfaced on the **History** tab in [11-artwork-record-passport.md](11-artwork-record-passport.md).

```
artwork_history_events
  id           uuid pk
  artwork_id   text references artworks(id)
  event_type   text check (event_type in ('upload','evidence','exhibition','enquiry','licence','sale'))
  description  text
  occurred_at  timestamptz default now()
```

- [ ] Create `artwork_history_events`

### New table: `artwork_link_visits`

Source-tracking for the Smart Artwork Link — [19-feature-smart-artwork-link-qr.md](19-feature-smart-artwork-link-qr.md) ("Silent Harmony received 27 visits from Instagram").

```
artwork_link_visits
  id          uuid pk
  artwork_id  text references artworks(id)
  viewer_id   uuid references users(id)   -- null until/unless the viewer identifies themselves
  source      text check (source in ('instagram','threads','rednote','qr','direct'))
  visited_at  timestamptz default now()
```

- [ ] Create `artwork_link_visits`

### On the Artwork Readiness Scan ([18](18-feature-artwork-readiness-scan.md))

No new column needed for the **Documented / Presentable / Trust-Ready / Commercially Ready** states themselves — recommend computing these in the app layer from which of the fields above are actually filled in, rather than storing a redundant status that can drift out of sync. Flag if the team disagrees and wants it persisted (e.g. for querying/filtering artists by readiness tier).

---

## 3. Interest & buyers

### New table: `interest_entries`

This single table covers both the **Interest Ledger** ([12-interest-ledger.md](12-interest-ledger.md)) and the **Buyer Intent Card** ([20-feature-buyer-intent-card.md](20-feature-buyer-intent-card.md)) — the intent card is just the form that fills a ledger entry's detail fields, so one table avoids duplicating buyer/artwork/purpose data across two places. Also carries the **Interest-to-Deal Progress** pipeline stage ([24](24-feature-basic-tier-additions.md) #7) rather than a separate table.

```
interest_entries
  id                      uuid pk
  artwork_id              text references artworks(id)
  viewer_id               uuid references users(id)     -- null = anonymous traffic
  is_identified           boolean not null default false
  purpose                 text check (purpose in ('purchase','licence','exhibit','commission','collaborate'))
  message                 text
  organization            text
  budget_range            text
  intended_use            text                           -- required when purpose = 'licence'
  decision_timeline       text
  identity_sharing_consent boolean not null default false
  source                  text                            -- Instagram, direct, etc.
  next_action             text check (next_action in ('reply','invite','qualify','decline','block'))
  pipeline_stage          text check (pipeline_stage in
                             ('viewer','enquiry','qualified','viewing_room','negotiation','completed'))
                           not null default 'viewer'
  created_at              timestamptz default now()
```

- [ ] Create `interest_entries`
- [ ] **Hard rule to enforce at the query/RLS level, not just the UI:** anonymous entries (`is_identified = false`) must never expose `viewer_id`/identity to the artist — see [12-interest-ledger.md](12-interest-ledger.md)'s "Never reveal anonymous viewers"

Buyer Card display fields ([13-buyer-card.md](13-buyer-card.md): Name, Photo/Logo, Role, Organization, Country, Verification, Collecting Interests, Purpose, Optional Budget, Previous Artbank Activity) are mostly satisfied by `users` (name/photo/role/country, plus the new `organization`/`collecting_interests` columns above) joined with a viewer's `interest_entries` history for "Previous Artbank Activity" and "Purpose"/"Budget" — no separate buyer-profile table needed unless the team wants buyer-specific fields that don't belong on the shared `users` row.

### New table: `artwork_deals`

Replaces the old `artworks.price`/`currency` columns. Nothing is priced upfront — a deal only gets recorded once artist and buyer actually agree on terms in the discussion room, closing out an `interest_entries` row. This is what "recorded earnings" (never estimated) on Today ([08-today-dashboard.md](08-today-dashboard.md)) and an artwork's Earnings tab ([11-artwork-record-passport.md](11-artwork-record-passport.md)) read from — "USD 0 recorded" on a fresh My Works card ([09-my-works.md](09-my-works.md)) just means no row exists here yet.

```
artwork_deals
  id                 uuid pk
  artwork_id         text references artworks(id)
  interest_entry_id  uuid references interest_entries(id)   -- the negotiation this closed out
  buyer_id           uuid references users(id)
  deal_type          text check (deal_type in ('sale','licence','commission'))
  amount             numeric not null
  currency           text not null default 'USD'
  agreed_at          timestamptz default now()
```

- [ ] Create `artwork_deals`
- [ ] When a deal is recorded, the linked `interest_entries.pipeline_stage` should move to `'completed'` — enforce in app logic (trigger optional, not required for v1)

### New table: `saved_artworks`

Buyer Save List — [24-feature-basic-tier-additions.md](24-feature-basic-tier-additions.md) #9.

```
saved_artworks
  buyer_user_id  uuid references users(id)
  artwork_id     text references artworks(id)
  saved_at       timestamptz default now()
  primary key (buyer_user_id, artwork_id)
```

- [ ] Create `saved_artworks`

---

## 4. Opportunities

New tables for [14-opportunities.md](14-opportunities.md):

```
opportunities
  id                uuid pk
  title             text not null
  organizer_name    text
  organizer_verified boolean not null default false
  deadline          date
  fee_amount        numeric
  fee_currency      text default 'USD'
  created_at        timestamptz default now()

opportunity_matches
  opportunity_id       uuid references opportunities(id)
  artist_id            uuid references users(id)
  match_strength        text check (match_strength in ('strong','medium','weak'))
  why_text              text
  missing_requirements  text[]
  primary key (opportunity_id, artist_id)

opportunity_applications
  id             uuid pk
  opportunity_id uuid references opportunities(id)
  artist_id      uuid references users(id)
  status         text check (status in ('draft','submitted')) not null default 'draft'
  approved_by    uuid references users(id)   -- self, or a guardian for a minor — [17] "artist or guardian approves submission"
  submitted_at   timestamptz
  created_at     timestamptz default now()
```

- [ ] Create `opportunities`, `opportunity_matches`, `opportunity_applications`
- [ ] **Hard rule:** `opportunity_applications` must never auto-transition to `submitted` without an explicit artist/guardian action — [14-opportunities.md](14-opportunities.md) "DELETE — Automatic submission"

---

## 5. Messages

New tables for [15-messages.md](15-messages.md):

```
conversations
  id              uuid pk
  artist_id       uuid references users(id)
  buyer_id        uuid references users(id)
  artwork_id      text references artworks(id)
  category        text check (category in
                     ('new_enquiry','purchase','licence','exhibition','commission','collaboration','support'))
  guardian_cc_id  uuid references users(id)   -- populated when either party is_minor
  created_at      timestamptz default now()

messages
  id               uuid pk
  conversation_id  uuid references conversations(id)
  sender_id        uuid references users(id)
  body             text not null
  created_at       timestamptz default now()
  read_at          timestamptz

conversation_flags
  id               uuid pk
  conversation_id  uuid references conversations(id)
  flagged_by       uuid references users(id)
  action           text check (action in ('report','block','archive'))
  reason           text
  created_at       timestamptz default now()
```

- [ ] Create `conversations`, `messages`, `conversation_flags`
- [ ] **Hard rule:** no personal email/phone in `messages.body` gets exposed outside Artbank — enforced at the app layer (this isn't something RLS alone can guarantee) — [15-messages.md](15-messages.md)
- [ ] **Hard rule:** if either `artist_id` or `buyer_id` resolves to a minor (`users.is_minor`), `guardian_cc_id` must be set from `guardian_links` before the conversation can be created — completion-test blocker in [00-overview-and-timeline.md](00-overview-and-timeline.md)

---

## 6. Private Viewing Rooms

New tables for [21-feature-private-viewing-room.md](21-feature-private-viewing-room.md):

```
viewing_rooms
  id                     uuid pk
  artist_id              uuid references users(id)
  title                  text
  private_notes          text
  price_visible          boolean not null default false
  download_allowed       boolean not null default false
  buyer_identity_required boolean not null default true
  expires_at             timestamptz
  created_at             timestamptz default now()

viewing_room_artworks
  viewing_room_id  uuid references viewing_rooms(id)
  artwork_id       text references artworks(id)
  primary key (viewing_room_id, artwork_id)

viewing_room_access_log
  id               uuid pk
  viewing_room_id  uuid references viewing_rooms(id)
  viewer_id        uuid references users(id)
  viewed_at        timestamptz default now()
```

- [ ] Create `viewing_rooms`, `viewing_room_artworks`, `viewing_room_access_log`
- [ ] **Scope reminder:** no video calls, payments or contract fields on these tables yet — [21-feature-private-viewing-room.md](21-feature-private-viewing-room.md) explicitly excludes them

---

## 7. Professional Artwork Pack

[23-feature-professional-artwork-pack.md](23-feature-professional-artwork-pack.md) is generated on-demand (mobile share page + PDF) from data that already exists elsewhere (`artworks`, `artwork_images`, `users`, `coa_status`) — **no dedicated table planned.** If usage analytics matter later, a lightweight `pack_generations (artwork_id, generated_at)` log could be added, but that's a nice-to-have, not a v1 requirement.

---

## Decisions log

1. **`users.role` enum** → `('artist','buyer','guardian','partner','admin')`. `admin` stays — needed for the admin-upload flow below.
2. **`artworks.status` vs. "visibility"** → deferred. Shipping a simplified 3-value `status` (`draft`/`published`/`archived`) for now; the fuller Draft/Published/Private/Archived vs. Public/Private/Unlisted question gets revisited once the My Works / Add Artwork screens are actually being designed, since it's a dashboard-UX call as much as a schema one.
3. **The ~50 `finalist-*` rows in `artworks`** → they don't have accounts and won't get individual ones. They're attributed to whichever admin uploads them (`uploaded_by`), with the entrant's name kept as `artist_display_name` since there's no `artist_id` to point to. This is the general pattern for **any** admin-run competition/bulk upload going forward, not just a one-time backfill — see the admin-upload flow below.
4. **Pricing** → never shown, never set upfront. `artworks.price`/`currency` are dropped entirely; agreed terms are recorded in the new `artwork_deals` table only once a negotiation actually closes.

## New operational requirement surfaced by decision 3: Admin Upload

The original PDF brief doesn't describe an admin role or an admin upload flow at all — this came up directly from you, not from the brief. Worth calling out explicitly since it's real scope: an **Admin page** where staff can create an `artworks` row on behalf of someone without an account yet (`artist_display_name` set, `artist_id` left null, `uploaded_by` = the admin), for cases like competition entries. This needs:
- [ ] An admin-only route, gated on `users.role = 'admin'`
- [ ] A way to later link an `artist_display_name` row to a real `artist_id` once that person registers (manual match at minimum; auto-match by email if the competition collected one)

Flag if you want this broken out into its own numbered checklist file alongside [09](09-my-works.md)–[24](24-feature-basic-tier-additions.md) rather than living here.

## Suggested migration order

1. `users` role enum change + new columns + `guardian_links`
2. `artworks` column drops/renames/adds — simplified `status`, `artist_id` nullable + `uploaded_by` + `artist_display_name`, `price`/`currency` dropped
3. `artwork_images` (+ backfill from `artworks.image_url`, then drop that column)
4. `artwork_evidence_files`, `artwork_history_events`, `artwork_link_visits`
5. `interest_entries`, `artwork_deals`, `saved_artworks`
6. `opportunities`, `opportunity_matches`, `opportunity_applications`
7. `conversations`, `messages`, `conversation_flags`
8. `viewing_rooms`, `viewing_room_artworks`, `viewing_room_access_log`
