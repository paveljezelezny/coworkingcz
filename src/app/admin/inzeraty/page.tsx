'use client';

import { useState, useEffect } from 'react';
import {
  Search, Trash2, Building2, Users, Tag, Calendar,
  ToggleLeft, ToggleRight, X, CheckCircle, XCircle,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import Link from 'next/link';

interface AdminListing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  location: string | null;
  price: number | null;
  priceType: string | null;
  isActive: boolean;
  createdAt: string;
  contactEmail: string | null;
  tags: Record<string, unknown>;
  user: { id: string; name: string | null; email: string } | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  job_offer: 'Práce',
  freelance: 'Freelance',
  service: 'Služba',
  product: 'Produkt',
  collaboration: 'Spolupráce',
  event: 'Event',
  other: 'Jiné',
};

export default function AdminInzeratyPage() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/listings');
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, []);

  const toggleActive = async (id: string, current: boolean) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !current }),
      });
      setListings(prev => prev.map(l => l.id === id ? { ...l, isActive: !current } : l));
    } finally {
      setActionId(null);
    }
  };

  const deleteListing = async (id: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
    } finally {
      setActionId(null);
      setDeleteConfirmId(null);
    }
  };

  const filtered = listings.filter((l) => {
    const matchSearch = !search || l.title.toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCategory || l.category === filterCategory;
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? l.isActive : !l.isActive);
    return matchSearch && matchCat && matchActive;
  });

  const categories = Array.from(new Set(listings.map(l => l.category)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Správa inzerátů z Marketplace</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Super Admin
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100">
            <Link href="/admin" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Coworkingy
            </Link>
            <Link href="/admin/uzivatele" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Users className="w-4 h-4" /> Uživatelé
            </Link>
            <Link href="/admin/inzeraty" className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Inzeráty
            </Link>
            <Link href="/admin/eventy" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Eventy
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Celkem</p>
            <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Aktivní</p>
            <p className="text-3xl font-bold text-green-600">{listings.filter(l => l.isActive).length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Neaktivní</p>
            <p className="text-3xl font-bold text-gray-400">{listings.filter(l => !l.isActive).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat inzerát, uživatele…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">Všechny kategorie</option>
            {categories.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c] ?? c}</option>
            ))}
          </select>
          <select
            value={filterActive}
            onChange={e => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="all">Všechny stavy</option>
            <option value="active">Aktivní</option>
            <option value="inactive">Neaktivní</option>
          </select>
          {(search || filterCategory || filterActive !== 'all') && (
            <button
              onClick={() => { setSearch(''); setFilterCategory(''); setFilterActive('all'); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <X className="w-4 h-4" /> Vymazat
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žádné inzeráty nenalezeny</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Inzerát</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Uživatel</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Kategorie</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600">Stav</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Přidáno</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((listing) => (
                  <>
                    <tr
                      key={listing.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setExpandedId(expandedId === listing.id ? null : listing.id)}
                            className="p-0.5 text-gray-400 hover:text-gray-700"
                          >
                            {expandedId === listing.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <div>
                            <p className="font-semibold text-gray-900">{listing.title}</p>
                            {listing.location && (
                              <p className="text-xs text-gray-400">{listing.location}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-gray-800">{listing.user?.name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{listing.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {CATEGORY_LABELS[listing.category] ?? listing.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleActive(listing.id, listing.isActive)}
                          disabled={actionId === listing.id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
                          title={listing.isActive ? 'Deaktivovat' : 'Aktivovat'}
                        >
                          {listing.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-700">Aktivní</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-gray-400">Neaktivní</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                        {new Date(listing.createdAt).toLocaleDateString('cs-CZ')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleActive(listing.id, listing.isActive)}
                            disabled={actionId === listing.id}
                            title={listing.isActive ? 'Deaktivovat' : 'Aktivovat'}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-50"
                          >
                            {listing.isActive ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                          {deleteConfirmId === listing.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => deleteListing(listing.id)}
                                disabled={actionId === listing.id}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                Smazat
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                              >
                                Zrušit
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(listing.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === listing.id && (
                      <tr key={`${listing.id}-detail`} className="bg-blue-50/40">
                        <td colSpan={6} className="px-8 py-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="font-semibold text-gray-700 mb-1">Popis</p>
                              <p className="text-gray-600">{listing.description || '—'}</p>
                            </div>
                            <div className="space-y-1">
                              <p><span className="font-semibold text-gray-700">Cena:</span> {listing.price ? `${listing.price} Kč` : 'neuvedena'}</p>
                              <p><span className="font-semibold text-gray-700">Kontakt:</span> {listing.contactEmail || '—'}</p>
                              <p><span className="font-semibold text-gray-700">Lokace:</span> {listing.location || '—'}</p>
                              <p><span className="font-semibold text-gray-700">Uživatel ID:</span> <span className="font-mono text-xs">{listing.user?.id ?? '—'}</span></p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
