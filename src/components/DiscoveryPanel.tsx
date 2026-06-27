'use client';

import { useState } from 'react';
import type { Place, VideoResult } from '@/lib/types';
import PlaceCard from './PlaceCard';
import VideoCard from './VideoCard';

type Tab = 'places' | 'videos' | 'trending';
type SortBy = 'rating' | 'reviews' | 'price';

interface DiscoveryPanelProps {
  places: Place[];
  videos: VideoResult[];
  loading: boolean;
  error: string | null;
  searchLabel: string | null;
  areaName: string | null;
  shareUrl?: string;
}

function EmptyState({ tab, areaName }: { tab: Tab; areaName: string | null }) {
  const messages: Record<Tab, { icon: string; text: string; sub?: string }> = {
    places: { icon: '📍', text: 'No places found nearby', sub: 'Try widening the radius or removing filters' },
    videos: { icon: '🎥', text: 'No videos found for this area', sub: 'Try a different category' },
    trending: { icon: '🔥', text: 'No trending spots yet', sub: 'Drop a pin to discover' },
  };
  const m = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span className="text-4xl">{m.icon}</span>
      <p className="text-brand-muted text-sm">{m.text}</p>
      {m.sub && <p className="text-brand-muted/60 text-xs">{m.sub}</p>}
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
  places, videos, loading, error, searchLabel, areaName, shareUrl,
}: DiscoveryPanelProps) {
  const [tab, setTab] = useState<Tab>('places');
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>('rating');
  const [minRating, setMinRating] = useState(0);
  const [copied, setCopied] = useState(false);

  const heatScore = (p: Place) => p.rating * Math.log(p.userRatingsTotal + 1);

  // Client-side filter + sort
  const displayedPlaces = places
    .filter((p) => !openNowOnly || p.openNow === true)
    .filter((p) => minRating === 0 || p.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === 'reviews') return b.userRatingsTotal - a.userRatingsTotal;
      if (sortBy === 'price') return (a.priceLevel ?? 99) - (b.priceLevel ?? 99);
      return heatScore(b) - heatScore(a); // 'rating' default
    });

  const trending = [...places]
    .sort((a, b) => heatScore(b) - heatScore(a))
    .slice(0, 10);

  const openCount = places.filter((p) => p.openNow === true).length;

  const handleShare = async () => {
    const url = shareUrl ?? window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const tabs: { id: Tab; label: string; emoji: string; count: number }[] = [
    { id: 'places', label: 'Places', emoji: '📍', count: displayedPlaces.length },
    { id: 'videos', label: 'Videos', emoji: '🎥', count: videos.length },
    { id: 'trending', label: 'Trending', emoji: '🔥', count: trending.length },
  ];

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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-brand-muted text-xs truncate" title={searchLabel}>📍 {searchLabel}</p>
            {areaName && (
              <h3 className="text-brand-text font-semibold text-sm mt-0.5">
                What&apos;s happening in <span className="text-brand-accent">{areaName}</span>
              </h3>
            )}
          </div>
          {/* Share button */}
          <button
            onClick={handleShare}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border text-xs text-brand-muted hover:text-brand-text hover:border-brand-accent/50 transition-all"
            title="Copy shareable link"
          >
            {copied ? '✅ Copied!' : '🔗 Share'}
          </button>
        </div>
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

      {/* Filter controls — shown on Places tab */}
      {tab === 'places' && searchLabel && (
        <div className="shrink-0 flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-brand-border bg-brand-bg/30">
          {/* Open Now toggle */}
          <button
            onClick={() => setOpenNowOnly((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              openNowOnly
                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : 'border-brand-border text-brand-muted hover:border-green-500/30 hover:text-green-400'
            }`}
          >
            🟢 Open Now
            {openNowOnly && openCount > 0 && (
              <span className="text-[10px] bg-green-500/20 px-1 rounded-full">{openCount}</span>
            )}
          </button>

          {/* Min rating */}
          <button
            onClick={() => setMinRating((r) => r === 0 ? 4 : 0)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
              minRating > 0
                ? 'bg-brand-gold/20 border-brand-gold/50 text-brand-gold'
                : 'border-brand-border text-brand-muted hover:border-brand-gold/30 hover:text-brand-gold'
            }`}
          >
            ★ 4.0+
          </button>

          {/* Sort */}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-[11px] text-brand-muted">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="bg-brand-card border border-brand-border text-brand-text text-[11px] rounded-lg px-2 py-1 cursor-pointer focus:outline-none focus:border-brand-accent"
            >
              <option value="rating">⭐ Best Rated</option>
              <option value="reviews">💬 Most Reviewed</option>
              <option value="price">💰 Price Low→High</option>
            </select>
          </div>
        </div>
      )}

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
          displayedPlaces.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="text-4xl">📍</span>
              <p className="text-brand-muted text-sm">No places match your filters</p>
              {openNowOnly && (
                <button
                  onClick={() => setOpenNowOnly(false)}
                  className="text-xs text-brand-accent border border-brand-accent/30 px-3 py-1 rounded-full hover:bg-brand-accent/10"
                >
                  Remove "Open Now" filter
                </button>
              )}
              {minRating > 0 && (
                <button
                  onClick={() => setMinRating(0)}
                  className="text-xs text-brand-accent border border-brand-accent/30 px-3 py-1 rounded-full hover:bg-brand-accent/10"
                >
                  Remove rating filter
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-4">
              {displayedPlaces.map((place, i) => (
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
