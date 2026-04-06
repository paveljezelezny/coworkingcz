/**
 * Runtime schema migration — runs before `next build` on Vercel.
 * Uses DIRECT_URL (port 5432) to bypass PgBouncer transaction-mode limits
 * that block DDL statements like ALTER TABLE.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});

const migrations = [
  // Add userId to Event table (was missing from initial deploy)
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "userId" TEXT`,
  // Add FK constraint if it doesn't already exist (safe — uses IF NOT EXISTS workaround)
  `DO $$
   BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'Event_userId_fkey'
     ) THEN
       ALTER TABLE "Event"
         ADD CONSTRAINT "Event_userId_fkey"
         FOREIGN KEY ("userId") REFERENCES "User"("id")
         ON DELETE SET NULL ON UPDATE CASCADE;
     END IF;
   END $$`,
];

async function run() {
  console.log('Running pre-build migrations...');
  for (const sql of migrations) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log('  ✓', sql.slice(0, 60).replace(/\s+/g, ' ').trim(), '...');
    } catch (err) {
      console.warn('  ⚠ Skipped:', err.message);
    }
  }
  console.log('Migrations done.');
}

run()
  .catch((e) => {
    console.error('Migration error (non-fatal):', e.message);
    process.exit(0); // don't block build
  })
  .finally(() => prisma.$disconnect());
