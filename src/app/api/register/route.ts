import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendVerificationEmail } from '@/lib/email';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['coworker', 'coworking_admin']).default('coworker'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Tento email je již registrován' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, email: true, name: true, role: true },
    });

    // Generate email verification token (valid 24 hours)
    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Store in VerificationToken table (NextAuth standard)
    await prisma.verificationToken.create({
      data: { identifier: email, token, expires },
    });

    // Build verification URL — Resend posílá link odsud
    const baseUrl = process.env.NEXTAUTH_URL ?? 'https://coworkings.cz';
    const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;

    // Pošli verifikační mail. Selhání nesmí shodit registraci (token v DB je, user
    // si může vyžádat resend přes /prihlaseni/zapomenute-heslo nebo support).
    try {
      await sendVerificationEmail({
        to: email,
        replyTo: process.env.RESEND_REPLY_TO,
        props: { name, email, verifyUrl },
      });
    } catch (mailErr) {
      console.warn('[register] verification mail failed', mailErr);
    }
    // Backup log pro debug / pokud mail selže
    console.log(`[VERIFY] Email verification link for ${email}: ${verifyUrl}`);

    return NextResponse.json({
      success: true,
      user,
      pendingVerification: true,
      // Return URL only in dev for testing; in prod the link goes via email
      ...(process.env.NODE_ENV === 'development' ? { verifyUrl } : {}),
    });
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json({ error: 'Neplatná data', details: err.errors }, { status: 400 });
    }
    console.error('Register error:', err);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}
