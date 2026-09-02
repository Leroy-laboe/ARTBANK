import { listMyWorks } from './artwork';
import { loadInterest } from './interest';
import { loadOpportunities } from './opportunities';
import { isSettled, listMyDeals, type DealSummary } from './deals';
import type { Work } from '../data/artspaceWorks';
import type { Enquiry } from '../data/artspaceInterest';
import type { Opportunity } from '../data/artspaceOpportunities';
import type { Profile } from '../types/user';
import type { IconName } from '../components/ui/Icon';
import {
  artworksAtWork as demoArtworksAtWork,
  bestOpportunity as demoBestOpportunity,
  moneyAndRights as demoMoney,
  needsDecision as demoNeedsDecision,
  professionalReadiness as demoReadiness,
  realInterest as demoRealInterest,
  type ArtworkAtWork,
  type DecisionItem,
  type InterestItem,
  type WorkStatus,
} from '../data/artspaceContent';

/** Today — the dashboard an artist lands on after signing in.
 *
 *  Every figure below is read or counted, never estimated. The rule the rest
 *  of the app follows applies here too: a read that FAILED and a table that is
 *  EMPTY are different answers. A failure stands in demo content (`isDemo`),
 *  because a fresh clone with no Supabase project behind it should still
 *  render. An artist who genuinely has nothing gets real zeros and the empty
 *  states that go with them — telling them they have interest, earnings or
 *  matches they do not have is the one thing this screen must never do. */

const MONEY = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

function money(amount: number, currency: string): string {
  return `${currency} ${MONEY.format(Math.round(amount))}`;
}

function txnNote(count: number): string {
  if (count === 0) return 'Nothing recorded yet';
  return `From ${count} transaction${count === 1 ? '' : 's'}`;
}

/** "May 8, 2025" → "May 8". The panel's date column is deliberately terse. */
function shortDate(updated: string): string {
  return updated.split(',')[0] ?? updated;
}

/* ── 1. Needs Your Decision ──────────────────────────────────────────────── */

/** Capped at three by the spec, and ordered by what it costs to ignore:
 *  money the artist is holding up, then someone waiting on a reply, then
 *  their own records being incomplete. */
function buildNeedsDecision(
  works: Work[],
  enquiries: Enquiry[],
  deals: DealSummary[] | null,
): DecisionItem[] {
  const items: DecisionItem[] = [];

  // A buyer has said they paid and the artist has not confirmed it. Until they
  // do, the sale is not settled and the money is not counted.
  for (const deal of deals ?? []) {
    if (deal.status === 'awaiting_payment' && deal.reportedAt) {
      items.push({
        id: `deal-${deal.id}`,
        icon: 'handshake',
        title: 'Payment reported',
        context: deal.artworkTitle ?? 'Recorded sale',
        meta: `${deal.counterpartName ?? 'The buyer'} says they have sent ${money(deal.amount, deal.currency)}`,
        action: 'Confirm',
      });
    }
  }

  for (const enquiry of enquiries) {
    if (enquiry.status === 'Replied') continue;
    items.push({
      id: `enquiry-${enquiry.id}`,
      icon: 'message',
      title: `${enquiry.purposeLabel} enquiry`,
      context: enquiry.artwork,
      meta: `${enquiry.name} · ${enquiry.time}`,
      action: 'Reply',
    });
  }

  // Missing facts on a published work — the record is public and incomplete.
  for (const work of works) {
    if (work.status !== 'Published') continue;
    const missing = [
      work.dimensions === '—' && 'dimensions',
      work.medium === '—' && 'medium',
    ].filter(Boolean) as string[];

    if (missing.length > 0) {
      items.push({
        id: `work-${work.id}`,
        icon: 'pencil',
        title: 'Artwork information',
        context: work.title,
        meta: `Missing ${missing.join(' and ')}`,
        action: 'Complete',
      });
    }
  }

  return items.slice(0, 3);
}

/* ── 2. Real Interest ────────────────────────────────────────────────────── */

function buildRealInterest(enquiries: Enquiry[]): InterestItem[] {
  return enquiries.slice(0, 3).map((enquiry) => ({
    id: enquiry.id,
    name: enquiry.name,
    detail: `${enquiry.purposeLabel} · ${enquiry.artwork}`,
    // Purpose is what the person asked for, which is the only interest signal
    // the ledger actually holds. Nothing here is inferred from behaviour.
    level: enquiry.purpose === 'Purchase' || enquiry.purpose === 'Commission' ? 'High' : 'Medium',
    time: enquiry.time,
    monogram: enquiry.monogram,
    tone: enquiry.tone,
  }));
}

