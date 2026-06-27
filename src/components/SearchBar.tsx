'use client';

import { useRef, useEffect } from 'react';

interface SearchBarProps {
  onPlaceSelected: (lat: number, lng: number, label: string) => void;
  mapsApiLoaded: boolean;
}

export default function SearchBar({ onPlaceSelected, mapsApiLoaded }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!mapsApiLoaded || !inputRef.current || autocompleteRef.current) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'id' },
      fields: ['geometry', 'formatted_address', 'name'],
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place?.geometry?.location) return;
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const label = place.formatted_address ?? place.name ?? `${lat}, ${lng}`;
      onPlaceSelected(lat, lng, label);
      if (inputRef.current) inputRef.current.value = '';
    });
  }, [mapsApiLoaded, onPlaceSelected]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search any street, area, or landmark…"
      className="w-full max-w-xl px-4 py-2.5 rounded-xl bg-brand-card border border-brand-border text-brand-text placeholder-brand-muted text-sm focus:outline-none focus:border-brand-accent transition-colors shadow-xl"
    />
  );
}
