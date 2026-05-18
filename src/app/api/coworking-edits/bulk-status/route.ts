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
 * Used by /spravce/coworkingy and /coworkingy (status badges) to render
 * per-card status badges without per-row fetches.
 */
export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  const myId = session?.user?.id;

  try {
    // 1) All taken coworkings (someone has CoworkingEdit)
    const edits = await prisma.coworkingEdit.findMany({
      select: { coworkingSlug: true, userId: true },
    });

    // 2) All my claims (any status)
    const myClaims = myId
      ? await prisma.coworkingClaim.findMany({
          where: { userId: myId },
          select: { coworkingSlug: true, status: true },
        })
      : [];

    const statuses: Record<string, string> = {};

    for (const e of edits) {
      statuses[e.coworkingSlug] = myId && e.userId === myId ? 'owned_by_me' : 'owned_by_other';
    }
    for (const c of myClaims) {
      const existing = statuses[c.coworkingSlug];
      if (c.status === 'approved') {
        statuses[c.coworkingSlug] = 'owned_by_me';
      } else if (c.status === 'pending' && existing !== 'owned_by_me') {
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
