import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPaidAccess } from '@/lib/membership';

// ---------------------------------------------------------------------------
// GET — public listings OR current user's listings
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine = searchParams.get('mine') === 'true';

  if (mine) {
    // Auth required — return current user's listings
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }

    const userId = session.user.id;
    const role: string = (session.user as any).role ?? 'coworker';
    const paid = await hasPaidAccess(userId, role);

    const listings = await prisma.marketplaceListing.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const count = listings.filter((l: { isActive: boolean }) => l.isActive).length;

    return NextResponse.json({
      listings: listings.map((l: { tags: string | null; [key: string]: unknown }) => ({
        ...l,
        tags: (() => {
          try { return JSON.parse((l.tags as string) ?? '{}'); } catch { return {}; }
        })(),
      })),
      count,
      paid,
      limit: paid ? null : 1,
    });
  }

  // Public — return all active listings with creator info
  const listings = await prisma.marketplaceListing.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, image: true },
      },
    },
  });

  return NextResponse.json({
    listings: listings.map((l: typeof listings[0]) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      tags: (() => {
        try { return JSON.parse(l.tags ?? '{}'); } catch { return {}; }
      })(),
      price: l.price,
      priceType: l.priceType,
      location: l.location,
      contactEmail: l.contactEmail,
      contactPhone: l.contactPhone,
      createdAt: l.createdAt,
      userName: l.user?.name ?? 'Anonymní',
      userImage: l.user?.image ?? null,
    })),
  });
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
  const role: string = (session.user as any).role ?? 'coworker';

  // Quota check
  const paid = await hasPaidAccess(userId, role);
  if (!paid) {
    const existingCount = await prisma.marketplaceListing.count({
      where: { userId, isActive: true },
    });
    if (existingCount >= 1) {
      return NextResponse.json(
        {
          error:
            'Bezplatný účet může mít nejvýše 1 aktivní inzerát. Upgradujte členství pro neomezené inzeráty.',
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

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Nadpis je povinný.' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Popis je povinný.' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Kategorie je povinná.' }, { status: 400 });
    }
    if (!contactEmail?.trim()) {
      return NextResponse.json({ error: 'Kontaktní e-mail je povinný.' }, { status: 400 });
    }

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
