import type { Work } from '../data/artspaceWorks';
import type { Enquiry, Follower, Viewer } from '../data/artspaceInterest';

/** Wraps a value for CSV: quotes it, and doubles any quotes inside so a title
 *  like `Study #2 "Blue"` doesn't break the column. */
function cell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
}

export type Column<T> = { header: string; get: (row: T) => string | number | null | undefined };

/** Builds and downloads a CSV in the browser. No backend involved, so export
 *  works today on every screen that has rows to hand. */
export function downloadCsv<T>(filename: string, columns: Column<T>[], rows: T[]) {
  const lines = [
    columns.map((c) => cell(c.header)).join(','),
    ...rows.map((row) => columns.map((c) => cell(c.get(row))).join(',')),
  ];

  // The BOM makes Excel read the file as UTF-8, so accented names and the ×
  // in dimensions survive the round trip.
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── My Works ── */

const workColumns: Column<Work>[] = [
  { header: 'Title', get: (w) => w.title },
  { header: 'Year', get: (w) => w.year },
  { header: 'Medium', get: (w) => w.medium },
  { header: 'Dimensions', get: (w) => w.dimensions },
  { header: 'Status', get: (w) => w.status },
  { header: 'Availability', get: (w) => w.availability },
  { header: 'Passport / COA', get: (w) => w.passport },
  { header: 'Identified interest', get: (w) => w.interestCount },
  { header: 'Interest level', get: (w) => w.interestLevel },
  { header: 'Opportunities', get: (w) => w.opportunities },
  // Recorded earnings only — an empty cell means nothing was recorded, which
  // is not the same as zero and must not be filled in with an estimate.
  { header: 'Earnings recorded (USD)', get: (w) => w.earnings },
  { header: 'Last updated', get: (w) => w.updated },
];

export function exportWorksCsv(works: Work[], filename = 'artbank-my-works.csv') {
  downloadCsv(filename, workColumns, works);
}

/* ── Interest ── */

/** One flat shape for the three kinds of interest, so they export as a single
 *  ledger rather than three files that have to be reconciled. */
type InterestRow = {
  type: 'Enquiry' | 'Follower' | 'Viewer';
  name: string;
  identityVerified: string;
  location: string;
  context: string;
  purpose: string;
  detail: string;
  status: string;
  when: string;
};

const interestColumns: Column<InterestRow>[] = [
  { header: 'Type', get: (r) => r.type },
  { header: 'Name', get: (r) => r.name },
  { header: 'Identity verified', get: (r) => r.identityVerified },
  { header: 'Location', get: (r) => r.location },
  { header: 'Interested in', get: (r) => r.context },
  { header: 'Purpose', get: (r) => r.purpose },
  { header: 'Detail', get: (r) => r.detail },
  { header: 'Status', get: (r) => r.status },
  { header: 'When', get: (r) => r.when },
];

/** Exports the interest ledger.
 *
 *  Identified people only. Anonymous visitors are deliberately absent — they
 *  have no identity to export, and the brief forbids ever revealing them, so
 *  they must not leak through a file either. Their count is reported on screen
 *  instead (docs/pivot-checklist/12-interest-ledger.md). */
export function exportInterestCsv(
  {
    enquiries,
    followers,
    viewers,
  }: { enquiries: Enquiry[]; followers: Follower[]; viewers: Viewer[] },
  filename = 'artbank-interest.csv',
) {
  const rows: InterestRow[] = [
    ...enquiries.map<InterestRow>((e) => ({
      type: 'Enquiry',
      name: e.name,
      identityVerified: e.verified ? 'Yes' : 'No',
      location: e.location,
      context: e.artwork,
      purpose: e.purposeLabel,
      detail: e.preview,
      status: e.status,
      when: e.time,
    })),
    ...followers.map<InterestRow>((f) => ({
      type: 'Follower',
      name: f.name,
      identityVerified: f.verified ? 'Yes' : 'No',
      location: f.location,
      context: '',
      purpose: f.role,
      detail: 'Follows your profile',
      status: 'Following',
      when: '',
    })),
    ...viewers.map<InterestRow>((v) => ({
      type: 'Viewer',
      name: v.name,
      identityVerified: v.verified ? 'Yes' : 'No',
      location: v.location,
      context: `${v.viewedCount} artwork${v.viewedCount === 1 ? '' : 's'}`,
      purpose: '',
      detail: 'Viewed your work',
      status: 'Identified viewer',
      when: `${v.lastViewedDate} ${v.lastViewedTime}`.trim(),
    })),
  ];

  downloadCsv(filename, interestColumns, rows);
  return rows.length;
}
