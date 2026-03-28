'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, MapPin, Tag, User, DollarSign } from 'lucide-react';
import { marketplaceData } from '@/lib/data/coworkings';
import Link from 'next/link';

type Category = 'all' | 'job_offer' | 'job_seeking' | 'service_offer' | 'service_seeking' | 'item_for_sale' | 'item_wanted';

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'Vše' },
    { id: 'job_offer', label: 'Nabídky práce' },
    { id: 'job_seeking', label: 'Hledám práci' },
    { id: 'service_offer', label: 'Nabízím služby' },
    { id: 'service_seeking', label: 'Hledám služby' },
    { id: 'item_for_sale', label: 'Prodej' },
    { id: 'item_wanted', label: 'Koupím' },
  ];

  const filteredListings = useMemo(() => {
    return marketplaceData.filter((listing) => {
      const matchCategory =
        selectedCategory === 'all' || listing.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      job_offer: { label: 'Nabídka práce', bgColor: 'bg-green-50', textColor: 'text-green-700' },
      job_seeking: { label: 'Hledám práci', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
      service_offer: { label: 'Nabízím služby', bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
      service_seeking: { label: 'Hledám služby', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
      item_for_sale: { label: 'Prodej', bgColor: 'bg-pink-50', textColor: 'text-pink-700' },
      item_wanted: { label: 'Koupím', bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
    };
    const config = categoryMap[category] || categoryMap.job_offer;
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Marketplace
            </h1>
            <p className="text-gray-600">
              Nabídky práce, služby, a prodej mezi coworkery
            </p>
          </div>
          <Link
            href="/marketplace/nova-nabidka"
            className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Přidat inzerát
          </Link>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledej nabídky, služby..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 w-full"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Add Button */}
        <div className="sm:hidden mb-6">
          <Link
            href="/marketplace/nova-nabidka"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Přidat inzerát
          </Link>
        </div>

        {/* Listings Grid */}
        {filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, idx) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col animate-fade-in"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Category Badge */}
                <div className="mb-4">
                  {getCategoryBadge(listing.category)}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex-grow">
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                {/* Tags */}
                {listing.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Info */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {/* Price */}
                  {listing.price && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Cena
                      </span>
                      <span className="font-bold text-gray-900">
                        {listing.price} Kč
                        {listing.priceType && listing.priceType !== 'fixed' && (
                          <span className="text-xs text-gray-600 font-normal ml-1">
                            /{listing.priceType === 'hourly' ? 'hod' : ''}
                          </span>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Location */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Poloha
                    </span>
                    <span className="text-gray-900 font-medium">{listing.location}</span>
                  </div>

                  {/* User */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <User className="w-4 h-4" />
                      Inzerát
                    </span>
                    <span className="text-gray-900 font-medium truncate">
                      {listing.userName}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full mt-4 py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Kontaktovat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Žádné inzeráty
            </h3>
            <p className="text-gray-600 mb-6">
              Zkus změnit filtry nebo se vrať později
            </p>
            <Link
              href="/marketplace/nova-nabidka"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Přidat první inzerát
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
