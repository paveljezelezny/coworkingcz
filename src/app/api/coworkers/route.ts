import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Ensure columns exist (inline migration)
    await ensureColumns();

    const profiles = await prisma.coworkerProfile.findMany({
      where: {
        isPublic: true,
        membershipTier: {
          not: null,
        },
      },
      select: {
        id: true,
        name: true,
        profession: true,
        bio: true,
        skills: true,
        avatarUrl: true,
        linkedinUrl: true,
        websiteUrl: true,
        homeCoworkingSlug: true,
        phone: true,
        isPhonePublic: true,
        isEmailPublic: true,
        isPhotoPublic: true,
        allowContact: true,
        membershipTier: true,
        user: {
          select: {
            email: true,
            image: true,
          },
        },
      },
    });

    type ProfileRow = typeof profiles[number];

    // Filter out free/trial-less tiers and format
    const result = profiles
      .filter((p: ProfileRow) => {
        const t = p.membershipTier;
        if (!t) return false;
        if (t === 'free') return false;
        return true;
      })
      .map((p: ProfileRow) => ({
        id: p.id,
        name: p.name || '',
        profession: p.profession || '',
        bio: p.bio || '',
        skills: Array.isArray(p.skills) ? (p.skills as string[]) : [],
        // Only show photo if isPhotoPublic
        avatarUrl: p.isPhotoPublic ? (p.avatarUrl || p.user?.image || null) : null,
        linkedinUrl: p.linkedinUrl || '',
        websiteUrl: p.websiteUrl || '',
        homeCoworkingSlug: p.homeCoworkingSlug || null,
        phone: p.isPhonePublic ? (p.phone || null) : null,
        email: p.isEmailPublic ? (p.user?.email || null) : null,
        allowContact: p.allowContact ?? false,
        membershipTier: p.membershipTier,
      }));

    return NextResponse.json({ coworkers: result }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    console.error('[/api/coworkers] error:', err);
    return NextResponse.json({ coworkers: [] });
  }
}

async function ensureColumns() {
  const cols = [
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "homeCoworkingSlug" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhonePublic" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isEmailPublic" BOOLEAN NOT NULL DEFAULT false`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "isPhotoPublic" BOOLEAN NOT NULL DEFAULT true`,
    `ALTER TABLE "CoworkerProfile" ADD COLUMN IF NOT EXISTS "allowContact" BOOLEAN NOT NULL DEFAULT false`,
  ];
  for (const sql of cols) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch {
      // ignore – column already exists
    }
  }
}
