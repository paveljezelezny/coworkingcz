import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!event) {
    return NextResponse.json({ error: 'Event nenalezen' }, { status: 404 });
  }

  const role: string = (session.user as any).role ?? 'coworker';
  if (event.userId !== session.user.id && role !== 'super_admin') {
    return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
  }

  // Delete registrations first, then the event
  await prisma.eventRegistration.deleteMany({ where: { eventId: params.id } });
  await prisma.event.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
