'use client';

import { useState, useCallback } from 'react';
import type { Place, VideoResult, CategoryId } from '@/lib/types';

interface DiscoverOptions {
  lat: number;
  lng: number;
  areaName: string;
  radiusMeters: number;
  category: CategoryId;
}

export interface DiscoverData {
  places: Place[];
  videos: VideoResult[];
  loading: boolean;
  error: string | null;
  discover: (opts: DiscoverOptions) => Promise<void>;
}

export function useDiscover(): DiscoverData {
  const [places, setPlaces] = useState<Place[]>([]);
  const [videos, setVideos] = useState<VideoResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const discover = useCallback(async (opts: DiscoverOptions) => {
    setLoading(true);
    setError(null);

    const placesParams = new URLSearchParams({
      lat: String(opts.lat),
      lng: String(opts.lng),
      radius: String(opts.radiusMeters),
      category: opts.category,
    });

    const ytParams = new URLSearchParams({
      area: opts.areaName,
      category: opts.category,
    });

    try {
      const [placesRes, ytRes] = await Promise.all([
        fetch(`/api/places?${placesParams}`),
        fetch(`/api/youtube?${ytParams}`),
      ]);

      const [placesData, ytData] = await Promise.all([
        placesRes.json(),
        ytRes.json(),
      ]);

      if (!placesRes.ok) throw new Error(placesData.error ?? 'Places search failed');
      if (!ytRes.ok) throw new Error(ytData.error ?? 'Video search failed');

      setPlaces(placesData.places ?? []);
      setVideos(ytData.videos ?? []);
    } catch (e: any) {
      setError(e.message ?? 'Unknown error');
      setPlaces([]);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { places, videos, loading, error, discover };
}
