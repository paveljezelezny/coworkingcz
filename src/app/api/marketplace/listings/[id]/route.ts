import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// DELETE — deactivate / delete listing (owner only)
// ---------------------------------------------------------------------------

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: params.id },
    select: { userId: true },
  });

  if (!listing) {
    return NextResponse.json({ error: 'Inzerát nenalezen' }, { status: 404 });
  }

  const role: string = (session.user as any).role ?? 'coworker';
  if (listing.userId !== session.user.id && role !== 'super_admin') {
    return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
  }

  await prisma.marketplaceListing.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}

// ---------------------------------------------------------------------------
// PATCH — toggle active / update listing (owner only)
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: params.id },
    select: { userId: true, isActive: true },
  });

  if (!listing) {
    return NextResponse.json({ error: 'Inzerát nenalezen' }, { status: 404 });
  }

  const role: string = (session.user as any).role ?? 'coworker';
  if (listing.userId !== session.user.id && role !== 'super_admin') {
    return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
  }

  const body = await req.json();

  const updated = await prisma.marketplaceListing.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      ...(body.title !== undefined ? { title: body.title.trim() } : {}),
      ...(body.description !== undefined ? { description: body.description.trim() } : {}),
    },
  });

  return NextResponse.json({ success: true, listing: updated });
}