/* ── 3. Artworks at Work ─────────────────────────────────────────────────── */

function workStatus(work: Work, negotiating: Set<string>): WorkStatus {
  if (negotiating.has(work.id)) return 'Negotiation';
  if (work.availability === 'On View') return 'On View';
  if (work.status === 'Draft') return 'In Progress';
  return 'On View';
}

function buildArtworksAtWork(works: Work[], deals: DealSummary[] | null): ArtworkAtWork[] {
  // A deal that is agreed but not yet settled is the work being negotiated.
  const negotiating = new Set(
    (deals ?? [])
      .filter((d) => d.status === 'awaiting_payment' || d.status === 'agreed')
      .map((d) => d.artworkId)
      .filter((id): id is string => Boolean(id)),
  );

  return works
    .filter((work) => work.status !== 'Archived')
    .slice(0, 3)
    .map((work) => ({
      id: work.id,
      title: work.title,
      detail: [work.medium, work.year].filter((v) => v && v !== '—').join(' · ') || 'No details yet',
      status: workStatus(work, negotiating),
      date: shortDate(work.updated),
      imageUrl: work.imageUrl,
    }));
}

/* ── 4. Best Opportunity ─────────────────────────────────────────────────── */

export type BestOpportunity = {
  badge: string;
  title: string;
  summary: string;
  imageUrl: string;
  facts: { icon: IconName; label: string; value: string }[];
  action: string;
  to: string;
};

function buildBestOpportunity(opportunities: Opportunity[]): BestOpportunity | null {
  const best = opportunities[0];
  if (!best) return null;

  return {
    badge: `${best.match} Match`,
    title: best.title,
    summary: best.summary,
    imageUrl: best.imageUrl,
    facts: [
      { icon: 'credit-card', label: 'Budget', value: best.budget },
      { icon: 'image', label: 'Medium', value: best.medium },
      { icon: 'calendar', label: 'Deadline', value: best.deadline },
    ],
    action: 'View Opportunity',
    to: '/artspace/opportunities',
  };
}

/* ── 5. Money and Rights ─────────────────────────────────────────────────── */

export type MoneyAndRights = {
  earnings: { id: string; icon: IconName; label: string; value: string; note: string }[];
  rights: { id: string; label: string; value: string; note: string }[];
  imageUrl: string;
};

function buildMoney(works: Work[], deals: DealSummary[], imageUrl: string): MoneyAndRights {
  // Settled only. An awaiting_payment deal is a promise, and the whole point
  // of the payment handshake is that a promise is not an earning.
  const settled = deals.filter((d) => isSettled(d.status));
  const pending = deals.filter((d) => d.status === 'awaiting_payment');

  const currency = deals[0]?.currency ?? 'USD';
  const sum = (list: DealSummary[]) => list.reduce((total, d) => total + d.amount, 0);

  const licences = settled.filter((d) => d.dealType === 'licence').length;
  const protectedWorks = works.filter((w) => w.passport === 'Verified').length;

  return {
    earnings: [
      {
        id: 'completed',
        icon: 'bank',
        label: 'Completed Earnings',
        value: money(sum(settled), currency),
        note: txnNote(settled.length),
      },
      {
        id: 'pending',
        icon: 'hourglass',
        label: 'Pending Earnings',
        value: money(sum(pending), currency),
        note: txnNote(pending.length),
      },
    ],
    rights: [
      {
        id: 'licences',
        label: 'Active Licences',
        value: String(licences),
        note: licences === 1 ? 'On-going licence' : 'On-going licences',
      },
      {
        id: 'protected',
        label: 'Rights Protected',
        value: String(protectedWorks),
        // Only works whose certificate has actually been issued count. A
        // request sitting in review is not protection.
        note: 'Certificate issued',
      },
    ],
    imageUrl,
  };
}

/* ── 6. Professional Readiness ───────────────────────────────────────────── */

export type Readiness = {
  score: number;
  verdict: string;
  note: string;
  tasks: { id: string; icon: IconName; title: string; detail: string; progress: number }[];
};

/** Nothing done out of nothing is 0%, not 100%. An artist who has not added a
 *  work yet has not completed their artwork records — saying they have would
 *  be the same invented figure this screen exists to remove. */
