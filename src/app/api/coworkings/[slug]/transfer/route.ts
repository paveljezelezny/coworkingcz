import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';

/**
 * GET /api/coworkings/[slug]/transfer — get pending transfer for this coworking
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const slug = params.slug;

  // Must own this coworking
  const claim = await prisma.coworkingClaim.findFirst({
    where: { userId, coworkingSlug: slug, status: 'approved' },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
  }

  // Find pending transfer
  const transfer = await prisma.coworkingTransfer.findFirst({
    where: { coworkingSlug: slug, fromUserId: userId, status: 'pending' },
  });

  return NextResponse.json({ transfer: transfer || null });
}

/**
 * POST /api/coworkings/[slug]/transfer — create a transfer request
 * Body: { toEmail: string, message?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const slug = params.slug;

  // Must own this coworking
  const claim = await prisma.coworkingClaim.findFirst({
    where: { userId, coworkingSlug: slug, status: 'approved' },
  });

  if (!claim) {
    return NextResponse.json({ error: 'Nemáte oprávnění' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { toEmail, message } = body;

  if (!toEmail || typeof toEmail !== 'string' || !toEmail.includes('@')) {
    return NextResponse.json({ error: 'Zadejte platný email' }, { status: 400 });
  }

  // Cannot transfer to yourself
  if (toEmail.toLowerCase() === session.user.email.toLowerCase()) {
    return NextResponse.json({ error: 'Nemůžete převést sami na sebe' }, { status: 400 });
  }

  // Check for existing pending transfer
  const existing = await prisma.coworkingTransfer.findFirst({
    where: { coworkingSlug: slug, fromUserId: userId, status: 'pending' },
  });

  if (existing) {
    return NextResponse.json({ error: 'Již existuje čekající žádost o převod' }, { status: 409 });
  }

  // Create transfer with token
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const transfer = await prisma.coworkingTransfer.create({
    data: {
      coworkingSlug: slug,
      fromUserId: userId,
      toEmail: toEmail.toLowerCase(),
      token,
      status: 'pending',
      message: message || null,
      expiresAt,
    },
  });

  // TODO: Send actual email to toEmail with acceptance link
  // For now, log the acceptance URL
  const acceptUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/auth/accept-transfer?token=${token}`;
  console.log(`[Transfer] Acceptance URL for ${toEmail}: ${acceptUrl}`);

  return NextResponse.json({ transfer, acceptUrl }, { status: 201 });
}

/**
 * DELETE /api/coworkings/[slug]/transfer — cancel a pending transfer
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const slug = params.slug;

  // Find and cancel pending transfer
  const transfer = await prisma.coworkingTransfer.findFirst({
    where: { coworkingSlug: slug, fromUserId: userId, status: 'pending' },
  });

  if (!transfer) {
    return NextResponse.json({ error: 'Žádná čekající žádost nenalezena' }, { status: 404 });
  }

  await prisma.coworkingTransfer.update({
    where: { id: transfer.id },
    data: { status: 'cancelled' },
  });

  return NextResponse.json({ success: true });
}
