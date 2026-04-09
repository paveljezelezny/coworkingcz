import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPaidAccess } from '@/lib/membership';

// ---------------------------------------------------------------------------
// GET — public events (paginated) OR ?mine=true for current user's events
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mine        = searchParams.get('mine') === 'true';
  const page        = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
  const limit       = Math.min(100, parseInt(searchParams.get('limit') ?? '50'));
  const offset      = (page - 1) * limit;
  const cwSlug      = searchParams.get('coworking') ?? null;
  const upcoming    = searchParams.get('upcoming') === 'true';

  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }
    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
      take: 100,
    });
    return NextResponse.json({ events });
  }

  // Public: paginated, optionally filtered
  const where: Record<string, unknown> = {};
  if (cwSlug) where.coworkingSlug = cwSlug;
  if (upcoming) where.startDate = { gte: new Date() };

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { startDate: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.event.count({ where }),
  ]);

  return NextResponse.json(
    { events, total, page, limit, pages: Math.ceil(total / limit) },
    { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=120' } }
  );
}

// ---------------------------------------------------------------------------
// POST — create new event
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Pro přidání eventu se musíte přihlásit.' }, { status: 401 });
  }

  const userId = session.user.id;
  const role: string = (session.user as Record<string, unknown>).role as string ?? 'coworker';

  const paid = await hasPaidAccess(userId, role);
  if (!paid) {
    return NextResponse.json(
      { error: 'Přidávání eventů je dostupné pouze platícím členům.', code: 'PAID_ONLY' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const {
      title, description, eventType,
      startDate, endDate, isAllDay,
      maxAttendees, price, isFree,
      externalUrl, imageUrl, location,
      coworkingSlug,
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Název eventu je povinný.' }, { status: 400 });
    if (!startDate)      return NextResponse.json({ error: 'Datum začátku je povinné.' }, { status: 400 });
    if (!coworkingSlug?.trim()) return NextResponse.json({ error: 'Vyberte coworking.' }, { status: 400 });

    const event = await prisma.event.create({
      data: {
        userId,
        coworkingSlug,
        title: title.trim(),
        description: description?.trim() ?? null,
        eventType: eventType ?? 'other',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        isAllDay: isAllDay ?? false,
        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
        price: !isFree && price ? parseFloat(price) : null,
        isFree: isFree ?? true,
        location: location?.trim() ?? null,
        externalUrl: externalUrl?.trim() ?? null,
        imageUrl: imageUrl?.trim() ?? null,
      },
    });

    return NextResponse.json({ success: true, id: event.id });
  } catch (err) {
    console.error('Event create error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání eventu.' }, { status: 500 });
  }
}
