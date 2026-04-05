'use client';

import { useState, useMemo } from 'react';
import { Calendar, Users, DollarSign, X, ChevronLeft, ChevronRight, ExternalLink, Plus, Lock } from 'lucide-react';
import { eventsData, getCitiesWithCount } from '@/lib/data/coworkings';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

type ViewMode = 'calendar' | 'list';

export default function UdalostiPage() {
  const { data: session } = useSession();
  const userRole: string = (session?.user as any)?.role ?? '';
  const canAddEvent = userRole === 'super_admin' || userRole === 'coworking_admin' || userRole === 'coworker';

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2));

  const cities = getCitiesWithCount();
  const eventTypes = [
    { id: 'workshop', label: 'Workshop' },
    { id: 'networking', label: 'Networking' },
    { id: 'meetup', label: 'Meetup' },
    { id: 'conference', label: 'Konference' },
    { id: 'party', label: 'Party' },
  ];

  const filteredEvents = useMemo(() => {
    return eventsData
      .filter((event) => {
        const matchCity = !selectedCity || event.coworkingName?.includes(selectedCity);
        const matchType = !selectedEventType || event.eventType === selectedEventType;
        return matchCity && matchType;
      })
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [selectedCity, selectedEventType]);

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
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
            {filteredEvents.length > 0 ? (
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
                              {event.eventType === 'workshop' && 'Workshop'}
                              {event.eventType === 'networking' && 'Networking'}
                              {event.eventType === 'meetup' && 'Meetup'}
                              {event.eventType === 'conference' && 'Konference'}
                              {event.eventType === 'party' && 'Party'}
                            </span>
                            <span className="text-xs text-gray-600 font-medium">
                              {event.coworkingName}
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
                        {event.url ? (
                          <a
                            href={event.url}
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
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Žádné eventy
                </h3>
                <p className="text-gray-600">
                  Zkus změnit filtry nebo se vrať později
                </p>
              </div>
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
            <div className="grid grid-cols-7 gap-2 mb-6">
              {/* Day headers */}
              {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map((day) => (
                <div
                  key={day}
                  className="text-center font-bold text-gray-600 py-2"
                >
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: getFirstDayOfMonth(currentMonth) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}

              {Array.from({ length: getDaysInMonth(currentMonth) }).map((_, i) => {
                const date = new Date(
                  currentMonth.getFullYear(),
                  currentMonth.getMonth(),
                  i + 1
                );
                const dayEvents = getEventsForDate(date);
                const isToday =
                  date.toDateString() === new Date().toDateString();

                return (
                  <div
                    key={i + 1}
                    className={`aspect-square rounded-lg border-2 p-2 flex flex-col justify-start overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                      isToday
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-100 hover:border-blue-300'
                    }`}
                  >
                    <span className={`text-sm font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {i + 1}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="text-xs bg-blue-600 text-white px-1 py-0.5 rounded truncate"
                          title={e.title}
                        >
                          {e.title.slice(0, 10)}...
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

            {/* Legend */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-bold text-gray-900 mb-4">Eventy pro vybrané období</h3>
              {filteredEvents.length > 0 ? (
                <div className="space-y-2">
                  {filteredEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-3 h-3 bg-blue-600 rounded-full flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(event.startDate).toLocaleDateString('cs-CZ')}
                        </p>
                      </div>
                    </div>
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
    </div>
  );
}
