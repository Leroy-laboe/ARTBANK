import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Recording what was agreed — the step that turns a negotiation into a
 *  number both sides can point at.
 *
 *  ARTBANK is not the counterparty. It takes no payment today, issues no
 *  contract and holds no escrow; automatic contracts are on the do-not-build
 *  list (docs/pivot-checklist/17-do-not-build-guardrails.md). What it does is
 *  keep the record of what two people settled on, and — once a gateway is
 *  connected — the record of whether the money moved.
 *
 *  Recording is one-sided by design. 0012's RLS lets only the artist insert
 *  (`artist_id = current_user_id()`), and both parties read it back. A buyer
 *  cannot record a sale of someone else's work.
 *
 *  Requires migrations 0012, 0015, 0024 and 0025. */

export type DealType = 'sale' | 'licence' | 'commission';

/** How the money moves. Kept apart from `status` because "paid in cash" and
 *  "paid by card" are the same outcome by different routes — and the offline
 *  route has to stay first-class, since most art still sells that way. */
export type PaymentRoute = 'offline' | 'request' | 'gateway';

export type DealStatus = 'agreed' | 'awaiting_payment' | 'paid' | 'cancelled' | 'refunded';

export const dealTypes: { id: DealType; label: string; hint: string }[] = [
  { id: 'sale', label: 'Sale', hint: 'Ownership of the work transfers to the buyer.' },
  { id: 'licence', label: 'Licence', hint: 'A permitted use was agreed. You keep the work.' },
  { id: 'commission', label: 'Commission', hint: 'New work agreed for this buyer.' },
];

export const paymentRoutes: { id: PaymentRoute; label: string; hint: string }[] = [
  {
    id: 'offline',
    label: 'Already settled',
    hint: 'They have paid. Record it and mark the work sold.',
  },
  {
    id: 'request',
    label: 'Request payment',
    hint: 'They get an amount to pay. You confirm when it lands.',
  },
  {
    id: 'gateway',
    label: 'Card payment',
    hint: 'Needs the payment service — not connected yet.',
  },
];

/** Payment methods a buyer can report having used. Deliberately short: this
 *  is context for the artist checking their account, not an accounting
 *  category. */
export const reportMethods: { id: string; label: string }[] = [
  { id: 'bank_transfer', label: 'Bank transfer' },
  { id: 'cash', label: 'Cash' },
  { id: 'other', label: 'Other' },
];

/** What a deal in this state means to a person, on each side.
 *
 *  Written out rather than derived, because the same status honestly reads
 *  differently depending on who is looking: "awaiting payment" is something
 *  the buyer must act on and something the artist is waiting for. */
export const dealStatusCopy: Record<
  DealStatus,
  { artist: string; buyer: string; tone: 'settled' | 'pending' | 'ended' }
> = {
  agreed: { artist: 'Agreed', buyer: 'Purchased', tone: 'settled' },
  awaiting_payment: { artist: 'Awaiting payment', buyer: 'Payment due', tone: 'pending' },
  paid: { artist: 'Paid', buyer: 'Paid', tone: 'settled' },
  cancelled: { artist: 'Cancelled', buyer: 'Cancelled', tone: 'ended' },
  refunded: { artist: 'Refunded', buyer: 'Refunded', tone: 'ended' },
};

/** The only two states that are money the artist actually has.
 *
 *  An `awaiting_payment` deal is a promise, and counting it as an earning
 *  would be exactly the invented figure the brief bans. Every earnings total
 *  in the app filters on this. */
export const SETTLED_STATUSES: DealStatus[] = ['agreed', 'paid'];

export function isSettled(status: string): boolean {
  return (SETTLED_STATUSES as string[]).includes(status);
}

