import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type AnySession = { user?: Record<string, unknown> } | null;

async function requireSuperAdmin() {
  const session: AnySession = await getServerSession(authOptions);
  const role = session?.user?.['role'] as string | undefined;
  if (!session?.user || role !== 'super_admin') return false;
  return true;
}

// PATCH — update event
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.event.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.eventType !== undefined ? { eventType: body.eventType || null } : {}),
      ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
      ...(body.startDate !== undefined ? { startDate: new Date(body.startDate) } : {}),
      ...(body.isFree !== undefined ? { isFree: Boolean(body.isFree) } : {}),
      ...(body.price !== undefined ? { price: body.price ? parseFloat(body.price) : null } : {}),
      ...(body.coworkingSlug !== undefined ? { coworkingSlug: body.coworkingSlug } : {}),
    },
  });

  return NextResponse.json({ success: true, event: updated });
}

// DELETE — remove event
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
  }

  await prisma.eventRegistration.deleteMany({ where: { eventId: params.id } });
  await prisma.event.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
