import { ArrowRight, Plus, Calendar, MapPin, Tag } from 'lucide-react';
import Link from 'next/link';
import CoworkingCard from '@/components/CoworkingCard';
import HeroSection from '@/components/HeroSection';
import { getFeaturedCoworkings, getCitiesWithCount } from '@/lib/data/coworkings';
import { coworkingsData } from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';

// Always fresh — data comes from DB
export const dynamic = 'force-dynamic';

// ─── Category labels ──────────────────────────────────────────────────────────

const CATEGORY_LABEL: Record<string, string> = {
  job_offer:       'Nabídka práce',
  job_seeking:     'Hledám práci',
  service_offer:   'Nabízím služby',
  service_seeking: 'Hledám služby',
  item_for_sale:   'Prodám',
  item_wanted:     'Koupím',
};

const CATEGORY_COLOR: Record<string, string> = {
  job_offer:       'bg-green-50 text-green-700',
  job_seeking:     'bg-blue-50 text-blue-700',
  service_offer:   'bg-purple-50 text-purple-700',
  service_seeking: 'bg-orange-50 text-orange-700',
  item_for_sale:   'bg-pink-50 text-pink-700',
  item_wanted:     'bg-indigo-50 text-indigo-700',
};

// ─── Build slug → name map (static + DB overrides) ───────────────────────────

async function buildSlugNameMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  // Start with static names
  for (const cw of coworkingsData) {
    map[cw.slug] = cw.name;
  }
  // Overlay DB overrides
  try {
    const edits = await prisma.coworkingEdit.findMany({
      select: { coworkingSlug: true, data: true },
    });
    for (const edit of edits) {
      const d = edit.data as Record<string, unknown>;
      if (d?.name && typeof d.name === 'string') {
        map[edit.coworkingSlug] = d.name;
      }
    }
  } catch {
    // coworkingEdit may not exist yet — static names are fine
  }
  return map;
}

// ─── Shared types ─────────────────────────────────────────────────────────────

interface HomeEvent {
  id: string;
  title: string;
  coworkingSlug: string;
  eventType: string | null;
  startDate: Date;
  isFree: boolean;
  price: number | null;
  imageUrl: string | null;
  externalUrl: string | null;
}

interface HomeListing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number | null;
  priceType: string | null;
  location: string | null;
  createdAt: Date;
  userName: string;
  userImage: string | null;
}

// ─── Fetch upcoming events from DB ───────────────────────────────────────────

async function fetchUpcomingEvents(): Promise<HomeEvent[]> {
  try {
    const events = await prisma.event.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 6,
      select: {
        id: true,
        title: true,
        coworkingSlug: true,
        eventType: true,
        startDate: true,
        isFree: true,
        price: true,
        imageUrl: true,
        externalUrl: true,
      },
    });
    return events;
  } catch {
    // location column may be missing — raw SQL without it
    try {
      type RawEvent = {
        id: string; title: string; coworkingSlug: string;
        eventType: string | null; startDate: Date; isFree: boolean;
        price: number | null; imageUrl: string | null; externalUrl: string | null;
      };
      const events = (await prisma.$queryRawUnsafe(
        `SELECT id, title, "coworkingSlug", "eventType", "startDate",
                "isFree", price, "imageUrl", "externalUrl"
         FROM "Event"
         WHERE "startDate" >= NOW()
         ORDER BY "startDate" ASC
         LIMIT 6`
      )) as RawEvent[];
      return events;
    } catch {
      return [];
    }
  }
}

// ─── Fetch marketplace listings from DB ──────────────────────────────────────

