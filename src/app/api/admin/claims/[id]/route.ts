import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

function isSuperAdmin(session: any) {
  return session?.user?.role === 'super_admin';
}

async function logAudit(claimId: string, action: string, actorUserId: string | null, fromStatus: string | null, toStatus: string | null, note?: string) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ClaimAuditLog" ("id", "claimId", "action", "actorUserId", "fromStatus", "toStatus", "note", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      randomUUID(),
      claimId,
      action,
      actorUserId,
      fromStatus,
      toStatus,
      note ?? null,
      new Date(),
    );
  } catch (err) {
    console.error('[audit] insert failed:', (err as Error).message);
  }
}

// PATCH /api/admin/claims/[id] — approve, reject, or accept a transfer
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const actorId = (session as any)?.user?.id as string | undefined;
  const body = await req.json();
  const action = body.action as string; // 'approve' | 'reject' | 'accept_transfer'
  const note = (body.note as string | undefined) || undefined;

  if (action !== 'approve' && action !== 'reject' && action !== 'accept_transfer') {
    return NextResponse.json({ error: 'Neplatná akce' }, { status: 400 });
  }

  const claim = await prisma.coworkingClaim.findUnique({ where: { id: params.id } });
  if (!claim) {
    return NextResponse.json({ error: 'Žádost nenalezena' }, { status: 404 });
  }

  const fromStatus = claim.status;

  // REJECT
  if (action === 'reject') {
    await prisma.coworkingClaim.update({
      where: { id: params.id },
      data: { status: 'rejected' },
    });
    await logAudit(claim.id, 'rejected', actorId ?? null, fromStatus, 'rejected', note);
    return NextResponse.json({ success: true, status: 'rejected' });
  }

  // APPROVE — pro běžné claimy (status pending → approved)
  // ACCEPT_TRANSFER — pro transfer requesty (transfer_pending → approved + převod ownership)
  if (action === 'accept_transfer' && fromStatus !== 'transfer_pending') {
    return NextResponse.json({ error: 'Tato žádost není žádost o převod' }, { status: 400 });
  }

  // Mark approved
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

  // Pokud šlo o transfer, předchozí ownera markovat jako 'rejected' nebo specifickým statusem.
  // (Předchozí approved claim na stejném slug, ale jiný userId)
  if (action === 'accept_transfer') {
    const previousOwnerClaims = await prisma.coworkingClaim.findMany({
      where: {
        coworkingSlug: claim.coworkingSlug,
        status: 'approved',
        NOT: { userId: claim.userId },
      },
    });
    for (const prev of previousOwnerClaims) {
      await prisma.coworkingClaim.update({
        where: { id: prev.id },
        data: { status: 'rejected' }, // ztratil ownership přes transfer
      });
      await logAudit(prev.id, 'transferred_away', actorId ?? null, 'approved', 'rejected', `Převedeno na ${claim.userId}`);
    }
  }

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

  await logAudit(
    claim.id,
    action === 'accept_transfer' ? 'transfer_approved' : 'approved',
    actorId ?? null,
    fromStatus,
    'approved',
    note,
  );

  return NextResponse.json({
    success: true,
    status: 'approved',
    redirectTo: `/spravce/${claim.coworkingSlug}`,
  });
}
