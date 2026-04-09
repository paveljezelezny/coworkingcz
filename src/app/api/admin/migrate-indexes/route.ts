import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Temporary endpoint — run once to create DB indexes, then delete this file.
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
    // Account
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Account_userId_idx" ON "Account"("userId")`,
    // Session
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Session_userId_idx" ON "Session"("userId")`,
    // User
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_role_idx" ON "User"("role")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "User_createdAt_idx" ON "User"("createdAt")`,
    // CoworkerProfile
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkerProfile_isPublic_idx" ON "CoworkerProfile"("isPublic")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkerProfile_membershipTier_idx" ON "CoworkerProfile"("membershipTier")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkerProfile_membershipEnd_idx" ON "CoworkerProfile"("membershipEnd")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkerProfile_stripeCustomerId_idx" ON "CoworkerProfile"("stripeCustomerId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkerProfile_homeCoworkingSlug_idx" ON "CoworkerProfile"("homeCoworkingSlug")`,
    // FreeVisit
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "FreeVisit_profileId_idx" ON "FreeVisit"("profileId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "FreeVisit_coworkingSlug_idx" ON "FreeVisit"("coworkingSlug")`,
    // CoworkingClaim
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkingClaim_userId_idx" ON "CoworkingClaim"("userId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkingClaim_status_idx" ON "CoworkingClaim"("status")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkingClaim_coworkingSlug_idx" ON "CoworkingClaim"("coworkingSlug")`,
    // CoworkingEdit
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "CoworkingEdit_userId_idx" ON "CoworkingEdit"("userId")`,
    // Event
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_userId_idx" ON "Event"("userId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_coworkingSlug_idx" ON "Event"("coworkingSlug")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_startDate_idx" ON "Event"("startDate")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_isFree_idx" ON "Event"("isFree")`,
    // EventRegistration
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "EventRegistration_userId_idx" ON "EventRegistration"("userId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "EventRegistration_eventId_idx" ON "EventRegistration"("eventId")`,
    // Booking
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Booking_userId_idx" ON "Booking"("userId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Booking_coworkingSlug_idx" ON "Booking"("coworkingSlug")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Booking_status_idx" ON "Booking"("status")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "Booking_date_idx" ON "Booking"("date")`,
    // MarketplaceListing
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "MarketplaceListing_userId_idx" ON "MarketplaceListing"("userId")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "MarketplaceListing_isActive_idx" ON "MarketplaceListing"("isActive")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "MarketplaceListing_isActive_createdAt_idx" ON "MarketplaceListing"("isActive","createdAt")`,
    `CREATE INDEX CONCURRENTLY IF NOT EXISTS "MarketplaceListing_category_idx" ON "MarketplaceListing"("category")`,
  ];

  const results: { sql: string; ok: boolean; error?: string }[] = [];

  for (const sql of statements) {
    try {
      // CONCURRENTLY cannot run in a transaction, so each runs standalone
      await prisma.$executeRawUnsafe(sql);
      results.push({ sql, ok: true });
    } catch (err) {
      results.push({ sql, ok: false, error: String(err) });
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
