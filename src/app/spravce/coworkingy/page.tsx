'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, MapPin, ChevronLeft, Check, Clock, ArrowRightLeft, Lock, Loader, X, AlertCircle } from 'lucide-react';
import { coworkingsData } from '@/lib/data/coworkings';
import type { CoworkingSpace } from '@/lib/types';

type Status = 'free' | 'owned_by_me' | 'owned_by_other' | 'pending_mine' | 'transfer_pending_mine' | 'rejected_mine';

interface ClaimModalProps {
  coworking: CoworkingSpace;
  isTransfer: boolean;
  onClose: () => void;
  onSubmitted: (newStatus: Status) => void;
}

function ClaimModal({ coworking, isTransfer, onClose, onSubmitted }: ClaimModalProps) {
  const [businessEmail, setBusinessEmail] = useState('');
  const [message, setMessage] = useState(isTransfer
    ? 'Žádám o převod tohoto coworkingu pod moji správu.'
    : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coworkingSlug: coworking.slug,
          coworkingName: coworking.name,
          businessEmail: businessEmail || undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Chyba při odesílání žádosti');
        return;
      }
      // Odvodit nový status
      let newStatus: Status = 'pending_mine';
      if (data.autoApproved) newStatus = 'owned_by_me';
      else if (data.transferRequest) newStatus = 'transfer_pending_mine';
      onSubmitted(newStatus);
    } catch (err) {
      setError('Chyba sítě');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isTransfer ? 'Žádost o převod' : 'Přivlastnit si coworking'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{coworking.name} — {coworking.city}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {isTransfer && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <strong>⚠️ Pozor:</strong> Tento coworking už má aktivního správce. Tvoje žádost projde jako žádost o převod.
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firemní email (volitelné)</label>
            <input
              type="email"
              value={businessEmail}
              onChange={e => setBusinessEmail(e.target.value)}
              placeholder="info@tvuj-coworking.cz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Pomáhá nám ověřit, že jsi opravdu provozovatel.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Zpráva pro administrátora</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Kdo jsi, jaká je tvoje role v coworkingu, čeho chceš dosáhnout..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </div>
        </div>

        {error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-5 flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium text-sm">
            Zrušit
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 rounded-lg font-medium text-sm flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {isTransfer ? 'Odeslat žádost o převod' : 'Odeslat žádost'}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  switch (status) {
    case 'owned_by_me':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
          <Check className="w-3 h-3" /> Spravuješ
        </span>
      );
    case 'pending_mine':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
          <Clock className="w-3 h-3" /> Čeká schválení
        </span>
      );
    case 'transfer_pending_mine':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
          <ArrowRightLeft className="w-3 h-3" /> Čeká převod
        </span>
      );
    case 'owned_by_other':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
          <Lock className="w-3 h-3" /> Spravuje někdo jiný
        </span>
      );
    case 'rejected_mine':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
          <X className="w-3 h-3" /> Zamítnuto
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium border border-emerald-200">
          Volný
        </span>
      );
  }
}

