import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/coworking-edits/bulk-status
 *
 * Returns ownership / claim status for ALL coworkings, scoped to the current user.
 *
 * Response:
 * {
 *   statuses: {
 *     [slug]: 'free' | 'owned_by_me' | 'owned_by_other' | 'pending_mine' | 'transfer_pending_mine' | 'rejected_mine'
 *   }
 * }
 *
 * **Source of truth pro vlastnictví = `CoworkingClaim` se status='approved'.**
 * `CoworkingEdit` je data-override tabulka — když super_admin upravuje libovolný
 * coworking, vznikne tam řádek s jeho userId. Dřív se to bralo jako ownership,
 * což znamenalo „Spravuješ" badge na všech coworkingech pro super_admina.
 * Edit záměrně ignorujeme — vlastnictví dělá pouze schválený claim.
 *
 * Used by /spravce/coworkingy and /coworkingy (status badges).
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;

  try {
    // 1) Všechny approved claims → kdo co vlastní
    const approved = await prisma.coworkingClaim.findMany({
      where: { status: 'approved' },
      select: { coworkingSlug: true, userId: true },
    });

    // 2) Mé claims jakéhokoliv statusu (pro pending/transfer/rejected badge)
    const myClaims = myId
      ? await prisma.coworkingClaim.findMany({
          where: { userId: myId },
          select: { coworkingSlug: true, status: true },
        })
      : [];

    const statuses: Record<string, string> = {};

    // Approved claims: owned_by_me vs owned_by_other
    for (const a of approved) {
      statuses[a.coworkingSlug] = myId && a.userId === myId ? 'owned_by_me' : 'owned_by_other';
    }

    // Moje non-approved claims (nepřepisují owned_by_me)
    for (const c of myClaims) {
      const existing = statuses[c.coworkingSlug];
      if (c.status === 'approved') continue; // už nastaveno výše
      if (c.status === 'pending' && existing !== 'owned_by_me') {
        statuses[c.coworkingSlug] = 'pending_mine';
      } else if (c.status === 'transfer_pending' && existing !== 'owned_by_me') {
        statuses[c.coworkingSlug] = 'transfer_pending_mine';
      } else if (c.status === 'rejected' && !existing) {
        statuses[c.coworkingSlug] = 'rejected_mine';
      }
    }

    return NextResponse.json({ statuses });
  } catch (err) {
    return NextResponse.json({ statuses: {} });
  }
}
