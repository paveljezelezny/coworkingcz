/**
 * Auto-migration: ensures all COW.OS tables exist.
 * Lightweight check first — only runs DDL if tables are actually missing.
 * IMPORTANT: Prisma $executeRawUnsafe supports only ONE statement per call.
 */
import { prisma } from '@/lib/prisma';

let tablesEnsured = false;

export async function ensureCowOsTables(): Promise<void> {
  if (tablesEnsured) return;

  // Quick check: does CowOsSubscription table exist?
  try {
    const result = await prisma.$queryRawUnsafe<{ exists: boolean }[]>(
      `SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'CowOsSubscription'
      ) as exists`
    );
    if (result[0]?.exists) {
      tablesEnsured = true;
      return;
    }
  } catch {
    // If even this check fails, continue to create tables
  }

  // Tables don't exist — create them one by one (Prisma requires single statements)
  const statements = [
    `CREATE TABLE IF NOT EXISTS "CowOsSubscription" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL UNIQUE,
      "userId" TEXT NOT NULL,
      "tier" TEXT NOT NULL DEFAULT 'free',
      "maxMembers" INTEGER NOT NULL DEFAULT 5,
      "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'active',
      "stripeSubscriptionId" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "currentPeriodEnd" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsBillingProfile" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL UNIQUE,
      "companyName" TEXT NOT NULL DEFAULT '',
      "ico" TEXT NOT NULL DEFAULT '',
      "dic" TEXT,
      "address" TEXT NOT NULL DEFAULT '',
      "city" TEXT NOT NULL DEFAULT '',
      "zip" TEXT NOT NULL DEFAULT '',
      "bankAccount" TEXT NOT NULL DEFAULT '',
      "iban" TEXT,
      "isVatPayer" BOOLEAN NOT NULL DEFAULT FALSE,
      "invoicePrefix" TEXT NOT NULL DEFAULT 'COWOS',
      "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
      "logoUrl" TEXT,
      "courtRegistration" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsMembershipPlan" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "basePrice" DOUBLE PRECISION NOT NULL,
      "billingInterval" TEXT NOT NULL DEFAULT 'monthly',
      "freeResourceHours" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("coworkingSlug", "name")
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsMember" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL,
      "userId" TEXT,
      "email" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "phone" TEXT,
      "company" TEXT,
      "ico" TEXT,
      "planId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'active',
      "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "endDate" TIMESTAMP(3),
      "nextRenewalDate" TIMESTAMP(3),
      "autoRenew" BOOLEAN NOT NULL DEFAULT TRUE,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("coworkingSlug", "email")
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsInvoice" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL,
      "memberId" TEXT NOT NULL,
      "invoiceNumber" TEXT NOT NULL,
      "issueDate" TIMESTAMP(3) NOT NULL,
      "dueDate" TIMESTAMP(3) NOT NULL,
      "paidDate" TIMESTAMP(3),
      "status" TEXT NOT NULL DEFAULT 'issued',
      "subtotal" DOUBLE PRECISION NOT NULL,
      "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "total" DOUBLE PRECISION NOT NULL,
      "currency" TEXT NOT NULL DEFAULT 'CZK',
      "items" JSONB NOT NULL,
      "supplierName" TEXT NOT NULL,
      "supplierIco" TEXT NOT NULL,
      "supplierDic" TEXT,
      "supplierAddress" TEXT NOT NULL,
      "recipientName" TEXT NOT NULL,
      "recipientIco" TEXT,
      "recipientAddress" TEXT,
      "bankAccount" TEXT NOT NULL,
      "iban" TEXT,
      "variableSymbol" TEXT NOT NULL,
      "qrPaymentCode" TEXT,
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsResource" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "capacity" INTEGER,
      "pricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "description" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsResourceBooking" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "coworkingSlug" TEXT NOT NULL,
      "resourceId" TEXT NOT NULL,
      "memberId" TEXT NOT NULL,
      "date" TIMESTAMP(3) NOT NULL,
      "startTime" TEXT NOT NULL,
      "endTime" TEXT NOT NULL,
      "durationMinutes" INTEGER NOT NULL,
      "isFreeQuota" BOOLEAN NOT NULL DEFAULT FALSE,
      "billableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "invoiceId" TEXT,
      "status" TEXT NOT NULL DEFAULT 'confirmed',
      "notes" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    // Indexes
    `CREATE INDEX IF NOT EXISTS "CowOsSubscription_userId_idx" ON "CowOsSubscription"("userId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_idx" ON "CowOsMember"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_status_idx" ON "CowOsMember"("coworkingSlug", "status")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_coworkingSlug_idx" ON "CowOsInvoice"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_memberId_idx" ON "CowOsInvoice"("memberId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMembershipPlan_coworkingSlug_idx" ON "CowOsMembershipPlan"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsResource_coworkingSlug_idx" ON "CowOsResource"("coworkingSlug")`,
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (err) {
      console.error('ensureCowOsTables statement failed:', sql.substring(0, 60), err);
      // Continue — other tables might succeed, and IF NOT EXISTS means re-runs are safe
    }
  }

  tablesEnsured = true;
}