export default function PrivlastnitPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [allCoworkings, setAllCoworkings] = useState<CoworkingSpace[]>([]);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [filterFree, setFilterFree] = useState(false);
  const [modal, setModal] = useState<{ coworking: CoworkingSpace; isTransfer: boolean } | null>(null);

  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/spravce/coworkingy');
      return;
    }
    if (sessionStatus !== 'authenticated') return;

    Promise.all([
      fetch('/api/admin/coworkings', { cache: 'no-store' }).then(r => (r.ok ? r.json() : coworkingsData)).catch(() => coworkingsData),
      fetch('/api/coworking-edits/bulk-status').then(r => (r.ok ? r.json() : { statuses: {} })).catch(() => ({ statuses: {} })),
    ]).then(([cws, { statuses: s }]) => {
      setAllCoworkings(Array.isArray(cws) ? cws : coworkingsData);
      setStatuses(s || {});
    }).finally(() => setLoading(false));
  }, [sessionStatus, router]);

  const filtered = useMemo(() => {
    let r = allCoworkings;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter(cw => cw.name.toLowerCase().includes(q) || cw.city.toLowerCase().includes(q));
    }
    if (cityFilter) {
      r = r.filter(cw => cw.city.toLowerCase().includes(cityFilter.toLowerCase()));
    }
    if (filterFree) {
      r = r.filter(cw => !statuses[cw.slug] || statuses[cw.slug] === 'free');
    }
    return r;
  }, [allCoworkings, query, cityFilter, filterFree, statuses]);

  const cities = useMemo(() => {
    const counts: Record<string, number> = {};
    allCoworkings.forEach(cw => { counts[cw.city] = (counts[cw.city] || 0) + 1; });
    return Object.entries(counts).map(([c, n]) => ({ city: c, count: n })).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [allCoworkings]);

  if (sessionStatus !== 'authenticated' || loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 320, fontFamily: '"Caveat", cursive', fontSize: 22, color: '#6b6558' }}>
        ↻ načítám…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <Link href="/spravce" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4">
        <ChevronLeft className="w-4 h-4" /> Zpět na šuplík správce
      </Link>

      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: '"Caveat", cursive', fontSize: 19, color: '#c76a54', marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
          ↘ najdi a přivlastni si
        </div>
        <h2 style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0 }}>
          Coworkingový adresář
        </h2>
        <p style={{ fontSize: 13, color: '#6b6558', marginTop: 4 }}>
          Najdi svůj coworking v seznamu a požádej o jeho přivlastnění. Schvalujeme obvykle do 24 hodin.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Hledat podle názvu nebo města..."
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <select
          value={cityFilter}
          onChange={e => setCityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="">Všechna města</option>
          {cities.map(c => <option key={c.city} value={c.city}>{c.city} ({c.count})</option>)}
        </select>
        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={filterFree}
            onChange={e => setFilterFree(e.target.checked)}
            className="rounded"
          />
          <span>Jen volné</span>
        </label>
      </div>

      {/* Result count */}
      <div className="mb-3 text-sm text-gray-600">
        {filtered.length === allCoworkings.length
          ? `${allCoworkings.length} coworkingů celkem`
          : `Nalezeno ${filtered.length} z ${allCoworkings.length}`
        }
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(cw => {
          const s: Status = (statuses[cw.slug] || 'free') as Status;
          const canClaim = s === 'free' || s === 'rejected_mine';
          const canTransfer = s === 'owned_by_other';
          return (
            <div key={cw.slug} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
                {cw.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{cw.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {cw.city}{cw.region && cw.region !== cw.city ? ` · ${cw.region}` : ''}
                    </div>
                  </div>
                  <StatusBadge status={s} />
                </div>
                <div className="mt-3 flex gap-2 items-center">
                  <Link
                    href={`/coworking/${cw.slug}`}
                    target="_blank"
                    className="text-xs text-gray-600 hover:text-gray-900 underline"
                  >
                    Zobrazit profil ↗
                  </Link>
                  {canClaim && (
                    <button
                      onClick={() => setModal({ coworking: cw, isTransfer: false })}
                      className="ml-auto px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded hover:bg-black"
                    >
                      Požádat o přivlastnění
                    </button>
                  )}
                  {canTransfer && (
                    <button
                      onClick={() => setModal({ coworking: cw, isTransfer: true })}
                      className="ml-auto px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700"
                    >
                      Požádat o převod
                    </button>
                  )}
                  {s === 'owned_by_me' && (
                    <Link
                      href={`/spravce/${cw.slug}`}
                      className="ml-auto px-3 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded hover:bg-orange-600"
                    >
                      Otevřít admin →
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 mt-6">
          <p>Žádný coworking neodpovídá filtru. <button onClick={() => { setQuery(''); setCityFilter(''); setFilterFree(false); }} className="text-blue-600 underline ml-1">Zrušit filtry</button></p>
          <p className="text-xs mt-2">Tvůj coworking v seznamu není? Napiš na <a href="mailto:info@coworkings.cz" className="text-blue-600">info@coworkings.cz</a> a přidáme ho.</p>
        </div>
      )}

      {modal && (
        <ClaimModal
          coworking={modal.coworking}
          isTransfer={modal.isTransfer}
          onClose={() => setModal(null)}
          onSubmitted={(newStatus) => {
            setStatuses(prev => ({ ...prev, [modal.coworking.slug]: newStatus }));
            setModal(null);
          }}
        />
      )}
    </div>
  );
}
