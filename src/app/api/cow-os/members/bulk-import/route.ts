import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';
import { randomUUID } from 'crypto';

/**
 * Bulk import members from a parsed CSV/xlsx.
 *
 * Request body:
 * {
 *   rows: Array<{
 *     email: string;
 *     name: string;
 *     planName?: string;     // plan resolved by name (case-insensitive)
 *     planId?: string;       // OR direct planId
 *     phone?: string;
 *     company?: string;
 *     ico?: string;
 *     notes?: string;
 *     autoRenew?: boolean;
 *   }>;
 *   defaultPlanId?: string;  // fallback plan if row has no plan
 * }
 *
 * Returns:
 * {
 *   imported: number;
 *   skipped: Array<{ row: number; email: string; reason: string }>;
 *   total: number;
 * }
 *
 * Failure modes are reported per-row, so a single bad row doesn't roll back the rest.
 */
export async function POST(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await ensureCowOsTables();

  try {
    const body = await req.json().catch(() => ({}));
    const rows = Array.isArray(body.rows) ? body.rows : null;
    const defaultPlanId: string | undefined = body.defaultPlanId;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Žádné řádky k importu' }, { status: 400 });
    }

    if (rows.length > 500) {
      return NextResponse.json(
        { error: 'Maximálně 500 řádků na jeden import. Rozdělte na menší dávky.' },
        { status: 400 }
      );
    }

    // Check subscription + member limit
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

    const memberCount = await prisma.$queryRawUnsafe<{ count: string }[]>(
      `SELECT COUNT(*)::int as count FROM "CowOsMember"
       WHERE "coworkingSlug" = $1 AND "status" != 'cancelled'`,
      auth.coworkingSlug
    );
    const currentCount = memberCount.length > 0 ? Number(memberCount[0].count) : 0;
    const remaining = maxMembers - currentCount;

    if (remaining <= 0) {
      return NextResponse.json(
        { error: `Dosáhli jste limitu ${maxMembers} členů. Žádní noví členové nebudou přidáni.` },
        { status: 409 }
      );
    }

    // Preload plans
    const plansResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT "id", "name", "billingInterval", "isActive" FROM "CowOsMembershipPlan" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );
    const plansByName = new Map<string, Record<string, unknown>>();
    const plansById = new Map<string, Record<string, unknown>>();
    for (const p of plansResult) {
      plansByName.set(((p.name as string) || '').toLowerCase().trim(), p);
      plansById.set(p.id as string, p);
    }

    // Preload existing member emails to detect duplicates
    const existingEmailsResult = await prisma.$queryRawUnsafe<{ email: string }[]>(
      `SELECT "email" FROM "CowOsMember" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );
    const existingEmails = new Set(existingEmailsResult.map((r: { email: string }) => (r.email || '').toLowerCase()));

    let imported = 0;
    const skipped: { row: number; email: string; reason: string }[] = [];
    const seenInBatch = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const rowNum = i + 1;
      const email = ((row.email as string) || '').trim().toLowerCase();
      const name = ((row.name as string) || '').trim();

      if (!email || !name) {
        skipped.push({ row: rowNum, email: email || '(prázdné)', reason: 'Chybí email nebo jméno' });
        continue;
      }

      // basic email shape check
      if (!email.includes('@') || !email.includes('.')) {
        skipped.push({ row: rowNum, email, reason: 'Neplatný formát emailu' });
        continue;
      }

      if (existingEmails.has(email)) {
        skipped.push({ row: rowNum, email, reason: 'Email už v coworkingu existuje' });
        continue;
      }
      if (seenInBatch.has(email)) {
        skipped.push({ row: rowNum, email, reason: 'Duplicitní email v rámci tohoto importu' });
        continue;
      }

      // Resolve plan
      let plan: Record<string, unknown> | undefined;
      if (row.planId) {
        plan = plansById.get(row.planId as string);
      } else if (row.planName) {
        plan = plansByName.get(((row.planName as string) || '').toLowerCase().trim());
      } else if (defaultPlanId) {
        plan = plansById.get(defaultPlanId);
      }

      if (!plan) {
        skipped.push({ row: rowNum, email, reason: 'Plán nenalezen (zadej planName nebo defaultPlanId)' });
        continue;
      }

      if (plan.isActive === false) {
        skipped.push({ row: rowNum, email, reason: `Plán "${plan.name}" je deaktivovaný` });
        continue;
      }

      if (imported >= remaining) {
        skipped.push({ row: rowNum, email, reason: `Dosažen limit ${maxMembers} členů` });
        continue;
      }

      // Insert
      try {
        const startDate = new Date();
        const nextRenewalDate = new Date(startDate);
        const billingInterval = plan.billingInterval as string;
        if (billingInterval === 'yearly') {
          nextRenewalDate.setFullYear(nextRenewalDate.getFullYear() + 1);
        } else {
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
          null, // userId — bulk-imported members are not linked to a user account by default
          email,
          name,
          (row.phone as string) || '',
          (row.company as string) || '',
          (row.ico as string) || '',
          plan.id,
          'active',
          startDate,
          nextRenewalDate,
          row.autoRenew !== false, // default true
          (row.notes as string) || '',
          now,
          now
        );

        existingEmails.add(email);
        seenInBatch.add(email);
        imported++;
      } catch (err) {
        skipped.push({
          row: rowNum,
          email,
          reason: 'DB error: ' + ((err as Error).message || 'unknown').slice(0, 120),
        });
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      total: rows.length,
      remainingCapacity: maxMembers - (currentCount + imported),
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Chyba při importu: ' + ((error as Error).message || 'unknown') },
      { status: 500 }
    );
  }
}
