'use client';

import { useState, useEffect } from 'react';
import {
  Search, Trash2, Building2, Users, Tag, Calendar,
  X, ChevronDown, ChevronUp, MapPin, DollarSign,
} from 'lucide-react';
import Link from 'next/link';
import { coworkingsData } from '@/lib/data/coworkings';

interface AdminEvent {
  id: string;
  title: string;
  description: string | null;
  eventType: string | null;
  coworkingSlug: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isAllDay: boolean;
  isFree: boolean;
  price: number | null;
  maxAttendees: number | null;
  externalUrl: string | null;
  imageUrl: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  // raw query fallback
  userName?: string | null;
  userEmail?: string | null;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  networking: 'Networking',
  meetup: 'Meetup',
  conference: 'Konference',
  party: 'Party',
  other: 'Jiné',
};

const slugToName: Record<string, string> = Object.fromEntries(
  coworkingsData.map((c) => [c.slug, c.name])
);

export default function AdminEventyPage() {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/events');
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const deleteEvent = async (id: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      setEvents(prev => prev.filter(e => e.id !== id));
    } finally {
      setActionId(null);
      setDeleteConfirmId(null);
    }
  };

  const filtered = events.filter((e) => {
    const userDisplayName = e.user?.name ?? e.userName ?? '';
    const userDisplayEmail = e.user?.email ?? e.userEmail ?? '';
    const matchSearch = !search ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      userDisplayEmail.toLowerCase().includes(search.toLowerCase()) ||
      userDisplayName.toLowerCase().includes(search.toLowerCase()) ||
      (slugToName[e.coworkingSlug] ?? e.coworkingSlug).toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || e.eventType === filterType;
    return matchSearch && matchType;
  });

  const upcoming = events.filter(e => new Date(e.startDate) >= new Date()).length;
  const past = events.filter(e => new Date(e.startDate) < new Date()).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Správa eventů a akcí</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Super Admin
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100">
            <Link href="/admin" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Coworkingy
            </Link>
            <Link href="/admin/uzivatele" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Users className="w-4 h-4" /> Uživatelé
            </Link>
            <Link href="/admin/inzeraty" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Inzeráty
            </Link>
            <Link href="/admin/eventy" className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Eventy
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Celkem</p>
            <p className="text-3xl font-bold text-gray-900">{events.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Nadcházející</p>
            <p className="text-3xl font-bold text-blue-600">{upcoming}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Proběhlé</p>
            <p className="text-3xl font-bold text-gray-400">{past}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat event, coworking, uživatele…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">Všechny typy</option>
            {Object.entries(EVENT_TYPE_LABELS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          {(search || filterType) && (
            <button
              onClick={() => { setSearch(''); setFilterType(''); }}
              className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <X className="w-4 h-4" /> Vymazat
            </button>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-white rounded-xl animate-pulse border border-gray-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Žádné eventy nenalezeny</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Uživatel</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Datum</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Coworking</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((event) => {
                  const isPast = new Date(event.startDate) < new Date();
                  const userDisplayName = event.user?.name ?? event.userName;
                  const userDisplayEmail = event.user?.email ?? event.userEmail;
                  return (
                    <>
                      <tr
                        key={event.id}
                        className={`hover:bg-gray-50 transition-colors ${isPast ? 'opacity-60' : ''}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setExpandedId(expandedId === event.id ? null : event.id)}
                              className="p-0.5 text-gray-400 hover:text-gray-700"
                            >
                              {expandedId === event.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{event.title}</p>
                                {event.eventType && (
                                  <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                                    {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                                  </span>
                                )}
                                {isPast && (
                                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">proběhlý</span>
                                )}
                              </div>
                              {event.location && (
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3" />{event.location}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-gray-800">{userDisplayName ?? '—'}</p>
                          <p className="text-xs text-gray-400">{userDisplayEmail ?? '—'}</p>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-gray-800 whitespace-nowrap">
                            {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                          {!event.isAllDay && (
                            <p className="text-xs text-gray-400">
                              {new Date(event.startDate).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-600">
                          {slugToName[event.coworkingSlug] ?? event.coworkingSlug}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {deleteConfirmId === event.id ? (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => deleteEvent(event.id)}
                                disabled={actionId === event.id}
                                className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 disabled:opacity-50"
                              >
                                Smazat
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg hover:bg-gray-200"
                              >
                                Zrušit
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(event.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                      {expandedId === event.id && (
                        <tr key={`${event.id}-detail`} className="bg-blue-50/40">
                          <td colSpan={5} className="px-8 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-semibold text-gray-700 mb-1">Popis</p>
                                <p className="text-gray-600">{event.description || '—'}</p>
                              </div>
                              <div className="space-y-1">
                                <p className="flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5 text-orange-500" />
                                  {event.isFree ? 'Vstup zdarma' : `${event.price ?? '?'} Kč`}
                                </p>
                                {event.maxAttendees && (
                                  <p className="text-gray-600">Max. účastníků: {event.maxAttendees}</p>
                                )}
                                {event.externalUrl && (
                                  <a href={event.externalUrl} target="_blank" rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-xs break-all">
                                    {event.externalUrl}
                                  </a>
                                )}
                                <p className="text-xs text-gray-400 font-mono">ID: {event.id}</p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
