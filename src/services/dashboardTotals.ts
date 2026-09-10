import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/user';

/** Whole-catalogue figures for the Today dashboard, counted by Postgres.
 *
 *  These are the numbers that cannot be derived from a page of rows: what
 *  share of an artist's works carry dimensions or a certificate, and what
 *  their settled and pending earnings add up to. Deriving them in the browser
 *  meant reading every artwork and every deal on each dashboard load, so the
 *  screen got slower exactly as an artist got busier.
 *
 *  See migration 0034 and finding 6 in
 *  docs/pivot-checklist/27-production-readiness-audit.md. */
export type DashboardTotals = {
  worksTotal: number;
  worksWithDimensions: number;
  worksWithPassport: number;
  settledTotal: number;
  settledCount: number;
  pendingTotal: number;
  pendingCount: number;
  settledLicenceCount: number;
  currency: string;
};

type Row = {
  works_total: number | null;
  works_with_dimensions: number | null;
  works_with_passport: number | null;
  settled_total: number | string | null;
  settled_count: number | null;
  pending_total: number | string | null;
  pending_count: number | null;
  settled_licence_count: number | null;
  currency: string | null;
};

const num = (value: number | string | null | undefined): number => {
  const parsed = typeof value === 'string' ? Number(value) : (value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Returns null when the read failed, which the dashboard treats as an error
 *  rather than as zeros — a catalogue that could not be counted is not the
 *  same as a catalogue with nothing in it. */
export async function getDashboardTotals(
  profile: Profile | null,
): Promise<DashboardTotals | null> {
  if (!supabase || !profile) return null;

  const { data, error } = await supabase.rpc('dashboard_summary');
  if (error) return null;

  // The function returns a single row; PostgREST hands back an array.
  const row = (Array.isArray(data) ? data[0] : data) as Row | undefined;
  if (!row) return null;

  return {
    worksTotal: num(row.works_total),
    worksWithDimensions: num(row.works_with_dimensions),
    worksWithPassport: num(row.works_with_passport),
    // numeric comes over the wire as a string once it exceeds what JSON can
    // safely hold, so both shapes are handled.
    settledTotal: num(row.settled_total),
    settledCount: num(row.settled_count),
    pendingTotal: num(row.pending_total),
    pendingCount: num(row.pending_count),
    settledLicenceCount: num(row.settled_licence_count),
    currency: row.currency ?? 'USD',
  };
}
