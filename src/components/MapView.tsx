'use client';

import { useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import type { Place, SearchState } from '@/lib/types';
import { CATEGORIES } from '@/lib/types';

const LIBRARIES: ('places' | 'geometry')[] = ['places', 'geometry'];

const DARK_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0f0f14' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f0f14' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8888a8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#f97316' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a1a24' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a3a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#16161e' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a50' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f1f2e' }] },
  { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a0a12' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
];

const JAKARTA_CENTER = { lat: -6.2088, lng: 106.8456 };

interface MapViewProps {
  onLocationSelected: (lat: number, lng: number, label: string) => void;
  onMapsLoaded: () => void;
  searchState: SearchState | null;
  places: Place[];
  children?: React.ReactNode;
}

export default function MapView({ onLocationSelected, onMapsLoaded, searchState, places, children }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
    libraries: LIBRARIES,
    language: 'en',
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    onMapsLoaded();
  }, [onMapsLoaded]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      const label =
        status === 'OK' && results?.[0]
          ? results[0].formatted_address
          : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      onLocationSelected(lat, lng, label);
    });
  }, [onLocationSelected]);

  // Pan to new pin
  const prevRef = useRef<SearchState | null>(null);
  if (searchState && searchState !== prevRef.current) {
    prevRef.current = searchState;
    mapRef.current?.panTo({ lat: searchState.lat, lng: searchState.lng });
    mapRef.current?.setZoom(16);
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-sm">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {children && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[min(560px,calc(100%-2rem))] shadow-2xl">
          {children}
        </div>
      )}

      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={JAKARTA_CENTER}
        zoom={13}
        onLoad={onLoad}
        onUnmount={() => { mapRef.current = null; }}
        onClick={handleMapClick}
        options={{
          styles: DARK_STYLE,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
        }}
      >
        {/* Dropped pin + radius */}
        {searchState && (
          <>
            <Marker
              position={{ lat: searchState.lat, lng: searchState.lng }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: '#f97316',
                fillOpacity: 1,
                strokeColor: '#fff',
                strokeWeight: 2,
              }}
              zIndex={200}
            />
            <Circle
              center={{ lat: searchState.lat, lng: searchState.lng }}
              radius={searchState.radiusMeters}
              options={{
                fillColor: '#f97316',
                fillOpacity: 0.07,
                strokeColor: '#f97316',
                strokeOpacity: 0.35,
                strokeWeight: 1.5,
              }}
            />
          </>
        )}

        {/* Place markers — coloured by category */}
        {places.map((place) => {
          const cat = CATEGORIES.find((c) => c.id === place.category);
          const color = cat?.color ?? '#f97316';
          return (
            <Marker
              key={place.id}
              position={{ lat: place.lat, lng: place.lng }}
              title={`${place.name} ★${place.rating}`}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 7,
                fillColor: color,
                fillOpacity: 0.9,
                strokeColor: '#fff',
                strokeWeight: 1.5,
              }}
              zIndex={100}
            />
          );
        })}
      </GoogleMap>

      {/* Category colour legend */}
      <div className="absolute bottom-8 left-3 z-10 bg-brand-panel/90 backdrop-blur-sm border border-brand-border rounded-lg px-3 py-2 flex flex-col gap-1.5">
        {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
          <div key={cat.id} className="flex items-center gap-2 text-xs">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
            <span className="text-brand-muted">{cat.emoji} {cat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
