import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type AnySession = { user?: Record<string, unknown> } | null;

function isSuperAdmin(session: AnySession) {
  return (session?.user as any)?.role === 'super_admin';
}

// GET /api/admin/users
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
      coworkerProfile: {
        select: {
          membershipTier: true,
          membershipStart: true,
          membershipEnd: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users.map((u: typeof users[0]) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    image: u.image,
    role: u.role,
    createdAt: u.createdAt,
    membershipTier: u.coworkerProfile?.membershipTier ?? null,
    membershipStart: u.coworkerProfile?.membershipStart ?? null,
    membershipEnd: u.coworkerProfile?.membershipEnd ?? null,
  })));
}

// PATCH /api/admin/users — change role OR membership
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });

  const body = await req.json();
  const { userId, role, membershipTier, membershipEnd, membershipStart } = body;
  if (!userId) return NextResponse.json({ error: 'Chybí userId' }, { status: 400 });

  const currentUserId = (session!.user as any)?.id;

  // Role change
  if (role !== undefined) {
    const allowed = ['coworker', 'coworking_admin', 'super_admin'];
    if (!allowed.includes(role)) return NextResponse.json({ error: 'Neplatná role' }, { status: 400 });
    if (userId === currentUserId && role !== 'super_admin')
      return NextResponse.json({ error: 'Nemůžeš odebrat vlastní super admin roli' }, { status: 400 });
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, role: true },
    });
    return NextResponse.json(updated);
  }

  // Membership change
  if (membershipTier !== undefined) {
    const profileData: Record<string, unknown> = { membershipTier: membershipTier || null };
    if (membershipEnd !== undefined) profileData.membershipEnd = membershipEnd ? new Date(membershipEnd) : null;
    if (membershipStart !== undefined) profileData.membershipStart = membershipStart ? new Date(membershipStart) : null;

    await prisma.coworkerProfile.upsert({
      where: { userId },
      create: { userId, ...profileData },
      update: profileData,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Nic ke změně' }, { status: 400 });
}
