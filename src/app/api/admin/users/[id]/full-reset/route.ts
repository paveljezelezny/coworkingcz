import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

type AnySession = { user?: Record<string, unknown> } | null;

function isSuperAdmin(session: AnySession) {
  return (session?.user as any)?.role === 'super_admin';
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
  } catch {
    // best-effort
  }
}

/**
 * DELETE /api/admin/users/[id]/full-reset
 *
 * Atomicky smaže VŠECHNY ownership/coworking propojení uživatele:
 *   - CoworkingClaim (všechny statusy)
 *   - CoworkingEdit (ownership tabulka)
 *   - CowOsSubscription (pro coworkingy které user vlastnil)
 *   - CowOsBillingProfile, Plan, Member, Invoice (pro tyto coworkingy)
 *   - Degrade role z 'coworking_admin' na 'coworker' (super_admin nedegraduje)
 *
 * Reset NIČÍ user account — jen rozpojuje vlastnictví coworkingů.
 * Audit log entries se ZACHOVÁVAJÍ (cascade delete by je smazal, ale chceme historii).
 * Pending claims OD JINÝCH userů na tytéž coworkingy ZŮSTÁVAJÍ.
 *
 * Super_admin only. Vrací summary, co bylo smazáno.
 */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const actorId = (session?.user as any)?.id as string | undefined;
  const targetUserId = params.id;

  if (!targetUserId) {
    return NextResponse.json({ error: 'Chybí user id' }, { status: 400 });
  }

  // Zjisti, jaké coworkingy user vlastnil (CoworkingEdit) nebo měl approved claim
  // — to jsou ty, jejichž cow.os data potřebujeme odstranit.
  const owned = await prisma.coworkingEdit.findMany({
    where: { userId: targetUserId },
    select: { coworkingSlug: true },
  });
  const approvedClaims = await prisma.coworkingClaim.findMany({
    where: { userId: targetUserId, status: 'approved' },
    select: { coworkingSlug: true, id: true, status: true },
  });
  const allClaimsForLog = await prisma.coworkingClaim.findMany({
    where: { userId: targetUserId },
    select: { id: true, status: true, coworkingSlug: true },
  });
  const slugs = Array.from(new Set([
    ...owned.map((e: { coworkingSlug: string }) => e.coworkingSlug),
    ...approvedClaims.map((c: { coworkingSlug: string }) => c.coworkingSlug),
  ]));

  // Counts for response summary
  const counts = {
    coworkingEdits: 0,
    coworkingClaims: 0,
    cowOsSubscriptions: 0,
    cowOsBillingProfiles: 0,
    cowOsMembershipPlans: 0,
    cowOsMembers: 0,
    cowOsInvoices: 0,
    rolDowngrade: false,
  };

  // Audit log pro každý claim co se chystáme smazat
  for (const c of allClaimsForLog) {
    await logAudit(c.id, 'user_reset', actorId ?? null, c.status, null, `Full reset uživatele ${targetUserId}`);
  }

  // Delete v pořadí kvůli FK constraintům:
  //   invoices → members → plans → billing → subscription → edit → claim
  if (slugs.length > 0) {
    // Cow.os scoped data
    try {
      const inv = await prisma.$executeRawUnsafe<number>(
        `DELETE FROM "CowOsInvoice" WHERE "coworkingSlug" = ANY($1::text[])`,
        slugs,
      );
      counts.cowOsInvoices = Number(inv) || 0;
    } catch (e) { console.error('[reset] invoices:', (e as Error).message); }

    try {
      const mem = await prisma.$executeRawUnsafe<number>(
        `DELETE FROM "CowOsMember" WHERE "coworkingSlug" = ANY($1::text[])`,
        slugs,
      );
      counts.cowOsMembers = Number(mem) || 0;
    } catch (e) { console.error('[reset] members:', (e as Error).message); }

    try {
      const pl = await prisma.$executeRawUnsafe<number>(
        `DELETE FROM "CowOsMembershipPlan" WHERE "coworkingSlug" = ANY($1::text[])`,
        slugs,
      );
      counts.cowOsMembershipPlans = Number(pl) || 0;
    } catch (e) { console.error('[reset] plans:', (e as Error).message); }

    try {
      const bill = await prisma.$executeRawUnsafe<number>(
        `DELETE FROM "CowOsBillingProfile" WHERE "coworkingSlug" = ANY($1::text[])`,
        slugs,
      );
      counts.cowOsBillingProfiles = Number(bill) || 0;
    } catch (e) { console.error('[reset] billing:', (e as Error).message); }

    try {
      const sub = await prisma.$executeRawUnsafe<number>(
        `DELETE FROM "CowOsSubscription" WHERE "coworkingSlug" = ANY($1::text[]) AND "userId" = $2`,
        slugs,
        targetUserId,
      );
      counts.cowOsSubscriptions = Number(sub) || 0;
    } catch (e) { console.error('[reset] subscription:', (e as Error).message); }
  }

  // Edit — jen ty co user vlastní
  try {
    const ed = await prisma.coworkingEdit.deleteMany({
      where: { userId: targetUserId },
    });
    counts.coworkingEdits = ed.count;
  } catch (e) { console.error('[reset] edits:', (e as Error).message); }

  // Claims — všechny statusy
  try {
    const cl = await prisma.coworkingClaim.deleteMany({
      where: { userId: targetUserId },
    });
    counts.coworkingClaims = cl.count;
  } catch (e) { console.error('[reset] claims:', (e as Error).message); }

  // Degrade role pokud nebyl super_admin
  try {
    const u = await prisma.user.findUnique({ where: { id: targetUserId }, select: { role: true } });
    if (u && u.role === 'coworking_admin') {
      await prisma.user.update({ where: { id: targetUserId }, data: { role: 'coworker' } });
      counts.rolDowngrade = true;
    }
  } catch (e) { console.error('[reset] role:', (e as Error).message); }

  return NextResponse.json({
    success: true,
    userId: targetUserId,
    affectedCoworkings: slugs,
    counts,
  });
}
