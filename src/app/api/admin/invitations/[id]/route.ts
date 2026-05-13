// PATCH / DELETE /api/admin/invitations/[id]
// — super_admin může měnit status (pending/sent/redeemed/declined) a poznámku,
// nebo pozvánku smazat.

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ALLOWED_STATUS = new Set(['pending', 'sent', 'redeemed', 'declined']);

type AnySession = { user?: Record<string, unknown> } | null;
function isSuperAdmin(session: AnySession) {
  return (session?.user as any)?.role === 'super_admin';
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  let body: { status?: string; note?: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Neplatný JSON' }, { status: 400 });
  }

  const data: Record<string, unknown> = {};

  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ error: 'Neplatný status' }, { status: 400 });
    }
    data.status = body.status;
    if (body.status === 'sent') {
      data.sentAt = new Date();
    }
  }

  if (body.note !== undefined) {
    data.note = body.note === null ? null : String(body.note).slice(0, 2000);
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nic ke změně' }, { status: 400 });
  }

  const db = prisma as any;
  try {
    const updated = await db.invitation.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json({ ok: true, item: updated });
  } catch (err) {
    console.error('[admin/invitations] update failed', err);
    return NextResponse.json({ error: 'Nepodařilo se upravit pozvánku' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const db = prisma as any;
  try {
    await db.invitation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/invitations] delete failed', err);
    return NextResponse.json({ error: 'Nepodařilo se smazat' }, { status: 500 });
  }
}
