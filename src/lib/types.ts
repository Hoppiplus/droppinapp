// ─── Categories ───────────────────────────────────────────────────────────────

export type CategoryId = 'all' | 'food' | 'drinks' | 'entertainment' | 'shopping' | 'hotels';

export interface Category {
  id: CategoryId;
  label: string;
  emoji: string;
  color: string;
  /** Google Places types to include */
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
    placeTypes: ['restaurant', 'cafe', 'bar', 'food', 'store', 'shopping_mall', 'lodging'],
    ytTerms: ['kuliner', 'street food', 'review', 'viral'],
  },
  {
    id: 'food',
    label: 'Food',
    emoji: '🍜',
    color: '#f97316',
    placeTypes: ['restaurant', 'cafe', 'bakery', 'meal_takeaway', 'food'],
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
    placeTypes: ['shopping_mall', 'clothing_store', 'store', 'supermarket'],
    ytTerms: ['belanja', 'mall', 'thrift', 'pasar'],
  },
  {
    id: 'hotels',
    label: 'Stay',
    emoji: '🏨',
    color: '#14b8a6',
    placeTypes: ['lodging', 'hotel', 'hostel'],
    ytTerms: ['hotel review', 'staycation', 'penginapan'],
  },
];

// ─── Place (Google Places Nearby Search result) ────────────────────────────

export interface Place {
  id: string;               // place_id
  name: string;
  vicinity: string;         // short address
  rating: number;           // 1–5
  userRatingsTotal: number;
  priceLevel?: number;      // 0–4
  types: string[];
  photoRef?: string;        // photo_reference for /api/places/photo proxy
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
  areaName: string;   // extracted neighbourhood name used in queries
  radiusMeters: number;
}
