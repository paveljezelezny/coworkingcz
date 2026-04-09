/**
 * ONE-TIME endpoint — sets a yearly paid membership for the currently logged-in super_admin.
 * Safe to call multiple times (idempotent upsert).
 * GET /api/admin/setup-admin-membership
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as Record<string, unknown> | undefined;

  if (!user || user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Pouze super_admin' }, { status: 403 });
  }

  const userId = user.id as string;
  const email = user.email as string;

  // Set a 1-year monthly membership starting today
  const now = new Date();
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + 1);

  await prisma.coworkerProfile.upsert({
    where: { userId },
    create: {
      userId,
      membershipTier: 'monthly',
      membershipStart: now,
      membershipEnd: end,
    },
    update: {
      membershipTier: 'monthly',
      membershipStart: now,
      membershipEnd: end,
    },
  });

  return NextResponse.json({
    ok: true,
    message: `Membership nastaven pro ${email}`,
    tier: 'monthly',
    start: now.toISOString(),
    end: end.toISOString(),
  });
}
