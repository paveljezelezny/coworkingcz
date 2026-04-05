'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, X, MapPin, DollarSign, Building2, Calendar, Users2 } from 'lucide-react';
import CoworkingCard from '@/components/CoworkingCard';
import { coworkingsData, getCitiesWithCount } from '@/lib/data/coworkings';
import { AMENITY_LABELS, VENUE_TYPE_LABELS, FilterOptions, CoworkingSpace } from '@/lib/types';

function CoworkingyPageInner() {
  const searchParams = useSearchParams();

  // Inicializuj filtry z URL params (přesměrování z homepage)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') ?? '');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedVenueTypes, setSelectedVenueTypes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [maxMonthlyPrice, setMaxMonthlyPrice] = useState(30000);
  const [minCapacity, setMinCapacity] = useState(0);
  const [minArea, setMinArea] = useState(0);
  const [onlyEventSpace, setOnlyEventSpace] = useState(false);
  const [onlySpecialDeal, setOnlySpecialDeal] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  // Start empty — never flash stale static photos. Fill from live API only.
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch coworkings with DB overrides (photos, edits, deletions)
  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        // cache: 'no-store' prevents the browser from serving a stale cached response
        const response = await fetch('/api/admin/coworkings', { cache: 'no-store' });
        if (!response.ok) throw new Error('API error');
        const data = await response.json();
        setCoworkings(Array.isArray(data) ? data : coworkingsData);
      } catch (error) {
        console.error('Failed to fetch coworkings:', error);
        setCoworkings(coworkingsData); // graceful fallback
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
  const venueTypeKeys = Object.keys(VENUE_TYPE_LABELS);

  const filteredCoworkings = useMemo(() => {
    let results = coworkings;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (cw) =>
          cw.name.toLowerCase().includes(query) ||
          cw.shortDescription.toLowerCase().includes(query) ||
          cw.city.toLowerCase().includes(query)
      );
    }

    // Použij substring match — "Praha" najde i "Praha 3", "Praha 1" atd.
    if (selectedCity) results = results.filter((cw) =>
      cw.city.toLowerCase().includes(selectedCity.toLowerCase())
    );

    if (selectedAmenities.length > 0) {
      results = results.filter((cw) => selectedAmenities.every((a) => cw.amenities.includes(a)));
    }

    if (selectedVenueTypes.length > 0) {
      results = results.filter((cw) =>
        selectedVenueTypes.some((v) => ((cw as any).venueTypes || []).includes(v))
      );
    }

    if (maxPrice < 10000) results = results.filter((cw) => !cw.prices?.dayPass?.from || cw.prices.dayPass.from <= maxPrice);
    if (maxMonthlyPrice < 30000) results = results.filter((cw) => !cw.prices?.openSpace?.from || cw.prices.openSpace.from <= maxMonthlyPrice);
    if (minCapacity > 0) results = results.filter((cw) => !cw.capacity || cw.capacity >= minCapacity);
    if (minArea > 0) results = results.filter((cw) => !cw.areaM2 || cw.areaM2 >= minArea);
    if (onlyEventSpace) results = results.filter((cw) => (cw as any).hasEventSpace === true);
    if (onlySpecialDeal) results = results.filter((cw) => cw.specialDeal?.enabled);

    // Primary sort
    if (sortBy === 'name') results.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'price') results.sort((a, b) => (a.prices?.dayPass?.from || 0) - (b.prices?.dayPass?.from || 0));
    else if (sortBy === 'price_monthly') results.sort((a, b) => (a.prices?.openSpace?.from || 0) - (b.prices?.openSpace?.from || 0));
    else if (sortBy === 'capacity') results.sort((a, b) => (b.capacity || 0) - (a.capacity || 0));
    else if (sortBy === 'featured') results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));

    // isFeatured vždy první bez ohledu na řazení
    results.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return 0;
    });

    return results;
  }, [coworkings, searchQuery, selectedCity, selectedAmenities, selectedVenueTypes, maxPrice, maxMonthlyPrice, minCapacity, minArea, onlyEventSpace, onlySpecialDeal, sortBy]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const toggleVenueType = (v: string) => {
    setSelectedVenueTypes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const hasActiveFilters =
    selectedCity || selectedAmenities.length > 0 || selectedVenueTypes.length > 0 ||
    maxPrice < 10000 || maxMonthlyPrice < 30000 || minCapacity > 0 || minArea > 0 || onlyEventSpace || onlySpecialDeal;

  const clearAllFilters = () => {
    setSelectedCity('');
    setSelectedAmenities([]);
    setSelectedVenueTypes([]);
    setMaxPrice(10000);
    setMaxMonthlyPrice(30000);
    setMinCapacity(0);
    setMinArea(0);
    setOnlyEventSpace(false);
    setOnlySpecialDeal(false);
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
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto">
              {/* City */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />Město
                </h3>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="input-field w-full">
                  <option value="">Všechna města</option>
                  {cities.map((city) => (
                    <option key={city.city} value={city.city}>{city.city} ({city.count})</option>
                  ))}
                </select>
              </div>

              {/* Price/day */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-orange-500" />
                  Max. cena/den: <span className="text-blue-600">{maxPrice === 10000 ? 'bez omezení' : `${maxPrice} Kč`}</span>
                </h3>
                <input type="range" min="0" max="10000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>

              {/* Price/month */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Max. cena/měsíc: <span className="text-blue-600">{maxMonthlyPrice === 30000 ? 'bez omezení' : `${maxMonthlyPrice} Kč`}</span>
                </h3>
                <input type="range" min="0" max="30000" step="500" value={maxMonthlyPrice} onChange={(e) => setMaxMonthlyPrice(Number(e.target.value))} className="w-full accent-green-600" />
              </div>

              {/* Min capacity */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm flex items-center gap-2">
                  <Users2 className="w-4 h-4 text-blue-500" />
                  Min. kapacita: <span className="text-blue-600">{minCapacity === 0 ? 'bez omezení' : `${minCapacity} míst`}</span>
                </h3>
                <input type="range" min="0" max="200" step="5" value={minCapacity} onChange={(e) => setMinCapacity(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>

              {/* Min area */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">
                  Min. plocha: <span className="text-blue-600">{minArea === 0 ? 'bez omezení' : `${minArea} m²`}</span>
                </h3>
                <input type="range" min="0" max="2000" step="50" value={minArea} onChange={(e) => setMinArea(Number(e.target.value))} className="w-full accent-blue-600" />
              </div>

              {/* Event space only */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-purple-50 transition-colors">
                  <input type="checkbox" checked={onlyEventSpace} onChange={(e) => setOnlyEventSpace(e.target.checked)} className="w-4 h-4 rounded accent-purple-600" />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-purple-500" />Eventový prostor
                  </span>
                </label>
              </div>

              {/* Special Deal only */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-amber-50 transition-colors">
                  <input type="checkbox" checked={onlySpecialDeal} onChange={(e) => setOnlySpecialDeal(e.target.checked)} className="w-4 h-4 rounded accent-amber-500" />
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    🏷️ <span>Jen Special Deal</span>
                  </span>
                </label>
              </div>

              {/* Amenities */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Vybavení</h3>
                <div className="space-y-1.5">
                  {amenities.map((amenity) => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                      <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} className="w-4 h-4 rounded accent-blue-600" />
                      <span className="text-xs text-gray-700">{AMENITY_LABELS[amenity] || amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Venue types */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Typ akce / využití</h3>
                <div className="space-y-1.5">
                  {venueTypeKeys.map((v) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                      <input type="checkbox" checked={selectedVenueTypes.includes(v)} onChange={() => toggleVenueType(v)} className="w-4 h-4 rounded accent-purple-600" />
                      <span className="text-xs text-gray-700">{VENUE_TYPE_LABELS[v]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Clear */}
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="w-full py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200">
                  Vymazat všechny filtry
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
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 input-field">
                <option value="featured">Doporučené</option>
                <option value="name">Název A-Z</option>
                <option value="price">Cena/den (nízká-vysoká)</option>
                <option value="price_monthly">Cena/měsíc (nízká-vysoká)</option>
                <option value="capacity">Kapacita (největší)</option>
              </select>
            </div>

            {/* Desktop Sort */}
            <div className="hidden lg:flex mb-6 items-center gap-4">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-56">
                <option value="featured">Doporučené</option>
                <option value="name">Název A-Z</option>
                <option value="price">Cena/den (nízká-vysoká)</option>
                <option value="price_monthly">Cena/měsíc (nízká-vysoká)</option>
                <option value="capacity">Kapacita (největší)</option>
              </select>
              {hasActiveFilters && (
                <button onClick={clearAllFilters} className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                  <X className="w-4 h-4" />Vymazat filtry
                </button>
              )}
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
              {loading ? (
                /* Skeleton cards while live data loads — no stale photos flash */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-lg bg-white border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-full" />
                        <div className="h-4 bg-gray-100 rounded w-5/6" />
                        <div className="h-10 bg-gray-200 rounded mt-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
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
                        onClick={() => { setSearchQuery(''); clearAllFilters(); }}
                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Vymazat filtry
                      </button>
                    </div>
                  )}
                </>
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
