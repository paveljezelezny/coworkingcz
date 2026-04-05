'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Send, Lock, CheckCircle, AlertCircle,
  Briefcase, Wrench, ShoppingBag, Tag, MapPin,
  DollarSign, Phone, Mail, Globe, Info, Zap,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Category =
  | 'job_offer'
  | 'job_seeking'
  | 'service_offer'
  | 'service_seeking'
  | 'item_for_sale'
  | 'item_wanted';

type PriceType = 'fixed' | 'hourly' | 'monthly' | 'negotiable' | 'free';
type WorkType = 'remote' | 'onsite' | 'hybrid' | 'flexible';
type ExperienceLevel = 'junior' | 'mid' | 'senior' | 'any';
type Condition = 'new' | 'like_new' | 'good' | 'fair' | 'for_parts';

interface FormData {
  title: string;
  category: Category | '';
  description: string;
  // Pricing
  priceType: PriceType | '';
  price: string;
  // Location & availability
  location: string;
  isRemote: boolean;
  availableFrom: string;
  // Job/service specific
  workType: WorkType | '';
  experienceLevel: ExperienceLevel | '';
  // Item specific
  condition: Condition | '';
  // Tags
  tagsInput: string;
  // Contact
  contactEmail: string;
  contactPhone: string;
  externalUrl: string;
}

// ─── Category config ─────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; label: string; emoji: string; color: string; desc: string }[] = [
  { id: 'job_offer',      label: 'Nabídka práce',    emoji: '💼', color: 'blue',   desc: 'Hledám zaměstnance nebo spolupracovníka' },
  { id: 'job_seeking',    label: 'Hledám práci',     emoji: '🙋', color: 'teal',   desc: 'Hledám zaměstnání nebo projekt' },
  { id: 'service_offer',  label: 'Nabízím služby',   emoji: '🛠️', color: 'purple', desc: 'Freelance, poradenství, kreativa…' },
  { id: 'service_seeking',label: 'Hledám služby',    emoji: '🔍', color: 'orange', desc: 'Potřebuji dodavatele nebo experta' },
  { id: 'item_for_sale',  label: 'Prodám / pronajmu',emoji: '📦', color: 'pink',   desc: 'Prodej nebo pronájem věci či prostoru' },
  { id: 'item_wanted',    label: 'Koupím / přijmu',  emoji: '🛒', color: 'indigo', desc: 'Hledám věc, prostor nebo materiál' },
];

const PRICE_TYPES: { id: PriceType; label: string }[] = [
  { id: 'free',       label: 'Zdarma / dobrovolné' },
  { id: 'negotiable', label: 'Dohodou' },
  { id: 'fixed',      label: 'Pevná cena (Kč)' },
  { id: 'hourly',     label: 'Hodinová sazba (Kč/hod)' },
  { id: 'monthly',    label: 'Měsíční sazba (Kč/měs)' },
];

const WORK_TYPES: { id: WorkType; label: string }[] = [
  { id: 'remote',   label: 'Vzdáleně (remote)' },
  { id: 'onsite',   label: 'Na místě (onsite)' },
  { id: 'hybrid',   label: 'Hybrid' },
  { id: 'flexible', label: 'Flexibilní' },
];

const EXPERIENCE_LEVELS: { id: ExperienceLevel; label: string }[] = [
  { id: 'any',    label: 'Jakákoliv úroveň' },
  { id: 'junior', label: 'Junior (0–2 roky)' },
  { id: 'mid',    label: 'Mid (2–5 let)' },
  { id: 'senior', label: 'Senior (5+ let)' },
];

