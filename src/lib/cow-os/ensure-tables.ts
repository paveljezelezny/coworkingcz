/**
 * Auto-migration: ensures all COW.OS tables exist.
 * Called lazily on first COW.OS activation — no manual migration needed.
 * Uses CREATE TABLE IF NOT EXISTS so it's safe to call repeatedly.
 */
import { prisma } from '@/lib/prisma';

let tablesEnsured = false;

export async function ensureCowOsTables(): Promise<void> {
  // Skip if already verified in this process lifecycle
  if (tablesEnsured) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS "CowOsSubscription" (
      "id" TEXT NOT NULL,
      "coworkingSlug" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "tier" TEXT NOT NULL DEFAULT 'free',
      "maxMembers" INTEGER NOT NULL DEFAULT 5,
      "monthlyPrice" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'active',
      "stripeSubscriptionId" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "currentPeriodEnd" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CowOsSubscription_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "CowOsSubscription_coworkingSlug_key" ON "CowOsSubscription"("coworkingSlug")`,

    `CREATE TABLE IF NOT EXISTS "CowOsBillingProfile" (
      "id" TEXT NOT NULL,
      "coworkingSlug" TEXT NOT NULL,
      "companyName" TEXT NOT NULL,
      "ico" TEXT NOT NULL,
      "dic" TEXT,
      "address" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "zip" TEXT NOT NULL,
      "bankAccount" TEXT NOT NULL,
      "iban" TEXT,
      "isVatPayer" BOOLEAN NOT NULL DEFAULT FALSE,
      "invoicePrefix" TEXT NOT NULL DEFAULT 'COWOS',
      "nextInvoiceNumber" INTEGER NOT NULL DEFAULT 1,
      "logoUrl" TEXT,
      "courtRegistration" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CowOsBillingProfile_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "CowOsBillingProfile_coworkingSlug_key" ON "CowOsBillingProfile"("coworkingSlug")`,

    `CREATE TABLE IF NOT EXISTS "CowOsMembershipPlan" (
      "id" TEXT NOT NULL,
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
      CONSTRAINT "CowOsMembershipPlan_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "CowOsMembershipPlan_coworkingSlug_name_key" ON "CowOsMembershipPlan"("coworkingSlug", "name")`,

    `CREATE TABLE IF NOT EXISTS "CowOsMember" (
      "id" TEXT NOT NULL,
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
      CONSTRAINT "CowOsMember_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_email_key" ON "CowOsMember"("coworkingSlug", "email")`,

    `CREATE TABLE IF NOT EXISTS "CowOsInvoice" (
      "id" TEXT NOT NULL,
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
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CowOsInvoice_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsResource" (
      "id" TEXT NOT NULL,
      "coworkingSlug" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "capacity" INTEGER,
      "pricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "description" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CowOsResource_pkey" PRIMARY KEY ("id")
    )`,

    `CREATE TABLE IF NOT EXISTS "CowOsResourceBooking" (
      "id" TEXT NOT NULL,
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
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "CowOsResourceBooking_pkey" PRIMARY KEY ("id")
    )`,

    // Key indexes
    `CREATE INDEX IF NOT EXISTS "CowOsSubscription_userId_idx" ON "CowOsSubscription"("userId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_idx" ON "CowOsMember"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_status_idx" ON "CowOsMember"("coworkingSlug", "status")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_coworkingSlug_idx" ON "CowOsInvoice"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_memberId_idx" ON "CowOsInvoice"("memberId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMembershipPlan_coworkingSlug_idx" ON "CowOsMembershipPlan"("coworkingSlug")`,
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
  }

  tablesEnsured = true;
}
