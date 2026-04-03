'use client';

import { useState, useEffect } from 'react';
import { MapPin, Search, X, Users, DollarSign, Calendar, ExternalLink } from 'lucide-react';
import { coworkingsData } from '@/lib/data/coworkings';
import { CoworkingSpace } from '@/lib/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getMarkerCoords } from '@/components/GoogleMap';

// Dynamically import GoogleMap to avoid SSR issues with the Google Maps JS API
const GoogleMap = dynamic(() => import('@/components/GoogleMap'), { ssr: false });

export default function MapaPage() {
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>(coworkingsData);
  const [selectedCoworking, setSelectedCoworking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Fetch live data (with DB overrides)
  useEffect(() => {
    fetch('/api/admin/coworkings')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCoworkings(data); })
      .catch(() => {/* fallback to static */});
  }, []);

  const cities = [...new Set(coworkings.map((cw) => cw.city))].sort();

  const filteredCoworkings = coworkings.filter((cw) => {
    const matchSearch = !searchQuery || cw.name.toLowerCase().includes(searchQuery.toLowerCase()) || cw.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = !selectedCity || cw.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchSearch && matchCity;
  });

  // Build marker data — skip coworkings that have no known coordinates
  const mapMarkers = filteredCoworkings
    .map((cw) => {
      const coords = getMarkerCoords(cw.latitude, cw.longitude, cw.city);
      if (!coords) return null;
      return {
        id: cw.id,
        name: cw.name,
        city: cw.city,
        address: cw.address ?? '',
        lat: coords.lat,
        lng: coords.lng,
        slug: cw.slug,
        prices: cw.prices,
        capacity: cw.capacity,
        isVerified: cw.isVerified,
        photoUrl: cw.photos?.[0]?.url,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mapa coworkingů</h1>
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledej coworking nebo město..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12 w-full"
              />
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">Všechna města</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
            {(searchQuery || selectedCity) && (
              <button
                onClick={() => { setSearchQuery(''); setSelectedCity(''); }}
                className="px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-200px)]">
        {/* Google Map */}
        <div className="flex-1 relative overflow-hidden">
          <GoogleMap
            markers={mapMarkers}
            selectedId={selectedCoworking}
            onSelect={setSelectedCoworking}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full sm:w-96 bg-white border-l border-gray-200 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-gray-100 flex-shrink-0">
            <p className="text-sm text-gray-600">
              Nalezeno <span className="font-bold text-gray-900">{filteredCoworkings.length}</span> coworkingů
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredCoworkings.length > 0 ? filteredCoworkings.map((cw) => (
              <div
                key={cw.id}
                onClick={() => setSelectedCoworking(cw.id === selectedCoworking ? null : cw.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCoworking === cw.id
                    ? 'border-orange-400 bg-orange-50 shadow-md'
                    : 'border-gray-100 hover:border-blue-300 bg-white'
                }`}
              >
                {/* Thumbnail */}
                {cw.photos && cw.photos[0] && (
                  <div className="relative w-full h-28 mb-3 rounded-lg overflow-hidden bg-gray-100">
                    <img src={cw.photos[0].url} alt={cw.name} className="w-full h-full object-cover" />
                  </div>
                )}

                <h3 className="font-bold text-gray-900 mb-1">{cw.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3" />{cw.city}
                </p>
                <p className="text-xs text-gray-600 line-clamp-2 mb-3">{cw.shortDescription}</p>

                {/* Mini stats */}
                <div className="flex flex-wrap gap-3 mb-3 text-xs text-gray-600">
                  {cw.capacity && (
                    <span className="flex items-center gap-1"><Users className="w-3 h-3 text-blue-500" />{cw.capacity} míst</span>
                  )}
                  {(cw as any).prices?.dayPass?.enabled && (cw as any).prices.dayPass.from && (
                    <span className="flex items-center gap-1"><DollarSign className="w-3 h-3 text-orange-500" />od {(cw as any).prices.dayPass.from} Kč/den</span>
                  )}
                  {(cw as any).prices?.openSpace?.enabled && (cw as any).prices.openSpace.from && (
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-green-500" />od {(cw as any).prices.openSpace.from} Kč/měs</span>
                  )}
                </div>

                <Link
                  href={`/coworking/${cw.slug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Detail <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )) : (
              <div className="text-center py-12">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Žádné výsledky</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
