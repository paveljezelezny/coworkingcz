'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Send, CheckCircle, AlertCircle,
  Calendar, Clock, MapPin, Users, DollarSign,
  Globe, Image, Lock, Zap, Upload, X, Link2,
} from 'lucide-react';
interface CoworkingOption { slug: string; name: string; city: string; }

const EVENT_TYPES = [
  { id: 'workshop',    label: 'Workshop',    emoji: '🎓' },
  { id: 'networking', label: 'Networking',   emoji: '🤝' },
  { id: 'meetup',     label: 'Meetup',       emoji: '☕' },
  { id: 'conference', label: 'Konference',   emoji: '🎤' },
  { id: 'party',      label: 'Party / Social', emoji: '🎉' },
  { id: 'other',      label: 'Jiné',         emoji: '📌' },
];

interface FormData {
  title: string;
  description: string;
  eventType: string;
  coworkingSlug: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  isAllDay: boolean;
  isFree: boolean;
  price: string;
  maxAttendees: string;
  externalUrl: string;
  imageUrl: string;
}

export default function NovaUdalostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [paidAccess, setPaidAccess] = useState<boolean | null>(null);
  const [coworkings, setCoworkings] = useState<CoworkingOption[]>([]);
  const [form, setForm] = useState<FormData>({
    title: '', description: '', eventType: '',
    coworkingSlug: '', location: '', startDate: '', startTime: '09:00',
    endDate: '', endTime: '11:00',
    isAllDay: false, isFree: true, price: '',
    maxAttendees: '', externalUrl: '', imageUrl: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    setImageError('');
    if (!file.type.startsWith('image/')) { setImageError('Vyberte obrázek (jpg, png, webp…)'); return; }
    if (file.size > 1024 * 1024) { setImageError('Obrázek musí být menší než 1 MB'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      set('imageUrl', dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const userRole: string = (session?.user as any)?.role ?? '';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/udalosti/nova-udalost');
      return;
    }
    if (status === 'authenticated') {
      // Fetch paid access check and coworking list in parallel
      Promise.all([
        fetch('/api/marketplace/listings?mine=true').then(r => r.json()).catch(() => ({})),
        fetch('/api/coworkings').then(r => r.json()).catch(() => []),
      ]).then(([listingsData, cwData]) => {
        setPaidAccess(listingsData.paid === true);
        const list: CoworkingOption[] = Array.isArray(cwData) ? cwData : [];
        setCoworkings(list.sort((a, b) => a.name.localeCompare(b.name, 'cs')));
      }).catch(() => setPaidAccess(false));
    }
  }, [status, userRole]);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.eventType) { setError('Vyberte typ eventu.'); return; }
    if (!form.title.trim()) { setError('Název je povinný.'); return; }
    if (!form.startDate) { setError('Datum začátku je povinné.'); return; }
    if (!form.coworkingSlug) { setError('Vyberte coworking.'); return; }

    setSaving(true);
    setError('');
    try {
      const startISO = form.isAllDay
        ? `${form.startDate}T00:00:00`
        : `${form.startDate}T${form.startTime}:00`;
      const endISO = form.endDate
        ? (form.isAllDay ? `${form.endDate}T23:59:00` : `${form.endDate}T${form.endTime}:00`)
        : null;

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          eventType: form.eventType,
          coworkingSlug: form.coworkingSlug,
          location: form.location || null,
          startDate: startISO,
          endDate: endISO,
          isAllDay: form.isAllDay,
          isFree: form.isFree,
          price: !form.isFree && form.price ? form.price : null,
          maxAttendees: form.maxAttendees || null,
          externalUrl: form.externalUrl || null,
          imageUrl: form.imageUrl || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Nastala chyba.');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('Nepodařilo se připojit k serveru.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──
  if (status === 'loading' || paidAccess === null) {
    return (
      <div className="flex items-center justify-center" style={{minHeight:320}}>
        <div className="text-gray-400 text-sm">Načítám…</div>
      </div>
    );
  }

  // ── Not paid ──
  if (!paidAccess) {
    return (
      <div className="flex items-center justify-center px-4" style={{minHeight:320}}>
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Pouze pro platící členy</h2>
          <p className="text-gray-600 mb-8">
            Přidávání eventů je dostupné pro coworkery a coworkingy s aktivním členstvím.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/ceniky"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Zobrazit plány členství
            </Link>
            <Link
              href="/udalosti"
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center"
            >
              Zpět na eventy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Success ──
  if (success) {
    return (
      <div className="flex items-center justify-center px-4" style={{minHeight:320}}>
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Event přidán!</h2>
          <p className="text-gray-600 mb-8">Váš event je nyní viditelný v kalendáři akcí.</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/udalosti"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Zpět na kalendář akcí
            </Link>
            <button
              onClick={() => { setSuccess(false); setImagePreview(''); setImageError(''); setImageMode('upload'); setForm({ title: '', description: '', eventType: '', coworkingSlug: '', location: '', startDate: '', startTime: '09:00', endDate: '', endTime: '11:00', isAllDay: false, isFree: true, price: '', maxAttendees: '', externalUrl: '', imageUrl: '' }); }}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Přidat další event
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{paddingBottom:60,background:"#efe9dc"}}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">

        <Link href="/udalosti" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: '"Caveat", cursive', fontSize: 18, color: '#c76a54', textDecoration: 'none', marginBottom: 24 }}>
          ← zpět na kalendář akcí
        </Link>

        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: '"Caveat", cursive', fontSize: 22, color: '#c59a3a', marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            ↘ uspořádej akci
          </div>
          <h1 style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 40, fontWeight: 500, letterSpacing: '-0.025em', color: '#1a1a1a', margin: '4px 0 8px' }} className="md:!text-[48px]">
            Nová událost
          </h1>
          <p style={{ fontSize: 14, color: '#6b6558', margin: 0 }}>Přidej akci do kalendáře coworkingové komunity.</p>
        </div>

        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
          <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">Aktivní členství — můžete přidávat eventy</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* ── Typ eventu ─────────────────────────────────────────── */}
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Typ eventu
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {EVENT_TYPES.map((et) => (
                <button
                  key={et.id}
                  type="button"
                  onClick={() => set('eventType', et.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${
                    form.eventType === et.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{et.emoji}</span>
                  <span className="font-semibold text-sm text-gray-900">{et.label}</span>
                </button>
              ))}
            </div>
          </section>

          {form.eventType && (
            <>
              {/* ── Základní info ─────────────────────────────────── */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Informace o eventu
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Název eventu <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={100}
                      value={form.title}
                      onChange={(e) => set('title', e.target.value)}
                      placeholder="např. Networking pro freelancery"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Popis</label>
                    <textarea
                      rows={4}
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                      placeholder="Popište co se na eventu bude dít, pro koho je určen, co si přinést…"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* ── Datum a čas ───────────────────────────────────── */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Datum a čas
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('isAllDay', !form.isAllDay)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${form.isAllDay ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isAllDay ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Celodenní akce</span>
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Začátek <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={form.startDate}
                        onChange={(e) => set('startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    {!form.isAllDay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Čas začátku</label>
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={(e) => set('startTime', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Konec (volitelné)</label>
                      <input
                        type="date"
                        value={form.endDate}
                        onChange={(e) => set('endDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    {!form.isAllDay && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Čas konce</label>
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={(e) => set('endTime', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Místo ─────────────────────────────────────────── */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Místo konání
                </h2>
                <div className="space-y-3">
                  <select
                    value={form.coworkingSlug}
                    onChange={(e) => set('coworkingSlug', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value="">— Vyberte coworking —</option>
                    {coworkings.map((cw) => (
                      <option key={cw.slug} value={cw.slug}>
                        {cw.name} — {cw.city}
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => set('location', e.target.value)}
                      placeholder="Přesná adresa nebo místo konání (volitelné)"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </section>

              {/* ── Kapacita a vstupné ────────────────────────────── */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  Kapacita a vstupné
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      min={1}
                      value={form.maxAttendees}
                      onChange={(e) => set('maxAttendees', e.target.value)}
                      placeholder="Max. počet účastníků (volitelné)"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => set('isFree', !form.isFree)}
                      className={`w-11 h-6 rounded-full relative transition-colors ${form.isFree ? 'bg-green-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isFree ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Vstupné zdarma</span>
                  </label>

                  {!form.isFree && (
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => set('price', e.target.value)}
                        placeholder="Vstupné v Kč"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 text-sm">Kč</span>
                    </div>
                  )}
                </div>
              </section>

              {/* ── Volitelné ─────────────────────────────────────── */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-600" />
                  Média a registrace
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      value={form.externalUrl}
                      onChange={(e) => set('externalUrl', e.target.value)}
                      placeholder="Odkaz na registraci / více informací (volitelné)"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  {/* Image upload / URL */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    {/* Toggle */}
                    <div className="flex border-b border-gray-100">
                      <button type="button"
                        onClick={() => { setImageMode('upload'); set('imageUrl', imagePreview); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${imageMode === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Upload className="w-4 h-4" /> Nahrát soubor
                      </button>
                      <button type="button"
                        onClick={() => { setImageMode('url'); set('imageUrl', form.imageUrl.startsWith('data:') ? '' : form.imageUrl); setImagePreview(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${imageMode === 'url' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <Link2 className="w-4 h-4" /> URL adresa
                      </button>
                    </div>

                    <div className="p-3">
                      {imageMode === 'upload' ? (
                        <div>
                          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                            onChange={e => e.target.files?.[0] && handleImageFile(e.target.files[0])} />
                          {imagePreview ? (
                            <div className="relative">
                              <img src={imagePreview} alt="preview" className="w-full h-36 object-cover rounded-lg" />
                              <button type="button"
                                onClick={() => { setImagePreview(''); set('imageUrl', ''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                              onDragOver={e => e.preventDefault()}
                              onDrop={e => { e.preventDefault(); e.dataTransfer.files?.[0] && handleImageFile(e.dataTransfer.files[0]); }}
                              className="w-full border-2 border-dashed border-gray-200 rounded-lg py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                              <Image className="w-6 h-6" />
                              <span className="text-xs">Klikni nebo přetáhni obrázek</span>
                              <span className="text-xs text-gray-300">Max 1 MB · jpg, png, webp</span>
                            </button>
                          )}
                          {imageError && <p className="text-xs text-red-500 mt-1">{imageError}</p>}
                        </div>
                      ) : (
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                          <input type="url"
                            value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                            onChange={e => set('imageUrl', e.target.value)}
                            placeholder="https://… URL obrázku eventu"
                            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                >
                  <Send className="w-5 h-5" />
                  {saving ? 'Publikuji…' : 'Zveřejnit event'}
                </button>
                <Link
                  href="/udalosti"
                  className="py-4 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center text-base"
                >
                  Zrušit
                </Link>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
