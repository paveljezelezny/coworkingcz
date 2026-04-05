'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, MapPin, Tag, User, DollarSign, X, Mail, Phone, Globe, ExternalLink, Calendar, Briefcase } from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category = 'all' | 'job_offer' | 'job_seeking' | 'service_offer' | 'service_seeking' | 'item_for_sale' | 'item_wanted';

interface ListingMeta {
  tags?: string[];
  workType?: string | null;
  experienceLevel?: string | null;
  availableFrom?: string | null;
  condition?: string | null;
  externalUrl?: string | null;
}

interface Listing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: ListingMeta;
  price: number | null;
  priceType: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  userName: string;
  userImage: string | null;
}

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; emoji: string }> = {
  job_offer:       { label: 'Nabídka práce',    bgColor: 'bg-green-50',  textColor: 'text-green-700',  emoji: '💼' },
  job_seeking:     { label: 'Hledám práci',     bgColor: 'bg-blue-50',   textColor: 'text-blue-700',   emoji: '🙋' },
  service_offer:   { label: 'Nabízím služby',   bgColor: 'bg-purple-50', textColor: 'text-purple-700', emoji: '🛠️' },
  service_seeking: { label: 'Hledám služby',    bgColor: 'bg-orange-50', textColor: 'text-orange-700', emoji: '🔍' },
  item_for_sale:   { label: 'Prodám / pronajmu',bgColor: 'bg-pink-50',   textColor: 'text-pink-700',   emoji: '📦' },
  item_wanted:     { label: 'Koupím / přijmu',  bgColor: 'bg-indigo-50', textColor: 'text-indigo-700', emoji: '🛒' },
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  fixed: 'Kč',
  hourly: 'Kč/hod',
  monthly: 'Kč/měs',
  negotiable: 'Dohodou',
  free: 'Zdarma',
};

const WORK_TYPE_LABELS: Record<string, string> = {
  remote: 'Remote', onsite: 'Onsite', hybrid: 'Hybrid', flexible: 'Flexibilní',
};

const EXPERIENCE_LABELS: Record<string, string> = {
  junior: 'Junior', mid: 'Mid', senior: 'Senior', any: 'Jakákoliv úroveň',
};

