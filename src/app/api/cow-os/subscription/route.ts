import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';
import { randomUUID } from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await ensureCowOsTables();

    const subscription = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsSubscription" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    const sub = subscription.length > 0 ? subscription[0] : null;
    return NextResponse.json(sub);
  } catch (error) {
    console.error('GET subscription error:', error);
    // Return null so frontend shows activation screen instead of blocking
    return NextResponse.json(null);
  }
}

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error, detail: `Auth failed for slug=${slug}` },
      { status: auth.status }
    );
  }

  try {
    // Auto-create all COW.OS tables if they don't exist yet
    await ensureCowOsTables();
  } catch (err) {
    console.error('ensureCowOsTables failed:', err);
    // Continue anyway — tables might already exist from manual migration
  }

  try {
    // Check if subscription already exists
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsSubscription" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    if (existing.length > 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    // Create new free subscription
    const id = randomUUID();
    const now = new Date().toISOString();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CowOsSubscription"
       ("id", "coworkingSlug", "userId", "tier", "maxMembers", "monthlyPrice", "status", "startDate", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      id,
      auth.coworkingSlug,
      auth.userId,
      'free',
      5,
      0,
      'active',
      now,
      now,
      now
    );

    // Fetch and return the created subscription
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsSubscription" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    const sub = result.length > 0 ? result[0] : null;
    return NextResponse.json(sub, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('POST subscription error:', msg);
    return NextResponse.json(
      { error: 'Chyba při aktivaci', detail: msg },
      { status: 500 }
    );
  }
}
