import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Temporary endpoint — run once to create COW.OS tables + all indexes.
// GET /api/admin/migrate-indexes
// Requires super_admin session.

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as Record<string, unknown>)?.role;
  if (role !== 'super_admin') {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const statements = [
    // ──────────────────────────────────────────────
    // COW.OS TABLES
    // ──────────────────────────────────────────────

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

    // ──────────────────────────────────────────────
    // COW.OS INDEXES
    // ──────────────────────────────────────────────
    `CREATE INDEX IF NOT EXISTS "CowOsSubscription_userId_idx" ON "CowOsSubscription"("userId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsSubscription_status_idx" ON "CowOsSubscription"("status")`,

    `CREATE INDEX IF NOT EXISTS "CowOsMembershipPlan_coworkingSlug_idx" ON "CowOsMembershipPlan"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMembershipPlan_coworkingSlug_isActive_idx" ON "CowOsMembershipPlan"("coworkingSlug", "isActive")`,

    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_idx" ON "CowOsMember"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_status_idx" ON "CowOsMember"("coworkingSlug", "status")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_coworkingSlug_nextRenewalDate_idx" ON "CowOsMember"("coworkingSlug", "nextRenewalDate")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_userId_idx" ON "CowOsMember"("userId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsMember_planId_idx" ON "CowOsMember"("planId")`,

    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_coworkingSlug_idx" ON "CowOsInvoice"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_coworkingSlug_status_idx" ON "CowOsInvoice"("coworkingSlug", "status")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_memberId_idx" ON "CowOsInvoice"("memberId")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_dueDate_idx" ON "CowOsInvoice"("dueDate")`,
    `CREATE INDEX IF NOT EXISTS "CowOsInvoice_invoiceNumber_idx" ON "CowOsInvoice"("invoiceNumber")`,

    `CREATE INDEX IF NOT EXISTS "CowOsResource_coworkingSlug_idx" ON "CowOsResource"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsResource_coworkingSlug_isActive_idx" ON "CowOsResource"("coworkingSlug", "isActive")`,

    `CREATE INDEX IF NOT EXISTS "CowOsResourceBooking_coworkingSlug_idx" ON "CowOsResourceBooking"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CowOsResourceBooking_resourceId_date_idx" ON "CowOsResourceBooking"("resourceId", "date")`,
    `CREATE INDEX IF NOT EXISTS "CowOsResourceBooking_memberId_date_idx" ON "CowOsResourceBooking"("memberId", "date")`,
    `CREATE INDEX IF NOT EXISTS "CowOsResourceBooking_invoiceId_idx" ON "CowOsResourceBooking"("invoiceId")`,

    // ──────────────────────────────────────────────
    // EXISTING TABLE INDEXES (from previous batch)
    // ──────────────────────────────────────────────
    `CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId")`,
    `CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,
    `CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role")`,
    `CREATE INDEX IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt")`,
    `CREATE INDEX IF NOT EXISTS "CoworkerProfile_isPublic_idx" ON "CoworkerProfile"("isPublic")`,
    `CREATE INDEX IF NOT EXISTS "CoworkerProfile_membershipTier_idx" ON "CoworkerProfile"("membershipTier")`,
    `CREATE INDEX IF NOT EXISTS "CoworkerProfile_membershipEnd_idx" ON "CoworkerProfile"("membershipEnd")`,
    `CREATE INDEX IF NOT EXISTS "CoworkerProfile_stripeCustomerId_idx" ON "CoworkerProfile"("stripeCustomerId")`,
    `CREATE INDEX IF NOT EXISTS "CoworkerProfile_homeCoworkingSlug_idx" ON "CoworkerProfile"("homeCoworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "FreeVisit_profileId_idx" ON "FreeVisit"("profileId")`,
    `CREATE INDEX IF NOT EXISTS "FreeVisit_coworkingSlug_idx" ON "FreeVisit"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CoworkingClaim_userId_idx" ON "CoworkingClaim"("userId")`,
    `CREATE INDEX IF NOT EXISTS "CoworkingClaim_status_idx" ON "CoworkingClaim"("status")`,
    `CREATE INDEX IF NOT EXISTS "CoworkingClaim_coworkingSlug_idx" ON "CoworkingClaim"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "CoworkingEdit_userId_idx" ON "CoworkingEdit"("userId")`,
    `CREATE INDEX IF NOT EXISTS "Event_userId_idx" ON "Event"("userId")`,
    `CREATE INDEX IF NOT EXISTS "Event_coworkingSlug_idx" ON "Event"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate")`,
    `CREATE INDEX IF NOT EXISTS "Event_isFree_idx" ON "Event"("isFree")`,
    `CREATE INDEX IF NOT EXISTS "EventRegistration_userId_idx" ON "EventRegistration"("userId")`,
    `CREATE INDEX IF NOT EXISTS "EventRegistration_eventId_idx" ON "EventRegistration"("eventId")`,
    `CREATE INDEX IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId")`,
    `CREATE INDEX IF NOT EXISTS "Booking_coworkingSlug_idx" ON "Booking"("coworkingSlug")`,
    `CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status")`,
    `CREATE INDEX IF NOT EXISTS "Booking_date_idx" ON "Booking"("date")`,
    `CREATE INDEX IF NOT EXISTS "MarketplaceListing_userId_idx" ON "MarketplaceListing"("userId")`,
    `CREATE INDEX IF NOT EXISTS "MarketplaceListing_isActive_idx" ON "MarketplaceListing"("isActive")`,
    `CREATE INDEX IF NOT EXISTS "MarketplaceListing_isActive_createdAt_idx" ON "MarketplaceListing"("isActive","createdAt")`,
    `CREATE INDEX IF NOT EXISTS "MarketplaceListing_category_idx" ON "MarketplaceListing"("category")`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      results.push({ sql: sql.substring(0, 80) + '...', ok: true });
    } catch (err) {
      results.push({ sql: sql.substring(0, 80) + '...', ok: false, error: String(err) });
    }
  }

  const failed = results.filter((r) => !r.ok);
  return NextResponse.json({
    total: results.length,
    ok: results.filter((r) => r.ok).length,
    failed: failed.length,
    errors: failed,
  });
}
