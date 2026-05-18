// POST /api/auth/forgot-password
// Veřejný endpoint — přijme email, vytvoří reset token a pošle mail.
// Vždy vrací 200 OK (neprozrazuje, jestli email v DB existuje) — anti enumeration.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPasswordResetToken, PASSWORD_RESET_TOKEN_HOURS } from '@/lib/auth-tokens';
import { sendPasswordResetEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try { body = await req.json(); } catch { body = {}; }

  const email = (body.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Neplatný email' }, { status: 400 });
  }

  // Vždy vracíme stejnou odpověď, nehledě na to jestli user existuje
  const okResponse = NextResponse.json({ ok: true });

  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });
  } catch (err) {
    console.error('[forgot-password] lookup failed', err);
    return okResponse;
  }

  // Pokud uživatel neexistuje nebo nemá heslo (jen Google login), nic neposíláme.
  if (!user || !user.password) return okResponse;

  let token: string;
  try {
    const created = await createPasswordResetToken(email);
    token = created.token;
  } catch (err) {
    console.error('[forgot-password] token create failed', err);
    return okResponse;
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://coworkings.cz';
  const resetUrl = `${baseUrl}/prihlaseni/nove-heslo?token=${token}`;

  // Selhání mailu nesmí prozradit existenci uživatele
  try {
    await sendPasswordResetEmail({
      to: email,
      replyTo: process.env.RESEND_REPLY_TO,
      props: {
        name: user.name ?? null,
        email,
        resetUrl,
        expiresHours: PASSWORD_RESET_TOKEN_HOURS,
      },
    });
  } catch (err) {
    console.error('[forgot-password] mail failed', err);
  }

  return okResponse;
}
