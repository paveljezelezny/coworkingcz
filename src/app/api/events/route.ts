import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasPaidAccess } from '@/lib/membership';

// ---------------------------------------------------------------------------
// Migration helper — adds userId column if missing (runs inline on first need)
// ---------------------------------------------------------------------------

async function ensureEventColumns(): Promise<void> {
  const ddl = [
    `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
    `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "location" TEXT`,
    `DO $$ BEGIN
       IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Event_userId_fkey') THEN
         ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey"
           FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
       END IF;
     END $$`,
  ];
  for (const sql of ddl) {
    try { await prisma.$executeRawUnsafe(sql); } catch { /* ignore */ }
  }
}

// ---------------------------------------------------------------------------
// GET — public all events, or ?mine=true for current user's events
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const mine = new URL(req.url).searchParams.get('mine') === 'true';

  if (mine) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
    }
    const userId = session.user.id;
    const role: string = (session.user as any).role ?? '';

    // Try normal query (works if userId column exists)
    try {
      const events = await prisma.event.findMany({
        where: { userId },
        orderBy: { startDate: 'desc' },
      });
      return NextResponse.json({ events });
    } catch {
      // Column missing — run migration, then retry
      await ensureEventColumns();
      try {
        // After migration: assign orphaned (null userId) events to super_admin
        if (role === 'super_admin') {
          await prisma.$executeRawUnsafe(
            `UPDATE "Event" SET "userId" = $1 WHERE "userId" IS NULL`,
            userId
          );
        }
        const events = await prisma.event.findMany({
          where: { userId },
          orderBy: { startDate: 'desc' },
        });
        return NextResponse.json({ events });
      } catch {
        return NextResponse.json({ events: [] });
      }
    }
  }

  // Public — all events
  try {
    const events = await prisma.event.findMany({ orderBy: { startDate: 'asc' } });
    return NextResponse.json({ events });
  } catch {
    // userId column missing — raw SQL without it
    const cols = `"id","coworkingSlug","title","description","eventType","startDate","endDate","isAllDay","maxAttendees","price","isFree","externalUrl","imageUrl","createdAt","updatedAt"`;
    try {
      const events = await prisma.$queryRawUnsafe(`SELECT ${cols} FROM "Event" ORDER BY "startDate" ASC`);
      return NextResponse.json({ events });
    } catch {
      return NextResponse.json({ events: [] });
    }
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
      externalUrl, imageUrl, location,
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
      location: location?.trim() ?? null,
      externalUrl: externalUrl?.trim() ?? null,
      imageUrl: imageUrl?.trim() ?? null,
    };

    let eventId: string;
    try {
      const event = await prisma.event.create({ data: { ...eventData, userId } });
      eventId = event.id;
    } catch (dbErr) {
      const msg = (dbErr as Error).message ?? '';
      if (msg.includes('userId') || msg.includes('column')) {
        // Run migration inline, then retry
        await ensureEventColumns();
        try {
          const event = await prisma.event.create({ data: { ...eventData, userId } });
          eventId = event.id;
        } catch {
          // Migration ran but Prisma client not refreshed — raw INSERT with userId
          const { randomUUID } = await import('crypto');
          eventId = randomUUID();
          await prisma.$executeRawUnsafe(
            `INSERT INTO "Event" ("id","userId","coworkingSlug","title","description","eventType","startDate","endDate","isAllDay","maxAttendees","price","isFree","externalUrl","imageUrl","createdAt","updatedAt")
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,NOW(),NOW())`,
            eventId, userId,
            eventData.coworkingSlug, eventData.title, eventData.description,
            eventData.eventType, eventData.startDate, eventData.endDate ?? null,
            eventData.isAllDay, eventData.maxAttendees ?? null, eventData.price ?? null,
            eventData.isFree, eventData.externalUrl ?? null, eventData.imageUrl ?? null,
          );
        }
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
