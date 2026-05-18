import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/coworking-edits?slug=<slug>
 *
 * Returns:
 *   { exists: boolean, ownedByMe: boolean }
 *
 * Used by ClaimButton on /coworking/{slug} to decide whether to show
 * "Přivlastnit" vs "Požádat o převod" vs nothing.
 *
 * Privacy: returns booleans only, never the owner's identity.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (!slug) {
    return NextResponse.json({ error: 'Chybí slug' }, { status: 400 });
  }

  try {
    const edit = await prisma.coworkingEdit.findUnique({
      where: { coworkingSlug: slug },
      select: { userId: true },
    });
    if (!edit) {
      return NextResponse.json({ exists: false, ownedByMe: false });
    }
    const session = await getServerSession(authOptions);
    const myId = session?.user?.id;
    return NextResponse.json({
      exists: true,
      ownedByMe: !!(myId && edit.userId === myId),
    });
  } catch (err) {
    return NextResponse.json({ exists: false, ownedByMe: false });
  }
}
