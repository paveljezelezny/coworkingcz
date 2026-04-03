'use client';

import { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import Link from 'next/link';
import { AMENITY_LABELS } from '@/lib/types';

export default function AddCoworkingPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    region: '',
    capacity: 20,
    areaM2: 500,
    shortDescription: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    prices: {
      hourly:    { enabled: false, from: null as number | null },
      dayPass:   { enabled: false, from: null as number | null },
      openSpace: { enabled: false, from: null as number | null },
      fixDesk:   { enabled: false, from: null as number | null },
      office:    { enabled: false, from: null as number | null },
    },
    amenities: ['wifi'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData(prev => {
      const amenities = prev.amenities as string[];
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.city) {
      alert('Vyplňte prosím název a město');
      return;
    }

    setLoading(true);
    try {
      // For now, just show a message - adding new coworkings would require
      // updating the static data or a dedicated creation endpoint
      alert('Přidávání nových coworkingů zatím není implementováno. Kontaktujte správce.');
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Přidat coworking</h1>
          <div className="w-24" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basics Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Základní informace</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Název *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Město *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
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
                    value={formData.capacity}
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
                    value={formData.areaM2}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Popis</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Krátký popis
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                />
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailní popis
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Kontakt</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
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
                    value={formData.phone}
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
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Ceny</h2>
              <p className="text-sm text-gray-500 mb-4">Zaškrtni typy cen, které coworking nabízí, a zadej cenu "od".</p>
              <div className="space-y-3">
                {([
                  { key: 'hourly',    label: 'Hodina',      unit: 'Kč/hod' },
                  { key: 'dayPass',   label: 'Den',         unit: 'Kč/den' },
                  { key: 'openSpace', label: 'Open Space',  unit: 'Kč/měs' },
                  { key: 'fixDesk',   label: 'Fix Desk',    unit: 'Kč/měs' },
                  { key: 'office',    label: 'Kancelář',    unit: 'Kč/měs' },
                ] as const).map(({ key, label, unit }) => {
                  const entry = formData.prices[key];
                  return (
                    <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <label className="flex items-center gap-2 w-36 flex-shrink-0 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={entry.enabled}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            prices: { ...prev.prices, [key]: { ...prev.prices[key], enabled: e.target.checked } },
                          }))}
                          className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                      </label>
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500 whitespace-nowrap">od</span>
                        <input
                          type="number"
                          min={0}
                          placeholder="—"
                          disabled={!entry.enabled}
                          value={entry.from ?? ''}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            prices: { ...prev.prices, [key]: { ...prev.prices[key], from: e.target.value ? parseInt(e.target.value) : null } },
                          }))}
                          className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        />
                        <span className="text-xs text-gray-500">{unit}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Amenities Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">Vybavení</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {amenities.map(amenity => (
                  <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.amenities as string[]).includes(amenity)}
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

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
              >
                {loading && <Loader className="w-5 h-5 animate-spin" />}
                Vytvořit
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
