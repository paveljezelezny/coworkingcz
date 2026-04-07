import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type AnySession = { user?: Record<string, unknown> } | null;

async function requireSuperAdmin(req: NextRequest) {
  const session: AnySession = await getServerSession(authOptions);
  const role = session?.user?.['role'] as string | undefined;
  if (!session?.user || role !== 'super_admin') {
    return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
  }
  return null;
}

// GET — all listings (admin)
export async function GET(req: NextRequest) {
  const denied = await requireSuperAdmin(req);
  if (denied) return denied;

  const listings = await prisma.marketplaceListing.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json({
    listings: listings.map((l: typeof listings[0]) => ({
      ...l,
      tags: (() => { try { return JSON.parse(l.tags ?? '{}'); } catch { return {}; } })(),
    })),
  });
}
