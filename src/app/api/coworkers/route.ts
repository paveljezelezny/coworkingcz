import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseSkills(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try {
    const parsed = JSON.parse(String(raw));
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return String(raw).split(',').map(s => s.trim()).filter(Boolean);
  }
}

function str(v: unknown): string {
  return v ? String(v) : '';
}

function bool(v: unknown, defaultVal = false): boolean {
  if (v === null || v === undefined) return defaultVal;
  return Boolean(v);
}

// ─── Ensure new columns exist ─────────────────────────────────────────────────

async function ensureColumns() {
  const ddl = [
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "homeCoworkingSlug" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "company" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhonePublic" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isEmailPublic" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhotoPublic" BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "allowContact" BOOLEAN NOT NULL DEFAULT false`,
  ];
  for (const sql of ddl) {
    try { await prisma.$executeRawUnsafe(sql); } catch { /* already exists */ }
  }
}

// ─── GET /api/coworkers ───────────────────────────────────────────────────────

export async function GET() {
  try {
    // Step 1: ensure new columns
    await ensureColumns();

    // Step 2: try full query (all new columns)
    let rows: Record<string, unknown>[] = [];

    try {
      rows = (await prisma.$queryRawUnsafe(`
        SELECT
          cp.id,
          cp.name,
          cp.profession,
          cp.bio,
          cp.skills,
          cp."linkedinUrl",
          cp."websiteUrl",
          cp."membershipTier",
          COALESCE(cp."isPublic", true)        AS "isPublic",
          cp."homeCoworkingSlug",
          cp.phone,
          cp.company,
          COALESCE(cp."isPhonePublic", false)  AS "isPhonePublic",
          COALESCE(cp."isEmailPublic", false)  AS "isEmailPublic",
          COALESCE(cp."isPhotoPublic", true)   AS "isPhotoPublic",
          COALESCE(cp."allowContact", false)   AS "allowContact",
          cp."avatarUrl",
          u.email                              AS "userEmail",
          u.image                              AS "userImage"
        FROM "CoworkerProfile" cp
        INNER JOIN "User" u ON u.id = cp."userId"
        WHERE COALESCE(cp."isPublic", true) = true
          AND cp."membershipTier" IS NOT NULL
          AND cp."membershipTier" NOT IN ('free')
        ORDER BY cp.name ASC NULLS LAST
      `)) as Record<string, unknown>[];
    } catch {
      // Step 3: fallback — new columns missing, use only guaranteed columns
      try {
        rows = (await prisma.$queryRawUnsafe(`
          SELECT
            cp.id,
            cp.name,
            cp.profession,
            cp.bio,
            cp.skills,
            cp."linkedinUrl",
            cp."websiteUrl",
            cp."membershipTier",
            COALESCE(cp."isPublic", true) AS "isPublic",
            cp."avatarUrl",
            u.email                       AS "userEmail",
            u.image                       AS "userImage"
          FROM "CoworkerProfile" cp
          INNER JOIN "User" u ON u.id = cp."userId"
          WHERE COALESCE(cp."isPublic", true) = true
            AND cp."membershipTier" IS NOT NULL
            AND cp."membershipTier" NOT IN ('free')
          ORDER BY cp.name ASC NULLS LAST
        `)) as Record<string, unknown>[];
      } catch (inner) {
        console.error('[/api/coworkers] fallback query failed:', inner);
        return NextResponse.json({ coworkers: [] });
      }
    }

    const result = rows.map(row => {
      const isPhotoPublic = bool(row.isPhotoPublic, true);
      const isPhonePublic = bool(row.isPhonePublic, false);
      const isEmailPublic = bool(row.isEmailPublic, false);

      return {
        id:                str(row.id),
        name:              str(row.name),
        profession:        str(row.profession),
        bio:               str(row.bio),
        skills:            parseSkills(row.skills),
        avatarUrl:         isPhotoPublic ? (str(row.avatarUrl) || str(row.userImage) || null) : null,
        linkedinUrl:       str(row.linkedinUrl),
        websiteUrl:        str(row.websiteUrl),
        homeCoworkingSlug: row.homeCoworkingSlug ? str(row.homeCoworkingSlug) : null,
        phone:             isPhonePublic ? (str(row.phone) || null) : null,
        email:             isEmailPublic ? (str(row.userEmail) || null) : null,
        company:           str(row.company) || null,
        allowContact:      bool(row.allowContact, false),
        membershipTier:    str(row.membershipTier) || null,
      };
    });

    return NextResponse.json(
      { coworkers: result },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err) {
    console.error('[/api/coworkers] unexpected error:', err);
    return NextResponse.json({ coworkers: [] });
  }
}
