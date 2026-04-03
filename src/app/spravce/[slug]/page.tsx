'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, ExternalLink, CheckCircle, AlertCircle,
  Info, Clock, Wifi, DollarSign, Image, Phone, Globe, Mail,
  MapPin, Users, Building2
} from 'lucide-react';
import { coworkingsData } from '@/lib/data/coworkings';
import { AMENITY_LABELS } from '@/lib/types';

const DAYS = [
  { key: 'mon', label: 'Pondělí' },
  { key: 'tue', label: 'Úterý' },
  { key: 'wed', label: 'Středa' },
  { key: 'thu', label: 'Čtvrtek' },
  { key: 'fri', label: 'Pátek' },
  { key: 'sat', label: 'Sobota' },
  { key: 'sun', label: 'Neděle' },
];

const ALL_AMENITIES = Object.keys(AMENITY_LABELS);

type Tab = 'info' | 'contact' | 'hours' | 'amenities' | 'pricing' | 'photos';

interface EditData {
  name?: string;
  shortDescription?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  openingHours?: Record<string, string>;
  amenities?: string[];
  prices?: {
    hourly?:    { enabled: boolean; from: number | null };
    dayPass?:   { enabled: boolean; from: number | null };
    openSpace?: { enabled: boolean; from: number | null };
    fixDesk?:   { enabled: boolean; from: number | null };
    office?:    { enabled: boolean; from: number | null };
  };
  capacity?: number | null;
  areaM2?: number | null;
  photos?: { url: string; caption?: string }[];
}

interface EditPageProps {
  params: { slug: string };
}

