import { notFound } from 'next/navigation';
import {
  MapPin, Phone, Mail, Globe, Users, Clock,
  Calendar, Star, MessageSquare, Youtube, Boxes,
  ExternalLink, Building2,
} from 'lucide-react';
import Link from 'next/link';
import { coworkingsData, eventsData } from '@/lib/data/coworkings';
import { AMENITY_LABELS, VENUE_TYPE_LABELS, VENUE_TYPE_EMOJIS } from '@/lib/types';
import ClaimButton from '@/components/ClaimButton';
import PhotoGallery from '@/components/PhotoGallery';
import CoworkingTabs from '@/components/CoworkingTabs';
import AmenityGrid from '@/components/AmenityGrid';
import { prisma } from '@/lib/prisma';

// Vždy renderovat server-side — aby se DB overrides zobrazily live
export const dynamic = 'force-dynamic';

interface CoworkingDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return coworkingsData.map((coworking) => ({ slug: coworking.slug }));
}

async function getDbOverrides(slug: string) {
  try {
    const edit = await prisma.coworkingEdit.findUnique({ where: { coworkingSlug: slug } });
    return (edit?.data as Record<string, any>) ?? null;
  } catch {
    return null;
  }
}

/** Ensure URL is absolute (adds https:// if missing) */
function ensureAbsoluteUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

