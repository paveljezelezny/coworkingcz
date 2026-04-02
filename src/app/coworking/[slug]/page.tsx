import { notFound } from 'next/navigation';
import { MapPin, Phone, Mail, Globe, Users, Clock, Calendar, Star, Wifi, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { coworkingsData, eventsData } from '@/lib/data/coworkings';
import { AMENITY_LABELS } from '@/lib/types';
import ClaimButton from '@/components/ClaimButton';
import { prisma } from '@/lib/prisma';

// Vždy renderovat server-side (ne staticky) — aby se DB overrides zobrazily live
export const dynamic = 'force-dynamic';

interface CoworkingDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return coworkingsData.map((coworking) => ({
    slug: coworking.slug,
  }));
}

// Fetch any DB overrides for this coworking
async function getDbOverrides(slug: string) {
  try {
    const edit = await prisma.coworkingEdit.findUnique({ where: { coworkingSlug: slug } });
    return (edit?.data as Record<string, any>) ?? null;
  } catch {
    return null;
  }
}

export default async function CoworkingDetailPage({ params }: CoworkingDetailPageProps) {
  const base = coworkingsData.find((cw) => cw.slug === params.slug);
  if (!base) notFound();

  // Merge static data with any owner edits from DB
  const overrides = await getDbOverrides(params.slug);
  const coworking = overrides && Object.keys(overrides).length > 0
    ? { ...base, ...overrides }
    : base;

  // Check if deleted via admin panel
  if ((coworking as any).deleted) notFound();

  const relatedEvents = eventsData.filter((e) => e.coworkingId === base.id);

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <div className="relative h-96 sm:h-[500px] bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
        {coworking.photos && (coworking.photos as any[])[0] && (
          <img
            src={(coworking.photos as any[])[0].url}
            alt={coworking.name}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 bg-gradient-to-t from-black/60 to-transparent text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              {(coworking as any).isVerified && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 rounded-full text-sm font-semibold">
                  <Star className="w-4 h-4" />
                  Ověřeno
                </span>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">{coworking.name}</h1>
            <p className="text-blue-50 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {(coworking as any).address}, {coworking.city}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs (visual only) */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <div className="flex gap-8">
                {['Přehled', 'Vybavení', 'Ceny', 'Eventy'].map((t, i) => (
                  <button key={t} className={`py-4 px-2 font-semibold border-b-2 whitespace-nowrap ${i === 0 ? 'text-blue-600 border-blue-600' : 'text-gray-600 border-transparent hover:text-blue-600'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">O coworkingu</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{(coworking as any).description}</p>

              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Otevírací doba
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Object.entries((coworking as any).openingHours || {}).map(([day, hours]) => (
                    <div key={day}>
                      <p className="text-sm font-semibold text-gray-900">
                        {day === 'mon' && 'Pondělí'}{day === 'tue' && 'Úterý'}{day === 'wed' && 'Středa'}
                        {day === 'thu' && 'Čtvrtek'}{day === 'fri' && 'Pátek'}{day === 'sat' && 'Sobota'}{day === 'sun' && 'Neděle'}
                      </p>
                      <p className="text-sm text-gray-600">{hours as string}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Vybavení</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {((coworking as any).amenities || []).map((amenity: string) => (
                  <div key={amenity} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <Wifi className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-900">{AMENITY_LABELS[amenity] || amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Pricing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ceny</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(coworking as any).priceHourly && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">Hodinová sazba</h3>
                    <div className="text-3xl font-bold text-blue-600 mb-1">{(coworking as any).priceHourly} Kč</div>
                    <p className="text-xs text-blue-700">za hodinu</p>
                  </div>
                )}
                {(coworking as any).priceDayPass && (
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
                    <h3 className="text-sm font-semibold text-orange-900 mb-2">Celodenní průkaz</h3>
                    <div className="text-3xl font-bold text-orange-600 mb-1">{(coworking as any).priceDayPass} Kč</div>
                    <p className="text-xs text-orange-700">za den</p>
                  </div>
                )}
                {(coworking as any).priceMonthly && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                    <h3 className="text-sm font-semibold text-green-900 mb-2">Měsíční předplatné</h3>
                    <div className="text-3xl font-bold text-green-600 mb-1">{(coworking as any).priceMonthly} Kč</div>
                    <p className="text-xs text-green-700">za měsíc</p>
                  </div>
                )}
              </div>
            </section>

            {/* Events */}
            {relatedEvents.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Eventy v tomto coworkingu</h2>
                <div className="space-y-4">
                  {relatedEvents.map((event) => (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.startDate).toLocaleDateString('cs-CZ', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Kontakt</h3>

              <div className="space-y-4 mb-6">
                {(coworking as any).phone && (
                  <a href={`tel:${(coworking as any).phone}`} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <Phone className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Telefon</p>
                      <p className="text-sm font-semibold text-gray-900">{(coworking as any).phone}</p>
                    </div>
                  </a>
                )}
                {(coworking as any).email && (
                  <a href={`mailto:${(coworking as any).email}`} className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{(coworking as any).email}</p>
                    </div>
                  </a>
                )}
                {(coworking as any).website && (
                  <a href={(coworking as any).website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 hover:bg-blue-50 rounded-lg transition-colors group">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Web</p>
                      <p className="text-sm font-semibold text-blue-600">Navštívit</p>
                    </div>
                  </a>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-6 border border-gray-100">
                {(coworking as any).capacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Kapacita</span>
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-1">
                      <Users className="w-4 h-4 text-blue-600" />
                      {(coworking as any).capacity} míst
                    </span>
                  </div>
                )}
                {(coworking as any).areaM2 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Plocha</span>
                    <span className="text-sm font-bold text-gray-900">{(coworking as any).areaM2} m²</span>
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

                {/* Claim / Edit button - client component */}
                <ClaimButton slug={params.slug} />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-2">Praktické informace</h4>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2"><span className="text-lg">✓</span><span>Všechny ceny jsou bez DPH</span></li>
                <li className="flex items-start gap-2"><span className="text-lg">✓</span><span>Členství zahrnuje přístup 24/7</span></li>
                <li className="flex items-start gap-2"><span className="text-lg">✓</span><span>Bezplatná registrace</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