async function fetchMarketplaceListings(): Promise<HomeListing[]> {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        price: true,
        priceType: true,
        location: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
      },
    });
    type ListingRow = typeof listings[number];
    return listings.map((l: ListingRow): HomeListing => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      price: l.price,
      priceType: l.priceType,
      location: l.location,
      createdAt: l.createdAt,
      userName: l.user?.name ?? 'Anonymní',
      userImage: l.user?.image ?? null,
    }));
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [events, marketplaceListings, slugNameMap] = await Promise.all([
    fetchUpcomingEvents(),
    fetchMarketplaceListings(),
    buildSlugNameMap(),
  ]);

  const featuredCoworkings = getFeaturedCoworkings();
  const cities = getCitiesWithCount();

  return (
    <div className="w-full">
      {/* Hero */}
      <HeroSection cities={cities} />

      {/* ── Featured Coworkings ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Doporučené coworkingy</h2>
              <p className="section-subtitle">Nejpopulárnější coworkingové prostory v České republice</p>
            </div>
            <Link href="/coworkingy"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              Zobrazit všechny <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCoworkings.map((coworking, idx) => (
              <div key={coworking.id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <CoworkingCard coworking={coworking} />
              </div>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link href="/coworkingy"
              className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Zobrazit všechny coworkingy
            </Link>
          </div>
        </div>
      </section>

      {/* ── Upcoming Events (from DB) ── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Nadcházející eventy</h2>
              <p className="section-subtitle">Setkat se s komunitou na zajímavých akcích</p>
            </div>
            <Link href="/udalosti"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              Zobrazit všechny <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Žádné nadcházející eventy</p>
              <Link href="/udalosti/nova-udalost"
                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
                <Plus className="w-3.5 h-3.5" /> Přidat první event
              </Link>
            </div>
          ) : (
            <>
              <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
                {events.map((event) => {
                  const coworkingName = slugNameMap[event.coworkingSlug] ?? event.coworkingSlug;
                  return (
                    <div
                      key={event.id}
                      className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow snap-start"
                    >
                      <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                        {event.imageUrl ? (
                          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-30">
                            <Calendar className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {event.isFree ? 'Zdarma' : `${event.price} Kč`}
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {coworkingName}
                        </p>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                              weekday: 'short', month: 'short', day: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </div>
                          {event.externalUrl && (
                            <a href={event.externalUrl} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-blue-600 font-semibold hover:underline">
                              Více →
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 sm:hidden">
                <Link href="/udalosti"
                  className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Zobrazit všechny eventy
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Marketplace Preview (from DB) ── */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Marketplace</h2>
              <p className="section-subtitle">Nabídky práce, služby a prodej mezi coworkery</p>
            </div>
            <Link href="/marketplace"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold">
              Zobrazit všechny <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {marketplaceListings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Žádné aktivní inzeráty</p>
              <Link href="/marketplace/nova-nabidka"
                className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium">
                <Plus className="w-3.5 h-3.5" /> Přidat první inzerát
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {marketplaceListings.map((listing, idx) => {
                  const catLabel = CATEGORY_LABEL[listing.category] ?? listing.category;
                  const catColor = CATEGORY_COLOR[listing.category] ?? 'bg-gray-100 text-gray-600';
                  return (
                    <div
                      key={listing.id}
                      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow animate-slide-up flex flex-col"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${catColor}`}>
                          {catLabel}
                        </span>
                        {listing.price != null && (
                          <span className="font-bold text-blue-600 text-sm whitespace-nowrap">
                            {listing.price.toLocaleString('cs-CZ')} Kč
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1.5 line-clamp-2 flex-1">{listing.title}</h3>
                      {listing.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{listing.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50 text-xs text-gray-400">
                        {listing.userImage ? (
                          <img src={listing.userImage} alt="" className="w-5 h-5 rounded-full object-cover" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">
                            {listing.userName?.[0]?.toUpperCase() ?? '?'}
                          </div>
                        )}
                        <span className="truncate">{listing.userName}</span>
                        {listing.location && (
                          <span className="flex items-center gap-0.5 ml-auto flex-shrink-0">
                            <MapPin className="w-3 h-3" />{listing.location}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-center">
                <Link href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="w-5 h-5" /> Přidat inzerát
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Cities (před patičkou) ── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Coworkingy v tvém městě</h2>
            <p className="section-subtitle">Najdi coworkingový prostor v 15+ městech po celé České republice</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.slice(0, 12).map((city) => (
              <Link
                key={city.city}
                href={`/coworkingy?mesto=${city.city}`}
                className="group p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-600 hover:shadow-md transition-all text-center"
              >
                <div className="text-2xl font-bold text-blue-600 group-hover:text-orange-500 transition-colors">
                  {city.count}
                </div>
                <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                  {city.city}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
