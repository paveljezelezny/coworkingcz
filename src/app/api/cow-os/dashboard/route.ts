import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Run parallel queries
    const [memberStats, invoiceStats, revenue, plansCount, subscriptionInfo] = await Promise.all([
      // 1. Count members by status
      (async () => {
        const stats = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT "status", COUNT(*) as count
           FROM "CowOsMember"
           WHERE "coworkingSlug" = $1
           GROUP BY "status"`,
          auth.coworkingSlug
        );

        const result = { active: 0, trial: 0, expired: 0, cancelled: 0, total: 0 };
        stats.forEach((row) => {
          const status = row.status as string;
          const count = row.count as number;
          if (status === 'active') result.active = count;
          else if (status === 'trial') result.trial = count;
          else if (status === 'expired') result.expired = count;
          else if (status === 'cancelled') result.cancelled = count;
          result.total += count;
        });
        return result;
      })(),

      // 2. Count invoices by status
      (async () => {
        const stats = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT "status", COUNT(*) as count
           FROM "CowOsInvoice"
           WHERE "coworkingSlug" = $1
           GROUP BY "status"`,
          auth.coworkingSlug
        );

        const result = { issued: 0, paid: 0, overdue: 0, total: 0 };
        stats.forEach((row) => {
          const status = row.status as string;
          const count = row.count as number;
          if (status === 'issued') result.issued = count;
          else if (status === 'paid') result.paid = count;
          else if (status === 'overdue') result.overdue = count;
          result.total += count;
        });
        return result;
      })(),

      // 3. Sum revenue (this month and this year)
      (async () => {
        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);

        const [monthResult, yearResult] = await Promise.all([
          prisma.$queryRawUnsafe<{ sum: number | null }[]>(
            `SELECT SUM("total") as sum
             FROM "CowOsInvoice"
             WHERE "coworkingSlug" = $1 AND "status" = 'paid' AND "paidDate" >= $2`,
            auth.coworkingSlug,
            thisMonthStart.toISOString()
          ),
          prisma.$queryRawUnsafe<{ sum: number | null }[]>(
            `SELECT SUM("total") as sum
             FROM "CowOsInvoice"
             WHERE "coworkingSlug" = $1 AND "status" = 'paid' AND "paidDate" >= $2`,
            auth.coworkingSlug,
            thisYearStart.toISOString()
          ),
        ]);

        return {
          thisMonth: monthResult[0]?.sum || 0,
          thisYear: yearResult[0]?.sum || 0,
        };
      })(),

      // 4. Count active plans
      (async () => {
        const result = await prisma.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*) as count
           FROM "CowOsMembershipPlan"
           WHERE "coworkingSlug" = $1 AND "isActive" = true`,
          auth.coworkingSlug
        );
        return result[0]?.count || 0;
      })(),

      // 5. Get subscription info
      (async () => {
        const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "CowOsSubscription" WHERE "coworkingSlug" = $1`,
          auth.coworkingSlug
        );
        if (result.length === 0) {
          return { tier: 'none', maxMembers: 0, status: 'inactive' };
        }
        const sub = result[0];
        return {
          tier: sub.tier as string,
          maxMembers: sub.maxMembers as number,
          status: sub.status as string,
        };
      })(),
    ]);

    return NextResponse.json({
      members: memberStats,
      invoices: invoiceStats,
      revenue,
      plans: { active: plansCount },
      subscription: subscriptionInfo,
    });
  } catch (error) {
    console.error('GET dashboard error:', error);
    return NextResponse.json({ error: 'Chyba při načítání dashboardu' }, { status: 500 });
  }
}
