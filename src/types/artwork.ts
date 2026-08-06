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