const CONDITIONS: { id: Condition; label: string }[] = [
  { id: 'new',       label: 'Nové / nepoužité' },
  { id: 'like_new',  label: 'Jako nové' },
  { id: 'good',      label: 'Dobrý stav' },
  { id: 'fair',      label: 'Použité, funkční' },
  { id: 'for_parts', label: 'Na díly / nefunkční' },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function NovaInzeratPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [quota, setQuota] = useState<{ count: number; paid: boolean; limit: number | null } | null>(null);
  const [loadingQuota, setLoadingQuota] = useState(true);

  const [form, setForm] = useState<FormData>({
    title: '',
    category: '',
    description: '',
    priceType: '',
    price: '',
    location: '',
    isRemote: false,
    availableFrom: '',
    workType: '',
    experienceLevel: '',
    condition: '',
    tagsInput: '',
    contactEmail: '',
    contactPhone: '',
    externalUrl: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Pre-fill email from session
  useEffect(() => {
    if (session?.user?.email) {
      setForm((prev) => ({ ...prev, contactEmail: prev.contactEmail || session.user!.email! }));
    }
  }, [session]);

  // Load quota
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/prihlaseni?callbackUrl=/marketplace/nova-nabidka`);
      return;
    }
    if (status === 'authenticated') {
      fetch('/api/marketplace/listings')
        .then((r) => r.json())
        .then((data) => setQuota(data))
        .finally(() => setLoadingQuota(false));
    }
  }, [status]);

  const set = (field: keyof FormData, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const isJobOrService = ['job_offer', 'job_seeking', 'service_offer', 'service_seeking'].includes(form.category);
  const isItem = ['item_for_sale', 'item_wanted'].includes(form.category);
  const needsPrice = form.priceType !== '' && form.priceType !== 'free' && form.priceType !== 'negotiable';

  const quotaExceeded = quota && !quota.paid && quota.limit !== null && quota.count >= quota.limit;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category) { setError('Vyberte kategorii inzerátu.'); return; }
    if (!form.title.trim()) { setError('Nadpis je povinný.'); return; }
    if (!form.description.trim()) { setError('Popis je povinný.'); return; }
    if (!form.contactEmail.trim()) { setError('Kontaktní e-mail je povinný.'); return; }

    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/marketplace/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          description: form.description,
          priceType: form.priceType || null,
          price: needsPrice && form.price ? form.price : null,
          location: form.isRemote ? 'Vzdáleně' : form.location,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || null,
          externalUrl: form.externalUrl || null,
          workType: form.workType || null,
          experienceLevel: form.experienceLevel || null,
          availableFrom: form.availableFrom || null,
          condition: form.condition || null,
          tags: form.tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
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
  if (status === 'loading' || loadingQuota) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Načítám…</div>
      </div>
    );
  }

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Inzerát přidán!</h2>
          <p className="text-gray-600 mb-8">Váš inzerát je nyní aktivní a zobrazuje se v marketplace.</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/marketplace"
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-center"
            >
              Zpět do marketplace
            </Link>
            <button
              onClick={() => { setSuccess(false); setForm({ title: '', category: '', description: '', priceType: '', price: '', location: '', isRemote: false, availableFrom: '', workType: '', experienceLevel: '', condition: '', tagsInput: '', contactEmail: session?.user?.email ?? '', contactPhone: '', externalUrl: '' }); }}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Přidat další inzerát
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">

        {/* Back link */}
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Zpět do marketplace
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nový inzerát</h1>
          <p className="text-gray-500">Vyplňte formulář a oslovte komunitu coworkerů.</p>
        </div>

        {/* Quota banner */}
        {quota && !quota.paid && (
          <div className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
            quotaExceeded
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            {quotaExceeded ? (
              <Lock className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-sm">
              {quotaExceeded ? (
                <>
                  <p className="font-semibold text-red-800 mb-1">Limit inzerátů vyčerpán</p>
                  <p className="text-red-700">
                    Bezplatný účet umožňuje 1 aktivní inzerát.{' '}
                    <Link href="/ceniky" className="underline font-medium">Upgradujte členství</Link>{' '}
                    pro neomezené inzeráty.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-amber-800 mb-1">Bezplatný účet — {quota.count}/{quota.limit} inzerátů</p>
                  <p className="text-amber-700">
                    Máte 1 inzerát zdarma.{' '}
                    <Link href="/ceniky" className="underline font-medium">Členství</Link>{' '}
                    odemkne neomezené inzeráty.
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {quota?.paid && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-center gap-3">
            <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-800 font-medium">Aktivní členství — neomezené inzeráty</p>
          </div>
        )}

        {quotaExceeded ? null : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── 1. Kategorie ─────────────────────────────────────────── */}
            <section>
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-blue-600" />
                Co inzerujete?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => set('category', cat.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      form.category === cat.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="font-semibold text-gray-900 text-sm">{cat.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </section>

            {form.category && (
              <>
                {/* ── 2. Základní info ──────────────────────────────────── */}
                <section>
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    Základní informace
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nadpis inzerátu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={100}
                        value={form.title}
                        onChange={(e) => set('title', e.target.value)}
                        placeholder={
                          form.category === 'job_offer' ? 'např. Hledáme React developera na full-time' :
                          form.category === 'job_seeking' ? 'např. UX designer hledá projekt' :
                          form.category === 'service_offer' ? 'např. Nabízím copywriting a SEO texty' :
                          form.category === 'service_seeking' ? 'např. Hledám grafika pro redesign loga' :
                          form.category === 'item_for_sale' ? 'např. Prodám standing desk, výška nastavitelná' :
                          'např. Hledám použitý monitor 27"'
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="text-xs text-gray-400 text-right mt-1">{form.title.length}/100</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Podrobný popis <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        value={form.description}
                        onChange={(e) => set('description', e.target.value)}
                        placeholder="Popište co nejpodrobněji — co nabízíte nebo hledáte, podmínky spolupráce, očekávání…"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Klíčová slova / tagy
                        <span className="text-gray-400 font-normal"> (oddělené čárkou)</span>
                      </label>
                      <input
                        type="text"
                        value={form.tagsInput}
                        onChange={(e) => set('tagsInput', e.target.value)}
                        placeholder={
                          isItem
                            ? 'např. nábytek, kancelář, ikea'
                            : 'např. React, TypeScript, remote, startup'
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      {form.tagsInput && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean).map((tag, i) => (
                            <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* ── 3. Podmínky (job / service specific) ─────────────── */}
                {isJobOrService && (
                  <section>
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-blue-600" />
                      Podmínky spolupráce
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Typ práce</label>
                        <select
                          value={form.workType}
                          onChange={(e) => set('workType', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                        >
                          <option value="">— vyberte —</option>
                          {WORK_TYPES.map((wt) => (
                            <option key={wt.id} value={wt.id}>{wt.label}</option>
                          ))}
                        </select>
                      </div>
                      {['job_offer', 'job_seeking'].includes(form.category) && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">Úroveň zkušeností</label>
                          <select
                            value={form.experienceLevel}
                            onChange={(e) => set('experienceLevel', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                          >
                            <option value="">— vyberte —</option>
                            {EXPERIENCE_LEVELS.map((el) => (
                              <option key={el.id} value={el.id}>{el.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Dostupnost od</label>
                        <input
                          type="date"
                          value={form.availableFrom}
                          onChange={(e) => set('availableFrom', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                      </div>
                    </div>
                  </section>
                )}

                {/* ── 4. Stav předmětu (item specific) ─────────────────── */}
                {isItem && (
                  <section>
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                      Stav předmětu
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {CONDITIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => set('condition', form.condition === c.id ? '' : c.id)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                            form.condition === c.id
                              ? 'border-blue-600 bg-blue-50 text-blue-800'
                              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </section>
                )}

                {/* ── 5. Cena ───────────────────────────────────────────── */}
                <section>
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                    Cena / odměna
                  </h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {PRICE_TYPES.map((pt) => (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => set('priceType', form.priceType === pt.id ? '' : pt.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                          form.priceType === pt.id
                            ? 'border-blue-600 bg-blue-50 text-blue-800'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {pt.label}
                      </button>
                    ))}
                  </div>

                  {needsPrice && (
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        value={form.price}
                        onChange={(e) => set('price', e.target.value)}
                        placeholder="Zadejte částku v Kč"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <span className="absolute right-4 top-3.5 text-gray-400 text-sm">Kč</span>
                    </div>
                  )}
                </section>

                {/* ── 6. Lokalita ───────────────────────────────────────── */}
                <section>
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Lokalita
                  </h2>
                  <div className="flex items-center gap-3 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <div
                        onClick={() => set('isRemote', !form.isRemote)}
                        className={`w-11 h-6 rounded-full relative transition-colors ${form.isRemote ? 'bg-blue-600' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isRemote ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">Výhradně vzdáleně (remote)</span>
                    </label>
                  </div>
                  {!form.isRemote && (
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => set('location', e.target.value)}
                      placeholder="Město, oblast, nebo &quot;celá ČR&quot;"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </section>

                {/* ── 7. Kontakt ────────────────────────────────────────── */}
                <section>
                  <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    Kontaktní údaje
                  </h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={form.contactEmail}
                        onChange={(e) => set('contactEmail', e.target.value)}
                        placeholder="váš@email.cz"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={form.contactPhone}
                        onChange={(e) => set('contactPhone', e.target.value)}
                        placeholder="Telefon (volitelné)"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                    <div className="relative">
                      <Globe className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={form.externalUrl}
                        onChange={(e) => set('externalUrl', e.target.value)}
                        placeholder="Web, portfolio, LinkedIn… (volitelné)"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </section>

                {/* ── Error ─────────────────────────────────────────────── */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                {/* ── Submit ────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-base"
                  >
                    <Send className="w-5 h-5" />
                    {saving ? 'Publikuji…' : 'Zveřejnit inzerát'}
                  </button>
                  <Link
                    href="/marketplace"
                    className="py-4 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center text-base"
                  >
                    Zrušit
                  </Link>
                </div>

                <p className="text-xs text-gray-400 text-center pb-4">
                  Inzerát se zobrazí ihned po publikaci. Můžete ho kdykoli spravovat ze svého profilu.
                </p>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
