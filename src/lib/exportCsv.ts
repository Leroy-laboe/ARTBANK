import type { Work } from '../data/artspaceWorks';

/** Wraps a value for CSV: quotes it, and doubles any quotes inside so a title
 *  like `Study #2 "Blue"` doesn't break the column. */
function cell(value: string | number | null): string {
  if (value === null) return '';
  return `"${String(value).replace(/"/g, '""')}"`;
}

const COLUMNS: { header: string; get: (w: Work) => string | number | null }[] = [
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

/** Downloads the given artworks as a CSV. Runs entirely in the browser —
 *  no backend needed, so Export works today. */
export function exportWorksCsv(works: Work[], filename = 'artbank-my-works.csv') {
  const rows = [
    COLUMNS.map((c) => cell(c.header)).join(','),
    ...works.map((w) => COLUMNS.map((c) => cell(c.get(w))).join(',')),
  ];

  // The BOM makes Excel read the file as UTF-8, so accented titles and the
  // × in dimensions survive the round trip.
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
