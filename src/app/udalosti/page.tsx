'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Calendar, Users, DollarSign, X, ChevronLeft, ChevronRight,
  ExternalLink, Plus, Lock, MapPin, Clock,
} from 'lucide-react';
import { coworkingsData, getCitiesWithCount } from '@/lib/data/coworkings';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type ViewMode = 'calendar' | 'list';

interface DbEvent {
  id: string;
  coworkingSlug: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  startDate: string;
  endDate?: string | null;
  isAllDay: boolean;
  isFree: boolean;
  price?: number | null;
  maxAttendees?: number | null;
  location?: string | null;
  externalUrl?: string | null;
  imageUrl?: string | null;
}

// Resolve coworking slug → display name from static data
const slugToName: Record<string, string> = Object.fromEntries(
  coworkingsData.map((c) => [c.slug, c.name])
);

const EVENT_TYPE_LABELS: Record<string, string> = {
  workshop: 'Workshop',
  networking: 'Networking',
  meetup: 'Meetup',
  conference: 'Konference',
  party: 'Party',
  other: 'Jiné',
};

// ─── Day popup modal ─────────────────────────────────────────────────────────

function DayEventsModal({
  date,
  events,
  onClose,
}: {
  date: Date;
  events: DbEvent[];
  onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const dayLabel = date.toLocaleDateString('cs-CZ', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 capitalize">{dayLabel}</h2>
            <p className="text-sm text-gray-500">
              {events.length} {events.length === 1 ? 'event' : events.length < 5 ? 'eventy' : 'eventů'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Events list */}
        <div className="px-4 py-4 space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {event.imageUrl && (
                <div className="h-36 w-full overflow-hidden">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {!event.imageUrl && (
                <div className="h-16 bg-gradient-to-r from-blue-500 to-blue-700 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white/60" />
                </div>
              )}

              <div className="p-4">
                {/* Type badge */}
                {event.eventType && (
                  <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full mb-2">
                    {EVENT_TYPE_LABELS[event.eventType] ?? event.eventType}
                  </span>
                )}

                <h3 className="text-base font-bold text-gray-900 mb-1">{event.title}</h3>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">{event.description}</p>
                )}

                <div className="space-y-1.5 text-sm text-gray-600">
                  {/* Date/time */}
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>
                      {event.isAllDay
                        ? 'Celodenní akce'
                        : new Date(event.startDate).toLocaleTimeString('cs-CZ', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                      {event.endDate && !event.isAllDay && (
                        <> – {new Date(event.endDate).toLocaleTimeString('cs-CZ', {
                          hour: '2-digit', minute: '2-digit',
                        })}</>
                      )}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span>
                      {slugToName[event.coworkingSlug] ?? event.coworkingSlug}
                      {event.location && <>, {event.location}</>}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <span>{event.isFree ? 'Vstup zdarma' : `${event.price ?? '?'} Kč`}</span>
                  </div>

                  {/* Capacity */}
                  {event.maxAttendees && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      <span>Max {event.maxAttendees} účastníků</span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                {event.externalUrl && (
                  <a
                    href={event.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors text-sm"
                  >
                    Zjistit víc <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function UdalostiPage() {
  const { data: session } = useSession();
  const userRole: string = (session?.user as any)?.role ?? '';
  const canAddEvent = userRole === 'super_admin' || userRole === 'coworking_admin' || userRole === 'coworker';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allEvents, setAllEvents] = useState<DbEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar day popup
  const [popupDate, setPopupDate] = useState<Date | null>(null);
  const [popupEvents, setPopupEvents] = useState<DbEvent[]>([]);

  useEffect(() => {
    fetch('/api/events')
      .then((r) => r.json())
      .then((d) => setAllEvents(d.events ?? []))
      .catch(() => setAllEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const cities = getCitiesWithCount();
  const eventTypes = [
    { id: 'workshop', label: 'Workshop' },
    { id: 'networking', label: 'Networking' },
    { id: 'meetup', label: 'Meetup' },
    { id: 'conference', label: 'Konference' },
    { id: 'party', label: 'Party' },
  ];

  const filteredEvents = useMemo(() => {
    return allEvents
      .filter((event) => {
        const name = slugToName[event.coworkingSlug] ?? event.coworkingSlug;
        const matchCity = !selectedCity || name.includes(selectedCity);
        const matchType = !selectedEventType || event.eventType === selectedEventType;
        return matchCity && matchType;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [allEvents, selectedCity, selectedEventType]);

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    // Convert Sunday=0 to Monday=0 (Czech week starts Monday)
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter((e) => {
      const eventDate = new Date(e.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handleDayClick = (date: Date, dayEvents: DbEvent[]) => {
    if (dayEvents.length === 0) return;
    setPopupDate(date);
    setPopupEvents(dayEvents);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Akce a eventy
            </h1>
            <p className="text-gray-600">
              Najdi si zajímavou akci a setkej se s komunitou
            </p>
          </div>
          {session ? (
            canAddEvent ? (
              <Link
                href="/udalosti/nova-udalost"
                className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
              >
                <Plus className="w-5 h-5" />
                Přidat event
              </Link>
            ) : (
              <Link
                href="/ceniky"
                className="hidden sm:flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 text-sm"
                title="Pouze pro platící členy"
              >
                <Lock className="w-4 h-4" />
                Přidat event
              </Link>
            )
          ) : (
            <Link
              href="/prihlaseni?callbackUrl=/udalosti/nova-udalost"
              className="hidden sm:flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              Přidat event
            </Link>
          )}
        </div>

        {/* Mobile add button */}
        <div className="sm:hidden mb-6">
          {session && canAddEvent ? (
            <Link
              href="/udalosti/nova-udalost"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Přidat event
            </Link>
          ) : (
            <Link
              href={session ? '/ceniky' : '/prihlaseni?callbackUrl=/udalosti/nova-udalost'}
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Přidat event
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8 space-y-4 sm:space-y-0 sm:flex gap-4">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Všechna města</option>
            {cities.map((city) => (
              <option key={city.city} value={city.city}>
                {city.city}
              </option>
            ))}
          </select>

          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e.target.value)}
            className="input-field flex-1"
          >
            <option value="">Typ eventu</option>
            {eventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>

          {(selectedCity || selectedEventType) && (
            <button
              onClick={() => {
                setSelectedCity('');
                setSelectedEventType('');
              }}
              className="px-4 py-3 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Vymazat
            </button>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Kalendář
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Seznam
          </button>
        </div>

        {/* List View */}
        {viewMode === 'list' && (
          <div>
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-100 p-6 animate-pulse h-40" />
                ))}
              </div>
            )}
            {!loading && filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white rounded-lg border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Event Image */}
                      <div className="w-full sm:w-40 h-40 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg overflow-hidden flex-shrink-0">
                        {event.imageUrl && (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                              {EVENT_TYPE_LABELS[event.eventType ?? ''] ?? event.eventType}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {slugToName[event.coworkingSlug] ?? event.coworkingSlug}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-3">
                            {event.title}
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-600" />
                              {event.location}
                            </span>
                          )}
                          {event.maxAttendees && (
                            <span className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-blue-600" />
                              Max {event.maxAttendees} osob
                            </span>
                          )}
                          <span className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-500" />
                            {event.isFree ? 'Zdarma' : `${event.price} Kč`}
                          </span>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="flex sm:flex-col gap-2 items-stretch sm:items-end justify-center">
                        {event.externalUrl ? (
                          <a
                            href={event.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            Zjistit víc…
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <button
                            disabled
                            className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 text-gray-400 font-semibold rounded-lg cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                            title="Odkaz nebyl zadán"
                          >
                            Zjistit víc…
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Žádné eventy</h3>
                  <p className="text-gray-600">Zkus změnit filtry nebo se vrať později</p>
                </div>
              )
            )}
          </div>
        )}

        {/* Calendar View */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('cs-CZ', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-6">
              {/* Day headers */}
              {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
                <div
                  key={day}
                  className="text-center font-bold text-gray-600 py-2 text-sm"
                >
                  {day}
                </div>
              ))}

              {/* Empty cells before first day */}
              {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {/* Calendar days */}
              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1
                );
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const hasEvents = dayEvents.length > 0;

                return (
                  <div
                    key={i + 1}
                    onClick={() => handleDayClick(date, dayEvents)}
                    className={`aspect-square rounded-lg border-2 p-1.5 flex flex-col justify-start overflow-hidden transition-all ${
                      hasEvents
                        ? 'cursor-pointer hover:shadow-md hover:scale-[1.03]'
                        : 'cursor-default'
                    } ${
                      isToday
                        ? 'border-blue-600 bg-blue-50'
                        : hasEvents
                        ? 'border-blue-300 hover:border-blue-500'
                        : 'border-gray-100'
                    }`}
                  >
                    <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded truncate leading-tight"
                          title={e.title}
                        >
                          <span className="hidden sm:inline">{e.title.length > 10 ? e.title.slice(0, 10) + '…' : e.title}</span>
                          <span className="sm:hidden">●</span>
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-blue-600 font-bold">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-400 mb-6 text-center">
              Kliknutím na den s eventem zobrazíte detail
            </p>

            {/* Legend */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Eventy pro vybrané období</h3>
              {filteredEvents.length > 0 ? (
                <div className="space-y-2">
                  {filteredEvents.slice(0, 5).map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      onClick={() => {
                        const d = new Date(event.startDate);
                        handleDayClick(d, getEventsForDate(d));
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                            day: 'numeric', month: 'long',
                          })}
                          {event.location && ` · ${event.location}`}
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  V tomto měsíci nejsou žádné eventy
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Day popup */}
      {popupDate && (
        <DayEventsModal
          date={popupDate}
          events={popupEvents}
          onClose={() => { setPopupDate(null); setPopupEvents([]); }}
        />
      )}
    </div>
  );
}