const CONDITION_LABELS: Record<string, string> = {
  new: 'Nové', like_new: 'Jako nové', good: 'Dobrý stav', fair: 'Použité', for_parts: 'Na díly',
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function ListingModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const cfg = CATEGORY_CONFIG[listing.category] || CATEGORY_CONFIG.job_offer;
  const tags = listing.tags?.tags ?? [];
  const meta = listing.tags;

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });

  const formatPrice = () => {
    if (!listing.priceType) return null;
    if (listing.priceType === 'free') return 'Zdarma';
    if (listing.priceType === 'negotiable') return 'Dohodou';
    if (listing.price) return `${listing.price.toLocaleString('cs-CZ')} ${PRICE_TYPE_LABELS[listing.priceType] ?? 'Kč'}`;
    return null;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full mb-2 ${cfg.bgColor} ${cfg.textColor}`}>
              <span>{cfg.emoji}</span> {cfg.label}
            </span>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">{listing.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2">
            {listing.location && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-gray-400" /> {listing.location}
              </span>
            )}
            {formatPrice() && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 bg-blue-50 px-3 py-1.5 rounded-full">
                <DollarSign className="w-3.5 h-3.5 text-blue-500" /> {formatPrice()}
              </span>
            )}
            {meta.workType && (
              <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                {WORK_TYPE_LABELS[meta.workType] ?? meta.workType}
              </span>
            )}
            {meta.experienceLevel && (
              <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                {EXPERIENCE_LABELS[meta.experienceLevel] ?? meta.experienceLevel}
              </span>
            )}
            {meta.condition && (
              <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                {CONDITION_LABELS[meta.condition] ?? meta.condition}
              </span>
            )}
            {meta.availableFrom && (
              <span className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                od {new Date(meta.availableFrom).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Popis</h3>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Klíčová slova</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span key={i} className="text-sm bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact block */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                {listing.userImage ? (
                  <img src={listing.userImage} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{listing.userName}</p>
                <p className="text-xs text-gray-400">Zveřejněno {formatDate(listing.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {listing.contactEmail && (
                <a
                  href={`mailto:${listing.contactEmail}`}
                  className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  {listing.contactEmail}
                </a>
              )}
              {listing.contactPhone && (
                <a
                  href={`tel:${listing.contactPhone}`}
                  className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  {listing.contactPhone}
                </a>
              )}
              {meta.externalUrl && (
                <a
                  href={meta.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  {meta.externalUrl.replace(/^https?:\/\//, '').split('/')[0]}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>

          {/* CTA */}
          {listing.contactEmail && (
            <a
              href={`mailto:${listing.contactEmail}?subject=${encodeURIComponent(`Zájem o inzerát: ${listing.title}`)}`}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-base"
            >
              <Mail className="w-5 h-5" />
              Napsat e-mail
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'Vše' },
    { id: 'job_offer', label: 'Nabídky práce' },
    { id: 'job_seeking', label: 'Hledám práci' },
    { id: 'service_offer', label: 'Nabízím služby' },
    { id: 'service_seeking', label: 'Hledám služby' },
    { id: 'item_for_sale', label: 'Prodám' },
    { id: 'item_wanted', label: 'Koupím' },
  ];

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/listings');
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    return listings.filter((listing) => {
      const matchCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (listing.description ?? '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [listings, selectedCategory, searchQuery]);

  const getCategoryBadge = (category: string) => {
    const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.job_offer;
    return (
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cfg.bgColor} ${cfg.textColor}`}>
        {cfg.label}
      </span>
    );
  };

  const formatPrice = (listing: Listing) => {
    if (!listing.priceType) return null;
    if (listing.priceType === 'free') return 'Zdarma';
    if (listing.priceType === 'negotiable') return 'Dohodou';
    if (listing.price) return `${listing.price.toLocaleString('cs-CZ')} ${PRICE_TYPE_LABELS[listing.priceType] ?? 'Kč'}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Marketplace</h1>
            <p className="text-gray-600">Nabídky práce, služby, a prodej mezi coworkery</p>
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

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 rounded w-24 mb-4" />
                <div className="h-6 bg-gray-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-full mb-1" />
                <div className="h-4 bg-gray-100 rounded w-5/6" />
              </div>
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing, idx) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all p-6 flex flex-col animate-fade-in cursor-pointer"
                style={{ animationDelay: `${idx * 50}ms` }}
                onClick={() => setSelectedListing(listing)}
              >
                {/* Category Badge */}
                <div className="mb-4">{getCategoryBadge(listing.category)}</div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 flex-grow">
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                {/* Tags */}
                {(listing.tags?.tags ?? []).length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {(listing.tags.tags ?? []).slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer Info */}
                <div className="border-t border-gray-100 pt-4 space-y-3">
                  {formatPrice(listing) && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" /> Cena
                      </span>
                      <span className="font-bold text-gray-900">{formatPrice(listing)}</span>
                    </div>
                  )}
                  {listing.location && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Poloha
                      </span>
                      <span className="text-gray-900 font-medium">{listing.location}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <User className="w-4 h-4" /> Inzerát
                    </span>
                    <span className="text-gray-900 font-medium truncate max-w-[130px]">
                      {listing.userName}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className="w-full mt-4 py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={(e) => { e.stopPropagation(); setSelectedListing(listing); }}
                >
                  Kontaktovat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Žádné inzeráty</h3>
            <p className="text-gray-600 mb-6">Zkus změnit filtry nebo se vrať později</p>
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

      {/* Detail Modal */}
      {selectedListing && (
        <ListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
      )}
    </div>
  );
}
