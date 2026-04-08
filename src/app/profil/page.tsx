'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Mail, Globe, Linkedin, Award, Pencil, LogOut,
  Loader2, Check, X, Plus, Trash2, ShieldCheck,
  Calendar, ExternalLink, Lock, Zap, Tag, MapPin,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp,
  Upload, Link2, Image, Phone, Eye, EyeOff, Camera,
  Building2, MessageSquare, ZoomIn, ZoomOut,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  bio: string;
  profession: string;
  skills: string[];
  linkedinUrl: string;
  websiteUrl: string;
  avatarUrl: string | null;
  isPublic: boolean;
  membershipTier: string | null;
  membershipStart: string | null;
  membershipEnd: string | null;
  homeCoworkingSlug: string | null;
  phone: string | null;
  company: string | null;
  isPhonePublic: boolean;
  isEmailPublic: boolean;
  isPhotoPublic: boolean;
  allowContact: boolean;
}

interface MyListing {
  id: string;
  title: string;
  category: string;
  description: string | null;
  price: number | null;
  priceType: string | null;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  tags: Record<string, unknown>;
}

interface MyEvent {
  id: string;
  title: string;
  coworkingSlug: string;
  eventType: string | null;
  startDate: string;
  endDate?: string | null;
  isAllDay?: boolean;
  isFree: boolean;
  price: number | null;
  maxAttendees?: number | null;
  location?: string | null;
  externalUrl: string | null;
  imageUrl?: string | null;
  description?: string | null;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function membershipLabel(tier: string | null): string {
  if (!tier) return '';
  if (tier.startsWith('trial')) return 'Trial 30 dní';
  if (tier === 'monthly') return 'Měsíční';
  if (tier === 'yearly') return 'Roční';
  if (tier === 'team') return 'Týmový';
  if (tier === 'premium') return 'Premium';
  return tier;
}

function membershipStatus(end: string | null): 'active' | 'expiring' | 'expired' | 'none' {
  if (!end) return 'none';
  const endDate = new Date(end);
  const now = new Date();
  const daysLeft = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 7) return 'expiring';
  return 'active';
}

