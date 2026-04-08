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

      // ── Platba úspěšná — aktivuj členství ──────────────────────────────
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ── Subscription obnovena / zaplacena ──────────────────────────────
      case 'invoice.payment_succeeded': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const invoice = event.data.object as any;
        if (invoice.subscription || invoice.customer) {
          await handleSubscriptionRenewed(invoice);
        }
        break;
      }

      // ── Subscription zrušena / expirovala ──────────────────────────────
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(sub);
        break;
      }

      // ── Platba selhala ─────────────────────────────────────────────────
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

  const { tier, start, end } = planDates(plan);

  // Upsert CoworkerProfile s novým členstvím
  await prisma.coworkerProfile.upsert({
    where:  { userId: user.id },
    create: {
      userId:          user.id,
      membershipTier:  tier,
      membershipStart: start,
      membershipEnd:   end,
      isPublic:        true,
    },
    update: {
      membershipTier:  tier,
      membershipStart: start,
      membershipEnd:   end,
    },
  });

  // Ulož stripeCustomerId a subscriptionId pro budoucí použití (raw SQL — nové sloupce)
  if (session.customer || session.subscription) {
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "CoworkerProfile"
         SET "stripeCustomerId"    = COALESCE($1, "stripeCustomerId"),
             "stripeSubscriptionId" = COALESCE($2, "stripeSubscriptionId")
         WHERE "userId" = $3`,
        session.customer  ? String(session.customer)     : null,
        session.subscription ? String(session.subscription) : null,
        user.id
      );
    } catch {
      // Sloupce ještě neexistují — ensureColumns je přidá při prvním volání profile API
    }
  }

  console.log(`[stripe/webhook] ✅ Activated ${tier} for ${userEmail} until ${end.toISOString()}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleSubscriptionRenewed(invoice: any) {
  // Najdi uživatele přes stripeCustomerId (raw SQL)
  const customerId = String(invoice.customer);
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT cp."userId", cp."membershipTier" AS plan
       FROM "CoworkerProfile" cp
       WHERE cp."stripeCustomerId" = $1
       LIMIT 1`,
      customerId
    );
    const typedRows = rows as { userId: string; plan: string }[];
    if (!typedRows.length) return;
    const { userId, plan } = typedRows[0];
    const { end } = planDates(plan);
    await prisma.coworkerProfile.update({
      where: { userId },
      data:  { membershipEnd: end },
    });
    console.log(`[stripe/webhook] ✅ Renewed subscription for userId ${userId}`);
  } catch (err) {
    console.error('[stripe/webhook] Renewal error:', err);
  }
}

async function handleSubscriptionCancelled(sub: Stripe.Subscription) {
  const customerId = String(sub.customer);
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "CoworkerProfile"
       SET "membershipTier" = 'free', "membershipEnd" = NOW()
       WHERE "stripeCustomerId" = $1`,
      customerId
    );
    console.log(`[stripe/webhook] ✅ Cancelled subscription for customer ${customerId}`);
  } catch (err) {
    console.error('[stripe/webhook] Cancellation error:', err);
  }
}

// ── Helper: vypočítá tier + datum konce podle plan klíče ─────────────────────

function planDates(plan: string): { tier: string; start: Date; end: Date } {
  const start = new Date();
  const end   = new Date();

  if (plan.includes('yearly') || plan === 'coworker_yearly') {
    end.setFullYear(end.getFullYear() + 1);
    return { tier: 'yearly', start, end };
  }

  if (plan === 'coworker_monthly') {
    end.setMonth(end.getMonth() + 1);
    return { tier: 'monthly', start, end };
  }

  if (plan.startsWith('coworking_')) {
    end.setMonth(end.getMonth() + 1);
    return { tier: plan.replace('coworking_', ''), start, end };
  }

  // fallback
  end.setMonth(end.getMonth() + 1);
  return { tier: 'monthly', start, end };
}
