import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as const,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Next.js App Router — musí být raw body (ne JSON parse)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[stripe/webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  console.log(`[stripe/webhook] Event: ${event.type}`);

  try {
    switch (event.type) {

      // ── Checkout dokončen — aktivuj trial / členství ───────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ── Trial končí — informace, membership zůstane trial po dobu trialu ──
      case 'customer.subscription.trial_will_end': {
        const sub = event.data.object as Stripe.Subscription;
        console.log(`[stripe/webhook] Trial will end for subscription ${sub.id}`);
        // TODO: poslat email uživateli "Za 3 dny začne nabíhat platba"
        break;
      }

      // ── Subscription updated (cancel_at_period_end změna aj.) ─────────────
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(sub);
        break;
      }

      // ── Invoice zaplacena (obnova po trialu nebo měsíčně/ročně) ───────────
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleInvoicePaid(invoice);
        }
        break;
      }

      // ── Subscription zrušena / expirovala ──────────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(sub);
        break;
      }

      // ── Platba selhala ─────────────────────────────────────────────────────
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn(`[stripe/webhook] Payment failed for invoice ${invoice.id}`);
        // TODO: poslat email uživateli
        break;
      }

      default:
        console.log(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error('[stripe/webhook] Handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Handlers ─────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta      = session.metadata ?? {};
  const userEmail = meta.userEmail || session.customer_email;
  const plan      = meta.plan ?? '';

  if (!userEmail) {
    console.error('[stripe/webhook] No email in checkout session');
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  if (!user) {
    console.error(`[stripe/webhook] User not found for email: ${userEmail}`);
    return;
  }

  // Po checkout.session.completed v subscription+trial mode je subscription ve stavu trialing
  // Načteme subscription abychom dostali přesné datum konce trialu
  let trialEnd: Date | null = null;
  let periodEnd: Date | null = null;
  let interval = 'month';

  if (session.subscription) {
    try {
      const sub = await stripe.subscriptions.retrieve(String(session.subscription));
      if (sub.trial_end) trialEnd = new Date(sub.trial_end * 1000);
      if (sub.current_period_end) periodEnd = new Date(sub.current_period_end * 1000);
      const price = sub.items.data[0]?.price;
      interval = price?.recurring?.interval ?? 'month';
    } catch (e) {
      console.warn('[stripe/webhook] Could not retrieve subscription:', e);
    }
  }

  // V trialu: membershipEnd = datum konce trialu, tier = 'trial'
  // Bez trialu: membershipEnd = period_end, tier dle plánu
  const membershipEnd = trialEnd ?? periodEnd ?? (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  })();

  const tier = trialEnd ? 'trial' : tierFromPlan(plan, interval);

  await prisma.coworkerProfile.upsert({
    where:  { userId: user.id },
    create: {
      userId:          user.id,
      membershipTier:  tier,
      membershipStart: new Date(),
      membershipEnd,
      isPublic:        true,
    },
    update: {
      membershipTier:  tier,
      membershipStart: new Date(),
      membershipEnd,
    },
  });

  // Uložíme Stripe ID — silently fail pokud sloupce ještě neexistují
  await upsertStripeIds(user.id, {
    customerId:     session.customer ? String(session.customer) : undefined,
    subscriptionId: session.subscription ? String(session.subscription) : undefined,
    interval,
  });

  console.log(`[stripe/webhook] ✅ Activated ${tier} for ${userEmail} until ${membershipEnd.toISOString()}`);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // invoice.period_end = přesný konec nového předplaceného období dle Stripe
  const customerId = String(invoice.customer);
  const periodEnd  = invoice.period_end ? new Date(invoice.period_end * 1000) : null;
  if (!periodEnd) return;

  // Zjistíme interval z položek faktury
  let interval = 'month';
  try {
    const lines = (invoice as unknown as { lines?: { data?: Array<{ price?: { recurring?: { interval?: string } } }> } }).lines;
    interval = lines?.data?.[0]?.price?.recurring?.interval ?? 'month';
  } catch {}

  try {
    // Najdeme uživatele přes stripeCustomerId (raw SQL — sloupec nemusí existovat)
    const rows = await prisma.$queryRawUnsafe<{ userId: string; plan: string }[]>(
      `SELECT "userId", "membershipTier" AS plan FROM "CoworkerProfile" WHERE "stripeCustomerId" = $1 LIMIT 1`,
      customerId
    );

    if (rows.length === 0) {
      // Záloha: lookup přes Stripe customer email
      const customer = await stripe.customers.retrieve(customerId);
      if (customer.deleted) return;
      const email = customer.email;
      if (!email) return;
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return;

      const plan = 'coworker_monthly'; // default fallback
      const tier = tierFromPlan(plan, interval);
      await prisma.coworkerProfile.update({
        where: { userId: user.id },
        data: { membershipTier: tier, membershipEnd: periodEnd },
      });
      await upsertStripeIds(user.id, { customerId, interval });
      console.log(`[stripe/webhook] ✅ Renewed (by email) for ${email} until ${periodEnd.toISOString()}`);
      return;
    }

    const { userId, plan } = rows[0];
    const tier = tierFromPlan(plan, interval);
    await prisma.coworkerProfile.update({
      where: { userId },
      data: { membershipTier: tier, membershipEnd: periodEnd },
    });
    console.log(`[stripe/webhook] ✅ Renewed subscription for userId ${userId} until ${periodEnd.toISOString()}`);
  } catch (err) {
    console.error('[stripe/webhook] Renewal error:', err);
  }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription) {
  // Pokud je cancel_at_period_end=true → nezrušíme hned, jen informujeme
  // Pokud se změnil interval nebo plán → aktualizujeme tier
  const customerId = String(sub.customer);
  const periodEnd  = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null;
  if (!periodEnd) return;

  try {
    const rows = await prisma.$queryRawUnsafe<{ userId: string }[]>(
      `SELECT "userId" FROM "CoworkerProfile" WHERE "stripeCustomerId" = $1 LIMIT 1`,
      customerId
    );
    if (!rows.length) return;
    const { userId } = rows[0];

    const interval = sub.items.data[0]?.price?.recurring?.interval ?? 'month';
    const plan     = sub.metadata?.plan ?? 'coworker_monthly';
    const tier     = sub.status === 'trialing' ? 'trial' : tierFromPlan(plan, interval);

    await prisma.coworkerProfile.update({
      where: { userId },
      data: { membershipTier: tier, membershipEnd: periodEnd },
    });
    console.log(`[stripe/webhook] ✅ Updated subscription for userId ${userId} — tier ${tier}`);
  } catch (err) {
    console.error('[stripe/webhook] Update error:', err);
  }
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  const customerId = String(sub.customer);
  // Nastavíme konec na actual period_end (uživatel dočerpal co zaplatil)
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : new Date();

  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "CoworkerProfile"
       SET "membershipTier" = 'free', "membershipEnd" = $1, "stripeSubscriptionId" = NULL
       WHERE "stripeCustomerId" = $2`,
      periodEnd,
      customerId
    );
    console.log(`[stripe/webhook] ✅ Cancelled subscription for customer ${customerId}, active until ${periodEnd.toISOString()}`);
  } catch (err) {
    console.error('[stripe/webhook] Cancellation error:', err);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function tierFromPlan(plan: string, interval: string): string {
  if (interval === 'year' || plan.includes('yearly')) return 'yearly';
  if (plan.startsWith('coworking_')) return plan.replace('coworking_', '');
  return 'monthly';
}

async function upsertStripeIds(userId: string, opts: {
  customerId?: string;
  subscriptionId?: string;
  interval?: string;
}) {
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "CoworkerProfile"
       SET "stripeCustomerId"     = COALESCE($1, "stripeCustomerId"),
           "stripeSubscriptionId" = COALESCE($2, "stripeSubscriptionId"),
           "stripePlanInterval"   = COALESCE($3, "stripePlanInterval")
       WHERE "userId" = $4`,
      opts.customerId     ?? null,
      opts.subscriptionId ?? null,
      opts.interval       ?? null,
      userId
    );
  } catch {
    // Columns may not exist yet — silently ignore
  }
}
