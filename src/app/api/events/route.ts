import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function hasPaidAccess(userId: string, role: string): Promise<boolean> {
  if (role === 'super_admin') return true;
  if (role === 'coworking_admin') {
    const edit = await prisma.coworkingEdit.findFirst({ where: { userId } });
    if (edit) return true;
  }
  const profile = await prisma.coworkerProfile.findUnique({
    where: { userId },
    select: { membershipTier: true, membershipEnd: true },
  });
  if (
    profile?.membershipTier &&
    profile.membershipEnd &&
    new Date(profile.membershipEnd) > new Date()
  ) {
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// GET — current user's events
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  try {
    const events = await prisma.event.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json({ events });
  } catch (err) {
    // userId column may not exist yet in DB — return empty list gracefully
    console.warn('GET /api/events fallback (column missing?):', (err as Error).message);
    return NextResponse.json({ events: [] });
  }
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
  const role: string = (session.user as any).role ?? 'coworker';

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
      externalUrl, imageUrl,
      coworkingSlug,
    } = body;

    if (!title?.trim()) return NextResponse.json({ error: 'Název eventu je povinný.' }, { status: 400 });
    if (!startDate) return NextResponse.json({ error: 'Datum začátku je povinné.' }, { status: 400 });
    if (!coworkingSlug?.trim()) return NextResponse.json({ error: 'Vyberte coworking.' }, { status: 400 });

    const eventData = {
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
      externalUrl: externalUrl?.trim() ?? null,
      imageUrl: imageUrl?.trim() ?? null,
    };

    let eventId: string;
    try {
      // Try with userId first (schema has the column)
      const event = await prisma.event.create({ data: { ...eventData, userId } });
      eventId = event.id;
    } catch (dbErr) {
      const msg = (dbErr as Error).message ?? '';
      // userId column missing in DB — use raw SQL INSERT that skips that column
      if (msg.includes('userId') || msg.includes('column')) {
        console.warn('Event create: userId column missing, falling back to raw INSERT');
        const { randomUUID } = await import('crypto');
        eventId = randomUUID();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Event" ("id","coworkingSlug","title","description","eventType","startDate","endDate","isAllDay","maxAttendees","price","isFree","externalUrl","imageUrl","createdAt","updatedAt")
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())`,
          eventId,
          eventData.coworkingSlug,
          eventData.title,
          eventData.description,
          eventData.eventType,
          eventData.startDate,
          eventData.endDate ?? null,
          eventData.isAllDay,
          eventData.maxAttendees ?? null,
          eventData.price ?? null,
          eventData.isFree,
          eventData.externalUrl ?? null,
          eventData.imageUrl ?? null,
        );
      } else {
        throw dbErr;
      }
    }

    return NextResponse.json({ success: true, id: eventId });
  } catch (err) {
    console.error('Event create error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání eventu.' }, { status: 500 });
  }
}
