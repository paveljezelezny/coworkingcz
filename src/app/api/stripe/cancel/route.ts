import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as const,
});

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nejsi přihlášen' }, { status: 401 });
    }

    // Najdeme subscription ID z DB nebo přes Stripe email lookup
    let subscriptionId: string | null = null;
    try {
      const rows = await prisma.$queryRawUnsafe<{ subId: string | null }[]>(
        `SELECT "stripeSubscriptionId" AS "subId" FROM "CoworkerProfile" cp
         JOIN "User" u ON u.id = cp."userId"
         WHERE u.email = $1 LIMIT 1`,
        session.user.email
      );
      subscriptionId = rows[0]?.subId ?? null;
    } catch {
      // Sloupec neexistuje — fallback
    }

    // Fallback: hledáme přes Stripe customers
    if (!subscriptionId) {
      const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
      const customerId = customers.data[0]?.id;
      if (customerId) {
        const subs = await stripe.subscriptions.list({ customer: customerId, status: 'active', limit: 1 });
        subscriptionId = subs.data[0]?.id ?? null;
        // Zkusíme i trialing
        if (!subscriptionId) {
          const trialSubs = await stripe.subscriptions.list({ customer: customerId, status: 'trialing', limit: 1 });
          subscriptionId = trialSubs.data[0]?.id ?? null;
        }
      }
    }

    if (!subscriptionId) {
      return NextResponse.json({ error: 'Aktivní předplatné nenalezeno' }, { status: 404 });
    }

    // Zrušíme NA KONCI AKTUÁLNÍHO OBDOBÍ — ne okamžitě
    // Uživatel dočerpá co zaplatil (nebo trial doběhne)
    const cancelled = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    const endsAt = cancelled.cancel_at
      ? new Date(cancelled.cancel_at * 1000).toISOString()
      : cancelled.current_period_end
        ? new Date(cancelled.current_period_end * 1000).toISOString()
        : null;

    console.log(`[stripe/cancel] Subscription ${subscriptionId} set to cancel at period end (${endsAt})`);

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      endsAt,
    });
  } catch (err) {
    console.error('[stripe/cancel] Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