export type RecordSaleInput = {
  artworkId: string;
  /** The other party. Null when the agreement was reached off-platform and
   *  there is no ArtBank account to attach it to. */
  buyerId: string | null;
  dealType: DealType;
  amount: number;
  currency: string;
  /** ISO date (yyyy-mm-dd) from the form's date field. */
  agreedAt: string;
  /** `offline` records a deal already settled. `request` opens one the buyer
   *  must pay and the artist confirms. `gateway` opens one only a verified
   *  webhook can ever mark paid. */
  paymentRoute: PaymentRoute;
};

export type RecordSaleResult = {
  status: DealStatus;
  /** The availability the artwork was moved to, if any. */
  availability: 'sold' | 'reserved' | null;
  /** True when a matching enquiry was advanced in the interest ledger. */
  movedEnquiry: boolean;
};

/** Finds the enquiry this agreement came out of, so the deal can point back at
 *  it and the ledger entry can be moved on.
 *
 *  Best-effort by design: a deal agreed outside ArtBank has no enquiry behind
 *  it, and that is a normal case rather than an error. */
async function findInterestEntry(
  profile: Profile,
  artworkId: string,
  buyerId: string | null,
): Promise<string | null> {
  const client = supabase;
  if (!client || !buyerId) return null;

  const { data } = await client
    .from('interest_entries')
    .select('id')
    .eq('artist_id', profile.id)
    .eq('artwork_id', artworkId)
    .eq('viewer_id', buyerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data as { id: string } | null)?.id ?? null;
}

/**
 * Records a deal against an artwork.
 *
 * Four writes, in a deliberate order, because PostgREST gives us no
 * transaction across them: the deal row goes first because it is the only one
 * that cannot be reconstructed afterwards. Everything below it is a
 * consequence the artist could set by hand if it failed — availability is a
 * menu item, the ledger stage is cosmetic on the artist's own screen, and a
 * missing history line is a gap rather than a wrong number.
 *
 * The route decides the starting state, and that decides everything
 * downstream. An offline deal is settled the moment it is recorded, so the
 * work is sold and the enquiry is done. A gateway deal is a promise: the work
 * is only *reserved*, the enquiry moves to negotiation rather than completed,
 * and nothing counts as an earning until a verified webhook says the money
 * arrived.
 *
 * Throws only if the deal itself fails. The rest report back instead, so the
 * caller can tell the artist what did and did not land.
 */
export async function recordSale(
  profile: Profile,
  input: RecordSaleInput,
): Promise<RecordSaleResult> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be recorded yet.');

  // Only 'offline' means already settled. Both of the other routes are asking
  // for money that has not arrived yet.
  const status: DealStatus =
    input.paymentRoute === 'offline' ? 'agreed' : 'awaiting_payment';
  const settled = isSettled(status);

  const interestEntryId = await findInterestEntry(profile, input.artworkId, input.buyerId);

  // 1. The deal. If this throws, nothing else should have happened.
  const { error } = await client.from('artwork_deals').insert({
    artwork_id: input.artworkId,
    interest_entry_id: interestEntryId,
    artist_id: profile.id,
    buyer_id: input.buyerId,
    deal_type: input.dealType,
    amount: input.amount,
    currency: input.currency,
    status,
    payment_route: input.paymentRoute,
    // Only an offline deal is settled on the spot. A gateway one stays null
    // until the webhook fills it in.
    settled_at: settled ? new Date().toISOString() : null,
    // The form collects a date; the column is a timestamp. Noon avoids a
    // same-day record sliding into the previous day in a western timezone.
    agreed_at: new Date(`${input.agreedAt}T12:00:00`).toISOString(),
  });

  if (error) throw error;

  // 2. Availability. A settled sale takes the work off the market; one
  //    awaiting payment only holds it, because the money has not arrived and
  //    calling that sold would be a claim the database cannot back. A licence
  //    or commission touches neither — the artist still holds the piece.
  let availability: RecordSaleResult['availability'] = null;
  if (input.dealType === 'sale') {
    const next = settled ? 'sold' : 'reserved';
    const { error: availError } = await client
      .from('artworks')
      .update({ availability: next, updated_at: new Date().toISOString() })
      .eq('id', input.artworkId);
    if (!availError) availability = next;
  }

  // 3. Move the enquiry it came from. Both sides read the same row, so one
  //    update settles what the artist and the buyer each see.
  let movedEnquiry = false;
  if (interestEntryId) {
    const { error: stageError } = await client
      .from('interest_entries')
      .update({ pipeline_stage: settled ? 'completed' : 'negotiation' })
      .eq('id', interestEntryId);
    movedEnquiry = !stageError;
  }

  // 4. Provenance. Append-only by design — 0015 gives this table no update or
  //    delete policy, so what is written here is permanent.
  const label = dealTypes.find((d) => d.id === input.dealType)?.label ?? 'Deal';
  const money = `${input.currency} ${input.amount.toLocaleString('en-US')}`;
  await client.from('artwork_history_events').insert({
    artwork_id: input.artworkId,
    event_type: 'sale',
    description: settled ? `${label} agreed — ${money}.` : `${label} opened — ${money}, awaiting payment.`,
  });

  return { status, availability, movedEnquiry };
}

