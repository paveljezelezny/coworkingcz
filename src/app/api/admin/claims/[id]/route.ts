import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isSuperAdmin(session: any) {
  return session?.user?.role === 'super_admin';
}

// PATCH /api/admin/claims/[id] — approve or reject a claim
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const { action } = await req.json(); // action: 'approve' | 'reject'
  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Neplatná akce' }, { status: 400 });
  }

  const claim = await prisma.coworkingClaim.findUnique({ where: { id: params.id } });
  if (!claim) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  if (action === 'reject') {
    await prisma.coworkingClaim.update({
      where: { id: params.id },
      data: { status: 'rejected' },
    });
    return NextResponse.json({ success: true, status: 'rejected' });
  }

  // APPROVE — set status, create CoworkingEdit, upgrade user role
  await prisma.coworkingClaim.update({
    where: { id: params.id },
    data: { status: 'approved' },
  });

  // Create or transfer CoworkingEdit ownership
  await prisma.coworkingEdit.upsert({
    where: { coworkingSlug: claim.coworkingSlug },
    create: {
      coworkingSlug: claim.coworkingSlug,
      userId: claim.userId,
      data: {},
    },
    update: {
      userId: claim.userId,
    },
  });

  // Upgrade user role to coworking_admin (only if not already super_admin)
  const user = await prisma.user.findUnique({
    where: { id: claim.userId },
    select: { role: true },
  });
  if (user && user.role !== 'super_admin') {
    await prisma.user.update({
      where: { id: claim.userId },
      data: { role: 'coworking_admin' },
    });
  }

  return NextResponse.json({
    success: true,
    status: 'approved',
    redirectTo: `/spravce/${claim.coworkingSlug}`,
  });
}
