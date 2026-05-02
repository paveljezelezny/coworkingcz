import {
  getFeaturedCoworkings,
  getCitiesWithCount,
  coworkingsData,
} from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';
import { PDHomePage, listingKindFromCategory, ageLabelFromDate, type PDHomeData } from '@/components/paper-diary/PDHomePage';

// ISR: cache homepage 60s (rychlejší TTFB, i tak téměř real-time).
export const revalidate = 60;

interface HomeEvent {
  id: string;
  title: string;
  coworkingSlug: string;
  eventType: string | null;
  startDate: Date;
}

interface HomeListing {
  id: string;
  title: string;
  category: string;
  price: number | null;
  priceType: string | null;
  location: string | null;
  createdAt: Date;
  userName: string;
}

// ─── Static name map (DB overrides) ──────────────────────────────────────────

async function buildSlugNameMap(): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (const cw of coworkingsData) map[cw.slug] = cw.name;
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
    // edit table may not exist
  }
  return map;
}

// ─── Upcoming events ─────────────────────────────────────────────────────────

async function fetchUpcomingEvents(): Promise<HomeEvent[]> {
  try {
    return await prisma.event.findMany({
      where: { startDate: { gte: new Date() } },
      orderBy: { startDate: 'asc' },
      take: 6,
      select: {
        id: true, title: true, coworkingSlug: true,
        eventType: true, startDate: true,
      },
    });
  } catch {
    try {
      type RawEvent = {
        id: string; title: string; coworkingSlug: string;
        eventType: string | null; startDate: Date;
      };
      return (await prisma.$queryRawUnsafe(
        `SELECT id, title, "coworkingSlug", "eventType", "startDate"
         FROM "Event"
         WHERE "startDate" >= NOW()
         ORDER BY "startDate" ASC
         LIMIT 6`
      )) as RawEvent[];
    } catch {
      return [];
    }
  }
}

// ─── Marketplace ─────────────────────────────────────────────────────────────

async function fetchMarketplaceListings(): Promise<HomeListing[]> {
  try {
    const listings = await prisma.marketplaceListing.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true, title: true, category: true,
        price: true, priceType: true, location: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });
    return listings.map((l: typeof listings[number]): HomeListing => ({
      id: l.id, title: l.title, category: l.category,
      price: l.price, priceType: l.priceType, location: l.location,
      createdAt: l.createdAt, userName: l.user?.name ?? 'Anonymní',
    }));
  } catch {
    return [];
  }
}

// ─── Coworker count (pro statistický strip) ──────────────────────────────────

async function getCoworkerCount(): Promise<number> {
  try {
    const n = await prisma.coworkerProfile.count({
      where: { isPublic: true },
    });
    return n;
  } catch {
    return 0;
  }
}

// ─── Helper: budget label z marketplace listing ─────────────────────────────

function budgetLabel(l: HomeListing): string {
  if (l.price == null || l.price === 0) return 'Dohodou';
  const fmt = new Intl.NumberFormat('cs-CZ').format(l.price);
  if (l.priceType === 'hourly') return `${fmt} Kč/h`;
  if (l.priceType === 'monthly') return `${fmt} Kč/měs`;
  return `${fmt} Kč`;
}

// ─── Map featured coworking → PD shape ──────────────────────────────────────

const TONE_BY_CITY: Record<string, 'amber' | 'moss' | 'coral' | 'accent' | 'ink'> = {
  Praha: 'accent', Brno: 'moss', Ostrava: 'coral', Plzeň: 'amber',
  Olomouc: 'moss', Liberec: 'accent', 'České Budějovice': 'amber', 'Hradec Králové': 'moss',
  Pardubice: 'coral', Zlín: 'amber',
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function Home() {
  const [events, listings, , coworkerCount] = await Promise.all([
    fetchUpcomingEvents(),
    fetchMarketplaceListings(),
    buildSlugNameMap(),
    getCoworkerCount(),
  ]);

  const featuredRaw = getFeaturedCoworkings().slice(0, 6);
  const cities = getCitiesWithCount();

  // ── PD-tvarovaná data ─────────────────────────────────────
  const featured: PDHomeData['featured'] = featuredRaw.map((cw) => {
    const primaryPhoto = cw.photos?.find((p) => p.isPrimary)?.url ?? cw.photos?.[0]?.url ?? null;
    const fromHourly = cw.prices?.hourly?.from ?? null;
    const fromDay = cw.prices?.dayPass?.from ?? null;
    return {
      id: cw.id,
      name: cw.name,
      slug: cw.slug,
      city: cw.city ?? null,
      image: primaryPhoto,
      rating: typeof (cw as unknown as { rating?: number }).rating === 'number'
        ? (cw as unknown as { rating: number }).rating
        : null,
      pricePerHour: fromHourly,
      note: cw.shortDescription
        ? cw.shortDescription.replace(/\.$/, '').slice(0, 60)
        : (fromDay ? `den od ${fromDay} Kč` : null),
      verified: cw.isVerified ?? false,
      tone: TONE_BY_CITY[cw.city ?? ''] ?? 'ink',
    };
  });

  const slugToName = new Map(coworkingsData.map((cw) => [cw.slug, cw.name]));

  const pdEvents: PDHomeData['events'] = events.map((e) => ({
    id: e.id,
    title: e.title,
    startDate: e.startDate.toISOString(),
    eventType: e.eventType,
    coworkingName: slugToName.get(e.coworkingSlug) || e.coworkingSlug,
    coworkingSlug: e.coworkingSlug,
  }));

  const pdListings: PDHomeData['listings'] = listings.slice(0, 4).map((l) => {
    const k = listingKindFromCategory(l.category);
    return {
      id: l.id,
      title: l.title,
      categoryLabel: k.label,
      kind: k.kind,
      tone: k.tone,
      userName: l.userName,
      location: l.location,
      ageLabel: ageLabelFromDate(l.createdAt),
      budgetLabel: budgetLabel(l),
    };
  });

  const data: PDHomeData = {
    featured,
    events: pdEvents,
    listings: pdListings,
    cities: cities.map((c) => ({ name: c.city, count: c.count })),
    stats: {
      coworkings: coworkingsData.length,
      cities: new Set(coworkingsData.map((cw) => cw.city)).size,
      coworkers: coworkerCount,
      events: events.length,
      listings: listings.length,
    },
  };

  return <PDHomePage data={data} />;
}
