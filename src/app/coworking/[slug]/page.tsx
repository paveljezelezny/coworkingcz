import { notFound } from 'next/navigation';
import {
  MapPin, Phone, Mail, Globe, Users, Clock,
  Calendar, Star, Wifi, MessageSquare, Youtube, Boxes,
} from 'lucide-react';
import Link from 'next/link';
import { coworkingsData, eventsData } from '@/lib/data/coworkings';
import { AMENITY_LABELS } from '@/lib/types';
import ClaimButton from '@/components/ClaimButton';
import PhotoGallery from '@/components/PhotoGallery';
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
                <MapPin className="w-5 h-5" />
                {coworking.address}, {coworking.city}
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
                <MapPin className="w-4 h-4" />
                {coworking.address ? `${coworking.address}, ` : ''}{coworking.city}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Main Content ─────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            {/* Tabs (visual only) */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <div className="flex gap-8">
                {['Přehled', 'Vybavení', 'Ceny', 'Eventy'].map((t, i) => (
                  <button
                    key={t}
                    className={`py-4 px-2 font-semibold border-b-2 whitespace-nowrap ${
                      i === 0
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-blue-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <section className="mb-12">
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
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vybavení</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(coworking.amenities || []).map((amenity: string) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100"
                  >
                    <Wifi className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">
                      {AMENITY_LABELS[amenity] || amenity}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ceny</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {coworking.priceHourly && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Hodinová sazba</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {coworking.priceHourly.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-blue-700">za hodinu</p>
                  </div>
                )}
                {coworking.priceDayPass && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                    <h3 className="text-sm font-semibold text-orange-900 mb-2">Celodenní průkaz</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {coworking.priceDayPass.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-orange-700">za den</p>
                  </div>
                )}
                {coworking.priceMonthly && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Měsíční předplatné</h3>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {coworking.priceMonthly.toLocaleString('cs-CZ')} Kč
                    </div>
                    <p className="text-xs text-green-700">za měsíc</p>
                  </div>
                )}
              </div>
            </section>

            {/* Events */}
            {relatedEvents.length > 0 && (
              <section className="mb-12">
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
                          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            Podrobnosti
                          </button>
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
                {coworking.website && (
                  <a
                    href={coworking.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Web</p>
                      <p className="text-sm font-semibold text-blue-600">Navštívit</p>
                    </div>
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6 border border-gray-100">
                {coworking.capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Kapacita</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      {coworking.capacity} míst
                    </span>
                  </div>
                )}
                {coworking.areaM2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Plocha</span>
                    <span className="text-sm font-bold text-gray-900">{coworking.areaM2} m²</span>
                  </div>
                )}
                {coworking.priceDayPass && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Cena/den</span>
                    <span className="text-sm font-bold text-orange-600">
                      {coworking.priceDayPass.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
                {coworking.priceMonthly && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Cena/měsíc</span>
                    <span className="text-sm font-bold text-green-600">
                      {coworking.priceMonthly.toLocaleString('cs-CZ')} Kč
                    </span>
                  </div>
                )}
              </div>

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