function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysLeft(end: string | null): number {
  if (!end) return 0;
  return Math.ceil((new Date(end).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

// Ensure URL has https:// prefix
function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function roleLabel(role: string): string {
  if (role === 'super_admin') return 'Super admin';
  if (role === 'coworking_admin') return 'Správce coworkingu';
  return 'Coworker';
}

// ─── Skill Tag Component ─────────────────────────────────────────────────────

function SkillTag({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

// ─── Membership Card ─────────────────────────────────────────────────────────

function MembershipCard({ tier, end, role }: { tier: string | null; end: string | null; role: string }) {
  const status = membershipStatus(end);

  if (role === 'super_admin') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-purple-900">Super Admin</h3>
        </div>
        <p className="text-sm text-purple-700">Neomezený přístup ke všem funkcím platformy.</p>
      </div>
    );
  }

  if (!tier || status === 'none') {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 text-gray-500" />
          <h3 className="font-bold text-gray-700">Základní účet</h3>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Odemkni přidávání eventů, inzerátů a další funkce.
        </p>
        <Link
          href="/ceniky"
          className="block w-full py-2 px-4 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Začít 30 dní zdarma →
        </Link>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="bg-red-50 rounded-xl border border-red-200 p-5 mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Award className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-red-800">{membershipLabel(tier)}</h3>
          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Expirováno</span>
        </div>
        <p className="text-sm text-red-700 mb-4">Členství expirovala {formatDate(end)}.</p>
        <Link
          href="/ceniky"
          className="block w-full py-2 px-4 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors text-center"
        >
          Obnovit členství
        </Link>
      </div>
    );
  }

  const isTrial = tier.startsWith('trial');
  const days = daysLeft(end);
  const isExpiring = status === 'expiring';

  return (
    <div className={`rounded-xl border p-5 mb-5 ${isTrial
      ? 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
      : isExpiring
        ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200'
        : 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {isTrial ? <Zap className="w-5 h-5 text-green-600" /> : <Award className="w-5 h-5 text-amber-600" />}
        <h3 className={`font-bold ${isTrial ? 'text-green-900' : 'text-amber-900'}`}>
          {membershipLabel(tier)}
        </h3>
        {isTrial && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Trial</span>
        )}
        {isExpiring && !isTrial && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">Brzy vyprší</span>
        )}
      </div>
      <p className={`text-sm mb-1 ${isTrial ? 'text-green-800' : 'text-amber-800'}`}>
        Aktivní do {formatDate(end)}
      </p>
      {days >= 0 && (
        <p className={`text-xs mb-4 ${isTrial ? 'text-green-600' : isExpiring ? 'text-orange-600' : 'text-amber-600'}`}>
          Zbývá {days} {days === 1 ? 'den' : days < 5 ? 'dny' : 'dní'}
        </p>
      )}
      <Link
        href="/ceniky"
        className={`block w-full py-2 px-4 text-white text-sm font-semibold rounded-lg transition-colors text-center ${
          isTrial ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-600 hover:bg-amber-700'
        }`}
      >
        {isTrial ? 'Přejít na placený plán' : 'Prodloužit členství'}
      </Link>
    </div>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────

function Avatar({ name, image, size = 'lg', onClick }: {
  name: string;
  image?: string | null;
  size?: 'sm' | 'lg';
  onClick?: () => void;
}) {
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';
  const inner = image ? (
    <img src={image} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />
  ) : (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="relative group flex-shrink-0 focus:outline-none"
        title="Změnit profilovou fotku"
      >
        {inner}
        <span className="absolute inset-0 rounded-full bg-black/30 transition-opacity flex items-center justify-center">
          <Camera className="w-6 h-6 text-white drop-shadow" />
        </span>
      </button>
    );
  }
  return inner;
}

// ─── Avatar Crop Modal ────────────────────────────────────────────────────────

function AvatarCropModal({
  src,
  onConfirm,
  onClose,
}: {
  src: string;
  onConfirm: (dataUrl: string) => void;
  onClose: () => void;
}) {
  const SIZE = 240; // circle diameter in px
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgNatural, setImgNatural] = useState({ w: 0, h: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  // When img loads, auto-fit scale so it fills the circle
  const handleImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setImgNatural({ w, h });
    const fit = SIZE / Math.min(w, h);
    setScale(fit);
    setOffsetX(0);
    setOffsetY(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };
  const handleMouseUp = () => setDragging(false);
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale(s => Math.min(5, Math.max(0.5, s - e.deltaY * 0.002)));
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = SIZE;
    canvas.height = SIZE;
    // Clip to circle
    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    // Draw image with current transform
    const imgW = imgNatural.w * scale;
    const imgH = imgNatural.h * scale;
    ctx.drawImage(
      document.querySelector('.crop-img') as HTMLImageElement,
      SIZE / 2 - imgW / 2 + offsetX,
      SIZE / 2 - imgH / 2 + offsetY,
      imgW,
      imgH
    );
    onConfirm(canvas.toDataURL('image/jpeg', 0.85));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Upravit profilovou fotku</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-4 text-center">Táhni fotku pro přesun · kolečko myši pro zoom</p>

        {/* Crop area */}
        <div className="flex justify-center mb-5">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-full border-4 border-blue-500 shadow-lg cursor-grab active:cursor-grabbing select-none"
            style={{ width: SIZE, height: SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt="crop"
              className="crop-img absolute max-w-none pointer-events-none"
              style={{
                width: imgNatural.w * scale,
                height: imgNatural.h * scale,
                top: SIZE / 2 - (imgNatural.h * scale) / 2 + offsetY,
                left: SIZE / 2 - (imgNatural.w * scale) / 2 + offsetX,
                userSelect: 'none',
              }}
              draggable={false}
              onLoad={handleImgLoad}
            />
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-3 mb-5 justify-center">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ZoomOut className="w-4 h-4 text-gray-600" />
          </button>
          <input
            type="range" min={0.5} max={5} step={0.05}
            value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            className="flex-1"
          />
          <button onClick={() => setScale(s => Math.min(5, s + 0.1))} className="p-2 hover:bg-gray-100 rounded-lg">
            <ZoomIn className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Hidden canvas for export */}
        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Použít fotku
          </button>
          <button
            onClick={onClose}
            className="py-3 px-5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Category config (listings) ──────────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  job_offer:       { label: 'Nabídka práce',    bgColor: 'bg-green-50',  textColor: 'text-green-700' },
  job_seeking:     { label: 'Hledám práci',     bgColor: 'bg-blue-50',   textColor: 'text-blue-700' },
  service_offer:   { label: 'Nabízím služby',   bgColor: 'bg-purple-50', textColor: 'text-purple-700' },
  service_seeking: { label: 'Hledám služby',    bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
  item_for_sale:   { label: 'Prodám',           bgColor: 'bg-pink-50',   textColor: 'text-pink-700' },
  item_wanted:     { label: 'Koupím',           bgColor: 'bg-indigo-50', textColor: 'text-indigo-700' },
};

// ─── Listing Edit Modal ───────────────────────────────────────────────────────

const LISTING_CATEGORIES = [
  { id: 'job_offer',       label: 'Nabídka práce' },
  { id: 'job_seeking',     label: 'Hledám práci' },
  { id: 'service_offer',   label: 'Nabízím služby' },
  { id: 'service_seeking', label: 'Hledám služby' },
  { id: 'item_for_sale',   label: 'Prodám / pronajmu' },
  { id: 'item_wanted',     label: 'Koupím / přijmu' },
];

const PRICE_TYPES = [
  { id: 'free',       label: 'Zdarma' },
  { id: 'negotiable', label: 'Dohodou' },
  { id: 'fixed',      label: 'Pevná cena (Kč)' },
  { id: 'hourly',     label: 'Hodinová sazba' },
  { id: 'monthly',    label: 'Měsíční sazba' },
];

interface ListingEditForm {
  title: string;
  description: string;
  category: string;
  priceType: string;
  price: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  tagsInput: string;
  externalUrl: string;
  workType: string;
  experienceLevel: string;
  condition: string;
}

function ListingEditModal({
  listing,
  onClose,
  onSaved,
}: {
  listing: MyListing;
  onClose: () => void;
  onSaved: (updated: MyListing) => void;
}) {
  const meta = listing.tags as Record<string, unknown>;
  const tagsArr: string[] = Array.isArray(meta?.tags) ? (meta.tags as string[]) : [];

  const [form, setForm] = useState<ListingEditForm>({
    title: listing.title,
    description: listing.description ?? '',
    category: listing.category,
    priceType: listing.priceType ?? '',
    price: listing.price ? String(listing.price) : '',
    location: listing.location ?? '',
    contactEmail: '',
    contactPhone: '',
    tagsInput: tagsArr.join(', '),
    externalUrl: (meta?.externalUrl as string) ?? '',
    workType: (meta?.workType as string) ?? '',
    experienceLevel: (meta?.experienceLevel as string) ?? '',
    condition: (meta?.condition as string) ?? '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill contact from API
  useEffect(() => {
    fetch(`/api/marketplace/listings/${listing.id}`)
      .then(r => r.json())
      .then(d => {
        setForm(prev => ({
          ...prev,
          contactEmail: d.contactEmail ?? '',
          contactPhone: d.contactPhone ?? '',
        }));
      })
      .catch(() => {});
  }, [listing.id]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (field: keyof ListingEditForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const needsPrice = form.priceType !== '' && form.priceType !== 'free' && form.priceType !== 'negotiable';

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Nadpis je povinný.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/marketplace/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          priceType: form.priceType || null,
          price: needsPrice && form.price ? form.price : null,
          location: form.location,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone || null,
          tags: form.tagsInput.split(',').map(t => t.trim()).filter(Boolean),
          externalUrl: form.externalUrl || null,
          workType: form.workType || null,
          experienceLevel: form.experienceLevel || null,
          condition: form.condition || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Chyba při ukládání.'); return; }
      onSaved(data.listing);
      onClose();
    } catch {
      setError('Nepodařilo se připojit k serveru.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Upravit inzerát</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Kategorie */}
          <div>
            <label className={labelCls}>Kategorie</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LISTING_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => set('category', cat.id)}
                  className={`text-sm px-3 py-2 rounded-xl border-2 font-medium transition-all text-left ${
                    form.category === cat.id
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nadpis */}
          <div>
            <label className={labelCls}>Nadpis <span className="text-red-500">*</span></label>
            <input
              type="text"
              maxLength={100}
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Popis */}
          <div>
            <label className={labelCls}>Popis</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Cena */}
          <div>
            <label className={labelCls}>Cena</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {PRICE_TYPES.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => set('priceType', form.priceType === pt.id ? '' : pt.id)}
                  className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition-all ${
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
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="Částka v Kč"
                className={inputCls}
              />
            )}
          </div>

          {/* Lokalita */}
          <div>
            <label className={labelCls}>Lokalita</label>
            <input
              type="text"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="Praha, remote, celá ČR…"
              className={inputCls}
            />
          </div>

          {/* Tagy */}
          <div>
            <label className={labelCls}>Klíčová slova <span className="text-gray-400 font-normal">(oddělené čárkou)</span></label>
            <input
              type="text"
              value={form.tagsInput}
              onChange={e => set('tagsInput', e.target.value)}
              placeholder="React, TypeScript, remote…"
              className={inputCls}
            />
            {form.tagsInput && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Kontakt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Kontaktní e-mail</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={e => set('contactEmail', e.target.value)}
                placeholder="váš@email.cz"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Telefon <span className="text-gray-400 font-normal">(volitelné)</span></label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={e => set('contactPhone', e.target.value)}
                placeholder="+420 …"
                className={inputCls}
              />
            </div>
          </div>

          {/* Web */}
          <div>
            <label className={labelCls}>Web / portfolio <span className="text-gray-400 font-normal">(volitelné)</span></label>
            <input
              type="url"
              value={form.externalUrl}
              onChange={e => set('externalUrl', e.target.value)}
              placeholder="https://"
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              <X className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Uložit změny
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Event Edit Modal ─────────────────────────────────────────────────────────

const EVENT_TYPES = [
  { id: 'workshop',    label: 'Workshop' },
  { id: 'networking', label: 'Networking' },
  { id: 'talk',       label: 'Přednáška' },
  { id: 'conference', label: 'Konference' },
  { id: 'social',     label: 'Sociální' },
  { id: 'other',      label: 'Jiné' },
];

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop', networking: 'Networking', talk: 'Přednáška',
  conference: 'Konference', social: 'Sociální', other: 'Jiné',
};

interface EventEditForm {
  title: string;
  description: string;
  eventType: string;
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  isFree: boolean;
  price: string;
  maxAttendees: string;
  location: string;
  externalUrl: string;
  imageUrl: string;
  coworkingSlug: string;
}

function toDateInput(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 16);
}

function EventEditModal({
  event,
  onClose,
  onSaved,
}: {
  event: MyEvent;
  onClose: () => void;
  onSaved: (updated: MyEvent) => void;
}) {
  const [form, setForm] = useState<EventEditForm>({
    title: event.title,
    description: '',
    eventType: event.eventType ?? '',
    startDate: toDateInput(event.startDate),
    endDate: '',
    isAllDay: false,
    isFree: event.isFree,
    price: event.price ? String(event.price) : '',
    maxAttendees: '',
    location: event.location ?? '',
    externalUrl: event.externalUrl ?? '',
    imageUrl: event.imageUrl ?? '',
    coworkingSlug: event.coworkingSlug,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string>(event.imageUrl ?? '');
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

  // Load full event data
  useEffect(() => {
    fetch(`/api/events?mine=true`)
      .then(r => r.json())
      .then((data: { events: Array<MyEvent & { description?: string | null; endDate?: string | null; isAllDay?: boolean; maxAttendees?: number | null; imageUrl?: string | null; location?: string | null }> }) => {
        const full = data.events?.find((e) => e.id === event.id);
        if (full) {
          const img = full.imageUrl ?? '';
          setForm(prev => ({
            ...prev,
            description: full.description ?? '',
            endDate: toDateInput(full.endDate),
            isAllDay: full.isAllDay ?? false,
            maxAttendees: full.maxAttendees ? String(full.maxAttendees) : '',
            location: full.location ?? '',
            imageUrl: img,
          }));
          setImagePreview(img);
        }
      })
      .catch(() => {});
  }, [event.id]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const set = <K extends keyof EventEditForm>(field: K, value: EventEditForm[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Název je povinný.'); return; }
    if (!form.startDate) { setError('Datum začátku je povinné.'); return; }
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          eventType: form.eventType || 'other',
          startDate: form.startDate,
          endDate: form.endDate || null,
          isAllDay: form.isAllDay,
          isFree: form.isFree,
          price: !form.isFree && form.price ? form.price : null,
          maxAttendees: form.maxAttendees || null,
          location: form.location || null,
          externalUrl: form.externalUrl || null,
          imageUrl: form.imageUrl || null,
          coworkingSlug: form.coworkingSlug,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Chyba při ukládání.'); return; }
      onSaved({
        ...event,
        title: form.title,
        eventType: form.eventType || null,
        startDate: form.startDate,
        isFree: form.isFree,
        price: !form.isFree && form.price ? parseFloat(form.price) : null,
        location: form.location || null,
        externalUrl: form.externalUrl || null,
        imageUrl: form.imageUrl || null,
        coworkingSlug: form.coworkingSlug,
      });
      onClose();
    } catch {
      setError('Nepodařilo se připojit k serveru.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400';
  const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Upravit event</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Název */}
          <div>
            <label className={labelCls}>Název eventu <span className="text-red-500">*</span></label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Typ */}
          <div>
            <label className={labelCls}>Typ eventu</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set('eventType', form.eventType === t.id ? '' : t.id)}
                  className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition-all ${
                    form.eventType === t.id
                      ? 'border-blue-600 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Popis */}
          <div>
            <label className={labelCls}>Popis</label>
            <textarea
              rows={4}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Datum */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Začátek <span className="text-red-500">*</span></label>
              <input
                type="datetime-local"
                value={form.startDate}
                onChange={e => set('startDate', e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Konec <span className="text-gray-400 font-normal">(volitelné)</span></label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={e => set('endDate', e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Coworking slug + Adresa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Coworking slug</label>
              <input
                type="text"
                value={form.coworkingSlug}
                onChange={e => set('coworkingSlug', e.target.value)}
                placeholder="např. coworking-brno"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Adresa / místo <span className="text-gray-400 font-normal">(volitelné)</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.location}
                  onChange={e => set('location', e.target.value)}
                  placeholder="Přesná adresa"
                  className={`${inputCls} pl-9`}
                />
              </div>
            </div>
          </div>

          {/* Vstupné */}
          <div>
            <label className={labelCls}>Vstupné</label>
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => set('isFree', true)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                  form.isFree
                    ? 'border-green-500 bg-green-50 text-green-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Zdarma
              </button>
              <button
                type="button"
                onClick={() => set('isFree', false)}
                className={`flex-1 py-2 text-sm font-medium rounded-xl border transition-all ${
                  !form.isFree
                    ? 'border-blue-600 bg-blue-50 text-blue-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                Placené
              </button>
            </div>
            {!form.isFree && (
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={e => set('price', e.target.value)}
                placeholder="Cena v Kč"
                className={inputCls}
              />
            )}
          </div>

          {/* Max účastníků + odkaz */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Max. účastníků <span className="text-gray-400 font-normal">(volitelné)</span></label>
              <input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={e => set('maxAttendees', e.target.value)}
                placeholder="Neomezeno"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Odkaz na registraci <span className="text-gray-400 font-normal">(volitelné)</span></label>
              <input
                type="url"
                value={form.externalUrl}
                onChange={e => set('externalUrl', e.target.value)}
                placeholder="https://"
                className={inputCls}
              />
            </div>
          </div>

          {/* Obrázek */}
          <div>
            <label className={labelCls}>Obrázek eventu <span className="text-gray-400 font-normal">(volitelné, max 1 MB)</span></label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button type="button"
                  onClick={() => { setImageMode('upload'); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${imageMode === 'upload' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <Upload className="w-4 h-4" /> Nahrát soubor
                </button>
                <button type="button"
                  onClick={() => { setImageMode('url'); setImagePreview(''); }}
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
                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input type="url"
                      value={form.imageUrl.startsWith('data:') ? '' : form.imageUrl}
                      onChange={e => set('imageUrl', e.target.value)}
                      placeholder="https://… URL obrázku eventu"
                      className={`${inputCls} pl-9`} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-800">
              <X className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Uložit změny
          </button>
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-colors"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── My Listings Section ─────────────────────────────────────────────────────

function MyListingsSection() {
  const [listings, setListings] = useState<MyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<MyListing | null>(null);

  const fetchListings = useCallback(async () => {
    try {
      const res = await fetch('/api/marketplace/listings?mine=true');
      const data = await res.json();
      setListings(data.listings ?? []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const toggleActive = async (id: string, current: boolean) => {
    setActionId(id);
    try {
      await fetch(`/api/marketplace/listings/${id}`, {
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
    if (!confirm('Opravdu smazat tento inzerát?')) return;
    setActionId(id);
    try {
      await fetch(`/api/marketplace/listings/${id}`, { method: 'DELETE' });
      setListings(prev => prev.filter(l => l.id !== id));
    } finally {
      setActionId(null);
    }
  };

  const handleSaved = (updated: MyListing) => {
    setListings(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-gray-900">Moje inzeráty</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {listings.length}
            </span>
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </button>

        {!collapsed && (
          <div className="border-t border-gray-100">
            {loading ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Načítám…</div>
            ) : listings.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400 text-sm mb-3">Zatím žádné inzeráty</p>
                <Link
                  href="/marketplace/nova-nabidka"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" /> Přidat první inzerát
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {listings.map((listing) => {
                  const cfg = CATEGORY_CONFIG[listing.category] || CATEGORY_CONFIG.job_offer;
                  return (
                    <div key={listing.id} className={`px-6 py-4 flex items-start justify-between gap-4 ${!listing.isActive ? 'opacity-60' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bgColor} ${cfg.textColor}`}>
                            {cfg.label}
                          </span>
                          {!listing.isActive && (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Neaktivní</span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{listing.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          {listing.location && (
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.location}</span>
                          )}
                          <span>{new Date(listing.createdAt).toLocaleDateString('cs-CZ')}</span>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingListing(listing)}
                          title="Upravit"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(listing.id, listing.isActive)}
                          disabled={actionId === listing.id}
                          title={listing.isActive ? 'Deaktivovat' : 'Aktivovat'}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          {listing.isActive
                            ? <ToggleRight className="w-4 h-4 text-green-600" />
                            : <ToggleLeft className="w-4 h-4" />
                          }
                        </button>
                        <button
                          onClick={() => deleteListing(listing.id)}
                          disabled={actionId === listing.id}
                          title="Smazat"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="px-6 py-3 bg-gray-50">
                  <Link
                    href="/marketplace/nova-nabidka"
                    className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Přidat inzerát
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editingListing && (
        <ListingEditModal
          listing={editingListing}
          onClose={() => setEditingListing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

// ─── My Events Section ────────────────────────────────────────────────────────

function MyEventsSection() {
  const [events, setEvents] = useState<MyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events?mine=true');
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const deleteEvent = async (id: string) => {
    if (!confirm('Opravdu smazat tento event?')) return;
    setActionId(id);
    try {
      await fetch(`/api/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } finally {
      setActionId(null);
    }
  };

  const handleEventSaved = (updated: MyEvent) => {
    setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <h2 className="text-base font-bold text-gray-900">Moje eventy</h2>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {events.length}
            </span>
          </div>
          {collapsed ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </button>

        {!collapsed && (
          <div className="border-t border-gray-100">
            {loading ? (
              <div className="px-6 py-8 text-center text-gray-400 text-sm">Načítám…</div>
            ) : events.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-400 text-sm mb-3">Zatím žádné eventy</p>
                <Link
                  href="/udalosti/nova-udalost"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-semibold hover:underline"
                >
                  <Plus className="w-4 h-4" /> Přidat první event
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {events.map((event) => {
                  const isPast = new Date(event.startDate) < new Date();
                  return (
                    <div key={event.id} className={`px-6 py-4 flex items-start justify-between gap-4 ${isPast ? 'opacity-60' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {event.eventType && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                              {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                            </span>
                          )}
                          {isPast && (
                            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Proběhlý</span>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{event.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(event.startDate).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                          <span>{event.coworkingSlug}</span>
                          {event.isFree ? (
                            <span className="text-green-600 font-medium">Zdarma</span>
                          ) : event.price ? (
                            <span>{event.price.toLocaleString('cs-CZ')} Kč</span>
                          ) : null}
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingEvent(event)}
                          title="Upravit"
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {event.externalUrl && (
                          <a
                            href={event.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Otevřít odkaz"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => deleteEvent(event.id)}
                          disabled={actionId === event.id}
                          title="Smazat"
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div className="px-6 py-3 bg-gray-50">
                  <Link
                    href="/udalosti/nova-udalost"
                    className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Přidat event
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {editingEvent && (
        <EventEditModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSaved={handleEventSaved}
        />
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProfilPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment'); // 'success' | 'cancelled'

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [editLinkedin, setEditLinkedin] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editIsPhonePublic, setEditIsPhonePublic] = useState(false);
  const [editIsEmailPublic, setEditIsEmailPublic] = useState(false);
  const [editIsPhotoPublic, setEditIsPhotoPublic] = useState(true);
  const [editAllowContact, setEditAllowContact] = useState(false);
  const [editHomeCoworking, setEditHomeCoworking] = useState('');
  const [editHomeCoworkingOther, setEditHomeCoworkingOther] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const skillInputRef = useRef<HTMLInputElement>(null);

  // Avatar state
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [editAvatarUrl, setEditAvatarUrl] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Coworkings list for dropdown
  const [coworkingOptions, setCoworkingOptions] = useState<Array<{ slug: string; name: string }>>([]);

  // Redirect if unauthenticated
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/profil');
    }
  }, [authStatus, router]);

  // Fetch profile data
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetch('/api/profile')
      .then(r => r.json())
      .then((data: ProfileData) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [authStatus]);

  // Fetch coworkings list for homeCoworking dropdown
  // /api/coworkings returns a raw array (not { coworkings: [] })
  useEffect(() => {
    fetch('/api/coworkings')
      .then(r => r.json())
      .then((data: Array<{ slug: string; name: string }> | { coworkings?: Array<{ slug: string; name: string }> }) => {
        const list = Array.isArray(data) ? data : (data.coworkings ?? []);
        setCoworkingOptions(list.map(c => ({ slug: c.slug, name: c.name })));
      })
      .catch(() => {});
  }, []);

  // Populate edit form when entering edit mode
  const enterEditMode = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditBio(profile.bio);
    setEditProfession(profile.profession);
    setEditSkills([...profile.skills]);
    setEditLinkedin(profile.linkedinUrl);
    setEditWebsite(profile.websiteUrl);
    setEditIsPublic(profile.isPublic);
    setEditPhone(profile.phone ?? '');
    setEditCompany(profile.company ?? '');
    setEditIsPhonePublic(profile.isPhonePublic);
    setEditIsEmailPublic(profile.isEmailPublic);
    setEditIsPhotoPublic(profile.isPhotoPublic);
    setEditAllowContact(profile.allowContact);
    const homeSlug = profile.homeCoworkingSlug ?? '';
    // Detect if slug is "other" (not in list — will be resolved after coworkings load)
    setEditHomeCoworking(homeSlug);
    setEditHomeCoworkingOther('');
    setEditAvatarUrl(profile.avatarUrl);
    setSaveError('');
    setSaveSuccess(false);
    setIsEditMode(true);
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setSaveError('');
  };

  const addSkill = () => {
    const s = newSkill.trim();
    if (!s || editSkills.includes(s)) return;
    setEditSkills([...editSkills, s]);
    setNewSkill('');
    skillInputRef.current?.focus();
  };

  const removeSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);
    try {
      const linkedinUrl = normalizeUrl(editLinkedin);
      const websiteUrl = normalizeUrl(editWebsite);
      // homeCoworkingSlug: if dropdown is 'other' use the text field, otherwise use slug
      const homeCoworkingSlug = editHomeCoworking === '__other__'
        ? (editHomeCoworkingOther.trim() || null)
        : (editHomeCoworking || null);

      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          profession: editProfession,
          skills: editSkills,
          linkedinUrl,
          websiteUrl,
          isPublic: editIsPublic,
          phone: editPhone,
          company: editCompany,
          isPhonePublic: editIsPhonePublic,
          isEmailPublic: editIsEmailPublic,
          isPhotoPublic: editIsPhotoPublic,
          allowContact: editAllowContact,
          homeCoworkingSlug,
          avatarUrl: editAvatarUrl,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Chyba při ukládání');
      }
      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        name: editName,
        bio: editBio,
        profession: editProfession,
        skills: editSkills,
        linkedinUrl,
        websiteUrl,
        isPublic: editIsPublic,
        phone: editPhone || null,
        company: editCompany || null,
        isPhonePublic: editIsPhonePublic,
        isEmailPublic: editIsEmailPublic,
        isPhotoPublic: editIsPhotoPublic,
        allowContact: editAllowContact,
        homeCoworkingSlug,
        avatarUrl: editAvatarUrl,
      } : prev);
      setSaveSuccess(true);
      setIsEditMode(false);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : 'Chyba');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading / auth states ──

  if (authStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Profil nenalezen.</p>
      </div>
    );
  }

  const memberStatus = membershipStatus(profile.membershipEnd);
  const hasMembership = memberStatus === 'active' || memberStatus === 'expiring';
  const userRole = profile.role;

  // ── Render ──

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Stripe payment success banner */}
        {paymentStatus === 'success' && (
          <div className="mb-6 flex items-center gap-3 bg-green-50 border border-green-200 text-green-800 rounded-xl px-5 py-4">
            <Check className="w-5 h-5 flex-shrink-0 text-green-600" />
            <div>
              <p className="font-semibold">Platba proběhla úspěšně 🎉</p>
              <p className="text-sm text-green-700">Tvoje členství je aktivní. Výhody se projeví do pár minut.</p>
            </div>
          </div>
        )}

        {/* Stripe payment cancelled banner */}
        {paymentStatus === 'cancelled' && (
          <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4">
            <X className="w-5 h-5 flex-shrink-0 text-amber-600" />
            <p className="text-sm">Platba byla zrušena. Kdykoli se můžeš vrátit a zkusit to znovu.</p>
          </div>
        )}

        {/* Profile save success banner */}
        {saveSuccess && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            Profil byl úspěšně uložen.
          </div>
        )}

        {/* ── Header card ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar — clickable in edit mode to change photo */}
              <Avatar
                name={profile.name}
                image={isEditMode ? (editAvatarUrl ?? profile.image) : (profile.avatarUrl ?? profile.image)}
                size="lg"
                onClick={isEditMode ? () => fileInputRef.current?.click() : undefined}
              />
              {/* Hidden file input for avatar upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = ev => {
                    setAvatarSrc(ev.target?.result as string);
                    setShowCropModal(true);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
                }}
              />
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{profile.name || '(bez jména)'}</h1>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    profile.isPublic
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-600'
                  }`}>
                    {profile.isPublic ? '● Veřejný' : '● Neveřejný'}
                  </span>
                </div>
                {profile.profession && (
                  <p className="text-gray-500 mt-0.5">{profile.profession}</p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    userRole === 'super_admin' ? 'bg-purple-100 text-purple-700' :
                    userRole === 'coworking_admin' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {roleLabel(userRole)}
                  </span>
                  {hasMembership && (
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {membershipLabel(profile.membershipTier)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              {!isEditMode ? (
                <>
                  <button
                    onClick={enterEditMode}
                    className="flex-1 sm:flex-none py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Pencil className="w-4 h-4" />
                    Upravit
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Odhlásit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 sm:flex-none py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Uložit
                  </button>
                  <button
                    onClick={cancelEdit}
                    disabled={saving}
                    className="flex-1 sm:flex-none py-2 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Zrušit
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Error banner ── */}
        {saveError && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">
            <X className="w-4 h-4 flex-shrink-0" />
            {saveError}
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─ Left: main content ─ */}
          <div className="lg:col-span-2 space-y-6">

            {isEditMode ? (
              /* ── Edit form ── */
              <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Upravit profil</h2>

                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Jméno a příjmení</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Tvoje jméno"
                    className="input-field w-full"
                  />
                </div>

                {/* Profession */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profese / pozice</label>
                  <input
                    type="text"
                    value={editProfession}
                    onChange={e => setEditProfession(e.target.value)}
                    placeholder="např. Frontend Developer, Grafik, Marketér..."
                    className="input-field w-full"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">O mně</label>
                  <textarea
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    rows={4}
                    placeholder="Krátký popis — kdo jsi, na čem pracuješ, co tě zajímá..."
                    className="input-field w-full resize-none"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Dovednosti</label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[36px]">
                    {editSkills.map(skill => (
                      <SkillTag key={skill} label={skill} onRemove={() => removeSkill(skill)} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      ref={skillInputRef}
                      type="text"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                      placeholder="Přidat dovednost..."
                      className="input-field flex-1"
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Stiskni Enter nebo klikni + pro přidání</p>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Firma / projekt</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={editCompany}
                      onChange={e => setEditCompany(e.target.value)}
                      placeholder="Název firmy nebo projektu"
                      className="input-field w-full pl-10"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefon (mobil)</label>
                  <div className="flex gap-3 items-start">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="+420 777 000 000"
                        className="input-field w-full pl-10"
                      />
                    </div>
                    <button
                      onClick={() => setEditIsPhonePublic(!editIsPhonePublic)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-semibold transition-colors flex-shrink-0 ${editIsPhonePublic ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-gray-50 border-gray-200 text-gray-500'}`}
                      title={editIsPhonePublic ? 'Telefon je veřejný' : 'Telefon je skrytý'}
                    >
                      {editIsPhonePublic ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {editIsPhonePublic ? 'Veřejný' : 'Skrytý'}
                    </button>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn URL</label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <span className="flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-300 text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
                      <Linkedin className="w-3.5 h-3.5" /> https://
                    </span>
                    <input
                      type="text"
                      value={editLinkedin.replace(/^https?:\/\//i, '')}
                      onChange={e => setEditLinkedin(e.target.value ? `https://${e.target.value.replace(/^https?:\/\//i, '')}` : '')}
                      placeholder="linkedin.com/in/tvuj-profil"
                      className="flex-1 px-3 py-2 text-sm bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Webová stránka</label>
                  <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                    <span className="flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-300 text-xs text-gray-500 font-medium whitespace-nowrap flex-shrink-0">
                      <Globe className="w-3.5 h-3.5" /> https://
                    </span>
                    <input
                      type="text"
                      value={editWebsite.replace(/^https?:\/\//i, '')}
                      onChange={e => setEditWebsite(e.target.value ? `https://${e.target.value.replace(/^https?:\/\//i, '')}` : '')}
                      placeholder="tvoje-stranka.cz"
                      className="flex-1 px-3 py-2 text-sm bg-white outline-none"
                    />
                  </div>
                </div>

                {/* Home coworking */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Domácí coworking</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={editHomeCoworking}
                      onChange={e => {
                        setEditHomeCoworking(e.target.value);
                        if (e.target.value !== '__other__') setEditHomeCoworkingOther('');
                      }}
                      className="input-field w-full pl-10 pr-8 appearance-none"
                    >
                      <option value="">— Nevybráno —</option>
                      {coworkingOptions.map(c => (
                        <option key={c.slug} value={c.slug}>{c.name}</option>
                      ))}
                      <option value="__other__">Jiný…</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {editHomeCoworking === '__other__' && (
                    <input
                      type="text"
                      value={editHomeCoworkingOther}
                      onChange={e => setEditHomeCoworkingOther(e.target.value)}
                      placeholder="Název nebo slug coworkingu"
                      className="input-field w-full mt-2"
                    />
                  )}
                </div>

                {/* Visibility toggles */}
                <div className="space-y-3">
                  {/* Public profile */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Veřejný profil</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ostatní tě uvidí v adresáři coworkerů</p>
                    </div>
                    <button
                      onClick={() => setEditIsPublic(!editIsPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editIsPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Email public */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Zobrazit e-mail veřejně</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ostatní uvidí tvůj e-mail v profilu</p>
                    </div>
                    <button
                      onClick={() => setEditIsEmailPublic(!editIsEmailPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editIsEmailPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsEmailPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Photo public */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Zobrazit profilovou fotku</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ostatní uvidí tvou fotku v adresáři</p>
                    </div>
                    <button
                      onClick={() => setEditIsPhotoPublic(!editIsPhotoPublic)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editIsPhotoPublic ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editIsPhotoPublic ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Allow contact */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Umožnit kontaktování</p>
                      <p className="text-xs text-gray-500 mt-0.5">Ostatní tě mohou kontaktovat přes platformu</p>
                    </div>
                    <button
                      onClick={() => setEditAllowContact(!editAllowContact)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${editAllowContact ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${editAllowContact ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* ── View mode ── */
              <>
                {/* Bio */}
                {profile.bio ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-3">O mně</h2>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-dashed border-gray-300 p-6 text-center">
                    <p className="text-gray-400 text-sm">Ještě nemáš vyplněné bio.</p>
                    <button onClick={enterEditMode} className="text-blue-600 text-sm font-medium mt-1 hover:underline">
                      Přidat popis →
                    </button>
                  </div>
                )}

                {/* Skills */}
                {profile.skills.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Dovednosti</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <SkillTag key={idx} label={skill} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {(profile.linkedinUrl || profile.websiteUrl) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Odkazy</h2>
                    <div className="space-y-3">
                      {profile.linkedinUrl && (
                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <Linkedin className="w-4 h-4 flex-shrink-0" />
                          {profile.linkedinUrl.replace('https://', '')}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                      {profile.websiteUrl && (
                        <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 text-blue-600 hover:text-blue-700 font-medium text-sm">
                          <Globe className="w-4 h-4 flex-shrink-0" />
                          {profile.websiteUrl.replace('https://', '')}
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* My Listings */}
                <MyListingsSection />

                {/* My Events */}
                <MyEventsSection />
              </>
            )}
          </div>

          {/* ─ Right: sidebar ─ */}
          <div className="lg:col-span-1 space-y-5">

            {/* Membership card */}
            <MembershipCard tier={profile.membershipTier} end={profile.membershipEnd} role={userRole} />

            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Kontakt</h3>
              <div className="space-y-1">
                <a href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{profile.email}</span>
                </a>
                {profile.phone && (
                  <a href={`tel:${profile.phone}`}
                    className="flex items-center gap-3 py-2 hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors">
                    <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{profile.phone}</span>
                    {!profile.isPhonePublic && (
                      <span className="text-xs text-gray-400 ml-auto">skrytý</span>
                    )}
                  </a>
                )}
              </div>
            </div>

            {/* Account info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-4">Účet</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Člen od {formatDate(profile.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <ShieldCheck className="w-4 h-4 text-gray-400" />
                  <span>{roleLabel(profile.role)}</span>
                </div>
                {/* Membership tier badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  {(() => {
                    const t = profile.membershipTier;
                    if (!t || t === 'free') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">Zdarma</span>;
                    if (t.startsWith('trial')) return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">Trial 30 dní</span>;
                    if (t === 'monthly') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">Měsíční</span>;
                    if (t === 'yearly') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Roční</span>;
                    if (t === 'corporate') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Firemní</span>;
                    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">{t}</span>;
                  })()}
                  {profile.membershipEnd && (
                    <span className="text-xs text-gray-400">do {formatDate(profile.membershipEnd)}</span>
                  )}
                </div>
                {/* User ID */}
                <div className="flex items-start gap-2 text-gray-400">
                  <span className="text-xs font-bold text-gray-300 flex-shrink-0 mt-0.5">#</span>
                  <span className="text-xs font-mono break-all leading-relaxed">{profile.id}</span>
                </div>
                {!profile.isPublic && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Lock className="w-4 h-4 text-gray-400" />
                    <span>Soukromý profil</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Rychlé akce</h3>
              <div className="space-y-2">
                <Link href="/marketplace/nova-nabidka"
                  className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Plus className="w-4 h-4 text-blue-500" /> Přidat inzerát
                </Link>
                <Link href="/udalosti/nova-udalost"
                  className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="w-4 h-4 text-blue-500" /> Přidat event
                </Link>
                {(userRole === 'coworking_admin' || userRole === 'super_admin') && (
                  <Link href="/spravce"
                    className="flex items-center gap-2 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                    <ShieldCheck className="w-4 h-4 text-purple-500" /> Správce coworkingů
                  </Link>
                )}
              </div>
            </div>

            {/* Danger zone */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-3">Nastavení účtu</h3>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" /> Odhlásit se
                </button>
                <button
                  onClick={() => {
                    if (confirm('Opravdu chceš smazat svůj účet? Tato akce je nevratná.')) {
                      alert('Pro smazání účtu kontaktuj: info@coworkings.cz');
                    }
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 text-gray-400 hover:bg-gray-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Smazat účet
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Avatar crop modal */}
      {showCropModal && avatarSrc && (
        <AvatarCropModal
          src={avatarSrc}
          onConfirm={(dataUrl) => {
            setEditAvatarUrl(dataUrl);
            setShowCropModal(false);
            setAvatarSrc(null);
          }}
          onClose={() => {
            setShowCropModal(false);
            setAvatarSrc(null);
          }}
        />
      )}
    </div>
  );
}
