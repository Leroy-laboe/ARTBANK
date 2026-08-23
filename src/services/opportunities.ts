import { supabase } from '../lib/supabaseClient';
import {
  opportunities as demoOpportunities,
  type MatchStrength,
  type Opportunity,
  type OpportunityStage,
} from '../data/artspaceOpportunities';
import type { Profile } from '../types/user';

/** Reads opportunities matched to the signed-in artist. Requires migrations
 *  0013 and 0016.
 *
 *  Every row carries `why_text` because the brief forbids unexplained
 *  recommendations, and `missing_requirements` so the artist can see what
 *  still blocks them from applying. */

type MatchRow = {
  match_strength: string;
  match_score: number | null;
  why_text: string;
  missing_requirements: string[] | null;
  artwork_id: string | null;
  opportunities: {
    id: string;
    title: string;
    organizer_name: string | null;
    organizer_verified: boolean;
    location: string | null;
    summary: string | null;
    category: string | null;
    medium: string | null;
    deadline: string | null;
    budget_min: number | null;
    budget_max: number | null;
    budget_currency: string;
    fee_amount: number | null;
    fee_currency: string;
  } | null;
  applications: { status: string }[] | null;
};

const SELECT = `
  match_strength, match_score, why_text, missing_requirements, artwork_id,
  opportunities(
    id, title, organizer_name, organizer_verified, location, summary, category, medium,
    deadline, budget_min, budget_max, budget_currency, fee_amount, fee_currency
  )
`;

const strengthLabel: Record<string, MatchStrength> = {
  strong: 'Strong',
  good: 'Good',
  partial: 'Partial',
  weak: 'Weak',
};

function budgetText(o: NonNullable<MatchRow['opportunities']>): string {
  const fmt = (n: number) => n.toLocaleString('en-US');
  if (o.budget_min && o.budget_max && o.budget_min !== o.budget_max) {
    return `${o.budget_currency} ${fmt(o.budget_min)} - ${fmt(o.budget_max)}`;
  }
  if (o.budget_min) return `${o.budget_currency} ${fmt(o.budget_min)}`;
  return 'On Request';
}

/** Where the artist stands. A weak match is surfaced honestly as a poor fit
 *  rather than padded into looking like a live prospect. */
function stageFor(row: MatchRow): { stage: OpportunityStage; note: string } {
  const applied = row.applications?.[0]?.status;
  if (applied === 'submitted') {
    return { stage: 'Under Review', note: 'Your application is being reviewed' };
  }
  if (row.match_strength === 'weak') {
    return { stage: 'Not a Fit', note: 'This opportunity may not be the right fit' };
  }
  if (row.match_strength === 'strong' && (row.match_score ?? 0) >= 90) {
    return { stage: 'Invited', note: 'You’ve been invited to apply' };
  }
  return { stage: 'Shortlisted', note: 'You’ve been shortlisted for this opportunity' };
}

function daysUntil(deadline: string | null): number {
  if (!deadline) return 0;
  return Math.max(0, Math.round((new Date(deadline).getTime() - Date.now()) / 86_400_000));
}

function fromRow(row: MatchRow, index: number): Opportunity | null {
  const o = row.opportunities;
  if (!o) return null;
  const { stage, note } = stageFor(row);

  return {
    id: o.id,
    title: o.title,
    organizer: o.organizer_name ?? 'Unnamed organiser',
    organizerVerified: o.organizer_verified,
    location: o.location ?? '—',
    summary: o.summary ?? '',
    category: o.category ?? 'All Categories',
    medium: o.medium ?? 'All Mediums',
    deadline: o.deadline
      ? new Date(o.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Rolling',
    daysLeft: daysUntil(o.deadline),
    budget: budgetText(o),
    fee: o.fee_amount ? `${o.fee_currency} ${o.fee_amount}` : null,
    stage,
    stageNote: note,
    // The strongest match leads the list.
    featured: index === 0,
    imageUrl: demoOpportunities[index % demoOpportunities.length].imageUrl,
    match: strengthLabel[row.match_strength] ?? 'Partial',
    matchScore: row.match_score ?? 0,
    whyMatch: row.why_text,
    missing: row.missing_requirements ?? [],
  };
}

export type OpportunitiesResult = { opportunities: Opportunity[]; isDemo: boolean };

export async function loadOpportunities(profile: Profile | null): Promise<OpportunitiesResult> {
  if (!supabase || !profile) return { opportunities: demoOpportunities, isDemo: true };

  const { data, error } = await supabase
    .from('opportunity_matches')
    .select(SELECT)
    .eq('artist_id', profile.id)
    .order('match_score', { ascending: false });

  if (error || !data || data.length === 0) {
    return { opportunities: demoOpportunities, isDemo: true };
  }

  // Applications are a separate table; one extra read keeps the join simple.
  const { data: apps } = await supabase
    .from('opportunity_applications')
    .select('opportunity_id, status')
    .eq('artist_id', profile.id);

  const byOpportunity = new Map((apps ?? []).map((a) => [a.opportunity_id, a.status]));

  const rows = (data as unknown as MatchRow[]).map((row) => ({
    ...row,
    applications: row.opportunities
      ? [{ status: byOpportunity.get(row.opportunities.id) ?? 'none' }]
      : null,
  }));

  return {
    opportunities: rows.map(fromRow).filter((o): o is Opportunity => o !== null),
    isDemo: false,
  };
}
