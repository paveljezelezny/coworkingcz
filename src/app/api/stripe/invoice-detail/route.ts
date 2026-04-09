import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia' as const,
});

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Nejsi přihlášen' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get('id');
    if (!invoiceId) {
      return NextResponse.json({ error: 'Chybí ID faktury' }, { status: 400 });
    }

    const invoice = await stripe.invoices.retrieve(invoiceId, {
      expand: ['customer'],
    });

    // Bezpečnostní kontrola — faktura musí patřit přihlášenému uživateli
    const customer = invoice.customer as Stripe.Customer | null;
    if (customer && !customer.deleted && customer.email !== session.user.email) {
      return NextResponse.json({ error: 'Přístup odepřen' }, { status: 403 });
    }

    return NextResponse.json({
      id:          invoice.id,
      number:      invoice.number,
      amount:      invoice.amount_paid,
      currency:    invoice.currency.toUpperCase(),
      status:      invoice.status,
      date:        invoice.created,
      periodStart: invoice.period_start,
      periodEnd:   invoice.period_end,
      description: invoice.lines?.data?.[0]?.description ?? null,
      pdfUrl:      invoice.invoice_pdf,
      customerName:    customer && !customer.deleted ? customer.name : null,
      customerEmail:   customer && !customer.deleted ? customer.email : session.user.email,
      customerAddress: customer && !customer.deleted && customer.address
        ? [customer.address.line1, customer.address.postal_code, customer.address.city].filter(Boolean).join(', ')
        : null,
    });
  } catch (err) {
    console.error('[stripe/invoice-detail] Error:', err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
