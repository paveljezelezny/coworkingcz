// GET /api/admin/invitations  — vrátí všechny pozvánky (super_admin only).

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type AnySession = { user?: Record<string, unknown> } | null;
function isSuperAdmin(session: AnySession) {
  return (session?.user as any)?.role === 'super_admin';
}

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const db = prisma as any;
  try {
    const items = await db.invitation.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const stats = {
      total:   items.length,
      pending: items.filter((i: any) => i.status === 'pending').length,
      sent:    items.filter((i: any) => i.status === 'sent').length,
      redeemed: items.filter((i: any) => i.status === 'redeemed').length,
    };

    return NextResponse.json({ items, stats }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('[admin/invitations] list failed', err);
    return NextResponse.json({ error: 'Nepodařilo se načíst pozvánky' }, { status: 500 });
  }
}
