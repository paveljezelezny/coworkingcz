'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader,
  Upload,
  X,
  ImageIcon,
  Youtube,
  Boxes,
  Star,
  Building2,
  Users,
  Armchair,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { CoworkingSpace, Photo, AMENITY_LABELS, VENUE_TYPE_LABELS, VENUE_TYPE_EMOJIS } from '@/lib/types';

interface EditPageProps {
  params: { slug: string };
}

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // accept up to 10 MB input; canvas compresses to ~200 KB

/**
 * Compress an image file via Canvas to max 1400px on the longest side,
 * JPEG quality 0.82. Result is typically 80–250 KB regardless of input size.
 */
function compressImage(file: File, maxPx = 1400, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxPx || height > maxPx) {
          if (width >= height) {
            height = Math.round((height * maxPx) / width);
            width = maxPx;
          } else {
            width = Math.round((width * maxPx) / height);
            height = maxPx;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function EditCoworkingPage({ params }: EditPageProps) {
  const [coworking, setCoworking] = useState<CoworkingSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<Partial<CoworkingSpace>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? null : parseInt(value)) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAmenityChange = (amenity: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities || [];
      return {
        ...prev,
        amenities: amenities.includes(amenity)
          ? amenities.filter((a) => a !== amenity)
          : [...amenities, amenity],
      };
    });
  };

  const handleVenueTypeChange = (type: string) => {
    setFormData((prev) => {
      const types: string[] = (prev as any).venueTypes || [];
      return {
        ...prev,
        venueTypes: types.includes(type)
          ? types.filter((t) => t !== type)
          : [...types, type],
      } as any;
    });
  };

  // ── Photo upload ──────────────────────────────────────────────────────────
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setPhotoError(null);
    setUploadingPhoto(true);

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setPhotoError('Pouze obrázkové soubory jsou povoleny (JPG, PNG, WebP…).');
        continue;
      }
      if (file.size > MAX_PHOTO_SIZE) {
        setPhotoError(`Soubor "${file.name}" je příliš velký (max 10 MB).`);
        continue;
      }

      try {
        // Compress via Canvas → JPEG ~80–250 KB regardless of input size
        const compressedUrl = await compressImage(file);

        const newPhoto: Photo = {
          id: `photo_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          url: compressedUrl,
          caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          isPrimary: false,
        };

        setFormData((prev) => {
          const existing = prev.photos || [];
          const hasPrimary = existing.some((p) => p.isPrimary);
          return {
            ...prev,
            photos: [
              ...existing,
              { ...newPhoto, isPrimary: !hasPrimary && existing.length === 0 },
            ],
          };
        });
      } catch {
        setPhotoError(`Nepodařilo se zpracovat soubor "${file.name}".`);
      }
    }

    setUploadingPhoto(false);
    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemovePhoto = (photoId: string) => {
    setFormData((prev) => {
      const remaining = (prev.photos || []).filter((p) => p.id !== photoId);
      // If we removed the primary, promote the first remaining
      const hasPrimary = remaining.some((p) => p.isPrimary);
      if (!hasPrimary && remaining.length > 0) {
        remaining[0] = { ...remaining[0], isPrimary: true };
      }
      return { ...prev, photos: remaining };
    });
  };

  const handleSetPrimary = (photoId: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).map((p) => ({
        ...p,
        isPrimary: p.id === photoId,
      })),
    }));
  };

  const handlePhotoCaptionChange = (photoId: string, caption: string) => {
    setFormData((prev) => ({
      ...prev,
      photos: (prev.photos || []).map((p) =>
        p.id === photoId ? { ...p, caption } : p
      ),
    }));
  };
  // ─────────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!coworking) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/coworkings/${coworking.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Save failed');
      }

      const freshResponse = await fetch(`/api/admin/coworkings/${coworking.slug}`);
      const data = await freshResponse.json();
      setCoworking(data);
      setFormData(data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error: any) {
      setSaveError(error?.message || 'Chyba při ukládání');
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
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
      alert('Chyba při mazání');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Načítám...</span>
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
  const currentPhotos = formData.photos || [];

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
          <h1 className="text-xl font-bold text-gray-900 truncate max-w-xs">
            {coworking.name}
          </h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors text-sm"
          >
            {saving ? (
              <><Loader className="w-4 h-4 animate-spin" />Ukládám...</>
            ) : (
              <><Save className="w-4 h-4" />Uložit</>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Save status banners */}
        {saveStatus === 'success' && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 font-medium flex items-center gap-2">
            ✓ Uloženo úspěšně
          </div>
        )}
        {saveStatus === 'error' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <strong>Chyba při ukládání:</strong> {saveError}
          </div>
        )}

        {/* ── FOTOGRAFIE ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-600" />
            Fotografie
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Fotky se automaticky komprimují pro rychlé nahrávání. Přijímáme JPG, PNG i WebP do 10 MB.
            První fotka je hlavní — zobrazí se na kartě a jako náhled.
          </p>

          {/* Photo grid */}
          {currentPhotos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
              {currentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative group rounded-lg overflow-hidden border-2 ${
                    photo.isPrimary ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={photo.url}
                    alt={photo.caption}
                    className="w-full h-36 object-cover"
                  />
                  {/* Primary badge */}
                  {photo.isPrimary && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Hlavní
                    </div>
                  )}
                  {/* Overlay controls */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(photo.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium hover:bg-blue-700"
                      >
                        Nastavit jako hlavní
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePhoto(photo.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded-full font-medium hover:bg-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Odebrat
                    </button>
                  </div>
                  {/* Caption input */}
                  <input
                    type="text"
                    value={photo.caption}
                    onChange={(e) => handlePhotoCaptionChange(photo.id, e.target.value)}
                    placeholder="Popisek (volitelné)"
                    className="w-full px-2 py-1.5 text-xs border-0 border-t border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPhoto}
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {uploadingPhoto ? (
                <><Loader className="w-4 h-4 animate-spin" />Načítám...</>
              ) : (
                <><Upload className="w-4 h-4" />Přidat fotky (JPG, PNG, WebP — do 10 MB)</>
              )}
            </button>
            {photoError && (
              <p className="mt-2 text-sm text-red-600">{photoError}</p>
            )}
          </div>
        </div>

        {/* ── MÉDIA (YouTube + Matterport) ────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Média &amp; virtuální prohlídka</h2>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                YouTube video URL
              </label>
              <input
                type="url"
                name="youtubeUrl"
                value={formData.youtubeUrl || ''}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Videoukázka prostoru, která se zobrazí na stránce coworkingu.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-purple-500" />
                Matterport 3D prohlídka URL
              </label>
              <input
                type="url"
                name="matterportUrl"
                value={formData.matterportUrl || ''}
                onChange={handleInputChange}
                placeholder="https://my.matterport.com/show/?m=..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Odkaz na interaktivní 3D prohlídku prostoru (Matterport).
              </p>
            </div>
          </div>
        </div>

        {/* ── ZÁKLADNÍ INFORMACE ──────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Základní informace</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Název</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Město</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-500" />
                Ulice a číslo popisné
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="např. Vinohradská 123"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PSČ</label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode || ''}
                onChange={handleInputChange}
                placeholder="např. 120 00"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kapacita (počet míst celkem)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity ?? ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plocha (m²)</label>
              <input
                type="number"
                name="areaM2"
                value={formData.areaM2 ?? ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ── PRACOVNÍ PROSTORY ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Pracovní místa
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Upřesni, kolik máš různých typů pracovních míst. Zobrazí se v detailu prostoru.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Armchair className="w-4 h-4 text-orange-500" />
                Volné židle (hot desk)
              </label>
              <input
                type="number"
                name="hotDesks"
                value={(formData as any).hotDesks ?? ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Flexibilní místa bez rezervace</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fix desks</label>
              <input
                type="number"
                name="fixedDesks"
                value={(formData as any).fixedDesks ?? ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Dedikovaná stálá místa</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-500" />
                Počet kanceláří
              </label>
              <input
                type="number"
                name="officeCount"
                value={(formData as any).officeCount ?? ''}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Uzavřené kanceláře k pronájmu</p>
            </div>
          </div>
        </div>

        {/* ── POPIS ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Popis</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Krátký popis</label>
              <input
                type="text"
                name="shortDescription"
                value={formData.shortDescription || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Detailní popis</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ── KONTAKT ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Kontakt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Web</label>
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

        {/* ── CENY ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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
              const prices = (formData as any).prices || {};
              const entry = prices[key] || { enabled: false, from: null };
              return (
                <div key={key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-center gap-2 w-36 flex-shrink-0 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!entry.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        prices: {
                          ...((prev as any).prices || {}),
                          [key]: { ...entry, enabled: e.target.checked },
                        } as any,
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
                        prices: {
                          ...((prev as any).prices || {}),
                          [key]: { ...entry, from: e.target.value ? parseInt(e.target.value) : null },
                        } as any,
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

        {/* ── VYBAVENÍ ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vybavení</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {amenities.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(formData.amenities || []).includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{AMENITY_LABELS[amenity] || amenity}</span>
              </label>
            ))}
          </div>
        </div>

        {/* ── TYPY AKCÍ / VENUE ───────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Hodí se pro tyto akce</h2>
          <p className="text-sm text-gray-500 mb-5">
            Zaklikni, na jaké aktivity je váš prostor vhodný. Zákazníci to uvidí v detailu.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(VENUE_TYPE_LABELS).map(([key, label]) => {
              const checked = ((formData as any).venueTypes || []).includes(key);
              return (
                <label
                  key={key}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    checked
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/40'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleVenueTypeChange(key)}
                    className="sr-only"
                  />
                  <span className="text-2xl">{VENUE_TYPE_EMOJIS[key] || '📌'}</span>
                  <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
                </label>
              );
            })}
          </div>

          {/* Event space toggle */}
          <div className="border-t border-gray-100 pt-5">
            <label className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              (formData as any).hasEventSpace ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'
            }`}>
              <input
                type="checkbox"
                name="hasEventSpace"
                checked={(formData as any).hasEventSpace || false}
                onChange={handleCheckboxChange}
                className="w-5 h-5 mt-0.5 rounded accent-purple-600 flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-600" />
                  Nabízím eventový prostor k pronájmu
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Pokud je zaškrtnuto, zobrazí se tlačítko odkazující na{' '}
                  <a href="https://www.prostorna.cz" target="_blank" rel="noopener noreferrer" className="text-purple-600 underline">
                    prostorna.cz <ExternalLink className="w-3 h-3 inline" />
                  </a>{' '}
                  v detailu vašeho coworkingu.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* ── STATUS ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
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

        {/* ── AKCE ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {saving ? (
              <><Loader className="w-5 h-5 animate-spin" />Ukládám...</>
            ) : (
              <><Save className="w-5 h-5" />Uložit</>
            )}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors ml-auto"
          >
            {deleting ? (
              <><Loader className="w-5 h-5 animate-spin" />Mažu...</>
            ) : (
              <><Trash2 className="w-5 h-5" />Smazat</>
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
            <p className="text-gray-600 mb-6">Tuto akci nelze vrátit zpět.</p>
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
  );
}
