import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPaidAccess } from '@/lib/membership';

// ---------------------------------------------------------------------------
// GET — public listings (paginated) OR ?mine=true for current user's listings
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine     = searchParams.get('mine') === 'true';
  const page     = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit    = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
  const offset   = (page - 1) * limit;
  const category = searchParams.get('category') ?? null;

  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    const userId = session.user.id;
    const role: string = (session.user as Record<string, unknown>).role as string ?? 'coworker';
    const paid = await hasPaidAccess(userId, role);

    const listings = await prisma.marketplaceListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const count = listings.filter((l) => l.isActive).length;

    return NextResponse.json({
      listings: listings.map((l) => ({
        ...l,
        tags: (() => {
          try { return JSON.parse(l.tags ?? '{}'); } catch { return {}; }
        })(),
      })),
      count,
      paid,
      limit: paid ? null : 1,
    });
  }

  // Public — paginated, single JOIN query (no N+1)
  const whereExtra = category ? `AND ml.category = '${category.replace(/'/g, "''")}'` : '';

  const [rows, countResult] = await Promise.all([
    prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
      SELECT
        ml.id,
        ml.title,
        ml.description,
        ml.category,
        ml.tags,
        ml.price,
        ml."priceType",
        ml.location,
        ml."contactEmail",
        ml."contactPhone",
        ml."createdAt",
        u.name   AS "userName",
        u.image  AS "userImage"
      FROM "MarketplaceListing" ml
      INNER JOIN "User" u ON u.id = ml."userId"
      WHERE ml."isActive" = true
        ${whereExtra}
      ORDER BY ml."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `),
    prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) AS count
      FROM "MarketplaceListing" ml
      WHERE ml."isActive" = true
        ${whereExtra}
    `),
  ]);

  const total = Number(countResult[0]?.count ?? 0);

  const listings = rows.map((l) => ({
    id:           String(l.id),
    title:        String(l.title ?? ''),
    description:  l.description ? String(l.description) : null,
    category:     String(l.category ?? ''),
    tags: (() => {
      try { return JSON.parse(String(l.tags ?? '{}')); } catch { return {}; }
    })(),
    price:        l.price != null ? Number(l.price) : null,
    priceType:    l.priceType ? String(l.priceType) : null,
    location:     l.location ? String(l.location) : null,
    contactEmail: l.contactEmail ? String(l.contactEmail) : null,
    contactPhone: l.contactPhone ? String(l.contactPhone) : null,
    createdAt:    l.createdAt,
    userName:     l.userName ? String(l.userName) : 'Anonymní',
    userImage:    l.userImage ? String(l.userImage) : null,
  }));

  return NextResponse.json(
    { listings, total, page, limit, pages: Math.ceil(total / limit) },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } }
  );
}

// ---------------------------------------------------------------------------
// POST — create new listing
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Pro přidání inzerátu se musíte přihlásit.' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const role: string = (session.user as Record<string, unknown>).role as string ?? 'coworker';

  // Quota check
  const paid = await hasPaidAccess(userId, role);
  if (!paid) {
    const existingCount = await prisma.marketplaceListing.count({
      where: { userId, isActive: true },
    });
    if (existingCount >= 1) {
      return NextResponse.json(
        {
          error: 'Bezplatný účet může mít nejvýše 1 aktivní inzerát. Upgradujte členství pro neomezené inzeráty.',
          code: 'QUOTA_EXCEEDED',
        },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();

    const {
      title,
      description,
      category,
      tags,
      price,
      priceType,
      location,
      contactEmail,
      contactPhone,
      externalUrl,
      workType,
      experienceLevel,
      availableFrom,
      condition,
    } = body;

    if (!title?.trim())        return NextResponse.json({ error: 'Nadpis je povinný.' }, { status: 400 });
    if (!description?.trim())  return NextResponse.json({ error: 'Popis je povinný.' }, { status: 400 });
    if (!category)             return NextResponse.json({ error: 'Kategorie je povinná.' }, { status: 400 });
    if (!contactEmail?.trim()) return NextResponse.json({ error: 'Kontaktní e-mail je povinný.' }, { status: 400 });

    const tagArray: string[] = Array.isArray(tags)
      ? tags.filter(Boolean)
      : typeof tags === 'string'
      ? tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const meta = {
      tags: tagArray,
      workType: workType ?? null,
      experienceLevel: experienceLevel ?? null,
      availableFrom: availableFrom ?? null,
      condition: condition ?? null,
      externalUrl: externalUrl ?? null,
    };

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        category,
        tags: JSON.stringify(meta),
        price: price ? parseFloat(price) : null,
        priceType: priceType ?? null,
        location: location?.trim() ?? null,
        isActive: true,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone?.trim() ?? null,
      },
    });

    return NextResponse.json({ success: true, id: listing.id });
  } catch (err) {
    console.error('Marketplace create error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání inzerátu.' }, { status: 500 });
  }
}
