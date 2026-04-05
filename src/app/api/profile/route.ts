import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ─── GET /api/profile ────────────────────────────────────────────────────────
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as any).id as string;

  const user = await prisma.user.findUnique({
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

  return NextResponse.json({
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    createdAt: user.createdAt,
    bio: user.coworkerProfile?.bio ?? '',
    profession: user.coworkerProfile?.profession ?? '',
    skills,
    linkedinUrl: user.coworkerProfile?.linkedinUrl ?? '',
    websiteUrl: user.coworkerProfile?.websiteUrl ?? '',
    avatarUrl: user.coworkerProfile?.avatarUrl ?? null,
    isPublic: user.coworkerProfile?.isPublic ?? true,
    membershipTier: user.coworkerProfile?.membershipTier ?? null,
    membershipStart: user.coworkerProfile?.membershipStart ?? null,
    membershipEnd: user.coworkerProfile?.membershipEnd ?? null,
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
  const { name, bio, profession, skills, linkedinUrl, websiteUrl, isPublic } = body;

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
  const profileData: Record<string, unknown> = {};
  if (bio !== undefined) profileData.bio = bio.trim() || null;
  if (profession !== undefined) profileData.profession = profession.trim() || null;
  if (skills !== undefined) profileData.skills = JSON.stringify(Array.isArray(skills) ? skills : []);
  if (linkedinUrl !== undefined) profileData.linkedinUrl = linkedinUrl.trim() || null;
  if (websiteUrl !== undefined) profileData.websiteUrl = websiteUrl.trim() || null;
  if (isPublic !== undefined) profileData.isPublic = Boolean(isPublic);

  await prisma.coworkerProfile.upsert({
    where: { userId },
    create: { userId, ...profileData },
    update: profileData,
  });

  return NextResponse.json({ success: true });
}
