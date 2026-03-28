'use client';

import { useState } from 'react';
import { MapPin, Search, Filter, X } from 'lucide-react';
import { coworkingsData } from '@/lib/data/coworkings';
import Link from 'next/link';

export default function MapaPage() {
  const [selectedCoworking, setSelectedCoworking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const cities = ['Praha', 'Brno', 'Ostrava', 'Plzeň', 'Liberec', 'České Budějovice', 'Olomouc', 'Hradec Králové'];

  const filteredCoworkings = coworkingsData.filter((cw) => {
    const matchSearch = !searchQuery || cw.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = !selectedCity || cw.city === selectedCity;
    return matchSearch && matchCity;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mapa coworkingů</h1>

          {/* Search */}
          <div className="flex gap-4 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Hledej coworking..."
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
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            {(searchQuery || selectedCity) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCity('');
                }}
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
        {/* Map Container */}
        <div className="flex-1 relative bg-gradient-to-br from-blue-100 to-orange-100 overflow-hidden">
          {/* Placeholder Map */}
          <div className="w-full h-full flex items-center justify-center text-center">
            <div className="text-gray-500">
              <MapPin className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold">Interaktivní mapa</p>
              <p className="text-sm">Integrace s mapovacím API (Google Maps, Mapbox) - připraveno pro implementaci</p>
            </div>
          </div>

          {/* Map Markers (Placeholder) */}
          <div className="absolute inset-0 pointer-events-none">
            {filteredCoworkings.map((cw, idx) => (
              <div
                key={cw.id}
                className="absolute pointer-events-auto"
                style={{
                  left: `${20 + idx * 8}%`,
                  top: `${30 + (idx % 3) * 20}%`,
                }}
              >
                <button
                  onClick={() => setSelectedCoworking(cw.id)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                    selectedCoworking === cw.id
                      ? 'bg-orange-500 ring-4 ring-orange-200 scale-125'
                      : 'bg-blue-600 hover:scale-110'
                  }`}
                  title={cw.name}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - List */}
        <div className="w-full sm:w-96 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Coworkingy ({filteredCoworkings.length})
            </h2>

            {filteredCoworkings.length > 0 ? (
              <div className="space-y-4">
                {filteredCoworkings.map((cw) => (
                  <div
                    key={cw.id}
                    onClick={() => setSelectedCoworking(cw.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCoworking === cw.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-100 hover:border-blue-300'
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-1">{cw.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                      <MapPin className="w-4 h-4" />
                      {cw.city}
                    </p>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {cw.shortDescription}
                    </p>
                    <Link
                      href={`/coworking/${cw.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Detail
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Žádné coworkingy se shodují s tvými kritérii</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
