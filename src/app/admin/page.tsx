'use client';

import { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Plus, ChevronDown, Users, Building2, Tag, Calendar, ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { CoworkingSpace, AMENITY_LABELS } from '@/lib/types';

interface CoworkingWithOverride extends CoworkingSpace {
  deleted?: boolean;
}

export default function AdminDashboard() {
  const [coworkings, setCoworkings] = useState<CoworkingWithOverride[]>([]);
  const [filteredCoworkings, setFilteredCoworkings] = useState<CoworkingWithOverride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'capacity'>('name');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<CoworkingSpace>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Fetch coworkings on mount
  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        const response = await fetch('/api/admin/coworkings');
        const data = await response.json();
        setCoworkings(data);
        setFilteredCoworkings(data);
      } catch (error) {
        console.error('Failed to fetch coworkings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoworkings();
  }, []);

  // Handle search and sort
  useEffect(() => {
    let results = coworkings;

    // Filter deleted (override JSON uses `deleted`, matching DELETE handler + detail page)
    results = results.filter(c => !c.deleted);

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.city.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query))
      );
    }

    // Sort
    results.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return a.city.localeCompare(b.city);
      if (sortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
      return 0;
    });

    setFilteredCoworkings(results);
  }, [coworkings, searchQuery, sortBy]);

  const handleEditStart = (coworking: CoworkingSpace) => {
    setEditingId(coworking.id);
    setEditData(coworking);
  };

  const handleEditSave = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/coworkings/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });

      if (!response.ok) throw new Error('Save failed');

      // Refresh list
      const freshResponse = await fetch('/api/admin/coworkings');
      const data = await freshResponse.json();
      setCoworkings(data);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Chyba při ukládání');
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/coworkings/${slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Pull the real reason from the API so we're not debugging blind next time.
        let reason = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          if (payload?.error) reason = payload.error;
        } catch {
          // response wasn't JSON — keep the HTTP status
        }
        throw new Error(reason);
      }

      // Refresh list
      const freshResponse = await fetch('/api/admin/coworkings');
      const data = await freshResponse.json();
      setCoworkings(data);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete:', error);
      const message = error instanceof Error ? error.message : 'neznámá chyba';
      alert(`Chyba při mazání: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{minHeight:320}}>
        <div className="text-gray-600">Načítám...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Správa všech coworkingů</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Super Admin
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100 pt-0">
            <Link
              href="/admin"
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Coworkingy
            </Link>
            <Link
              href="/admin/uzivatele"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Uživatelé
            </Link>
            <Link
              href="/admin/zadosti"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Žádosti
            </Link>
            <Link
              href="/admin/inzeraty"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Tag className="w-4 h-4" />
              Inzeráty
            </Link>
            <Link
              href="/admin/eventy"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Eventy
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Vyhledat coworking..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <Link
            href="/admin/pridat"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Přidat
          </Link>
        </div>

        {/* Controls Row */}
        <div className="mb-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredCoworkings.length} coworkingů
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Seřadit: Název</option>
            <option value="city">Seřadit: Město</option>
            <option value="capacity">Seřadit: Kapacita</option>
          </select>
        </div>

        {/* Coworkings Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Název
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Město
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Kapacita
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Plán
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCoworkings.map((coworking) => (
                  <tr key={coworking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {coworking.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coworking.city}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {coworking.capacity || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(() => {
                        const cap = coworking.capacity || 0;
                        if (cap <= 0) return <span className="text-gray-400">—</span>;
                        if (cap < 30) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">Malý</span>;
                        if (cap <= 60) return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Střední</span>;
                        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Velký</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        {coworking.isVerified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Ověřeno
                          </span>
                        )}
                        {coworking.isFeatured && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/${coworking.slug}`}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Upravit
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(coworking.slug)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Smazat
                        </button>
                      </div>

                      {/* Delete Confirmation */}
                      {showDeleteConfirm === coworking.slug && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Smazat {coworking.name}?
                            </h3>
                            <p className="text-gray-600 mb-6">
                              Tuto akci nelze vrátit zpět.
                            </p>
                            <div className="flex gap-3">
                              <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                              >
                                Zrušit
                              </button>
                              <button
                                onClick={() => handleDelete(coworking.slug)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                              >
                                Smazat
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredCoworkings.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">Žádné coworkingů nebyly nalezeny</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
