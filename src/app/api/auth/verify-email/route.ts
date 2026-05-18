import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PWRESET_PREFIX } from '@/lib/auth-tokens';
import { sendRegistrationWelcomeEmail } from '@/lib/email';

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://coworkings.cz';

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

    // Pwreset tokeny patří jinému flow (/api/auth/reset-password) — sem nepatří
    if (record.identifier.startsWith(PWRESET_PREFIX)) {
      return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=invalid-token`);
    }

    if (new Date() > record.expires) {
      // Expired — delete it and redirect with error
      await prisma.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=token-expired`);
    }

    // Mark user as verified
    const user = await prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
      select: { email: true, name: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({ where: { token } });

    // Welcome mail — selhání nesmí shodit redirect
    try {
      await sendRegistrationWelcomeEmail({
        to: user.email ?? record.identifier,
        replyTo: process.env.RESEND_REPLY_TO,
        props: { name: user.name ?? null, email: user.email ?? record.identifier },
      });
    } catch (mailErr) {
      console.warn('[verify-email] welcome mail failed', mailErr);
    }

    // Redirect to login with success message
    return NextResponse.redirect(`${BASE_URL}/prihlaseni?verified=1`);
  } catch (err) {
    console.error('Email verification error:', err);
    return NextResponse.redirect(`${BASE_URL}/prihlaseni?error=server-error`);
  }
}
