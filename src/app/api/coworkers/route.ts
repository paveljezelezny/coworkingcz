import { NextRequest, NextResponse } from 'next/server';
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

function str(v: unknown): string { return v ? String(v) : ''; }
function bool(v: unknown, d = false): boolean {
  return (v === null || v === undefined) ? d : Boolean(v);
}

// ─── GET /api/coworkers ───────────────────────────────────────────────────────
// Supports: ?page=1&limit=50&coworking=slug&search=name

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '50')));
    const offset = (page - 1) * limit;
    const cwFilter = searchParams.get('coworking') ?? null;

    const whereExtra = cwFilter
      ? `AND cp."homeCoworkingSlug" = '${cwFilter.replace(/'/g, "''")}'`
      : '';

    const [rows, countResult] = await Promise.all([
      prisma.$queryRawUnsafe<Record<string, unknown>[]>(`
        SELECT
          cp.id,
          u.name                                    AS name,
          cp.profession,
          cp.bio,
          cp.skills,
          cp."linkedinUrl",
          cp."websiteUrl",
          cp."membershipTier",
          COALESCE(cp."isPublic", true)             AS "isPublic",
          cp."homeCoworkingSlug",
          cp.phone,
          cp.company,
          COALESCE(cp."isPhonePublic", false)       AS "isPhonePublic",
          COALESCE(cp."isEmailPublic", false)       AS "isEmailPublic",
          COALESCE(cp."isPhotoPublic", true)        AS "isPhotoPublic",
          COALESCE(cp."allowContact", false)        AS "allowContact",
          cp."avatarUrl",
          u.email                                   AS "userEmail",
          u.image                                   AS "userImage"
        FROM "CoworkerProfile" cp
        INNER JOIN "User" u ON u.id = cp."userId"
        WHERE COALESCE(cp."isPublic", true) = true
          AND cp."membershipTier" IS NOT NULL
          AND cp."membershipTier" NOT IN ('free')
          ${whereExtra}
        ORDER BY u.name ASC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `),
      prisma.$queryRawUnsafe<[{ count: bigint }]>(`
        SELECT COUNT(*) AS count
        FROM "CoworkerProfile" cp
        WHERE COALESCE(cp."isPublic", true) = true
          AND cp."membershipTier" IS NOT NULL
          AND cp."membershipTier" NOT IN ('free')
          ${whereExtra}
      `),
    ]);

    const total = Number(countResult[0]?.count ?? 0);

    const coworkers = rows.map(row => ({
      id:                str(row.id),
      name:              str(row.name),
      profession:        str(row.profession),
      bio:               str(row.bio),
      skills:            parseSkills(row.skills),
      avatarUrl:         bool(row.isPhotoPublic, true) ? (str(row.avatarUrl) || str(row.userImage) || null) : null,
      linkedinUrl:       str(row.linkedinUrl),
      websiteUrl:        str(row.websiteUrl),
      homeCoworkingSlug: row.homeCoworkingSlug ? str(row.homeCoworkingSlug) : null,
      phone:             bool(row.isPhonePublic, false) ? (str(row.phone) || null) : null,
      email:             bool(row.isEmailPublic, false) ? (str(row.userEmail) || null) : null,
      company:           str(row.company) || null,
      allowContact:      bool(row.allowContact, false),
      membershipTier:    str(row.membershipTier) || null,
    }));

    return NextResponse.json(
      { coworkers, total, page, limit, pages: Math.ceil(total / limit) },
      { headers: { 'Cache-Control': 'public, max-age=120, stale-while-revalidate=300' } }
    );
  } catch (err) {
    console.error('[/api/coworkers]', err);
    return NextResponse.json({ coworkers: [], total: 0, page: 1, limit: 50, pages: 0 });
  }
}
