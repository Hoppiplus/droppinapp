'use client';

import { useState } from 'react';
import type { Place, VideoResult } from '@/lib/types';
import PlaceCard from './PlaceCard';
import VideoCard from './VideoCard';

type Tab = 'places' | 'videos' | 'trending';

interface DiscoveryPanelProps {
  places: Place[];
  videos: VideoResult[];
  loading: boolean;
  error: string | null;
  searchLabel: string | null;
  areaName: string | null;
}

function EmptyState({ tab, areaName }: { tab: Tab; areaName: string | null }) {
  const messages: Record<Tab, { icon: string; text: string }> = {
    places: { icon: '📍', text: 'No places found nearby' },
    videos: { icon: '🎥', text: 'No videos found for this area' },
    trending: { icon: '🔥', text: 'No trending spots yet' },
  };
  const m = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-4xl">{m.icon}</span>
      <p className="text-brand-muted text-sm">{m.text}</p>
      {areaName && <p className="text-brand-muted/60 text-xs">in {areaName}</p>}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-brand-card border border-brand-border animate-pulse">
          <div className="w-20 h-20 rounded-lg bg-brand-border shrink-0" />
          <div className="flex-1 flex flex-col gap-2 justify-center">
            <div className="h-3 bg-brand-border rounded w-4/5" />
            <div className="h-3 bg-brand-border rounded w-2/5" />
            <div className="h-3 bg-brand-border rounded w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DiscoveryPanel({
  places, videos, loading, error, searchLabel, areaName,
}: DiscoveryPanelProps) {
  const [tab, setTab] = useState<Tab>('places');

  // Trending = top 10 by heat score (already sorted server-side, but take top 10)
  const trending = [...places]
    .sort((a, b) => (b.rating * Math.log(b.userRatingsTotal + 1)) - (a.rating * Math.log(a.userRatingsTotal + 1)))
    .slice(0, 10);

  const tabs: { id: Tab; label: string; emoji: string; count: number }[] = [
    { id: 'places', label: 'Places', emoji: '📍', count: places.length },
    { id: 'videos', label: 'Videos', emoji: '🎥', count: videos.length },
    { id: 'trending', label: 'Trending', emoji: '🔥', count: trending.length },
  ];

  // No pin yet
  if (!searchLabel) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
        <span className="text-5xl">📍</span>
        <h2 className="text-brand-text font-semibold text-lg">Drop a pin</h2>
        <p className="text-brand-muted text-sm leading-relaxed">
          Click anywhere on the map to discover what's popular, trending, and happening in that area.
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-2">
          {['🍜 Food', '🎭 Entertainment', '🧋 Cafes', '🔥 Trending', '🎥 Videos'].map((tag) => (
            <span key={tag} className="text-xs px-2.5 py-1 rounded-full border border-brand-border text-brand-muted">
              {tag}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-2 border-b border-brand-border">
        <p className="text-brand-muted text-xs truncate" title={searchLabel}>📍 {searchLabel}</p>
        {areaName && (
          <h3 className="text-brand-text font-semibold text-sm mt-0.5">
            What's happening in <span className="text-brand-accent">{areaName}</span>
          </h3>
        )}
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-b border-brand-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
              tab === t.id
                ? 'border-brand-accent text-brand-accent'
                : 'border-transparent text-brand-muted hover:text-brand-text'
            }`}
          >
            <span>{t.emoji}</span>
            <span>{t.label}</span>
            {t.count > 0 && (
              <span className={`text-[10px] px-1 rounded-full ${
                tab === t.id ? 'bg-brand-accent/20 text-brand-accent' : 'bg-brand-border text-brand-muted'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : tab === 'places' ? (
          places.length === 0 ? (
            <EmptyState tab="places" areaName={areaName} />
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {places.map((place, i) => (
                <PlaceCard key={place.id} place={place} rank={i + 1} />
              ))}
            </div>
          )
        ) : tab === 'videos' ? (
          videos.length === 0 ? (
            <EmptyState tab="videos" areaName={areaName} />
          ) : (
            <div className="flex flex-col gap-3 p-4">
              {videos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          )
        ) : (
          trending.length === 0 ? (
            <EmptyState tab="trending" areaName={areaName} />
          ) : (
            <div className="flex flex-col gap-2 p-4">
              <p className="text-brand-muted text-xs mb-1">
                Ranked by rating × review count — the most loved spots in this area.
              </p>
              {trending.map((place, i) => (
                <PlaceCard key={place.id} place={place} rank={i + 1} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
