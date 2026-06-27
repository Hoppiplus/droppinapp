'use client';

import Image from 'next/image';
import type { Place } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

interface PlaceCardProps {
  place: Place;
  rank?: number;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-brand-gold text-xs">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(Math.max(0, 5 - full - (half ? 1 : 0)))}
    </span>
  );
}

function PriceLevel({ level }: { level?: number }) {
  if (level === undefined || level === null) return null;
  return (
    <span className="text-brand-muted text-xs">
      {'$'.repeat(level + 1)}
    </span>
  );
}

export default function PlaceCard({ place, rank }: PlaceCardProps) {
  const cat = CATEGORIES.find((c) => c.id === place.category);
  const photoUrl = place.photoRef
    ? `/api/places/photo?ref=${encodeURIComponent(place.photoRef)}&maxwidth=400`
    : null;

  const mapsUrl = `https://www.google.com/maps/place/?q=place_id:${place.id}`;

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 rounded-xl bg-brand-card border border-brand-border hover:border-brand-accent/40 transition-all group cursor-pointer"
    >
      {/* Photo or placeholder */}
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-brand-border relative">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={place.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            {cat?.emoji ?? '📍'}
          </div>
        )}
        {rank !== undefined && rank <= 3 && (
          <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-brand-accent text-white text-[10px] font-bold flex items-center justify-center">
            {rank}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-brand-text text-sm font-medium leading-tight line-clamp-2 group-hover:text-brand-accent transition-colors">
            {place.name}
          </p>
          {/* Open / closed badge */}
          {place.openNow !== undefined && (
            <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
              place.openNow
                ? 'bg-green-500/15 text-green-400'
                : 'bg-red-500/15 text-red-400'
            }`}>
              {place.openNow ? 'Open' : 'Closed'}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <Stars rating={place.rating} />
          <span className="text-brand-text text-xs font-medium">{place.rating.toFixed(1)}</span>
          <span className="text-brand-muted text-xs">({place.userRatingsTotal.toLocaleString()})</span>
          <PriceLevel level={place.priceLevel} />
        </div>

        {/* Category badge + address */}
        <div className="flex items-center gap-1.5">
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${cat?.color}22`, color: cat?.color }}
          >
            {cat?.emoji} {cat?.label}
          </span>
        </div>

        <p className="text-brand-muted text-xs line-clamp-1">{place.vicinity}</p>
      </div>
    </a>
  );
}
