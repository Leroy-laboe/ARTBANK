import { worksFilterGroups, type Work } from '../../data/artspaceWorks';

/** The filters each select in WorksFiltersPanel drives. Keys match
 *  `worksFilterGroups[].id`, so the panel stays a loop rather than four
 *  hand-wired selects.
 *
 *  Kept out of the component file because React Fast Refresh only works when a
 *  module exports components alone. */
export type WorksFilters = {
  status: string;
  availability: string;
  passport: string;
  sort: string;
};

/** The first option in each group is its "no filter" value — "All Statuses",
 *  "All Availability", "All" — and the sort's first option is its default. */
export const defaultFilters: WorksFilters = {
  status: worksFilterGroups[0].options[0],
  availability: worksFilterGroups[1].options[0],
  passport: worksFilterGroups[2].options[0],
  sort: worksFilterGroups[3].options[0],
};

/** The tab strip above the table.
 *
 *  Tabs and the rail's Status/Availability selects used to be two independent
 *  filters over the same two fields, which meant they could contradict each
 *  other — the Published tab plus a Draft status filter matched nothing, for
 *  no reason a person could see.
 *
 *  So a tab is not a filter of its own. It is a shortcut that writes into the
 *  same `WorksFilters` the panel shows, and its active state is read back out
 *  of that filter. One source of truth, two ways to reach it.
 *
 *  The panel keeps both selects because they reach values no tab has —
 *  Draft, Private, Available, Reserved and Sold. Choose one of those and no
 *  tab is highlighted, which is the honest answer: no tab describes it. */
export type WorksTabDef = {
  id: string;
  label: string;
  status: string;
  availability: string;
};

export const worksTabDefs: WorksTabDef[] = [
  {
    id: 'all',
    label: 'All Works',
    status: defaultFilters.status,
    availability: defaultFilters.availability,
  },
  {
    id: 'published',
    label: 'Published',
    status: 'Published',
    availability: defaultFilters.availability,
  },
  {
    id: 'on-view',
    label: 'On View',
    status: defaultFilters.status,
    availability: 'On View',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    status: 'In Progress',
    availability: defaultFilters.availability,
  },
  {
    id: 'unavailable',
    label: 'Unavailable',
    status: defaultFilters.status,
    availability: 'Unavailable',
  },
  {
    id: 'archived',
    label: 'Archived',
    status: 'Archived',
    availability: defaultFilters.availability,
  },
];

/** Which tab the current filters correspond to, or '' when the combination
 *  isn't one a tab represents. ArtspaceTabs compares by equality, so '' simply
 *  highlights nothing. */
export function activeTabId(filters: WorksFilters): string {
  const found = worksTabDefs.find(
    (def) => def.status === filters.status && def.availability === filters.availability,
  );
  return found?.id ?? '';
}

/** Applies a tab, leaving passport and sort alone — those are the panel's
 *  alone, and a tab shouldn't silently reset them. */
export function applyTab(filters: WorksFilters, tabId: string): WorksFilters {
  const def = worksTabDefs.find((t) => t.id === tabId);
  if (!def) return filters;
  return { ...filters, status: def.status, availability: def.availability };
}

/** How many works a tab would show. Real counts, computed from the rows on
 *  hand — the strip used to carry fixed numbers (24, 8, 5, 3, 7) that
 *  contradicted the table directly beneath it. */
export function tabCount(works: Work[], def: WorksTabDef): number {
  return works.filter(
    (w) =>
      (def.status === defaultFilters.status || w.status === def.status) &&
      (def.availability === defaultFilters.availability || w.availability === def.availability),
  ).length;
}
