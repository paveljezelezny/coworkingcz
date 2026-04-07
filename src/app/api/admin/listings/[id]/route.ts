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

// PATCH — toggle active / update listing
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.marketplaceListing.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.description !== undefined ? { description: body.description?.trim() || null } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
    },
  });

  return NextResponse.json({ success: true, listing: updated });
}

// DELETE — remove listing
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireSuperAdmin())) {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
  }

  await prisma.marketplaceListing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
