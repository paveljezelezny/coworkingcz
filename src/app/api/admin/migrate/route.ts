import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/admin/migrate?action=delete-events — super_admin only
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const action = new URL(req.url).searchParams.get('action');
  if (action === 'delete-events') {
    await prisma.$executeRawUnsafe(`DELETE FROM "EventRegistration"`);
    await prisma.$executeRawUnsafe(`DELETE FROM "Event"`);
    return NextResponse.json({ ok: true, message: 'Všechny eventy smazány' });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const results: string[] = [];

  const migrations = [
    `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
    `DO $$ BEGIN
       IF NOT EXISTS (
         SELECT 1 FROM pg_constraint WHERE conname = 'Event_userId_fkey'
       ) THEN
         ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey"
           FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
       END IF;
     END $$`,
  ];

  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push(`OK: ${sql.slice(0, 50)}...`);
    } catch (e) {
      results.push(`SKIP: ${(e as Error).message.slice(0, 80)}`);
    }
  }

  return NextResponse.json({ ok: true, results });
}
