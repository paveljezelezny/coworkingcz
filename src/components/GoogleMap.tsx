'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

interface MarkerData {
  id: string;
  name: string;
  city: string;
  address: string;
  lat: number;
  lng: number;
  slug: string;
  priceDayPass?: number | null;
  priceMonthly?: number | null;
  capacity?: number | null;
  isVerified?: boolean;
  photoUrl?: string;
}

interface GoogleMapProps {
  markers: MarkerData[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

// City-centre fallback coordinates for Czech cities
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'Praha':             { lat: 50.0755, lng: 14.4378 },
  'Brno':              { lat: 49.1951, lng: 16.6068 },
  'Ostrava':           { lat: 49.8209, lng: 18.2625 },
  'Plzeň':             { lat: 49.7384, lng: 13.3736 },
  'Liberec':           { lat: 50.7663, lng: 15.0543 },
  'České Budějovice':  { lat: 48.9745, lng: 14.4743 },
  'Olomouc':           { lat: 49.5938, lng: 17.2509 },
  'Hradec Králové':    { lat: 50.2092, lng: 15.8328 },
  'Pardubice':         { lat: 50.0343, lng: 15.7812 },
  'Zlín':              { lat: 49.2235, lng: 17.6637 },
  'Karlovy Vary':      { lat: 50.2304, lng: 12.8710 },
  'Jihlava':           { lat: 49.3961, lng: 15.5875 },
};

export function getMarkerCoords(
  lat: number | null,
  lng: number | null,
  city: string
): { lat: number; lng: number } | null {
  if (lat && lng) return { lat, lng };
  return CITY_COORDS[city] ?? null;
}

export default function GoogleMap({ markers, selectedId, onSelect }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialise map once
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setLoadError('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY není nastaven.');
      setIsLoading(false);
      return;
    }

    // v2 API: setOptions + importLibrary (Loader class was removed in v2)
    setOptions({ apiKey, version: 'weekly' });

    importLibrary('maps').then(() => {
      if (!mapRef.current) return;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 49.8175, lng: 15.473 }, // centre of Czechia
        zoom: 7,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        ],
      });

      mapInstanceRef.current = map;
      infoWindowRef.current = new google.maps.InfoWindow();
      setIsLoading(false);
    }).catch((err: unknown) => {
      console.error('Google Maps load error:', err);
      setLoadError('Nepodařilo se načíst Google Maps. Zkontroluj API klíč.');
      setIsLoading(false);
    });
  }, []);

  // Sync markers whenever list changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || isLoading) return;

    const currentIds = new Set(markers.map((m) => m.id));

    // Remove stale markers
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.setMap(null);
        markersRef.current.delete(id);
      }
    });

    // Add / update markers
    markers.forEach((m) => {
      if (markersRef.current.has(m.id)) return; // already exists

      const marker = new google.maps.Marker({
        position: { lat: m.lat, lng: m.lng },
        map,
        title: m.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#2563eb',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        animation: google.maps.Animation.DROP,
      });

      marker.addListener('click', () => {
        onSelect(m.id);
        openInfoWindow(m, marker, map);
      });

      markersRef.current.set(m.id, marker);
    });
  }, [markers, isLoading]);

  // Highlight selected marker
  useEffect(() => {
    if (isLoading || !mapInstanceRef.current) return;
    markersRef.current.forEach((marker, id) => {
      marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: id === selectedId ? 14 : 10,
        fillColor: id === selectedId ? '#f97316' : '#2563eb',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      });
      if (id === selectedId) {
        mapInstanceRef.current?.panTo(marker.getPosition()!);
        const data = markers.find((m) => m.id === id);
        if (data) openInfoWindow(data, marker, mapInstanceRef.current!);
      }
    });
  }, [selectedId, markers, isLoading]);

  function openInfoWindow(
    m: MarkerData,
    marker: google.maps.Marker,
    map: google.maps.Map
  ) {
    if (!infoWindowRef.current) return;
    const photoHtml = m.photoUrl
      ? `<img src="${m.photoUrl}" style="width:100%;height:90px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />`
      : '';
    const verifiedBadge = m.isVerified
      ? `<span style="background:#2563eb;color:#fff;font-size:10px;padding:2px 6px;border-radius:999px;margin-left:4px;">✓ Ověřeno</span>`
      : '';
    const priceRow = [
      m.priceDayPass ? `${m.priceDayPass} Kč/den` : null,
      m.priceMonthly ? `${m.priceMonthly} Kč/měs` : null,
    ].filter(Boolean).join(' &nbsp;·&nbsp; ');

    infoWindowRef.current.setContent(`
      <div style="font-family:system-ui,sans-serif;width:220px;padding:4px 0;">
        ${photoHtml}
        <div style="font-weight:700;font-size:14px;margin-bottom:2px;">
          ${m.name}${verifiedBadge}
        </div>
        <div style="color:#6b7280;font-size:12px;margin-bottom:6px;">
          📍 ${[m.address, m.city].filter(Boolean).join(', ')}
        </div>
        ${priceRow ? `<div style="color:#374151;font-size:12px;margin-bottom:8px;">${priceRow}</div>` : ''}
        <a href="/coworking/${m.slug}" style="display:inline-block;background:#2563eb;color:#fff;padding:5px 12px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;">
          Zobrazit detail →
        </a>
      </div>
    `);
    infoWindowRef.current.open(map, marker);
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-600 text-sm p-8 text-center">
        <div>
          <p className="font-bold mb-1">Chyba načítání mapy</p>
          <p>{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-blue-50 z-10">
          <div className="text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Načítám mapu…</p>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
}
