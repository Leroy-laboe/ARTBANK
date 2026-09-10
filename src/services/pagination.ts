/** One convention for how much a list read is allowed to pull.
 *
 *  Before this, 110 of the service layer's queries had no ceiling at all —
 *  they were ordered full-table reads scoped to one user. Nothing breaks in
 *  testing, because nothing breaks until somebody is successful: the artist
 *  with 800 works and the buyer with 2,000 saves are the first to feel it,
 *  and they are the last people who should.
 *
 *  The ceiling is deliberately generous. It is a backstop against a runaway
 *  row count hanging the tab, not a substitute for a paged UI — where a
 *  surface genuinely needs "Load more", it should ask for a page at a time
 *  using `range()` below. */
export const PAGE_SIZE = 50;

/** Messages embedded on a conversation. Separate from PAGE_SIZE because the
 *  cost profile is different: a mailbox read embeds this many rows *per
 *  conversation*, so the two multiply. Newest-first, since a thread opens at
 *  the bottom and older messages are the ones nobody scrolls back to. */
export const THREAD_PAGE_SIZE = 100;

/** What a capped read hit. `hasMore` is the part that matters: a list that
 *  silently stops at 50 is a bug, a list that says "showing the first 50 of
 *  more" is a feature. */
export type Paged<T> = {
  items: T[];
  hasMore: boolean;
};

/** Asks for one more row than requested, so "is there another page?" is
 *  answered by the same round-trip rather than a second count query. */
export function pageBounds(page = 0, size = PAGE_SIZE): { from: number; to: number } {
  const from = page * size;
  return { from, to: from + size };
}

/** Trims the probe row back off and reports whether it was there. */
export function toPaged<T>(rows: T[] | null, size = PAGE_SIZE): Paged<T> {
  const items = rows ?? [];
  return {
    items: items.length > size ? items.slice(0, size) : items,
    hasMore: items.length > size,
  };
}
