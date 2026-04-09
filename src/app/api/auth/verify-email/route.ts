import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://coworkingcz.vercel.app';

// GET /api/auth/verify-email?token=XXX
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=missing-token`);
  }

  try {
    // Find the verification token
    const record = await prisma.verificationToken.findUnique({ where: { token } });

    if (!record) {
      return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=invalid-token`);
    }

    if (new Date() > record.expires) {
      // Expired — delete it and redirect with error
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=token-expired`);
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    // Redirect to login with success message
    return NextResponse.redirect(`${BASE_URL}/prihlaseni?verified=1`);
  } catch (err) {
    console.error('Email verification error:', err);
    return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=server-error`);
  }
}
