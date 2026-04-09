import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await ensureCowOsTables();

    const plans = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan"
       WHERE "coworkingSlug" = $1
       ORDER BY "sortOrder" ASC`,
      auth.coworkingSlug
    );

    return NextResponse.json(plans);
  } catch (error) {
    console.error('GET plans error:', error);
    return NextResponse.json({ error: 'Chyba při načítání' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { name, basePrice, description = '', billingInterval = 'monthly', freeResourceHours = 0, sortOrder = 0 } = body;

    // Validate required fields
    if (!name || basePrice === undefined || basePrice === null) {
      return NextResponse.json(
        { error: 'Chybí povinná pole: name, basePrice' },
        { status: 400 }
      );
    }

    // Check for duplicate name within same coworking
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan"
       WHERE "coworkingSlug" = $1 AND "name" = $2`,
      auth.coworkingSlug,
      name
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'Plán s tímto názvem již existuje' },
        { status: 409 }
      );
    }

    const id = randomUUID();
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CowOsMembershipPlan"
       ("id", "coworkingSlug", "name", "description", "basePrice", "billingInterval",
        "freeResourceHours", "isActive", "sortOrder", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      id,
      auth.coworkingSlug,
      name,
      description,
      basePrice,
      billingInterval,
      freeResourceHours,
      true,
      sortOrder,
      now,
      now
    );

    // Fetch and return the created plan
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1`,
      id
    );

    const plan = result.length > 0 ? result[0] : null;
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error('POST plan error:', error);
    return NextResponse.json({ error: 'Chyba při vytváření' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id, name, basePrice, description, billingInterval, freeResourceHours, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chybí id plánu' }, { status: 400 });
    }

    // Verify the plan belongs to this coworking
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      id,
      auth.coworkingSlug
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Plán nenalezen' }, { status: 404 });
    }

    const now = new Date();

    // Build dynamic update query
    const updates: string[] = [];
    const values: unknown[] = [id, auth.coworkingSlug, now];
    let paramIndex = 4;

    if (name !== undefined) {
      updates.push(`"name" = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }
    if (basePrice !== undefined) {
      updates.push(`"basePrice" = $${paramIndex}`);
      values.push(basePrice);
      paramIndex++;
    }
    if (description !== undefined) {
      updates.push(`"description" = $${paramIndex}`);
      values.push(description);
      paramIndex++;
    }
    if (billingInterval !== undefined) {
      updates.push(`"billingInterval" = $${paramIndex}`);
      values.push(billingInterval);
      paramIndex++;
    }
    if (freeResourceHours !== undefined) {
      updates.push(`"freeResourceHours" = $${paramIndex}`);
      values.push(freeResourceHours);
      paramIndex++;
    }
    if (isActive !== undefined) {
      updates.push(`"isActive" = $${paramIndex}`);
      values.push(isActive);
      paramIndex++;
    }
    if (sortOrder !== undefined) {
      updates.push(`"sortOrder" = $${paramIndex}`);
      values.push(sortOrder);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    updates.push(`"updatedAt" = $3`);

    const updateQuery = `UPDATE "CowOsMembershipPlan"
                         SET ${updates.join(', ')}
                         WHERE "id" = $1 AND "coworkingSlug" = $2`;

    await prisma.$executeRawUnsafe(updateQuery, ...values);

    // Fetch and return the updated plan
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1`,
      id
    );

    const plan = result.length > 0 ? result[0] : null;
    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.error('PUT plan error:', error);
    return NextResponse.json({ error: 'Chyba při aktualizaci' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chybí id plánu' }, { status: 400 });
    }

    // Verify the plan belongs to this coworking
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      id,
      auth.coworkingSlug
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Plán nenalezen' }, { status: 404 });
    }

    // Check if plan has members — if so, soft delete only
    const memberCount = await prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) as count FROM "CowOsMember" WHERE "planId" = $1`,
      id
    );

    const count = memberCount.length > 0 ? (memberCount[0].count as number) : 0;

    const now = new Date();

    // Soft delete: set isActive = false
    await prisma.$executeRawUnsafe(
      `UPDATE "CowOsMembershipPlan" SET "isActive" = false, "updatedAt" = $1 WHERE "id" = $2`,
      now,
      id
    );

    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1`,
      id
    );

    const plan = result.length > 0 ? result[0] : null;
    const message = count > 0 ? `Plán deaktivován (má ${count} členů)` : 'Plán deaktivován';

    return NextResponse.json({ ...plan, message }, { status: 200 });
  } catch (error) {
    console.error('DELETE plan error:', error);
    return NextResponse.json({ error: 'Chyba při deaktivaci' }, { status: 500 });
  }
}
