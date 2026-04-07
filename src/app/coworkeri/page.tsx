'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Search, X, LayoutGrid, List, MapPin, Globe, Linkedin,
  Phone, Mail, MessageSquare, Building2, ChevronDown,
  ExternalLink, Users, Award,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Coworker {
  id: string;
  name: string;
  profession: string;
  bio: string;
  skills: string[];
  avatarUrl: string | null;
  linkedinUrl: string;
  websiteUrl: string;
  homeCoworkingSlug: string | null;
  phone: string | null;
  email: string | null;
  allowContact: boolean;
  membershipTier: string | null;
}

interface CoworkingInfo {
  slug: string;
  name: string;
  city: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function membershipBadge(tier: string | null) {
  if (!tier) return null;
  if (tier.startsWith('trial')) return { label: 'Trial', cls: 'bg-teal-100 text-teal-700' };
  if (tier === 'monthly') return { label: 'Měsíční', cls: 'bg-green-100 text-green-700' };
  if (tier === 'yearly') return { label: 'Roční', cls: 'bg-blue-100 text-blue-700' };
  if (tier === 'team') return { label: 'Týmový', cls: 'bg-indigo-100 text-indigo-700' };
  if (tier === 'premium') return { label: 'Premium', cls: 'bg-amber-100 text-amber-700' };
  return { label: tier, cls: 'bg-gray-100 text-gray-600' };
}

function CoworkerAvatar({ name, src, size = 'md' }: { name: string; src: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-20 h-20 text-2xl' : size === 'md' ? 'w-14 h-14 text-lg' : 'w-10 h-10 text-sm';
  if (src) return <img src={src} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'}
    </div>
  );
}

// ─── Profile Popup ────────────────────────────────────────────────────────────

function CoworkerModal({
  coworker,
  coworkingName,
  onClose,
}: {
  coworker: Coworker;
  coworkingName: string | null;
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const badge = membershipBadge(coworker.membershipTier);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-bold text-gray-900 text-lg">Profil coworkera</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-start gap-4">
            <CoworkerAvatar name={coworker.name} src={coworker.avatarUrl} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900">{coworker.name || '(bez jména)'}</h3>
              {coworker.profession && (
                <p className="text-gray-500 text-sm mt-0.5">{coworker.profession}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {badge && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${badge.cls}`}>
                    <Award className="w-3 h-3" /> {badge.label}
                  </span>
                )}
                {coworkingName && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {coworkingName}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {coworker.bio && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1.5">O mně</h4>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{coworker.bio}</p>
            </div>
          )}

          {/* Skills */}
          {coworker.skills.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Dovednosti</h4>
              <div className="flex flex-wrap gap-2">
                {coworker.skills.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Contact */}
          {(coworker.phone || coworker.email || coworker.linkedinUrl || coworker.websiteUrl || coworker.allowContact) && (
            <div className="border-t border-gray-100 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Kontakt</h4>
              <div className="space-y-2">
                {coworker.email && (
                  <a href={`mailto:${coworker.email}`}
                    className="flex items-center gap-3 text-sm text-blue-600 hover:underline">
                    <Mail className="w-4 h-4 flex-shrink-0" /> {coworker.email}
                  </a>
                )}
                {coworker.phone && (
                  <a href={`tel:${coworker.phone}`}
                    className="flex items-center gap-3 text-sm text-blue-600 hover:underline">
                    <Phone className="w-4 h-4 flex-shrink-0" /> {coworker.phone}
                  </a>
                )}
                {coworker.linkedinUrl && (
                  <a href={coworker.linkedinUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:underline">
                    <Linkedin className="w-4 h-4 flex-shrink-0" />
                    LinkedIn profil <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {coworker.websiteUrl && (
                  <a href={coworker.websiteUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-blue-600 hover:underline">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    {coworker.websiteUrl.replace('https://', '')} <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                )}
                {coworker.allowContact && (
                  <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    Souhlasí s kontaktováním přes portál
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Card View ────────────────────────────────────────────────────────────────

function CoworkerCard({
  coworker,
  coworkingName,
  onClick,
}: {
  coworker: Coworker;
  coworkingName: string | null;
  onClick: () => void;
}) {
  const badge = membershipBadge(coworker.membershipTier);
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:shadow-md hover:border-blue-200 transition-all group w-full"
    >
      <div className="flex items-start gap-4 mb-3">
        <CoworkerAvatar name={coworker.name} src={coworker.avatarUrl} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {coworker.name || '(bez jména)'}
          </p>
          {coworker.profession && (
            <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">{coworker.profession}</p>
          )}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {badge && (
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            )}
            {coworkingName && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> {coworkingName}
              </span>
            )}
          </div>
        </div>
      </div>

      {coworker.bio && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{coworker.bio}</p>
      )}

      {coworker.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {coworker.skills.slice(0, 4).map((s, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{s}</span>
          ))}
          {coworker.skills.length > 4 && (
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-xs">+{coworker.skills.length - 4}</span>
          )}
        </div>
      )}
    </button>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function CoworkerRow({
  coworker,
  coworkingName,
  onClick,
}: {
  coworker: Coworker;
  coworkingName: string | null;
  onClick: () => void;
}) {
  const badge = membershipBadge(coworker.membershipTier);
  return (
    <button
      onClick={onClick}
      className="w-full bg-white border-b border-gray-100 last:border-0 px-5 py-4 flex items-center gap-4 text-left hover:bg-blue-50 transition-colors group"
    >
      <CoworkerAvatar name={coworker.name} src={coworker.avatarUrl} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {coworker.name || '(bez jména)'}
        </p>
        <div className="flex items-center gap-2 flex-wrap mt-0.5">
          {coworker.profession && (
            <span className="text-sm text-gray-500 line-clamp-1">{coworker.profession}</span>
          )}
          {coworkingName && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {coworkingName}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge && (
          <span className={`hidden sm:inline text-xs font-semibold px-2 py-0.5 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        )}
        {coworker.skills.slice(0, 2).map((s, i) => (
          <span key={i} className="hidden md:inline px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{s}</span>
        ))}
      </div>
    </button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CoworkersPage() {
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [coworkings, setCoworkings] = useState<CoworkingInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [coworkingFilter, setCoworkingFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  // View
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [selected, setSelected] = useState<Coworker | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/coworkers').then(r => r.json()),
      fetch('/api/coworkings').then(r => r.json()),
    ]).then(([cdata, cwdata]) => {
      setCoworkers(cdata.coworkers ?? []);
      const cwList = Array.isArray(cwdata) ? cwdata : [];
      setCoworkings(cwList.map((cw: { slug: string; name: string; city: string }) => ({
        slug: cw.slug,
        name: cw.name,
        city: cw.city?.startsWith('Praha') ? 'Praha' : cw.city,
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Build lookup map: slug → coworking info
  const cwMap = useMemo(() => {
    const m: Record<string, CoworkingInfo> = {};
    coworkings.forEach(cw => { m[cw.slug] = cw; });
    return m;
  }, [coworkings]);

  // All cities from coworkings that have at least one coworker
  const availableCities = useMemo(() => {
    const slugsWithCoworkers = new Set(coworkers.map(c => c.homeCoworkingSlug).filter(Boolean));
    const cities = new Set<string>();
    coworkings.forEach(cw => {
      if (slugsWithCoworkers.has(cw.slug)) {
        cities.add(cw.city?.startsWith('Praha') ? 'Praha' : cw.city);
      }
    });
    return Array.from(cities).sort();
  }, [coworkers, coworkings]);

  // Coworkings in selected city
  const availableCoworkings = useMemo(() => {
    if (!cityFilter) return coworkings.filter(cw => {
      const slugsWithCoworkers = new Set(coworkers.map(c => c.homeCoworkingSlug).filter(Boolean));
      return slugsWithCoworkers.has(cw.slug);
    });
    return coworkings.filter(cw => {
      const city = cw.city?.startsWith('Praha') ? 'Praha' : cw.city;
      return city === cityFilter;
    });
  }, [cityFilter, coworkings, coworkers]);

  // All unique skills
  const allSkills = useMemo(() => {
    const set = new Set<string>();
    coworkers.forEach(c => c.skills.forEach(s => set.add(s)));
    return Array.from(set).sort();
  }, [coworkers]);

  // Filtered
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return coworkers.filter(c => {
      if (q) {
        const text = `${c.name} ${c.profession} ${c.bio} ${c.skills.join(' ')}`.toLowerCase();
        if (!text.includes(q)) return false;
      }
      if (cityFilter && c.homeCoworkingSlug) {
        const cw = cwMap[c.homeCoworkingSlug];
        const city = cw?.city?.startsWith('Praha') ? 'Praha' : cw?.city;
        if (city !== cityFilter) return false;
      } else if (cityFilter && !c.homeCoworkingSlug) {
        return false;
      }
      if (coworkingFilter && c.homeCoworkingSlug !== coworkingFilter) return false;
      if (skillFilter && !c.skills.includes(skillFilter)) return false;
      return true;
    });
  }, [coworkers, query, cityFilter, coworkingFilter, skillFilter, cwMap]);

  const hasFilters = query || cityFilter || coworkingFilter || skillFilter;
  const clearFilters = () => { setQuery(''); setCityFilter(''); setCoworkingFilter(''); setSkillFilter(''); };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Coworkeři</h1>
          </div>
          <p className="text-gray-500">
            Aktivní členové coworkingové komunity — najdi kolegy, partnery nebo klienty
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Text search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Hledej jméno, profesi, dovednost…"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={cityFilter}
                onChange={e => { setCityFilter(e.target.value); setCoworkingFilter(''); }}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[140px]"
              >
                <option value="">Všechna města</option>
                {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Coworking filter */}
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={coworkingFilter}
                onChange={e => setCoworkingFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[160px]"
              >
                <option value="">Všechny coworkingy</option>
                {availableCoworkings.map(cw => <option key={cw.slug} value={cw.slug}>{cw.name}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>

            {/* Skill filter */}
            {allSkills.length > 0 && (
              <div className="relative">
                <select
                  value={skillFilter}
                  onChange={e => setSkillFilter(e.target.value)}
                  className="pl-4 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[140px]"
                >
                  <option value="">Všechny skills</option>
                  {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Filter summary + clear */}
          {hasFilters && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                Nalezeno: <strong className="text-gray-900">{filtered.length}</strong> coworkerů
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Zrušit filtry
              </button>
            </div>
          )}
        </div>

        {/* View toggle + count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {loading ? 'Načítám…' : `${filtered.length} coworkerů`}
          </p>
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            <button
              onClick={() => setViewMode('card')}
              className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Mřížka"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
              title="Seznam"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium mb-2">Žádní coworkeři nenalezeni</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-blue-600 text-sm hover:underline">
                Zkusit bez filtrů
              </button>
            )}
          </div>
        ) : viewMode === 'card' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <CoworkerCard
                key={c.id}
                coworker={c}
                coworkingName={c.homeCoworkingSlug ? (cwMap[c.homeCoworkingSlug]?.name ?? null) : null}
                onClick={() => setSelected(c)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {filtered.map(c => (
              <CoworkerRow
                key={c.id}
                coworker={c}
                coworkingName={c.homeCoworkingSlug ? (cwMap[c.homeCoworkingSlug]?.name ?? null) : null}
                onClick={() => setSelected(c)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {selected && (
        <CoworkerModal
          coworker={selected}
          coworkingName={selected.homeCoworkingSlug ? (cwMap[selected.homeCoworkingSlug]?.name ?? null) : null}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
