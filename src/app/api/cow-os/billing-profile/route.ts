import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner } from '@/lib/cow-os/auth';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const auth = await verifyCowOsOwner(slug);

  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const billingProfile = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsBillingProfile" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    const profile = billingProfile.length > 0 ? billingProfile[0] : null;
    return NextResponse.json(profile);
  } catch (error) {
    console.error('GET billing-profile error:', error);
    return NextResponse.json({ error: 'Chyba při načítání' }, { status: 500 });
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

    // Validate required fields
    const { companyName, ico, address, city, zip, bankAccount } = body;
    if (!companyName || !ico || !address || !city || !zip || !bankAccount) {
      return NextResponse.json(
        { error: 'Chybí povinná pole: companyName, ico, address, city, zip, bankAccount' },
        { status: 400 }
      );
    }

    const {
      dic = '',
      iban = '',
      isVatPayer = false,
      invoicePrefix = 'COWOS',
      nextInvoiceNumber = 1,
      logoUrl = '',
      courtRegistration = '',
    } = body;

    const id = randomUUID();
    const now = new Date().toISOString();

    // UPSERT: insert or update on conflict
    await prisma.$executeRawUnsafe(
      `INSERT INTO "CowOsBillingProfile"
       ("id", "coworkingSlug", "companyName", "ico", "dic", "address", "city", "zip",
        "bankAccount", "iban", "isVatPayer", "invoicePrefix", "nextInvoiceNumber",
        "logoUrl", "courtRegistration", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT ("coworkingSlug") DO UPDATE SET
       "companyName" = $3,
       "ico" = $4,
       "dic" = $5,
       "address" = $6,
       "city" = $7,
       "zip" = $8,
       "bankAccount" = $9,
       "iban" = $10,
       "isVatPayer" = $11,
       "invoicePrefix" = $12,
       "nextInvoiceNumber" = $13,
       "logoUrl" = $14,
       "courtRegistration" = $15,
       "updatedAt" = $17`,
      id,
      auth.coworkingSlug,
      companyName,
      ico,
      dic,
      address,
      city,
      zip,
      bankAccount,
      iban,
      isVatPayer,
      invoicePrefix,
      nextInvoiceNumber,
      logoUrl,
      courtRegistration,
      now,
      now
    );

    // Fetch and return the updated record
    const result = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT * FROM "CowOsBillingProfile" WHERE "coworkingSlug" = $1`,
      auth.coworkingSlug
    );

    const profile = result.length > 0 ? result[0] : null;
    return NextResponse.json(profile, { status: 200 });
  } catch (error) {
    console.error('PUT billing-profile error:', error);
    return NextResponse.json({ error: 'Chyba při ukládání' }, { status: 500 });
  }
}
