import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as const,
});

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nejsi přihlášen' }, { status: 401 });
    }

    // Najdeme stripeCustomerId z DB pokud existuje
    let customerId: string | null = null;
    try {
      const rows = await prisma.$queryRawUnsafe<{ id: string | null }[]>(
        `SELECT "stripeCustomerId" AS id FROM "CoworkerProfile" cp
         JOIN "User" u ON u.id = cp."userId"
         WHERE u.email = $1 LIMIT 1`,
        session.user.email
      );
      customerId = rows[0]?.id ?? null;
    } catch {
      // Sloupec neexistuje ještě — fallback na email lookup
    }

    // Pokud nemáme customerId, hledáme zákazníka ve Stripe podle emailu
    if (!customerId) {
      const customers = await stripe.customers.list({ email: session.user.email, limit: 1 });
      customerId = customers.data[0]?.id ?? null;
    }

    if (!customerId) {
      return NextResponse.json({ invoices: [], subscription: null });
    }

    // Načteme faktury (max 50) a aktuální subscription
    const [invoicesRes, subscriptionsRes] = await Promise.all([
      stripe.invoices.list({ customer: customerId, limit: 50, status: 'paid' }),
      stripe.subscriptions.list({ customer: customerId, limit: 1 }),
    ]);

    const invoices = invoicesRes.data.map(inv => ({
      id:          inv.id,
      number:      inv.number,
      amount:      inv.amount_paid,         // v haléřích (CZK * 100)
      currency:    inv.currency.toUpperCase(),
      status:      inv.status,
      date:        inv.created,             // unix timestamp
      periodStart: inv.period_start,
      periodEnd:   inv.period_end,
      description: inv.lines?.data?.[0]?.description ?? null,
      pdfUrl:      inv.invoice_pdf,         // Stripe hosted PDF
    }));

    const sub = subscriptionsRes.data[0] ?? null;
    const subscription = sub ? {
      id:                sub.id,
      status:            sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd:  sub.current_period_end,
      trialEnd:          sub.trial_end,
      interval:          sub.items.data[0]?.price?.recurring?.interval ?? null,
    } : null;

    return NextResponse.json({ invoices, subscription });
  } catch (err) {
    console.error('[stripe/invoices] Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
