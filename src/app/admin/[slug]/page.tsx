'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Loader } from 'lucide-react';
import Link from 'next/link';
import { CoworkingSpace, AMENITY_LABELS } from '@/lib/types';

interface EditPageProps {
  params: { slug: string };
}

export default function EditCoworkingPage({ params }: EditPageProps) {
  const [coworking, setCoworking] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<CoworkingSpace>>({});

  // Fetch coworking on mount
  useEffect(() => {
    const fetchCoworking = async () => {
      try {
        const response = await fetch(`/api/admin/coworkings/${params.slug}`);
        const data = await response.json();
        setCoworking(data);
        setFormData(data);
      } catch (error) {
        console.error('Failed to fetch coworking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoworking();
  }, [params.slug]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => {
      const amenities = prev.amenities || [];
      if (amenities.includes(amenity)) {
        return {
          ...prev,
          amenities: amenities.filter(a => a !== amenity),
        };
      } else {
        return {
          ...prev,
          amenities: [...amenities, amenity],
        };
      }
    });
  };

  const handleSave = async () => {
    if (!coworking) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/coworkings/${coworking.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Save failed');
      alert('Uloženo!');
      // Refresh data
      const freshResponse = await fetch(`/api/admin/coworkings/${coworking.slug}`);
      const data = await freshResponse.json();
      setCoworking(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to save:', error);
      alert('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!coworking) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/coworkings/${coworking.slug}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Delete failed');
      window.location.href = '/admin';
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Chyba při mazání');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Načítám...</div>
      </div>
    );
  }

  if (!coworking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Coworking nenalezen</div>
      </div>
    );
  }

  const amenities = Object.keys(AMENITY_LABELS);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Zpět
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{coworking.name}</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Container */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          {/* Basics Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Základní informace</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Název
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Město
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kapacita (počet míst)
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plocha (m²)
                </label>
                <input
                  type="number"
                  name="areaM2"
                  value={formData.areaM2 || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Popis</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Krátký popis
              </label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Detailní popis
              </label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Contact Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Kontakt</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Web
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Ceny</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena za hodinu (Kč)
                </label>
                <input
                  type="number"
                  name="priceHourly"
                  value={formData.priceHourly || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena za den (Kč)
                </label>
                <input
                  type="number"
                  name="priceDayPass"
                  value={formData.priceDayPass || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cena za měsíc (Kč)
                </label>
                <input
                  type="number"
                  name="priceMonthly"
                  value={formData.priceMonthly || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Vybavení</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {amenities.map(amenity => (
                <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(formData.amenities || []).includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                    className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {AMENITY_LABELS[amenity] || amenity}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Status Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Status</h2>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isVerified"
                  checked={formData.isVerified || false}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Ověřený coworking</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured || false}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Zvýrazněný coworking</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 pt-6 flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Ukládám...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Uložit
                </>
              )}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={deleting}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors ml-auto"
            >
              {deleting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Mažu...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Smazat
                </>
              )}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
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
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Zrušit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-medium transition-colors"
                >
                  {deleting ? 'Mažu...' : 'Smazat'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
