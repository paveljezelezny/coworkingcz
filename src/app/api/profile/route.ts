import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ─── Inline migration — add new columns if they're missing ────────────────────
async function ensureProfileColumns() {
  const ddl = [
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "homeCoworkingSlug" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhonePublic" BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isEmailPublic" BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhotoPublic" BOOLEAN NOT NULL DEFAULT TRUE`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "allowContact" BOOLEAN NOT NULL DEFAULT FALSE`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "company" TEXT`,
  ];
  for (const sql of ddl) {
    try { await prisma.$executeRawUnsafe(sql); } catch { /* column already exists */ }
  }
}

// ─── GET /api/profile ────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  // Run migration on first fetch (no-op if columns exist)
  await ensureProfileColumns();

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        coworkerProfile: {
          select: {
            bio: true,
            profession: true,
            skills: true,
            linkedinUrl: true,
            websiteUrl: true,
            avatarUrl: true,
            isPublic: true,
            membershipTier: true,
            membershipStart: true,
            membershipEnd: true,
            homeCoworkingSlug: true,
            phone: true,
            isPhonePublic: true,
            isEmailPublic: true,
            isPhotoPublic: true,
            allowContact: true,
          },
        },
      },
    });
  } catch {
    // Fallback without new columns if migration didn't complete
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        coworkerProfile: {
          select: {
            bio: true,
            profession: true,
            skills: true,
            linkedinUrl: true,
            websiteUrl: true,
            avatarUrl: true,
            isPublic: true,
            membershipTier: true,
            membershipStart: true,
            membershipEnd: true,
          },
        },
      },
    });
  }

  if (!user) {
    return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 });
  }

  // Parse skills from JSON string → string[]
  let skills: string[] = [];
  if (user.coworkerProfile?.skills) {
    try {
      skills = JSON.parse(user.coworkerProfile.skills);
    } catch {
      skills = user.coworkerProfile.skills
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
  }

  // Fetch company via raw SQL (not in generated Prisma client yet)
  let company: string | null = null;
  if (user.coworkerProfile) {
    try {
      const rows = await prisma.$queryRawUnsafe(
        `SELECT company FROM "CoworkerProfile" WHERE "userId" = $1 LIMIT 1`,
        userId
      ) as Array<{ company: string | null }>;
      company = rows[0]?.company ?? null;
    } catch {
      // column doesn't exist yet — ignore, returns null
    }
  }

  const profile = user.coworkerProfile as Record<string, unknown> | null;

  return NextResponse.json({
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    createdAt: user.createdAt,
    bio: profile?.bio ?? '',
    profession: profile?.profession ?? '',
    skills,
    linkedinUrl: profile?.linkedinUrl ?? '',
    websiteUrl: profile?.websiteUrl ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    isPublic: profile?.isPublic ?? true,
    membershipTier: profile?.membershipTier ?? null,
    membershipStart: profile?.membershipStart ?? null,
    membershipEnd: profile?.membershipEnd ?? null,
    homeCoworkingSlug: profile?.homeCoworkingSlug ?? null,
    phone: profile?.phone ?? null,
    company,
    isPhonePublic: profile?.isPhonePublic ?? false,
    isEmailPublic: profile?.isEmailPublic ?? false,
    isPhotoPublic: profile?.isPhotoPublic ?? true,
    allowContact: profile?.allowContact ?? false,
  });
}

// ─── PUT /api/profile ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const body = await req.json();
  const {
    name, bio, profession, skills, linkedinUrl, websiteUrl,
    isPublic, avatarUrl,
    homeCoworkingSlug, phone, company,
    isPhonePublic, isEmailPublic, isPhotoPublic, allowContact,
  } = body;

  // Validate
  if (name !== undefined && typeof name !== 'string') {
    return NextResponse.json({ error: 'Neplatné jméno' }, { status: 400 });
  }

  // Update User.name
  if (name !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() || null },
    });
  }

  // Upsert CoworkerProfile
  // NOTE: company is NOT in the generated Prisma client (schema not yet regenerated),
  // so we handle it separately via raw SQL after the Prisma upsert.
  const profileData: Record<string, unknown> = {};
  if (bio !== undefined)              profileData.bio = bio.trim() || null;
  if (profession !== undefined)       profileData.profession = profession.trim() || null;
  if (skills !== undefined)           profileData.skills = JSON.stringify(Array.isArray(skills) ? skills : []);
  if (linkedinUrl !== undefined)      profileData.linkedinUrl = linkedinUrl.trim() || null;
  if (websiteUrl !== undefined)       profileData.websiteUrl = websiteUrl.trim() || null;
  if (isPublic !== undefined)         profileData.isPublic = Boolean(isPublic);
  if (avatarUrl !== undefined)        profileData.avatarUrl = avatarUrl || null;
  if (homeCoworkingSlug !== undefined) profileData.homeCoworkingSlug = homeCoworkingSlug?.trim() || null;
  if (phone !== undefined)            profileData.phone = phone?.trim() || null;
  if (isPhonePublic !== undefined)    profileData.isPhonePublic = Boolean(isPhonePublic);
  if (isEmailPublic !== undefined)    profileData.isEmailPublic = Boolean(isEmailPublic);
  if (isPhotoPublic !== undefined)    profileData.isPhotoPublic = Boolean(isPhotoPublic);
  if (allowContact !== undefined)     profileData.allowContact = Boolean(allowContact);

  try {
    await prisma.coworkerProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });
  } catch {
    // If new columns missing, run migration and retry
    await ensureProfileColumns();
    await prisma.coworkerProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });
  }

  // Handle `company` via raw SQL (column added via DDL but not in generated Prisma client)
  if (company !== undefined) {
    const companyValue = company?.trim() || null;
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE "CoworkerProfile" SET "company" = $1 WHERE "userId" = $2`,
        companyValue,
        userId
      );
    } catch {
      // Column might not exist yet — run migration then retry
      await ensureProfileColumns();
      await prisma.$executeRawUnsafe(
        `UPDATE "CoworkerProfile" SET "company" = $1 WHERE "userId" = $2`,
        companyValue,
        userId
      );
    }
  }

  return NextResponse.json({ success: true });
}
