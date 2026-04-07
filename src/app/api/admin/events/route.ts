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

// GET — all events (admin)
export async function GET(req: NextRequest) {
  const denied = await requireSuperAdmin(req);
  if (denied) return denied;

  try {
    const events = await prisma.event.findMany({
      orderBy: { startDate: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ events });
  } catch {
    // Fallback if userId column missing
    const events = await prisma.$queryRawUnsafe(
      `SELECT e.*, u.name as "userName", u.email as "userEmail"
       FROM "Event" e
       LEFT JOIN "User" u ON e."userId" = u.id
       ORDER BY e."startDate" DESC`
    );
    return NextResponse.json({ events });
  }
}
