'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X, MapPin, DollarSign } from 'lucide-react';
import CoworkingCard from '@/components/CoworkingCard';
import { coworkingsData, getCitiesWithCount } from '@/lib/data/coworkings';
import { AMENITY_LABELS, FilterOptions, CoworkingSpace } from '@/lib/types';

function CoworkingyPageInner() {
  const searchParams = useSearchParams();

  // Inicializuj filtry z URL params (přesměrování z homepage)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') ?? '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minCapacity, setMinCapacity] = useState(0);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>(coworkingsData);
  const [loading, setLoading] = useState(true);

  // Fetch coworkings with DB overrides (to filter deleted ones)
  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        const response = await fetch('/api/admin/coworkings');
        const data = await response.json();
        setCoworkings(data);
      } catch (error) {
        console.error('Failed to fetch coworkings:', error);
        // Fallback to static data
        setCoworkings(coworkingsData);
      } finally {
        setLoading(false);
      }
    };
    fetchCoworkings();
  }, []);

  const cities = useMemo(() => {
    const citiesWithCount: Record<string, number> = {};
    coworkings.forEach((cw) => {
      citiesWithCount[cw.city] = (citiesWithCount[cw.city] || 0) + 1;
    });
    return Object.entries(citiesWithCount).map(([city, count]) => ({ city, count }));
  }, [coworkings]);

  const amenities = Object.keys(AMENITY_LABELS);

  const filteredCoworkings = useMemo(() => {
    let results = coworkings;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (cw) =>
          cw.name.toLowerCase().includes(query) ||
          cw.shortDescription.toLowerCase().includes(query) ||
          cw.description.toLowerCase().includes(query)
      );
    }

    // City filter
    if (selectedCity) {
      results = results.filter((cw) => cw.city === selectedCity);
    }

    // Amenities filter
    if (selectedAmenities.length > 0) {
      results = results.filter((cw) =>
        selectedAmenities.some((a) => cw.amenities.includes(a))
      );
    }

    // Price filter
    results = results.filter(
      (cw) => !cw.priceDayPass || cw.priceDayPass <= maxPrice
    );

    // Capacity filter
    results = results.filter(
      (cw) => !cw.capacity || cw.capacity >= minCapacity
    );

    // Sorting
    if (sortBy === 'name') {
      results.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'price') {
      results.sort((a, b) => (a.priceDayPass || 0) - (b.priceDayPass || 0));
    } else if (sortBy === 'featured') {
      results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return results;
  }, [coworkings, searchQuery, selectedCity, selectedAmenities, maxPrice, minCapacity, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Všechny coworkingy
          </h1>
          <p className="text-gray-600">
            Procházej a filtruj {coworkings.length} coworkingových prostorů
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledej coworking, město, vybavení..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6 sticky top-24">
              {/* City Filter */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Město</h3>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="input-field w-full"
                >
                  <option value="">Všechna města</option>
                  {cities.map((city) => (
                    <option key={city.city} value={city.city}>
                      {city.city} ({city.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">
                  Max. cena/den: {maxPrice} Kč
                </h3>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Capacity Filter */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">
                  Min. kapacita: {minCapacity} míst
                </h3>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="10"
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Vybavení</h3>
                <div className="space-y-2">
                  {amenities.slice(0, 10).map((amenity) => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                        className="w-4 h-4 rounded accent-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        {AMENITY_LABELS[amenity] || amenity}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {(selectedCity || selectedAmenities.length > 0 || maxPrice < 10000 || minCapacity > 0) && (
                <button
                  onClick={() => {
                    setSelectedCity('');
                    setSelectedAmenities([]);
                    setMaxPrice(10000);
                    setMinCapacity(0);
                  }}
                  className="w-full py-2 px-4 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Vymazat filtry
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-6 flex gap-3">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium text-gray-900 hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filtry
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 input-field"
              >
                <option value="featured">Doporučené</option>
                <option value="name">Název A-Z</option>
                <option value="price">Cena (nízká - vysoká)</option>
              </select>
            </div>

            {/* Desktop Sort */}
            <div className="hidden lg:block mb-6">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field w-48"
              >
                <option value="featured">Doporučené</option>
                <option value="name">Název A-Z</option>
                <option value="price">Cena (nízká - vysoká)</option>
              </select>
            </div>

            {/* Mobile Filter Panel */}
            {mobileFilterOpen && (
              <div className="lg:hidden bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-6 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900">Filtry</h2>
                  <button
                    onClick={() => setMobileFilterOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* City Filter Mobile */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Město</h3>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="input-field w-full"
                  >
                    <option value="">Všechna města</option>
                    {cities.map((city) => (
                      <option key={city.city} value={city.city}>
                        {city.city} ({city.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Filter Mobile */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">
                    Max. cena/den: {maxPrice} Kč
                  </h3>
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    step="100"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Amenities Mobile */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Vybavení</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {amenities.slice(0, 8).map((amenity) => (
                      <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">
                          {AMENITY_LABELS[amenity] || amenity}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div>
              <p className="text-sm text-gray-600 mb-6">
                Nalezeno <span className="font-bold text-gray-900">{filteredCoworkings.length}</span> coworkingů
              </p>

              {filteredCoworkings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredCoworkings.map((coworking) => (
                    <CoworkingCard key={coworking.id} coworking={coworking} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Žádné výsledky
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Zkus změnit filtry nebo hledaný text
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCity('');
                      setSelectedAmenities([]);
                      setMaxPrice(10000);
                      setMinCapacity(0);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Vymazat filtry
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CoworkingyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Načítám...</div></div>}>
      <CoworkingyPageInner />
    </Suspense>
  );
}
