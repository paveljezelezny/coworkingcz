import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner, verifyAuthenticated } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';
import { generateSpayd, czechAccountToIban } from '@/lib/cow-os/spayd';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const member = req.nextUrl.searchParams.get('member');
  const status = req.nextUrl.searchParams.get('status');
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1', 10);
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);

  try {
    await ensureCowOsTables();
    let whereClause = '';
    const params: unknown[] = [];

    if (member === 'true') {
      // Coworker view: must be authenticated, show only their invoices
      const auth = await verifyAuthenticated();
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      whereClause = `WHERE m."userId" = $1`;
      params.push(auth.userId);

      if (status) {
        whereClause += ` AND i."status" = $${params.length + 1}`;
        params.push(status);
      }

      // Count total
      const countResult = await prisma.$queryRawUnsafe<{ count: string }[]>(
        `SELECT COUNT(*)::int as count FROM "CowOsInvoice" i
         JOIN "CowOsMember" m ON i."memberId" = m."id"
         ${whereClause}`,
        ...params
      );
      const total = countResult.length > 0 ? Number(countResult[0].count) : 0;

      // Fetch invoices with pagination
      const offset = (page - 1) * limit;
      const invoices = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT i.*,
                m."name" as "memberName",
                m."email" as "memberEmail"
         FROM "CowOsInvoice" i
         JOIN "CowOsMember" m ON i."memberId" = m."id"
         ${whereClause}
         ORDER BY i."issueDate" DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        ...params,
        limit,
        offset
      );

      const pages = Math.ceil(total / limit);
      return NextResponse.json({
        invoices,
        total,
        page,
        limit,
        pages,
      });
    } else {
      // Owner view: require verifyCowOsOwner with slug
      const auth = await verifyCowOsOwner(slug);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      whereClause = `WHERE i."coworkingSlug" = $1`;
      params.push(auth.coworkingSlug);

      if (status) {
        whereClause += ` AND i."status" = $${params.length + 1}`;
        params.push(status);
      }

      // Count total
      const countResult = await prisma.$queryRawUnsafe<{ count: string }[]>(
        `SELECT COUNT(*) as count FROM "CowOsInvoice" i ${whereClause}`,
        ...params
      );
      const total = countResult.length > 0 ? Number(countResult[0].count) : 0;

      // Fetch invoices with pagination
      const offset = (page - 1) * limit;
      const invoices = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT i.*,
                m."name" as "memberName",
                m."email" as "memberEmail"
         FROM "CowOsInvoice" i
         JOIN "CowOsMember" m ON i."memberId" = m."id"
         ${whereClause}
         ORDER BY i."issueDate" DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        ...params,
        limit,
        offset
      );

      const pages = Math.ceil(total / limit);
      return NextResponse.json({
        invoices,
        total,
        page,
        limit,
        pages,
      });
    }
  } catch (error) {
    console.error('GET invoices error:', error);
    return NextResponse.json({ error: 'Chyba při načítání faktur' }, { status: 500 });
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
    const { memberId, items, notes = '' } = body;

    if (!memberId) {
      return NextResponse.json({ error: 'Chybí memberId' }, { status: 400 });
    }

    // Fetch member
    const memberResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsMember" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      memberId,
      auth.coworkingSlug
    );

    if (memberResult.length === 0) {
      return NextResponse.json({ error: 'Člen nenalezen' }, { status: 404 });
    }

    const member = memberResult[0];

    // Fetch billing profile
    const billingResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsBillingProfile" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    if (billingResult.length === 0) {
      return NextResponse.json(
        { error: 'Nejprve vyplňte fakturační údaje' },
        { status: 400 }
      );
    }

    const billing = billingResult[0];

    // Determine items
    let invoiceItems = items;
    if (!items || items.length === 0) {
      // Auto-generate from member's plan
      const planResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
        `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1`,
        member.planId
      );

      if (planResult.length === 0) {
        return NextResponse.json({ error: 'Plán člena nenalezen' }, { status: 404 });
      }

      const plan = planResult[0];
      const planName = plan.name as string;
      const billingInterval = plan.billingInterval as string;
      const basePrice = plan.basePrice as number;

      invoiceItems = [
        {
          description: `Členství: ${planName} (${billingInterval === 'yearly' ? 'roční' : 'měsíční'})`,
          quantity: 1,
          unitPrice: basePrice,
        },
      ];
    }

    // Calculate totals
    const subtotal = invoiceItems.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = (billing.isVatPayer as boolean) ? 0.21 : 0;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Generate invoice number
    const nextInvoiceNumber = (billing.nextInvoiceNumber as number) + 1;
    const invoicePrefix = billing.invoicePrefix as string;
    const invoiceNumber = `${invoicePrefix}-${String(nextInvoiceNumber).padStart(3, '0')}`;

    // Generate variable symbol
    const year = new Date().getFullYear();
    const variableSymbol = `${year}${String(nextInvoiceNumber).padStart(3, '0')}`;

    // Convert bank account to IBAN if needed
    let iban = billing.iban as string | null;
    if (!iban && billing.bankAccount) {
      iban = czechAccountToIban(billing.bankAccount as string) || '';
    }

    // Generate SPAYD QR code
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const spaydString = iban
      ? generateSpayd({
          iban,
          amount: total,
          currency: 'CZK',
          variableSymbol,
          message: invoiceNumber,
          dueDate,
          recipientName: (billing.companyName as string).substring(0, 35),
        })
      : '';

    // Insert invoice
    const id = randomUUID();
    const now = new Date();
    const issueDate = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO "CowOsInvoice"
       ("id", "coworkingSlug", "memberId", "invoiceNumber", "issueDate", "dueDate",
        "status", "subtotal", "taxRate", "taxAmount", "total", "currency", "items",
        "supplierName", "supplierIco", "supplierDic", "supplierAddress",
        "recipientName", "recipientIco", "recipientAddress",
        "bankAccount", "iban", "variableSymbol", "qrPaymentCode", "notes", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
      id,
      auth.coworkingSlug,
      memberId,
      invoiceNumber,
      issueDate,
      dueDate,
      'draft',
      subtotal,
      taxRate,
      taxAmount,
      total,
      'CZK',
      JSON.stringify(invoiceItems),
      billing.companyName,
      billing.ico,
      billing.dic,
      billing.address,
      member.name,
      member.ico || null,
      member.company || null,
      billing.bankAccount || null,
      iban || null,
      variableSymbol,
      spaydString || null,
      notes,
      now
    );

    // Increment nextInvoiceNumber in billing profile
    await prisma.$executeRawUnsafe(
      `UPDATE "CowOsBillingProfile" SET "nextInvoiceNumber" = $1 WHERE "coworkingSlug" = $2`,
      nextInvoiceNumber,
      auth.coworkingSlug
    );

    // Fetch and return the created invoice
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsInvoice" WHERE "id" = $1`,
      id
    );

    const invoice = result.length > 0 ? result[0] : null;
    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('POST invoice error:', error);
    return NextResponse.json({ error: 'Chyba při vytváření faktury' }, { status: 500 });
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
    const { id, status, paidDate } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Chybí id nebo status' }, { status: 400 });
    }

    // Fetch current invoice
    const invoiceResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsInvoice" WHERE "id" = $1 AND "coworkingSlug" = $2`,
      id,
      auth.coworkingSlug
    );

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: 'Faktura nenalezena' }, { status: 404 });
    }

    const invoice = invoiceResult[0];
    const currentStatus = invoice.status as string;

    // Validate status transitions
    const validTransitions: { [key: string]: string[] } = {
      draft: ['issued'],
      issued: ['paid', 'cancelled'],
      overdue: ['paid'],
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return NextResponse.json(
        { error: `Nelze převést ze ${currentStatus} na ${status}` },
        { status: 400 }
      );
    }

    const now = new Date();

    // CowOsInvoice has no updatedAt — just update status and optionally paidDate
    if (status === 'paid') {
      const pd = paidDate ? new Date(paidDate) : now;
      await prisma.$executeRawUnsafe(
        `UPDATE "CowOsInvoice" SET "status" = $1, "paidDate" = $2 WHERE "id" = $3 AND "coworkingSlug" = $4`,
        status, pd, id, auth.coworkingSlug
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE "CowOsInvoice" SET "status" = $1 WHERE "id" = $2 AND "coworkingSlug" = $3`,
        status, id, auth.coworkingSlug
      );
    }

    // Fetch and return the updated invoice
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsInvoice" WHERE "id" = $1`,
      id
    );

    const updated = result.length > 0 ? result[0] : null;
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('PUT invoice error:', error);
    return NextResponse.json({ error: 'Chyba při aktualizaci faktury' }, { status: 500 });
  }
}
