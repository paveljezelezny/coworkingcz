import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/claims — submit a coworking claim
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Musíš být přihlášen' }, { status: 401 });
  }

  try {
    const { coworkingSlug, coworkingName, businessEmail, message } = await req.json();

    if (!coworkingSlug || !coworkingName) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 });
    }

    const userId = session.user.id;

    // Check if already claimed
    const existing = await prisma.coworkingClaim.findUnique({
      where: { userId_coworkingSlug: { userId, coworkingSlug } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Tento coworking jsi již nárokoval' }, { status: 400 });
    }

    // Check if this coworking is already claimed by someone else
    const otherClaim = await prisma.coworkingEdit.findUnique({
      where: { coworkingSlug },
    });
    if (otherClaim && otherClaim.userId !== userId) {
      return NextResponse.json({ error: 'Tento coworking je již spravován jiným uživatelem' }, { status: 400 });
    }

    // Create claim — pending until admin approves
    await prisma.coworkingClaim.create({
      data: {
        userId,
        coworkingSlug,
        coworkingName,
        businessEmail,
        message,
        status: 'pending',
      },
    });

    // NOTE: CoworkingEdit and role upgrade happen only after admin approves (in /api/admin/claims/[id])

    return NextResponse.json({ success: true, pending: true });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}

// GET /api/claims — get all claims for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const claims = await prisma.coworkingClaim.findMany({
    where: { userId: session.user.id },
    select: { coworkingSlug: true, coworkingName: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich approved claims with edited names from CoworkingEdit (owner may have renamed)
  const slugs = claims.filter((c) => c.status === 'approved').map((c) => c.coworkingSlug);
  let editedNames: Record<string, string> = {};
  if (slugs.length > 0) {
    try {
      const edits = await prisma.coworkingEdit.findMany({
        where: { coworkingSlug: { in: slugs } },
        select: { coworkingSlug: true, data: true },
      });
      for (const edit of edits) {
        const data = edit.data as Record<string, any> | null;
        if (data && typeof data.name === 'string' && data.name.trim()) {
          editedNames[edit.coworkingSlug] = data.name;
        }
      }
    } catch {
      // DB issue — fall back to original claim names
    }
  }

  const enriched = claims.map((c) => ({
    ...c,
    coworkingName: editedNames[c.coworkingSlug] ?? c.coworkingName,
  }));

  return NextResponse.json({ claims: enriched });
}
