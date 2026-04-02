import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users — seznam všech uživatelů (jen super_admin)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}

// PATCH /api/admin/users — změna role uživatele (jen super_admin)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any)?.role !== 'super_admin') {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const { userId, role } = await req.json();

  const allowedRoles = ['coworker', 'coworking_admin', 'super_admin'];
  if (!userId || !allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Neplatné parametry' }, { status: 400 });
  }

  // Zabraň odebrání vlastní super_admin role
  const currentUserId = (session.user as any)?.id;
  if (userId === currentUserId && role !== 'super_admin') {
    return NextResponse.json({ error: 'Nemůžeš odebrat vlastní super admin roli' }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json(updated);
}
