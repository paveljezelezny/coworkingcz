// POST /api/auth/reset-password
// Dokončení reset flow — přijme { token, password }, validate, update bcrypt hash.

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  findPasswordResetEmail,
  consumePasswordResetToken,
  validatePassword,
} from '@/lib/auth-tokens';
import { sendPasswordChangedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BCRYPT_ROUNDS = 12; // stejné jako register/route.ts

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try { body = await req.json(); } catch { body = {}; }

  const token = (body.token ?? '').trim();
  const password = body.password ?? '';

  const pwCheck = validatePassword(password);
  if (!pwCheck.ok) {
    return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
  }

  const email = await findPasswordResetEmail(token);
  if (!email) {
    return NextResponse.json(
      { error: 'Reset odkaz je neplatný nebo expirovaný. Požádej o nový.' },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    // Token sedí, ale user mezitím smazán. Mazneme i token.
    await consumePasswordResetToken(token);
    return NextResponse.json({ error: 'Uživatel neexistuje.' }, { status: 400 });
  }

  try {
    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        // pokud user nebyl verified, reset přes mail je dostatečný signál (přístup k mailboxu)
        emailVerified: new Date(),
        updatedAt: new Date(),
      },
    });
    await consumePasswordResetToken(token);
  } catch (err) {
    console.error('[reset-password] update failed', err);
    return NextResponse.json({ error: 'Nepodařilo se uložit nové heslo.' }, { status: 500 });
  }

  // Confirmation mail — selhání nesmí shodit response
  try {
    await sendPasswordChangedEmail({
      to: user.email ?? email,
      replyTo: process.env.RESEND_REPLY_TO,
      props: {
        name: user.name ?? null,
        email: user.email ?? email,
        changedAt: new Date(),
      },
    });
  } catch (err) {
    console.warn('[reset-password] confirmation mail failed', err);
  }

  return NextResponse.json({ ok: true });
}
