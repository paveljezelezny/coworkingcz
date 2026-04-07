import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type SessionUser = { id?: string; role?: string } & Record<string, unknown>;

async function ownerCheck(id: string, session: { user?: SessionUser } | null) {
  const userId = session?.user?.id;
  if (!userId) return { error: 'Nepřihlášen', status: 401 };
  const event = await prisma.event.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!event) return { error: 'Event nenalezen', status: 404 };
  const role = session?.user?.role ?? 'coworker';
  if (event.userId !== userId && role !== 'super_admin') {
    return { error: 'Nemáte oprávnění', status: 403 };
  }
  return { event };
}

// ---------------------------------------------------------------------------
// PATCH — full event update (owner only)
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const check = await ownerCheck(params.id, session);
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json();

  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.eventType !== undefined ? { eventType: body.eventType || null } : {}),
      ...(body.startDate !== undefined ? { startDate: new Date(body.startDate) } : {}),
      ...(body.endDate !== undefined ? { endDate: body.endDate ? new Date(body.endDate) : null } : {}),
      ...(body.isAllDay !== undefined ? { isAllDay: Boolean(body.isAllDay) } : {}),
      ...(body.isFree !== undefined ? { isFree: Boolean(body.isFree) } : {}),
      ...(body.price !== undefined ? { price: !body.isFree && body.price ? parseFloat(body.price) : null } : {}),
      ...(body.maxAttendees !== undefined ? { maxAttendees: body.maxAttendees ? parseInt(body.maxAttendees) : null } : {}),
      ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
      ...(body.externalUrl !== undefined ? { externalUrl: body.externalUrl?.trim() || null } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl?.trim() || null } : {}),
      ...(body.coworkingSlug !== undefined ? { coworkingSlug: body.coworkingSlug } : {}),
    },
  });

  return NextResponse.json({ success: true, event: updated });
}

// ---------------------------------------------------------------------------
// DELETE — remove event (owner only)
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const check = await ownerCheck(params.id, session);
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  await prisma.eventRegistration.deleteMany({ where: { eventId: params.id } });
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
