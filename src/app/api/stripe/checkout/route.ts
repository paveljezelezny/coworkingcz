import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as const,
});

// Map plan keys → Stripe price IDs (set via env vars)
const PRICE_MAP: Record<string, string | undefined> = {
  coworker_monthly:   process.env.STRIPE_PRICE_COWORKER_MONTHLY,
  coworker_yearly:    process.env.STRIPE_PRICE_COWORKER_YEARLY,
  coworking_small:    process.env.STRIPE_PRICE_COWORKING_SMALL,
  coworking_medium:   process.env.STRIPE_PRICE_COWORKING_MEDIUM,
  coworking_large:    process.env.STRIPE_PRICE_COWORKING_LARGE,
};

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nejsi přihlášen' }, { status: 401 });
    }

    const body = await req.json();
    const { plan } = body as { plan: string };

    const priceId = PRICE_MAP[plan];
    if (!priceId) {
      return NextResponse.json(
        { error: `Neznámý plán: ${plan}. Zkontroluj STRIPE_PRICE_* env vars.` },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'https://coworkingcz.vercel.app';

    // Find or create Stripe customer for this email so invoices are linked correctly
    let customerId: string | undefined;
    try {
      const existing = await stripe.customers.list({ email: session.user.email, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const newCustomer = await stripe.customers.create({
          email: session.user.email,
          name: session.user.name || undefined,
          metadata: { userId: session.user.id || '' },
        });
        customerId = newCustomer.id;
      }
    } catch {
      // Non-fatal — checkout will create a customer automatically if this fails
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(customerId ? { customer: customerId } : { customer_email: session.user.email }),
      // Metadata pro webhook — identifikace uživatele a plánu
      metadata: {
        userId:    session.user.id || '',
        userEmail: session.user.email,
        plan,
      },
      subscription_data: {
        // ── 30 dní trial zdarma, kartou se to ověří hned, strhne po trialu ──
        trial_period_days: 30,
        metadata: {
          userId:    session.user.id || '',
          userEmail: session.user.email,
          plan,
        },
      },
      success_url: `${baseUrl}/profil?payment=success&plan=${plan}`,
      cancel_url:  `${baseUrl}/ceniky?payment=cancelled`,
      locale: 'cs',
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[stripe/checkout] Error:', err);
    const message = err instanceof Error ? err.message : 'Neznámá chyba';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
