export interface Artwork {
  id: string;
  title: string;
  artist: string;
  price: number | null;
  currency: string;
  likes: number;
  verified: boolean;
  gradient: string;
  imageUrl?: string;
}

export interface MarketplaceListing extends Artwork {
  category: string;
  listingType: 'buy-now' | 'auction';
  mriScore: number;
  endsIn?: string;
}