function pct(done: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((done / total) * 100);
}

function verdictFor(score: number): { verdict: string; note: string } {
  if (score >= 80) return { verdict: 'Strong', note: 'Keep building your professional presence.' };
  if (score >= 50) return { verdict: 'Building', note: 'A few more details will open more doors.' };
  return { verdict: 'Getting started', note: 'Complete your records to be taken seriously.' };
}

/** Private to the artist, and only ever a list of what to finish next. There
 *  is no public ranking anywhere on ArtBank — see
 *  docs/pivot-checklist/17-do-not-build-guardrails.md. */
function buildReadiness(works: Work[], profile: Profile): Readiness {
  const withDimensions = works.filter((w) => w.dimensions !== '—').length;
  const withPassport = works.filter((w) => w.passport === 'Verified').length;
  const bioFields = [profile.shortBio, profile.artistStatement, profile.website, profile.education];
  const bioDone = bioFields.filter((v) => Boolean(v && String(v).trim())).length;

  const dimensionsPct = pct(withDimensions, works.length);
  const passportPct = pct(withPassport, works.length);
  const bioPct = pct(bioDone, bioFields.length);

  const missingDimensions = works.length - withDimensions;
  const missingPassport = works.length - withPassport;

  const noWorks = works.length === 0;

  const tasks: Readiness['tasks'] = [
    {
      id: 'dimensions',
      icon: 'image',
      title: noWorks
        ? 'Add your first artwork'
        : missingDimensions === 0
          ? 'Artwork information complete'
          : `Add dimensions to ${missingDimensions} artwork${missingDimensions === 1 ? '' : 's'}`,
      detail: 'Complete artwork information',
      progress: dimensionsPct,
    },
    {
      id: 'provenance',
      icon: 'shield-check',
      title: noWorks
        ? 'Certificates start with an artwork'
        : missingPassport === 0
          ? 'Every artwork has a certificate'
          : `Add provenance for ${missingPassport} artwork${missingPassport === 1 ? '' : 's'}`,
      detail: 'Strengthen your verification',
      progress: passportPct,
    },
    {
      id: 'biography',
      icon: 'user',
      title: bioDone === bioFields.length ? 'Your biography is complete' : 'Complete your biography',
      detail: 'Build trust with your story',
      progress: bioPct,
    },
  ];

  const score = Math.round((dimensionsPct + passportPct + bioPct) / 3);

  return { score, ...verdictFor(score), tasks };
}

/* ── The screen ──────────────────────────────────────────────────────────── */

export type DashboardResult = {
  needsDecision: DecisionItem[];
  realInterest: InterestItem[];
  artworksAtWork: ArtworkAtWork[];
  bestOpportunity: BestOpportunity | null;
  money: MoneyAndRights;
  readiness: Readiness;
  /** True when any part of this fell back to sample content. The screen says
   *  so rather than passing demo figures off as the artist's own. */
  isDemo: boolean;
};

export async function loadDashboard(profile: Profile | null): Promise<DashboardResult> {
  if (!profile) return demoDashboard();

  const [worksResult, interestResult, opportunitiesResult, deals] = await Promise.all([
    listMyWorks(profile),
    loadInterest(profile),
    loadOpportunities(profile),
    listMyDeals(profile),
  ]);

  // Any source falling back means the numbers on this screen are not the
  // artist's own, and the whole screen has to say so.
  const isDemo =
    worksResult.isDemo || interestResult.isDemo || opportunitiesResult.isDemo || deals === null;

  if (isDemo) return demoDashboard();

  const works = worksResult.works;

  return {
    needsDecision: buildNeedsDecision(works, interestResult.enquiries, deals),
    realInterest: buildRealInterest(interestResult.enquiries),
    artworksAtWork: buildArtworksAtWork(works, deals),
    bestOpportunity: buildBestOpportunity(opportunitiesResult.opportunities),
    money: buildMoney(works, deals ?? [], demoMoney.imageUrl),
    readiness: buildReadiness(works, profile),
    isDemo: false,
  };
}

function demoDashboard(): DashboardResult {
  return {
    needsDecision: demoNeedsDecision,
    realInterest: demoRealInterest,
    artworksAtWork: demoArtworksAtWork,
    bestOpportunity: { ...demoBestOpportunity, to: '/artspace/opportunities' },
    money: demoMoney,
    readiness: demoReadiness,
    isDemo: true,
  };
}
