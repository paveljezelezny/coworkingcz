import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function isSuperAdmin(session: any) {
  return session?.user?.role === 'super_admin';
}

// GET /api/admin/claims?status=pending
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? 'pending';

  const claims = await prisma.coworkingClaim.findMany({
    where: status === 'all' ? {} : { status },
    include: {
      user: {
        select: { id: true, email: true, name: true, image: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ claims });
}