/* ── Reading deals back ──────────────────────────────────────────────────── */

export type DealSummary = {
  id: string;
  artworkId: string | null;
  artworkTitle: string | null;
  artworkImageUrl: string | null;
  dealType: DealType;
  amount: number;
  currency: string;
  status: DealStatus;
  paymentRoute: PaymentRoute;
  agreedAt: string;
  settledAt: string | null;
  /** When the buyer said they had sent it, if they have. A claim, not a
   *  payment — the deal is only settled once the artist confirms. */
  reportedAt: string | null;
  reportReference: string | null;
  reportMethod: string | null;
  /** The other party, from whichever side is asking. */
  counterpartName: string | null;
  counterpartHandle: string | null;
};

/* Two FK hints, because artwork_deals points at users twice. */
const DEAL_SELECT = `
  id, artwork_id, deal_type, amount, currency, status, payment_route, agreed_at, settled_at,
  artworks(title, image_url, artwork_images(url, is_primary)),
  artist:users!artwork_deals_artist_id_fkey(display_name, artist_name, profile_handle),
  buyer:users!artwork_deals_buyer_id_fkey(display_name, artist_name, profile_handle),
  payment_reports(reported_at, reference, method)
`;

type PartyRow = {
  display_name: string | null;
  artist_name: string | null;
  profile_handle: string | null;
} | null;

type DealRow = {
  id: string;
  artwork_id: string | null;
  deal_type: string;
  amount: number | string;
  currency: string;
  status: string;
  payment_route: string;
  agreed_at: string;
  settled_at: string | null;
  artworks: {
    title: string;
    image_url: string | null;
    artwork_images: { url: string; is_primary: boolean }[] | null;
  } | null;
  artist: PartyRow;
  buyer: PartyRow;
  payment_reports: { reported_at: string; reference: string | null; method: string }[] | null;
};

function partyName(party: PartyRow): string | null {
  return party?.artist_name?.trim() || party?.display_name?.trim() || null;
}

