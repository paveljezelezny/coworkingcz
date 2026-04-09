import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ONE-TIME migration — přidá Stripe sloupce do CoworkerProfile
// Po spuštění tento soubor smažte nebo znepřístupněte!
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "CoworkerProfile"
        ADD COLUMN IF NOT EXISTS "stripeCustomerId"     TEXT,
        ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
        ADD COLUMN IF NOT EXISTS "stripePlanInterval"   TEXT;
    `);
    return NextResponse.json({ ok: true, message: 'Migration applied successfully' });
  } catch (err) {
    return NextResponse.json({ ok: false, error: (err as Error).message }, { status: 500 });
  }
}