/** Convert any YouTube URL format to an embed URL */
function toYoutubeEmbed(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=ID
    const v = u.searchParams.get('v');
    if (v) return `https://www.youtube.com/embed/${v}`;
    // https://youtu.be/ID
    if (u.hostname === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`;
    // already an embed URL
    if (u.pathname.startsWith('/embed/')) return url;
  } catch {
    return null;
  }
  return null;
}

export default async function CoworkingDetailPage({ params }: CoworkingDetailPageProps) {
  const base = coworkingsData.find((cw) => cw.slug === params.slug);
  if (!base) notFound();

  const overrides = await getDbOverrides(params.slug);
  const coworking: any = overrides && Object.keys(overrides).length > 0
    ? { ...base, ...overrides }
    : base;

  if (coworking.deleted) notFound();

  const relatedEvents = eventsData.filter((e) => e.coworkingId === base.id);
  const photos: { id: string; url: string; caption: string; isPrimary: boolean }[] =
    coworking.photos || [];

  const youtubeEmbed = coworking.youtubeUrl ? toYoutubeEmbed(coworking.youtubeUrl) : null;
  const matterportUrl: string | null = coworking.matterportUrl || null;
  const websiteUrl = coworking.website ? ensureAbsoluteUrl(coworking.website) : null;
  const venueTypes: string[] = coworking.venueTypes || [];
  const hasEventSpace: boolean = coworking.hasEventSpace || false;

  return (
    <div className="w-full bg-white">
      {/* Hero / Photo Gallery */}
      {photos.length > 1 ? (
        <PhotoGallery photos={photos} name={coworking.name} />
      ) : (
        <div className="relative h-96 sm:h-[500px] bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
          {photos[0] && (
            <img
              src={photos[0].url}
              alt={coworking.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                {coworking.isVerified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                    <Star className="w-4 h-4" />
                    Ověřeno
                  </span>
                )}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">{coworking.name}</h1>
              <p className="text-blue-50 flex items-center gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0" />
                {[coworking.address, coworking.zipCode, coworking.city].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Title bar for multi-photo gallery (gallery handles its own overlay) */}
      {photos.length > 1 && (
        <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white px-6 sm:px-8 py-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-3 mb-1">
                {coworking.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                    <Star className="w-3 h-3" /> Ověřeno
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{coworking.name}</h1>
              <p className="text-blue-100 flex items-center gap-1.5 text-sm mt-1">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {[coworking.address, coworking.zipCode, coworking.city].filter(Boolean).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main Content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* Scrollable tabs — client component */}
            <CoworkingTabs hasEvents={relatedEvents.length > 0} />

            {/* Description */}
            <section id="sekce-prehled" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">O coworkingu</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{coworking.description}</p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Otevírací doba
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries(coworking.openingHours || {}).map(([day, hours]) => (
                    <div key={day}>
                      <p className="text-sm font-semibold text-gray-900">
                        {day === 'mon' && 'Pondělí'}
                        {day === 'tue' && 'Úterý'}
                        {day === 'wed' && 'Středa'}
                        {day === 'thu' && 'Čtvrtek'}
                        {day === 'fri' && 'Pátek'}
                        {day === 'sat' && 'Sobota'}
                        {day === 'sun' && 'Neděle'}
                      </p>
                      <p className="text-sm text-gray-600">{hours as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── YouTube video ───────────────────────────────────────── */}
            {youtubeEmbed && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Youtube className="w-6 h-6 text-red-500" />
                  Video prohlídka
                </h2>
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={youtubeEmbed}
                    title={`${coworking.name} — video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-xl border border-gray-200"
                  />
                </div>
              </section>
            )}

            {/* ── Matterport 3D tour ──────────────────────────────────── */}
            {matterportUrl && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Boxes className="w-6 h-6 text-purple-500" />
                  3D virtuální prohlídka
                </h2>
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={matterportUrl}
                    title={`${coworking.name} — 3D prohlídka`}
                    allow="xr-spatial-tracking"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full rounded-xl border border-gray-200"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                  <Boxes className="w-4 h-4" />
                  Interaktivní 3D prohlídka prostoru — klikej a prozkoumej každý kout.
                </p>
              </section>
            )}

            {/* Amenities */}
            <section id="sekce-vybaveni" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vybavení</h2>
              <AmenityGrid amenities={coworking.amenities || []} />
            </section>

            {/* Venue types */}
            {venueTypes.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hodí se také pro</h2>
                <p className="text-gray-500 text-sm mb-6">Prostor je vhodný pro tyto typy akcí a aktivit.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {venueTypes.map((type) => (
                    <div
                      key={type}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100 text-center hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      <span className="text-3xl">{VENUE_TYPE_EMOJIS[type] || '📌'}</span>
                      <span className="text-xs font-semibold text-gray-700 leading-tight">
                        {VENUE_TYPE_LABELS[type] || type}
                      </span>
                    </div>
                  ))}
                </div>
                {hasEventSpace && (
                  <div className="mt-6 p-5 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="font-bold text-purple-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        Eventový prostor k pronájmu
                      </p>
                      <p className="text-sm text-purple-700 mt-1">
                        Tento prostor nabízí prostory k pronájmu pro vaše akce.
                      </p>
                    </div>
                    <a
                      href="https://www.prostorna.cz"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors"
                    >
                      Zobrazit na Prostorna.cz
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </section>
            )}

            {/* Pricing */}
            <section id="sekce-ceny" className="mb-12 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ceny</h2>
              {(() => {
                const p = coworking.prices;
                const cards = [
                  p?.hourly?.enabled && p.hourly.from
                    ? { label: 'Hodina', from: p.hourly.from, unit: 'hod', color: 'blue' }
                    : null,
                  p?.dayPass?.enabled && p.dayPass.from
                    ? { label: 'Den', from: p.dayPass.from, unit: 'den', color: 'orange' }
                    : null,
                  p?.openSpace?.enabled && p.openSpace.from
                    ? { label: 'Open Space', from: p.openSpace.from, unit: 'měs', color: 'green' }
                    : null,
                  p?.fixDesk?.enabled && p.fixDesk.from
                    ? { label: 'Fix Desk', from: p.fixDesk.from, unit: 'měs', color: 'purple' }
                    : null,
                  p?.office?.enabled && p.office.from
                    ? { label: 'Kancelář', from: p.office.from, unit: 'měs', color: 'teal' }
                    : null,
                ].filter(Boolean) as { label: string; from: number; unit: string; color: string }[];

                const colorMap: Record<string, string> = {
                  blue:   'from-blue-50 to-blue-100 border-blue-200 text-blue-900 text-blue-600 text-blue-700',
                  orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900 text-orange-600 text-orange-700',
                  green:  'from-green-50 to-green-100 border-green-200 text-green-900 text-green-600 text-green-700',
                  purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900 text-purple-600 text-purple-700',
                  teal:   'from-teal-50 to-teal-100 border-teal-200 text-teal-900 text-teal-600 text-teal-700',
                };
                const bgMap: Record<string, { bg: string; heading: string; price: string; unit: string }> = {
                  blue:   { bg: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',   heading: 'text-blue-900',   price: 'text-blue-600',   unit: 'text-blue-700' },
                  orange: { bg: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200', heading: 'text-orange-900', price: 'text-orange-600', unit: 'text-orange-700' },
                  green:  { bg: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',  heading: 'text-green-900',  price: 'text-green-600',  unit: 'text-green-700' },
                  purple: { bg: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200', heading: 'text-purple-900', price: 'text-purple-600', unit: 'text-purple-700' },
                  teal:   { bg: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',    heading: 'text-teal-900',   price: 'text-teal-600',   unit: 'text-teal-700' },
                };

                if (cards.length === 0) {
                  return <p className="text-gray-500">Ceny jsou dostupné na vyžádání. Kontaktujte coworking přímo.</p>;
                }

                return (
                  <div className={`grid grid-cols-1 sm:grid-cols-${Math.min(cards.length, 3)} gap-4`}>
                    {cards.map((card) => {
                      const c = bgMap[card.color] || bgMap.blue;
                      return (
                        <div key={card.label} className={`${c.bg} rounded-lg p-6 border`}>
                          <h3 className={`text-sm font-semibold ${c.heading} mb-2`}>{card.label}</h3>
                          <div className={`text-3xl font-bold ${c.price} mb-1`}>
                            <span className="text-lg font-normal opacity-60">od </span>
                            {card.from.toLocaleString('cs-CZ')} Kč
                          </div>
                          <p className={`text-xs ${c.unit}`}>za {card.unit}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </section>

            {/* Events */}
            {relatedEvents.length > 0 && (
              <section id="sekce-eventy" className="mb-12 scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Eventy v tomto coworkingu
                </h2>
                <div className="space-y-4">
                  {relatedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {event.maxAttendees && (
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                Max {event.maxAttendees} osob
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-blue-600 mb-2">
                            {event.isFree ? 'Zdarma' : `${event.price} Kč`}
                          </div>
                          {event.url ? (
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Zjistit víc…
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="px-4 py-2 bg-gray-200 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed"
                              title="Odkaz nebyl zadán"
                            >
                              Zjistit víc…
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Kontakt</h3>

              <div className="space-y-4 mb-6">
                {coworking.phone && (
                  <a
                    href={`tel:${coworking.phone}`}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Telefon</p>
                      <p className="text-sm font-semibold text-gray-900">{coworking.phone}</p>
                    </div>
                  </a>
                )}
                {coworking.email && (
                  <a
                    href={`mailto:${coworking.email}`}
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{coworking.email}</p>
                    </div>
                  </a>
                )}
                {websiteUrl && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Web</p>
                      <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                        Navštívit <ExternalLink className="w-3 h-3" />
                      </p>
                    </div>
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6 border border-gray-100">
                {coworking.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Celková kapacita</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      {coworking.capacity} míst
                    </span>
                  </div>
                )}
                {coworking.hotDesks != null && coworking.hotDesks > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Volné židle (hot desk)</span>
                    <span className="text-sm font-bold text-gray-900">{coworking.hotDesks}</span>
                  </div>
                )}
                {coworking.fixedDesks != null && coworking.fixedDesks > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Fix desks</span>
                    <span className="text-sm font-bold text-gray-900">{coworking.fixedDesks}</span>
                  </div>
                )}
                {coworking.officeCount != null && coworking.officeCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Kanceláře</span>
                    <span className="text-sm font-bold text-gray-900">{coworking.officeCount}</span>
                  </div>
                )}
                {coworking.areaM2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Plocha</span>
                    <span className="text-sm font-bold text-gray-900">{coworking.areaM2} m²</span>
                  </div>
                )}
                {coworking.prices?.hourly?.enabled && coworking.prices.hourly.from && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">od (hodina)</span>
                    <span className="text-sm font-bold text-blue-600">
                      {coworking.prices.hourly.from.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                {coworking.prices?.dayPass?.enabled && coworking.prices.dayPass.from && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">od (den)</span>
                    <span className="text-sm font-bold text-orange-600">
                      {coworking.prices.dayPass.from.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                {coworking.prices?.openSpace?.enabled && coworking.prices.openSpace.from && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">od (open space/měs)</span>
                    <span className="text-sm font-bold text-green-600">
                      {coworking.prices.openSpace.from.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                {coworking.prices?.fixDesk?.enabled && coworking.prices.fixDesk.from && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">od (fix desk/měs)</span>
                    <span className="text-sm font-bold text-purple-600">
                      {coworking.prices.fixDesk.from.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                {coworking.prices?.office?.enabled && coworking.prices.office.from && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">od (kancelář/měs)</span>
                    <span className="text-sm font-bold text-teal-600">
                      {coworking.prices.office.from.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
              </div>

              {/* Special Deal banner */}
              {coworking.specialDeal?.enabled && (
                <div className="mb-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm font-bold text-amber-800">Special Deal</span>
                    <span className="ml-auto text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {coworking.specialDeal.badgeText}
                    </span>
                  </div>
                  {coworking.specialDeal.description && (
                    <p className="text-sm text-amber-900 mb-2">{coworking.specialDeal.description}</p>
                  )}
                  {(coworking.specialDeal.validFrom || coworking.specialDeal.validTo) && (
                    <p className="text-xs text-amber-700">
                      Platí{' '}
                      {coworking.specialDeal.validFrom && (
                        <span>od {new Date(coworking.specialDeal.validFrom).toLocaleDateString('cs-CZ')}</span>
                      )}
                      {coworking.specialDeal.validTo && (
                        <span> do {new Date(coworking.specialDeal.validTo).toLocaleDateString('cs-CZ')}</span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Event space banner */}
              {hasEventSpace && (
                <a
                  href="https://www.prostorna.cz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-3 w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Pronajmout eventový prostor
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}

              <div className="space-y-3">
                <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Rezervovat
                </button>
                <button className="w-full py-3 px-4 bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Napsat zprávu
                </button>
                <ClaimButton slug={params.slug} />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-2">Praktické informace</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Všechny ceny jsou bez DPH</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Členství zahrnuje přístup 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-lg">✓</span>
                  <span>Bezplatná registrace</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
