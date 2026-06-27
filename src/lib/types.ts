// ─── Categories ───────────────────────────────────────────────────────────────

export type CategoryId = 'all' | 'food' | 'drinks' | 'entertainment' | 'shopping' | 'hotels';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  /** Google Places (New) API types — must be Table A types */
  placeTypes: string[];
  /** YouTube search terms to append */
  ytTerms: string[];
}

export const CATEGORIES: Category[] = [
  {
    id: 'all',
    label: 'All',
    emoji: '🔥',
    color: '#f97316',
    placeTypes: ['restaurant', 'cafe', 'bar', 'shopping_mall', 'tourist_attraction', 'lodging'],
    ytTerms: ['kuliner', 'street food', 'review', 'viral'],
  },
  {
    id: 'food',
    label: 'Food',
    emoji: '🍜',
    color: '#f97316',
    placeTypes: ['restaurant', 'cafe', 'bakery'],
    ytTerms: ['kuliner', 'street food', 'makan', 'food review', 'warung'],
  },
  {
    id: 'drinks',
    label: 'Drinks',
    emoji: '🧋',
    color: '#8b5cf6',
    placeTypes: ['bar', 'cafe', 'night_club'],
    ytTerms: ['kafe', 'cafe tour', 'coffee shop', 'minuman', 'boba'],
  },
  {
    id: 'entertainment',
    label: 'Fun',
    emoji: '🎭',
    color: '#ec4899',
    placeTypes: ['movie_theater', 'amusement_park', 'museum', 'tourist_attraction', 'night_club', 'bowling_alley'],
    ytTerms: ['hiburan', 'wisata', 'tempat seru', 'hidden gem'],
  },
  {
    id: 'shopping',
    label: 'Shopping',
    emoji: '🛍️',
    color: '#3b82f6',
    placeTypes: ['shopping_mall', 'clothing_store', 'department_store', 'supermarket'],
    ytTerms: ['belanja', 'mall', 'thrift', 'pasar'],
  },
  {
    id: 'hotels',
    label: 'Stay',
    emoji: '🏨',
    color: '#14b8a6',
    placeTypes: ['lodging'],
    ytTerms: ['hotel review', 'staycation', 'penginapan'],
  },
];

// ─── Place (Google Places Nearby Search result) ────────────────────────────

export interface Place {
  id: string;
  name: string;
  vicinity: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: number;
  types: string[];
  photoRef?: string;
  openNow?: boolean;
  lat: number;
  lng: number;
  category: CategoryId;
}

// ─── Video (YouTube discovery result) ─────────────────────────────────────

export interface VideoResult {
  id: string;
  title: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  viewCount?: string;
  description: string;
  category: CategoryId;
}

// ─── Search state ──────────────────────────────────────────────────────────

export interface SearchState {
  lat: number;
  lng: number;
  label: string;
  areaName: string;
  radiusMeters: number;
}
