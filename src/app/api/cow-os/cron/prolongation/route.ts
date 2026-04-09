import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateSpayd, czechAccountToIban } from '@/lib/cow-os/spayd';
import { randomUUID } from 'crypto';

/**
 * Daily prolongation engine for auto-renewing members.
 * Secured by checking Authorization: Bearer {CRON_SECRET} header OR super_admin session.
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication: either CRON_SECRET header or super_admin session
    const authHeader = req.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      // Valid cron secret
    } else {
      // Check session
      const session = await getServerSession(authOptions);
      const role = (session?.user as Record<string, unknown>)?.role as string | undefined;
      if (role !== 'super_admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const processed: string[] = [];
    const invoicesGenerated: string[] = [];
    const errors: { memberId: string; error: string }[] = [];

    // 1. Find all auto-renewing members due for renewal
    const members = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT m.* FROM "CowOsMember" m
       WHERE m."autoRenew" = true
       AND m."nextRenewalDate" <= NOW()
       AND m."status" = 'active'`
    );

    for (const member of members) {
      const memberId = member.id as string;
      const coworkingSlug = member.coworkingSlug as string;
      const planId = member.planId as string;
      const currentEndDate = new Date(member.endDate as string);

      try {
        // Fetch plan
        const planResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "CowOsMembershipPlan" WHERE "id" = $1`,
          planId
        );

        if (planResult.length === 0) {
          throw new Error('Plan not found');
        }

        const plan = planResult[0];
        const planName = plan.name as string;
        const billingInterval = plan.billingInterval as string;
        const basePrice = plan.basePrice as number;

        // Fetch billing profile
        const billingResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
          `SELECT * FROM "CowOsBillingProfile" WHERE "coworkingSlug" = $1`,
          coworkingSlug
        );

        if (billingResult.length === 0) {
          throw new Error('Billing profile not found');
        }

        const billing = billingResult[0];

        // Calculate new dates
        const newEndDate = new Date(currentEndDate);
        if (billingInterval === 'yearly') {
          newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        } else {
          // Default: monthly (30 days)
          newEndDate.setDate(newEndDate.getDate() + 30);
        }
        const newNextRenewalDate = new Date(newEndDate);

        // Update member dates
        const now = new Date().toISOString();
        await prisma.$executeRawUnsafe(
          `UPDATE "CowOsMember"
           SET "endDate" = $1, "nextRenewalDate" = $2, "updatedAt" = $3
           WHERE "id" = $4`,
          newEndDate.toISOString(),
          newNextRenewalDate.toISOString(),
          now,
          memberId
        );

        // Generate invoice
        const invoiceItems = [
          {
            description: `Členství: ${planName} (${billingInterval === 'yearly' ? 'roční' : 'měsíční'})`,
            quantity: 1,
            unitPrice: basePrice,
          },
        ];

        const subtotal = basePrice;
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
        const invoiceId = randomUUID();
        const issueDate = new Date().toISOString();

        await prisma.$executeRawUnsafe(
          `INSERT INTO "CowOsInvoice"
           ("id", "coworkingSlug", "memberId", "invoiceNumber", "issueDate", "dueDate",
            "status", "subtotal", "taxRate", "taxAmount", "total", "currency", "items",
            "supplierName", "supplierIco", "supplierDic", "supplierAddress",
            "recipientName", "recipientIco", "recipientAddress",
            "bankAccount", "iban", "variableSymbol", "qrPaymentCode", "notes", "createdAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)`,
          invoiceId,
          coworkingSlug,
          memberId,
          invoiceNumber,
          issueDate,
          dueDate.toISOString(),
          'issued',
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
          `Auto-renewal invoice for ${planName}`,
          now
        );

        // Increment nextInvoiceNumber in billing profile
        await prisma.$executeRawUnsafe(
          `UPDATE "CowOsBillingProfile" SET "nextInvoiceNumber" = $1 WHERE "coworkingSlug" = $2`,
          nextInvoiceNumber,
          coworkingSlug
        );

        processed.push(memberId);
        invoicesGenerated.push(invoiceId);
      } catch (error) {
        console.error(`Error processing member ${memberId}:`, error);
        errors.push({
          memberId,
          error: (error as Error).message || 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      processed: processed.length,
      invoicesGenerated: invoicesGenerated.length,
      errors,
    });
  } catch (error) {
    console.error('Cron prolongation error:', error);
    return NextResponse.json({ error: 'Chyba při běhu prolongace' }, { status: 500 });
  }
}
