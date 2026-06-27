import { NextRequest, NextResponse } from 'next/server';
import type { Place, CategoryId } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

const PLACES_BASE = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

function categoryForTypes(types: string[]): CategoryId {
  const t = new Set(types);
  if (t.has('lodging') || t.has('hotel')) return 'hotels';
  if (t.has('bar') || t.has('night_club')) return 'drinks';
  if (t.has('shopping_mall') || t.has('clothing_store') || t.has('store')) return 'shopping';
  if (t.has('movie_theater') || t.has('amusement_park') || t.has('tourist_attraction') || t.has('museum')) return 'entertainment';
  if (t.has('cafe')) return 'drinks';
  if (t.has('restaurant') || t.has('food') || t.has('bakery') || t.has('meal_takeaway')) return 'food';
  return 'all';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '500';
  const category = (searchParams.get('category') ?? 'all') as CategoryId;

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Places API key not configured' }, { status: 500 });
  }

  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  // For 'all', don't filter by type — just return nearby interesting places
  const typeParam = category === 'all' ? 'establishment' : cat.placeTypes[0];

  const params = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: Math.min(parseInt(radius), 1500).toString(),
    type: typeParam,
    key: apiKey,
  });

  try {
    const res = await fetch(`${PLACES_BASE}?${params}`, { next: { revalidate: 300 } });
    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json({ error: 'Places API error', detail: err }, { status: res.status });
    }

    const data = await res.json();

    if (data.status === 'REQUEST_DENIED') {
      return NextResponse.json({ error: data.error_message ?? 'Places API denied' }, { status: 403 });
    }

    const places: Place[] = (data.results ?? [])
      .slice(0, 20)
      .map((r: any) => ({
        id: r.place_id,
        name: r.name,
        vicinity: r.vicinity ?? '',
        rating: r.rating ?? 0,
        userRatingsTotal: r.user_ratings_total ?? 0,
        priceLevel: r.price_level,
        types: r.types ?? [],
        photoRef: r.photos?.[0]?.photo_reference ?? null,
        openNow: r.opening_hours?.open_now,
        lat: r.geometry.location.lat,
        lng: r.geometry.location.lng,
        category: categoryForTypes(r.types ?? []),
      }))
      // Sort by a "heat score": rating × log(reviews+1) — surfaces quality places with real volume
      .sort((a: Place, b: Place) => {
        const score = (p: Place) => p.rating * Math.log(p.userRatingsTotal + 1);
        return score(b) - score(a);
      });

    return NextResponse.json({ places });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