function toSummary(row: DealRow, side: 'artist' | 'buyer'): DealSummary {
  // Whichever side is asking, "counterpart" is the other one.
  const other = side === 'artist' ? row.buyer : row.artist;
  const images = row.artworks?.artwork_images ?? [];

  const latest = [...(row.payment_reports ?? [])].sort(
    (a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime(),
  )[0];

  return {
    id: row.id,
    artworkId: row.artwork_id,
    artworkTitle: row.artworks?.title ?? null,
    artworkImageUrl:
      images.find((i) => i.is_primary)?.url ?? images[0]?.url ?? row.artworks?.image_url ?? null,
    dealType: (row.deal_type as DealType) ?? 'sale',
    amount: Number(row.amount),
    currency: row.currency,
    status: (row.status as DealStatus) ?? 'agreed',
    paymentRoute: (row.payment_route as PaymentRoute) ?? 'offline',
    agreedAt: row.agreed_at,
    settledAt: row.settled_at,
    // Newest report wins — a buyer who reports twice has corrected
    // themselves, and the later statement is the one to show.
    reportedAt: latest?.reported_at ?? null,
    reportReference: latest?.reference ?? null,
    reportMethod: latest?.method ?? null,
    counterpartName: partyName(other),
    counterpartHandle: other?.profile_handle ?? null,
  };
}

/** The most recent deal on an artwork that the caller is a party to.
 *
 *  No ownership filter is needed: 0012's read policy already restricts this
 *  table to the artist and the buyer, so a stranger asking about the same
 *  artwork gets nothing back rather than someone else's price. */
export async function getArtworkDeal(
  artworkId: string,
  side: 'artist' | 'buyer',
): Promise<DealSummary | null> {
  const client = supabase;
  if (!client || !artworkId) return null;

  const { data, error } = await client
    .from('artwork_deals')
    .select(DEAL_SELECT)
    .eq('artwork_id', artworkId)
    .order('agreed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return toSummary(data as unknown as DealRow, side);
}

/** Everything this buyer has bought, or owes on.
 *
 *  Cancelled deals are included on purpose: a buyer who was told a purchase
 *  existed should be able to see that it was called off, rather than have the
 *  row quietly vanish. */
export async function listMyPurchases(profile: Profile | null): Promise<DealSummary[]> {
  const client = supabase;
  if (!client || !profile) return [];

  const { data, error } = await client
    .from('artwork_deals')
    .select(DEAL_SELECT)
    .eq('buyer_id', profile.id)
    .order('agreed_at', { ascending: false });

  if (error || !data) return [];
  return (data as unknown as DealRow[]).map((row) => toSummary(row, 'buyer'));
}

/** The same list from the selling side — every deal this artist has agreed.
 *
 *  Returns null on a failed read so callers can tell "cannot see the deals"
 *  apart from "has no deals". An empty array is a real answer; null is not,
 *  and the dashboard shows different things for each. */
export async function listMyDeals(profile: Profile | null): Promise<DealSummary[] | null> {
  const client = supabase;
  if (!client || !profile) return null;

  const { data, error } = await client
    .from('artwork_deals')
    .select(DEAL_SELECT)
    .eq('artist_id', profile.id)
    .order('agreed_at', { ascending: false });

  if (error || !data) return null;
  return (data as unknown as DealRow[]).map((row) => toSummary(row, 'artist'));
}

/* ── The payment handshake ───────────────────────────────────────────────── */

/** The buyer saying "I have sent this."
 *
 *  A claim filed beside the deal, not a change to it — the buyer has no write
 *  access to artwork_deals at all, and 0025 explains why that separation
 *  matters (RLS grants whole rows, so an update permission would also let
 *  them rewrite the amount).
 *
 *  Nothing about the deal moves here. The artist confirming is what settles
 *  it, and until then every screen says "reported", never "paid". */
export async function reportPayment(
  profile: Profile,
  dealId: string,
  input: { method: string; reference: string | null; note: string | null },
): Promise<void> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be sent yet.');

  const { error } = await client.from('payment_reports').insert({
    deal_id: dealId,
    reported_by: profile.id,
    method: input.method,
    reference: input.reference,
    note: input.note,
  });

  if (error) throw error;
}

export type ConfirmPaymentResult = { markedSold: boolean; closedEnquiry: boolean };

/** The minimum a deal has to carry to be confirmed. Structural rather than
 *  tied to DealSummary, so the artwork record's Earnings tab — which reads a
 *  different shape — can call this without a conversion. */
export type ConfirmableDeal = {
  id: string;
  artworkId: string | null;
  dealType: string;
  amount: number;
  currency: string;
};

/** The artist saying "it arrived", which is what actually settles the deal.
 *
 *  Permitted only for the `request` route. 0025's policy refuses `paid` on a
 *  gateway deal from any client — that is a claim about a provider's system
 *  and only a verified webhook may make it. This is a claim about the
 *  artist's own bank account, which is theirs to make.
 *
 *  Same ordering rule as recordSale: the money first, consequences after. */
export async function confirmPayment(
  profile: Profile,
  deal: ConfirmableDeal,
): Promise<ConfirmPaymentResult> {
  const client = supabase;
  if (!client) throw new Error('No database is configured, so this cannot be confirmed yet.');

  const now = new Date().toISOString();

  const { error } = await client
    .from('artwork_deals')
    .update({ status: 'paid', settled_at: now })
    .eq('id', deal.id)
    .eq('artist_id', profile.id);

  if (error) throw error;

  // The work was only reserved while the money was outstanding. Now it sold.
  let markedSold = false;
  if (deal.dealType === 'sale' && deal.artworkId) {
    const { error: soldError } = await client
      .from('artworks')
      .update({ availability: 'sold', updated_at: now })
      .eq('id', deal.artworkId);
    markedSold = !soldError;
  }

  // And the enquiry that started it is finished.
  let closedEnquiry = false;
  if (deal.artworkId) {
    const { error: stageError } = await client
      .from('interest_entries')
      .update({ pipeline_stage: 'completed' })
      .eq('artist_id', profile.id)
      .eq('artwork_id', deal.artworkId);
    closedEnquiry = !stageError;
  }

  await client.from('artwork_history_events').insert({
    artwork_id: deal.artworkId,
    event_type: 'sale',
    description: `Payment received — ${deal.currency} ${deal.amount.toLocaleString('en-US')}.`,
  });

  return { markedSold, closedEnquiry };
}

/** People who have enquired about this artwork, for the buyer picker.
 *
 *  Reached from My Works, where a deal is recorded without a conversation in
 *  hand. Without this the artist could only record a sale to "not on ArtBank",
 *  which makes a payment request impossible — there would be nobody to request
 *  from. Identified enquirers only; an anonymous row has no one to name. */
export type Enquirer = { id: string; name: string };

export async function listEnquirers(profile: Profile, artworkId: string): Promise<Enquirer[]> {
  const client = supabase;
  if (!client) return [];

  const { data, error } = await client
    .from('interest_entries')
    .select('viewer_id, users!interest_entries_viewer_id_fkey(display_name, artist_name)')
    .eq('artist_id', profile.id)
    .eq('artwork_id', artworkId)
    .eq('is_identified', true)
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  type Row = {
    viewer_id: string | null;
    users: { display_name: string | null; artist_name: string | null } | null;
  };

  // One entry per person, even when they enquired more than once.
  const seen = new Map<string, string>();
  for (const row of data as unknown as Row[]) {
    if (!row.viewer_id || seen.has(row.viewer_id)) continue;
    seen.set(
      row.viewer_id,
      row.users?.artist_name?.trim() || row.users?.display_name?.trim() || 'Identified buyer',
    );
  }

  return [...seen.entries()].map(([id, name]) => ({ id, name }));
}

/** Turns a failed write into something the artist can act on, rather than a
 *  bare "could not save". Mirrors the pattern in services/profile.ts. */
export function describeDealError(err: unknown): string {
  const raw = err as { message?: string; code?: string } | null;
  const message = raw?.message ?? '';

  if (raw?.code === '42P01' || raw?.code === '42703' || /does not exist/i.test(message)) {
    return `The database is missing something this needs — ${message}. Run the outstanding migrations in supabase/migrations.`;
  }
  if (raw?.code === '42501' || /row-level security/i.test(message)) {
    return 'The database refused this. A deal can only be recorded by the artist who owns the artwork.';
  }
  if (/violates check constraint/i.test(message)) {
    return `A value was rejected by the database: ${message}`;
  }
  return message || 'Could not record this deal. Check your connection and try again.';
}
