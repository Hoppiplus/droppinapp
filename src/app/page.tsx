'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { CategoryId, SearchState } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';
import { extractAreaName } from '@/lib/geo';
import { useDiscover } from '@/hooks/useDiscover';
import DiscoveryPanel from '@/components/DiscoveryPanel';
import SearchBar from '@/components/SearchBar';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function Home() {
  const [category, setCategory] = useState<CategoryId>('all');
  const [radius, setRadius] = useState(500);
  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  const { places, videos, loading, error, discover } = useDiscover();

  const handleLocationSelected = useCallback(
    (lat: number, lng: number, label: string) => {
      const areaName = extractAreaName(label);
      const state: SearchState = { lat, lng, label, areaName, radiusMeters: radius };
      setSearchState(state);
      setPanelOpen(true);
      discover({ lat, lng, areaName, radiusMeters: radius, category });
    },
    [radius, category, discover]
  );

  const handleCategoryChange = (c: CategoryId) => {
    setCategory(c);
    if (searchState) {
      discover({ lat: searchState.lat, lng: searchState.lng, areaName: searchState.areaName, radiusMeters: radius, category: c });
    }
  };

  const handleMapsLoaded = useCallback(() => setMapsLoaded(true), []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-brand-bg">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center gap-3 px-4 py-3 bg-brand-panel border-b border-brand-border z-20">
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl">📍</span>
          <span className="font-bold text-brand-text tracking-tight text-lg">
            Drop<span className="text-brand-accent">Pin</span>
          </span>
          <span className="hidden sm:inline text-xs text-brand-muted ml-1 border border-brand-border rounded px-1.5 py-0.5">
            Jakarta · Beta
          </span>
        </div>

        <div className="flex-1 flex justify-center px-2">
          <SearchBar onPlaceSelected={handleLocationSelected} mapsApiLoaded={mapsLoaded} />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setPanelOpen((o) => !o)}
          className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
            panelOpen
              ? 'bg-brand-accent border-brand-accent text-white'
              : 'bg-brand-card border-brand-border text-brand-muted'
          }`}
        >
          🔥
          {(places.length + videos.length) > 0 && (
            <span className="text-xs">{places.length + videos.length}</span>
          )}
        </button>
      </header>

      {/* ── Category filter bar ─────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-brand-panel border-b border-brand-border overflow-x-auto no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
              category === cat.id
                ? 'text-white border-transparent'
                : 'bg-transparent border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-text/30'
            }`}
            style={category === cat.id ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}

        {/* Radius */}
        <div className="shrink-0 flex items-center gap-2 ml-auto pl-3 border-l border-brand-border">
          <span className="text-brand-muted text-xs whitespace-nowrap">Radius</span>
          <input
            type="range"
            min={200}
            max={1500}
            step={100}
            value={radius}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              setRadius(v);
              if (searchState) {
                setSearchState((s) => s ? { ...s, radiusMeters: v } : s);
                discover({ lat: searchState.lat, lng: searchState.lng, areaName: searchState.areaName, radiusMeters: v, category });
              }
            }}
            className="w-20 accent-brand-accent"
          />
          <span className="text-brand-accent text-xs font-medium w-14 text-right">{radius}m</span>
        </div>
      </div>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className={`relative transition-all duration-300 ${panelOpen ? 'hidden sm:block sm:flex-1' : 'flex-1'}`}>
          <MapView
            onLocationSelected={handleLocationSelected}
            onMapsLoaded={handleMapsLoaded}
            searchState={searchState}
            places={places}
          />

          {!searchState && mapsLoaded && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-brand-panel/90 backdrop-blur-sm border border-brand-border text-brand-muted text-xs px-4 py-2 rounded-full pointer-events-none">
              📍 Drop a pin to discover what's happening there
            </div>
          )}
        </div>

        {/* Discovery panel */}
        <aside className={`flex flex-col border-l border-brand-border bg-brand-panel overflow-hidden ${
          panelOpen ? 'flex w-full sm:w-[400px]' : 'hidden sm:flex sm:w-[400px]'
        }`}>
          <DiscoveryPanel
            places={places}
            videos={videos}
            loading={loading}
            error={error}
            searchLabel={searchState?.label ?? null}
            areaName={searchState?.areaName ?? null}
          />
        </aside>
      </div>
    </div>
  );
}
