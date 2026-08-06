export interface Creator {
  id: string;
  name: string;
  title: string;
  bio: string;
  mriScore: number;
  artworkCount: number;
  followers: string;
  gradient: string;
}

export interface CreatorProfile {
  id: string;
  name: string;
  title: string;
  category: string;
  country: string;
  countryFlag: string;
  followers: string;
  mriScore: number;
  verified: boolean;
  careerStage: 'Emerging' | 'Established' | 'Master';
  imageUrl: string;
}
