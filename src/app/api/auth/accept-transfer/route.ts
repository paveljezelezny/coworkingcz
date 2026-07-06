import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/accept-transfer?token=XXX
 *
 * When a new owner clicks the acceptance link:
 * 1. Validate token + not expired
 * 2. Require authenticated user matching toEmail
 * 3. Transfer the CoworkingClaim + CoworkingEdit to new user
 * 4. Mark transfer as accepted
 * 5. Redirect to /spravce
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/prihlaseni?error=missing-token', req.url));
  }

  // Find the transfer
  const transfer = await prisma.coworkingTransfer.findUnique({
    where: { token },
  });

  if (!transfer) {
    return NextResponse.redirect(new URL('/prihlaseni?error=invalid-token', req.url));
  }

  if (transfer.status !== 'pending') {
    return NextResponse.redirect(
      new URL(`/prihlaseni?error=transfer-${transfer.status}`, req.url)
    );
  }

  if (transfer.expiresAt < new Date()) {
    // Mark as expired
    await prisma.coworkingTransfer.update({
      where: { id: transfer.id },
      data: { status: 'cancelled' },
    });
    return NextResponse.redirect(new URL('/prihlaseni?error=transfer-expired', req.url));
  }

  // Check if user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // Redirect to login with callback back to this URL
    const callbackUrl = `/api/auth/accept-transfer?token=${token}`;
    return NextResponse.redirect(
      new URL(`/prihlaseni?callbackUrl=${encodeURIComponent(callbackUrl)}`, req.url)
    );
  }

  const userEmail = session.user.email.toLowerCase();
  const userId = (session.user as Record<string, unknown>).id as string;

  // Verify the logged-in user matches the target email
  if (userEmail !== transfer.toEmail.toLowerCase()) {
    return NextResponse.redirect(
      new URL('/spravce?error=transfer-wrong-email', req.url)
    );
  }

  try {
    const slug = transfer.coworkingSlug;
    const fromUserId = transfer.fromUserId;

    // Atomic transaction: token claim first (idempotence — replay-safe), then mutations.
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 0. Claim the token: pending → accepted atomically. Second click = count 0 → abort.
      const claimed = await tx.coworkingTransfer.updateMany({
        where: { id: transfer.id, status: 'pending' },
        data: { status: 'accepted' },
      });
      if (claimed.count !== 1) {
        throw new Error('transfer-already-processed');
      }

    // 1. Create or update claim for new owner
    await tx.coworkingClaim.upsert({
      where: {
        userId_coworkingSlug: { userId, coworkingSlug: slug },
      },
      update: { status: 'approved' },
      create: {
        userId,
        coworkingSlug: slug,
        coworkingName: slug, // Will be updated below
        status: 'approved',
      },
    });

    // Get the coworking name from old claim
    const oldClaim = await tx.coworkingClaim.findFirst({
      where: { userId: fromUserId, coworkingSlug: slug },
    });

    if (oldClaim) {
      // Update new claim with proper name
      await tx.coworkingClaim.update({
        where: { userId_coworkingSlug: { userId, coworkingSlug: slug } },
        data: { coworkingName: oldClaim.coworkingName },
      });

      // Remove old claim
      await tx.coworkingClaim.delete({
        where: { userId_coworkingSlug: { userId: fromUserId, coworkingSlug: slug } },
      });
    }

    // 2. Transfer CoworkingEdit ownership
    const edit = await tx.coworkingEdit.findUnique({
      where: { coworkingSlug: slug },
    });

    if (edit) {
      await tx.coworkingEdit.update({
        where: { coworkingSlug: slug },
        data: { userId },
      });
    }

    // 3. Upgrade new user's role if needed
    const newUser = await tx.user.findUnique({ where: { id: userId } });
    if (newUser && newUser.role === 'coworker') {
      await tx.user.update({
        where: { id: userId },
        data: { role: 'coworking_admin' },
      });
    }

    // 4. Check if old user still owns other coworkings; if not, downgrade role
    const otherClaims = await tx.coworkingClaim.findMany({
      where: { userId: fromUserId, status: 'approved' },
    });

    if (otherClaims.length === 0) {
      const oldUser = await tx.user.findUnique({ where: { id: fromUserId } });
      if (oldUser && oldUser.role === 'coworking_admin') {
        await tx.user.update({
          where: { id: fromUserId },
          data: { role: 'coworker' },
        });
      }
    }
    }); // end $transaction

    return NextResponse.redirect(
      new URL('/spravce?transfer=accepted', req.url)
    );
  } catch (error) {
    console.error('Accept transfer error:', error);
    return NextResponse.redirect(
      new URL('/spravce?error=transfer-failed', req.url)
    );
  }
}
