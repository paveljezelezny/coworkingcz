import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const status = req.nextUrl.searchParams.get('status');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);

  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    await ensureCowOsTables();
    // Build WHERE clause
    let whereClause = `WHERE m."coworkingSlug" = $1`;
    const params: unknown[] = [auth.coworkingSlug];

    if (status) {
      whereClause += ` AND m."status" = $${params.length + 1}`;
      params.push(status);
    }

    // Count total (cast to int to avoid BigInt serialization issue)
    const countResult = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::int as count FROM "CowOsMember" m ${whereClause}`,
      ...params
    );
    const total = countResult.length > 0 ? Number(countResult[0].count) : 0;

    // Fetch members with pagination and join plan info
    const offset = (page - 1) * limit;
    const paramCount = params.length;

    const members = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT m.*,
              m."startDate" as "membershipStart",
              p."name" as "planName",
              p."basePrice" as "planPrice"
       FROM "CowOsMember" m
       LEFT JOIN "CowOsMembershipPlan" p ON m."planId" = p."id"
       ${whereClause}
       ORDER BY m."createdAt" DESC
       LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`,
      ...params,
      limit,
      offset
    );

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      members,
      total,
      page,
      limit,
      pages,
    });
  } catch (error) {
    console.error('GET members error:', error);
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
    const { email, name, planId, phone = '', company = '', ico = '', status = 'active', autoRenew = true, notes = '' } = body;

    // Validate required fields
    if (!email || !name || !planId) {
      return NextResponse.json(
        { error: 'Chybí povinná pole: email, name, planId' },
        { status: 400 }
      );
    }

    // Check subscription exists and member limit
    const subscription = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsSubscription" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    if (subscription.length === 0) {
      return NextResponse.json(
        { error: 'Předplatné COW.OS není aktivní' },
        { status: 403 }
      );
    }

    const maxMembers = subscription[0].maxMembers as number;

    // Count current members (cast to int to avoid BigInt serialization)
    const memberCount = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::int as count FROM "CowOsMember"
       WHERE "coworkingSlug" = $1 AND "status" != 'cancelled'`,
      auth.coworkingSlug
    );

    const currentCount = memberCount.length > 0 ? Number(memberCount[0].count) : 0;
    if (currentCount >= maxMembers) {
      return NextResponse.json(
        { error: `Dosáhli jste limitu ${maxMembers} členů. Upgradujte plán.` },
        { status: 409 }
      );
    }

    // Check if member with this email already exists in this coworking
    const existingMember = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMember"
       WHERE "coworkingSlug" = $1 AND "email" = $2`,
      auth.coworkingSlug,
      email
    );

    if (existingMember.length > 0) {
      return NextResponse.json(
        { error: 'Člen s tímto emailem již v coworkingu existuje' },
        { status: 409 }
      );
    }

    // Verify plan belongs to this coworking
    const plan = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMembershipPlan"
       WHERE "id" = $1 AND "coworkingSlug" = $2`,
      planId,
      auth.coworkingSlug
    );

    if (plan.length === 0) {
      return NextResponse.json(
        { error: 'Plán není k dispozici pro tento coworking' },
        { status: 404 }
      );
    }

    // Calculate nextRenewalDate based on billingInterval
    const startDate = new Date();
    const nextRenewalDate = new Date(startDate);
    const billingInterval = plan[0].billingInterval as string;

    if (billingInterval === 'yearly') {
      nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
    } else {
      // Default: monthly (30 days)
      nextRenewalDate.setDate(nextRenewalDate.getDate() + 30);
    }

    const id = randomUUID();
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CowOsMember"
       ("id", "coworkingSlug", "userId", "email", "name", "phone", "company", "ico",
        "planId", "status", "startDate", "nextRenewalDate", "autoRenew", "notes", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
      id,
      auth.coworkingSlug,
      auth.userId,
      email,
      name,
      phone,
      company,
      ico,
      planId,
      status,
      startDate,
      nextRenewalDate,
      autoRenew,
      notes,
      now,
      now
    );

    // Fetch and return the created member
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT m.*,
              p."name" as "planName",
              p."basePrice" as "planPrice"
       FROM "CowOsMember" m
       LEFT JOIN "CowOsMembershipPlan" p ON m."planId" = p."id"
       WHERE m."id" = $1`,
      id
    );

    const member = result.length > 0 ? result[0] : null;
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST member error:', error);
    return NextResponse.json({ error: 'Chyba při přidání člena' }, { status: 500 });
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
    const { id, name, email, phone, company, ico, planId, status, autoRenew, notes, endDate, nextRenewalDate } = body;

    if (!id) {
      return NextResponse.json({ error: 'Chybí id člena' }, { status: 400 });
    }

    // Verify member belongs to this coworking
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMember" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      id,
      auth.coworkingSlug
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Člen nenalezen' }, { status: 404 });
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
    if (email !== undefined) {
      updates.push(`"email" = $${paramIndex}`);
      values.push(email);
      paramIndex++;
    }
    if (phone !== undefined) {
      updates.push(`"phone" = $${paramIndex}`);
      values.push(phone);
      paramIndex++;
    }
    if (company !== undefined) {
      updates.push(`"company" = $${paramIndex}`);
      values.push(company);
      paramIndex++;
    }
    if (ico !== undefined) {
      updates.push(`"ico" = $${paramIndex}`);
      values.push(ico);
      paramIndex++;
    }
    if (planId !== undefined) {
      updates.push(`"planId" = $${paramIndex}`);
      values.push(planId);
      paramIndex++;
    }
    if (status !== undefined) {
      updates.push(`"status" = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (autoRenew !== undefined) {
      updates.push(`"autoRenew" = $${paramIndex}`);
      values.push(autoRenew);
      paramIndex++;
    }
    if (notes !== undefined) {
      updates.push(`"notes" = $${paramIndex}`);
      values.push(notes);
      paramIndex++;
    }
    if (endDate !== undefined) {
      updates.push(`"endDate" = $${paramIndex}`);
      values.push(endDate);
      paramIndex++;
    }
    if (nextRenewalDate !== undefined) {
      updates.push(`"nextRenewalDate" = $${paramIndex}`);
      values.push(nextRenewalDate);
      paramIndex++;
    }

    if (updates.length === 0) {
      return NextResponse.json(existing[0], { status: 200 });
    }

    updates.push(`"updatedAt" = $3`);

    const updateQuery = `UPDATE "CowOsMember"
                         SET ${updates.join(', ')}
                         WHERE "id" = $1 AND "coworkingSlug" = $2`;

    await prisma.$executeRawUnsafe(updateQuery, ...values);

    // Fetch and return the updated member
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT m.*,
              p."name" as "planName",
              p."basePrice" as "planPrice"
       FROM "CowOsMember" m
       LEFT JOIN "CowOsMembershipPlan" p ON m."planId" = p."id"
       WHERE m."id" = $1`,
      id
    );

    const member = result.length > 0 ? result[0] : null;
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error('PUT member error:', error);
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
      return NextResponse.json({ error: 'Chybí id člena' }, { status: 400 });
    }

    // Verify member belongs to this coworking
    const existing = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMember" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      id,
      auth.coworkingSlug
    );

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Člen nenalezen' }, { status: 404 });
    }

    const now = new Date();

    // Soft delete: set status to 'cancelled'
    await prisma.$executeRawUnsafe(
      `UPDATE "CowOsMember" SET "status" = 'cancelled', "endDate" = $1, "updatedAt" = $2 WHERE "id" = $3`,
      now,
      now,
      id
    );

    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT m.*,
              p."name" as "planName",
              p."basePrice" as "planPrice"
       FROM "CowOsMember" m
       LEFT JOIN "CowOsMembershipPlan" p ON m."planId" = p."id"
       WHERE m."id" = $1`,
      id
    );

    const member = result.length > 0 ? result[0] : null;
    return NextResponse.json(member, { status: 200 });
  } catch (error) {
    console.error('DELETE member error:', error);
    return NextResponse.json({ error: 'Chyba při zrušení' }, { status: 500 });
  }
}
