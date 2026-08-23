export interface Creator {
  id: string;
  name: string;
  title: string;
  bio: string;
  mriScore: number;
  artworkCount: number;
  followers: string;
  gradient: string;
  imageUrl?: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  country: string;
  countryFlag: string;
  followers: string;
  careerStage: 'Emerging' | 'Established' | 'Master';
  /** Matches the labels in data/creatorsContent.ts's trendingStyles, so the
   *  Art Style filter and the Trending Styles panel share one vocabulary. */
  style: string;
  imageUrl: string;
}

/** Owned by CreatorsPage, passed down to CreatorFilterSidebar as a controlled
 *  component — lets the sidebar and the grid it filters share one source of
 *  truth. categories/stages are multi-select (OR within the group); country
 *  and style are single-select ('All Countries'/'All Styles' = no filter). */
export interface CreatorFilters {
  search: string;
  categories: string[];
  country: string;
  style: string;
  stages: string[];
}

export const defaultCreatorFilters: CreatorFilters = {
  search: '',
  categories: [],
  country: 'All Countries',
  style: 'All Styles',
  stages: [],
};