export default function EditCoworkingPage({ params }: EditPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const baseCoworking = coworkingsData.find((c) => c.slug === params.slug);

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [formData, setFormData] = useState<EditData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  // Merge static data with DB overrides
  const merged = {
    name: formData.name ?? baseCoworking?.name ?? '',
    shortDescription: formData.shortDescription ?? baseCoworking?.shortDescription ?? '',
    description: formData.description ?? baseCoworking?.description ?? '',
    phone: formData.phone ?? baseCoworking?.phone ?? '',
    email: formData.email ?? baseCoworking?.email ?? '',
    website: formData.website ?? baseCoworking?.website ?? '',
    address: formData.address ?? baseCoworking?.address ?? '',
    city: formData.city ?? baseCoworking?.city ?? '',
    zipCode: formData.zipCode ?? (baseCoworking as any)?.zipCode ?? '',
    openingHours: formData.openingHours ?? (baseCoworking?.openingHours as unknown as Record<string, string>) ?? {},
    amenities: formData.amenities ?? baseCoworking?.amenities ?? [],
    prices: formData.prices ?? (baseCoworking?.prices as any) ?? {
      hourly:    { enabled: false, from: null },
      dayPass:   { enabled: false, from: null },
      openSpace: { enabled: false, from: null },
      fixDesk:   { enabled: false, from: null },
      office:    { enabled: false, from: null },
    },
    capacity: formData.capacity ?? baseCoworking?.capacity ?? null,
    areaM2: formData.areaM2 ?? baseCoworking?.areaM2 ?? null,
    photos: formData.photos ?? (baseCoworking?.photos?.map((p) => ({ url: p.url, caption: p.caption })) ?? []),
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/prihlaseni?callbackUrl=/spravce/${params.slug}`);
      return;
    }
    if (status === 'authenticated') {
      loadEditData();
    }
  }, [status]);

  const loadEditData = async () => {
    try {
      const res = await fetch(`/api/coworkings/${params.slug}/edit`);
      if (res.status === 403 || res.status === 404) {
        setAccessDenied(true);
        return;
      }
      if (res.ok) {
        const { data } = await res.json();
        if (data && Object.keys(data).length > 0) {
          setFormData(data);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const update = (field: keyof EditData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateHours = (day: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      openingHours: { ...(prev.openingHours ?? {}), [day]: value },
    }));
  };

  const toggleAmenity = (amenity: string) => {
    const current = merged.amenities;
    const next = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    update('amenities', next);
  };

  const updatePhoto = (idx: number, field: 'url' | 'caption', value: string) => {
    const photos = [...merged.photos];
    photos[idx] = { ...photos[idx], [field]: value };
    update('photos', photos);
  };

  const addPhoto = () => {
    update('photos', [...merged.photos, { url: '', caption: '' }]);
  };

  const removePhoto = (idx: number) => {
    update('photos', merged.photos.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/coworkings/${params.slug}/edit`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Nepodařilo se uložit');
        return;
      }

      setSavedAt(new Date());
    } catch {
      setError('Chyba při ukládání');
    } finally {
      setSaving(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Přístup zamítnut</h2>
          <p className="text-gray-600 mb-6">
            Tento coworking nespravuješ. Nejdřív si ho{' '}
            <Link href={`/coworking/${params.slug}/narokovat`} className="text-blue-600 font-semibold">přivlastnit</Link>.
          </p>
          <Link href="/spravce" className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
            Zpět do správce
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Základní info', icon: <Info className="w-4 h-4" /> },
    { id: 'contact', label: 'Kontakt', icon: <Phone className="w-4 h-4" /> },
    { id: 'hours', label: 'Otevírací doba', icon: <Clock className="w-4 h-4" /> },
    { id: 'amenities', label: 'Vybavení', icon: <Wifi className="w-4 h-4" /> },
    { id: 'pricing', label: 'Ceny', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'photos', label: 'Fotografie', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/spravce" className="text-gray-500 hover:text-gray-700 flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-gray-900 truncate text-sm sm:text-base">{merged.name}</h1>
              <p className="text-xs text-gray-500">Editace profilu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {savedAt && !error && (
              <span className="text-xs text-green-600 flex items-center gap-1 hidden sm:flex">
                <CheckCircle className="w-3.5 h-3.5" />
                Uloženo {savedAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            {error && (
              <span className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </span>
            )}
            <Link
              href={`/coworking/${params.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Náhled</span>
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {saving ? (
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Ukládám...' : 'Uložit'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar tabs */}
          <div className="hidden sm:block w-48 flex-shrink-0">
            <nav className="space-y-1 sticky top-24">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile tabs */}
          <div className="sm:hidden w-full mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-600'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-gray-200 p-6">

              {/* TAB: Základní info */}
              {activeTab === 'info' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Základní informace</h2>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Název coworkingu *</label>
                    <input
                      type="text"
                      value={merged.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="input-field w-full"
                      placeholder="Název coworkingu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Krátký popis (zobrazuje se v kartičce)</label>
                    <input
                      type="text"
                      value={merged.shortDescription}
                      onChange={(e) => update('shortDescription', e.target.value)}
                      className="input-field w-full"
                      placeholder="Moderní coworkingový prostor v centru Prahy"
                      maxLength={120}
                    />
                    <p className="text-xs text-gray-400 mt-1">{merged.shortDescription?.length || 0}/120 znaků</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Plný popis</label>
                    <textarea
                      value={merged.description}
                      onChange={(e) => update('description', e.target.value)}
                      rows={6}
                      className="input-field w-full resize-none"
                      placeholder="Popište svůj coworking podrobně – atmosféra, community, co nabízíte, proč k vám přijít..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <Users className="w-4 h-4 inline mr-1" />
                        Kapacita (počet míst)
                      </label>
                      <input
                        type="number"
                        value={merged.capacity ?? ''}
                        onChange={(e) => update('capacity', e.target.value ? Number(e.target.value) : null)}
                        className="input-field w-full"
                        placeholder="50"
                        min={1}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <Building2 className="w-4 h-4 inline mr-1" />
                        Plocha (m²)
                      </label>
                      <input
                        type="number"
                        value={merged.areaM2 ?? ''}
                        onChange={(e) => update('areaM2', e.target.value ? Number(e.target.value) : null)}
                        className="input-field w-full"
                        placeholder="400"
                        min={1}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Kontakt */}
              {activeTab === 'contact' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Kontakt & adresa</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Telefon
                      </label>
                      <input
                        type="tel"
                        value={merged.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        className="input-field w-full"
                        placeholder="+420 123 456 789"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={merged.email}
                        onChange={(e) => update('email', e.target.value)}
                        className="input-field w-full"
                        placeholder="info@mujcoworking.cz"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <Globe className="w-4 h-4 inline mr-1" />
                      Webová stránka
                    </label>
                    <input
                      type="url"
                      value={merged.website}
                      onChange={(e) => update('website', e.target.value)}
                      className="input-field w-full"
                      placeholder="https://www.mujcoworking.cz"
                    />
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      Adresa
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Ulice a číslo</label>
                        <input
                          type="text"
                          value={merged.address}
                          onChange={(e) => update('address', e.target.value)}
                          className="input-field w-full"
                          placeholder="Václavské náměstí 1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Město</label>
                          <input
                            type="text"
                            value={merged.city}
                            onChange={(e) => update('city', e.target.value)}
                            className="input-field w-full"
                            placeholder="Praha"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">PSČ</label>
                          <input
                            type="text"
                            value={merged.zipCode}
                            onChange={(e) => update('zipCode', e.target.value)}
                            className="input-field w-full"
                            placeholder="110 00"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Otevírací doba */}
              {activeTab === 'hours' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Otevírací doba</h2>
                  <p className="text-sm text-gray-500">Formát: <code className="bg-gray-100 px-1 rounded">8:00 - 20:00</code> nebo <code className="bg-gray-100 px-1 rounded">Zavřeno</code></p>

                  <div className="space-y-3">
                    {DAYS.map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-semibold text-gray-700 flex-shrink-0">{label}</div>
                        <input
                          type="text"
                          value={merged.openingHours?.[key] ?? ''}
                          onChange={(e) => updateHours(key, e.target.value)}
                          className="input-field flex-1"
                          placeholder="8:00 - 20:00"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Rychlé nastavení:</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          const h: Record<string, string> = {};
                          DAYS.forEach(({ key }) => { h[key] = key === 'sat' || key === 'sun' ? 'Zavřeno' : '8:00 - 20:00'; });
                          update('openingHours', h);
                        }}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        Po–Pá 8–20, víkend zavřeno
                      </button>
                      <button
                        onClick={() => {
                          const h: Record<string, string> = {};
                          DAYS.forEach(({ key }) => { h[key] = '0:00 - 24:00'; });
                          update('openingHours', h);
                        }}
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                      >
                        24/7
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: Vybavení */}
              {activeTab === 'amenities' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Vybavení a služby</h2>
                  <p className="text-sm text-gray-500">Zaškrtni vše, co váš coworking nabízí.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_AMENITIES.map((amenity) => {
                      const isSelected = merged.amenities.includes(amenity);
                      return (
                        <button
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                            isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-medium">{AMENITY_LABELS[amenity] || amenity}</span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-gray-400">Vybráno: {merged.amenities.length} z {ALL_AMENITIES.length}</p>
                </div>
              )}

              {/* TAB: Ceny */}
              {activeTab === 'pricing' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Ceník</h2>
                  <p className="text-sm text-gray-500">Zaškrtni typy cen, které nabízíš, a zadej cenu "od" (bez DPH).</p>

                  <div className="space-y-3">
                    {([
                      { key: 'hourly',    label: 'Hodina',      unit: 'Kč/hod', color: 'blue' },
                      { key: 'dayPass',   label: 'Den',         unit: 'Kč/den', color: 'orange' },
                      { key: 'openSpace', label: 'Open Space',  unit: 'Kč/měs', color: 'green' },
                      { key: 'fixDesk',   label: 'Fix Desk',    unit: 'Kč/měs', color: 'purple' },
                      { key: 'office',    label: 'Kancelář',    unit: 'Kč/měs', color: 'teal' },
                    ] as const).map(({ key, label, unit, color }) => {
                      const entry = merged.prices?.[key] || { enabled: false, from: null };
                      const bgMap: Record<string, string> = {
                        blue: 'bg-blue-50 border-blue-100', orange: 'bg-orange-50 border-orange-100',
                        green: 'bg-green-50 border-green-100', purple: 'bg-purple-50 border-purple-100',
                        teal: 'bg-teal-50 border-teal-100',
                      };
                      const textMap: Record<string, string> = {
                        blue: 'text-blue-700', orange: 'text-orange-700', green: 'text-green-700',
                        purple: 'text-purple-700', teal: 'text-teal-700',
                      };
                      return (
                        <div key={key} className={`flex items-center gap-4 p-4 rounded-xl border ${bgMap[color]}`}>
                          <label className="flex items-center gap-2 w-36 flex-shrink-0 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!entry.enabled}
                              onChange={(e) => update('prices', {
                                ...merged.prices,
                                [key]: { ...entry, enabled: e.target.checked },
                              })}
                              className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className={`text-sm font-bold ${textMap[color]}`}>{label}</span>
                          </label>
                          <div className="flex items-center gap-2 flex-1">
                            <span className="text-xs text-gray-500 whitespace-nowrap">od</span>
                            <input
                              type="number"
                              min={0}
                              placeholder="—"
                              disabled={!entry.enabled}
                              value={entry.from ?? ''}
                              onChange={(e) => update('prices', {
                                ...merged.prices,
                                [key]: { ...entry, from: e.target.value ? Number(e.target.value) : null },
                              })}
                              className="w-28 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-white/60 disabled:text-gray-400 bg-white"
                            />
                            <span className="text-xs text-gray-500">{unit}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB: Fotografie */}
              {activeTab === 'photos' && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold text-gray-900 pb-3 border-b border-gray-100">Fotografie</h2>
                  <p className="text-sm text-gray-500">Zadej URL adresy fotek (z vlastního webu, Google Drive, Cloudinary apod.). Max. 6 fotek.</p>

                  <div className="space-y-4">
                    {merged.photos.map((photo, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          {photo.url && (
                            <img
                              src={photo.url}
                              alt={photo.caption || `Foto ${idx + 1}`}
                              className="w-20 h-16 object-cover rounded-lg flex-shrink-0 bg-gray-100"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          {!photo.url && (
                            <div className="w-20 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-300">
                              <Image className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <input
                              type="url"
                              value={photo.url}
                              onChange={(e) => updatePhoto(idx, 'url', e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="https://..."
                            />
                            <input
                              type="text"
                              value={photo.caption || ''}
                              onChange={(e) => updatePhoto(idx, 'caption', e.target.value)}
                              className="input-field w-full text-sm"
                              placeholder="Popisek fotky (volitelné)"
                            />
                          </div>
                          <button
                            onClick={() => removePhoto(idx)}
                            className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 mt-1"
                            title="Odebrat fotku"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {merged.photos.length < 6 && (
                    <button
                      onClick={addPhoto}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
                    >
                      + Přidat fotku
                    </button>
                  )}
                </div>
              )}

            </div>

            {/* Save button mobile */}
            <div className="mt-4 sm:hidden">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Ukládám...' : 'Uložit změny'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
