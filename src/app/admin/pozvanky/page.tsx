'use client';

// Super-admin sekce Pozvánky — seznam emailů ze pre-landingu.
// Akce: označit jako odeslané/redeemed, smazat, přidat poznámku, copy email do schránky.

import { useState, useEffect, useMemo } from 'react';
import { Mail, Check, Trash2, Search, RefreshCw, Copy, Edit3, X } from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  status: 'pending' | 'sent' | 'redeemed' | 'declined';
  note: string | null;
  source: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  sentAt: string | null;
}

interface ApiResponse {
  items: Invitation[];
  stats: { total: number; pending: number; sent: number; redeemed: number };
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Čeká',
  sent: 'Odesláno',
  redeemed: 'Pustil se dovnitř',
  declined: 'Zamítnuto',
};

const STATUS_COLOR: Record<string, string> = {
  pending:  'bg-amber-100  text-amber-800',
  sent:     'bg-blue-100   text-blue-800',
  redeemed: 'bg-green-100  text-green-800',
  declined: 'bg-gray-200   text-gray-600',
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('cs-CZ', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export default function AdminPozvankyPage() {
  const [items, setItems] = useState<Invitation[]>([]);
  const [stats, setStats] = useState<ApiResponse['stats'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent' | 'redeemed'>('all');
  const [editing, setEditing] = useState<Invitation | null>(null);

  async function load(showSpinner = true) {
    if (showSpinner) setLoading(true); else setRefreshing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/invitations', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ApiResponse = await res.json();
      setItems(data.items);
      setStats(data.stats);
    } catch (e: any) {
      setError(e?.message ?? 'Načtení selhalo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateOne(id: string, patch: Partial<Invitation>) {
    const optimistic = items.map(i => i.id === id ? { ...i, ...patch } : i);
    setItems(optimistic);
    try {
      const res = await fetch(`/api/admin/invitations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Update selhal');
      await load(false);
    } catch (e) {
      await load(false);
      alert('Nepodařilo se uložit změnu.');
    }
  }

  async function deleteOne(id: string, email: string) {
    if (!confirm(`Opravdu smazat pozvánku ${email}? Tahle akce je nevratná.`)) return;
    try {
      const res = await fetch(`/api/admin/invitations/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Smazání selhalo');
      setItems(items.filter(i => i.id !== id));
      await load(false);
    } catch {
      alert('Nepodařilo se smazat.');
    }
  }

  function copyEmail(email: string) {
    if (navigator.clipboard) navigator.clipboard.writeText(email);
  }

  const filtered = useMemo(() => {
    let r = items;
    if (filter !== 'all') r = r.filter(i => i.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(i =>
        i.email.toLowerCase().includes(q) ||
        (i.note ?? '').toLowerCase().includes(q) ||
        (i.utmCampaign ?? '').toLowerCase().includes(q),
      );
    }
    return r;
  }, [items, filter, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-orange-500" />
            Pozvánky
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Emaily zachycené na pre-landing stránce. Označuj odeslané, přidávej poznámky.
          </p>
        </div>
        <button
          onClick={() => load(false)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Načíst znovu
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <StatCard label="Celkem"  value={stats.total}    tone="gray" />
          <StatCard label="Čekají"  value={stats.pending}  tone="amber" />
          <StatCard label="Odesláno" value={stats.sent}    tone="blue" />
          <StatCard label="Pustili se dovnitř" value={stats.redeemed} tone="green" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Hledat email, poznámku, kampaň…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'pending', 'sent', 'redeemed'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg border ${
                filter === s
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {s === 'all' ? 'Vše' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Načítám…</div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {items.length === 0 ? 'Zatím žádné pozvánky.' : 'Nic nesedí filtru.'}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Přidáno</th>
                <th className="px-4 py-3 text-left">Zdroj / UTM</th>
                <th className="px-4 py-3 text-left">Poznámka</th>
                <th className="px-4 py-3 text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 break-all">{inv.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={inv.status}
                      onChange={e => updateOne(inv.id, { status: e.target.value as Invitation['status'] })}
                      className={`text-xs px-2 py-1 rounded-md border-0 cursor-pointer ${STATUS_COLOR[inv.status]}`}
                    >
                      {Object.entries(STATUS_LABEL).map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                    {inv.sentAt && inv.status !== 'pending' && (
                      <div className="text-[10px] text-gray-400 mt-1">odesláno {formatDate(inv.sentAt)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[220px]">
                    {inv.utmCampaign && <div><strong>{inv.utmCampaign}</strong></div>}
                    {(inv.utmSource || inv.utmMedium) && (
                      <div>{[inv.utmSource, inv.utmMedium].filter(Boolean).join(' / ')}</div>
                    )}
                    {inv.source && <div className="truncate" title={inv.source}>{inv.source}</div>}
                    {!inv.utmCampaign && !inv.utmSource && !inv.source && <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 max-w-[240px]">
                    {inv.note
                      ? <span title={inv.note}>{inv.note.length > 60 ? inv.note.slice(0, 60) + '…' : inv.note}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => copyEmail(inv.email)}
                      title="Kopírovat email"
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditing(inv)}
                      title="Upravit poznámku"
                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded ml-1"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {inv.status === 'pending' && (
                      <button
                        onClick={() => updateOne(inv.id, { status: 'sent' })}
                        title="Označit jako odeslané"
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded ml-1"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(inv.id, inv.email)}
                      title="Smazat"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded ml-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Note editor modal */}
      {editing && (
        <NoteModal
          invitation={editing}
          onClose={() => setEditing(null)}
          onSave={async (note) => {
            await updateOne(editing.id, { note });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone: 'gray'|'amber'|'blue'|'green' }) {
  const map: Record<string, string> = {
    gray: 'bg-white border-gray-200 text-gray-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  };
  return (
    <div className={`rounded-lg border p-4 ${map[tone]}`}>
      <div className="text-xs uppercase tracking-wide opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function NoteModal({
  invitation, onClose, onSave,
}: {
  invitation: Invitation;
  onClose: () => void;
  onSave: (note: string | null) => Promise<void>;
}) {
  const [val, setVal] = useState(invitation.note ?? '');
  const [saving, setSaving] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Poznámka</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-700 break-all"><strong>{invitation.email}</strong></p>
          <textarea
            value={val}
            onChange={e => setVal(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Třeba: kámoš ze SF Praha, slíbil intro do co.brik"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Zrušit
            </button>
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                await onSave(val.trim() ? val.trim() : null);
                setSaving(false);
              }}
              className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Ukládám…' : 'Uložit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
