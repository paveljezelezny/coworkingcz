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

  const userId = (session.user as Record<string, unknown>).id as string;

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
          homeCoworkingSlug: true,
          phone: true,
          company: true,
          isPhonePublic: true,
          isEmailPublic: true,
          isPhotoPublic: true,
          allowContact: true,
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

  const p = user.coworkerProfile;

  return NextResponse.json({
    id: user.id,
    name: user.name ?? '',
    email: user.email,
    image: user.image ?? null,
    role: user.role,
    createdAt: user.createdAt,
    bio: p?.bio ?? '',
    profession: p?.profession ?? '',
    skills,
    linkedinUrl: p?.linkedinUrl ?? '',
    websiteUrl: p?.websiteUrl ?? '',
    avatarUrl: p?.avatarUrl ?? null,
    isPublic: p?.isPublic ?? true,
    membershipTier: p?.membershipTier ?? null,
    membershipStart: p?.membershipStart ?? null,
    membershipEnd: p?.membershipEnd ?? null,
    homeCoworkingSlug: p?.homeCoworkingSlug ?? null,
    phone: p?.phone ?? null,
    company: p?.company ?? null,
    isPhonePublic: p?.isPhonePublic ?? false,
    isEmailPublic: p?.isEmailPublic ?? false,
    isPhotoPublic: p?.isPhotoPublic ?? true,
    allowContact: p?.allowContact ?? false,
  });
}

// ─── PUT /api/profile ────────────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;

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

  // Build CoworkerProfile upsert payload
  const profileData: Record<string, unknown> = {};
  if (bio !== undefined)               profileData.bio = bio.trim() || null;
  if (profession !== undefined)        profileData.profession = profession.trim() || null;
  if (skills !== undefined)            profileData.skills = JSON.stringify(Array.isArray(skills) ? skills : []);
  if (linkedinUrl !== undefined)       profileData.linkedinUrl = linkedinUrl.trim() || null;
  if (websiteUrl !== undefined)        profileData.websiteUrl = websiteUrl.trim() || null;
  if (isPublic !== undefined)          profileData.isPublic = Boolean(isPublic);
  if (avatarUrl !== undefined)         profileData.avatarUrl = avatarUrl || null;
  if (homeCoworkingSlug !== undefined) profileData.homeCoworkingSlug = homeCoworkingSlug?.trim() || null;
  if (phone !== undefined)             profileData.phone = phone?.trim() || null;
  if (company !== undefined)           profileData.company = company?.trim() || null;
  if (isPhonePublic !== undefined)     profileData.isPhonePublic = Boolean(isPhonePublic);
  if (isEmailPublic !== undefined)     profileData.isEmailPublic = Boolean(isEmailPublic);
  if (isPhotoPublic !== undefined)     profileData.isPhotoPublic = Boolean(isPhotoPublic);
  if (allowContact !== undefined)      profileData.allowContact = Boolean(allowContact);

  await prisma.coworkerProfile.upsert({
    where: { userId },
    create: { userId, ...profileData },
    update: profileData,
  });

  return NextResponse.json({ success: true });
}
