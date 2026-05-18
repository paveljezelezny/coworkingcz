// POST /api/profile/change-password
// Pro přihlášeného uživatele: vyžaduje currentPassword (anti-CSRF/hijack)
// a newPassword. Po update pošle confirmation mail.

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { validatePassword } from '@/lib/auth-tokens';
import { sendPasswordChangedEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BCRYPT_ROUNDS = 12;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  let body: { currentPassword?: string; newPassword?: string };
  try { body = await req.json(); } catch { body = {}; }

  const current = body.currentPassword ?? '';
  const next = body.newPassword ?? '';

  const pwCheck = validatePassword(next);
  if (!pwCheck.ok) {
    return NextResponse.json({ error: pwCheck.reason }, { status: 400 });
  }
  if (current === next) {
    return NextResponse.json({ error: 'Nové heslo musí být jiné než to současné.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, password: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'Uživatel nenalezen' }, { status: 404 });
  }
  if (!user.password) {
    return NextResponse.json(
      { error: 'Tvůj účet je propojený přes Google login. Heslo nemůžeš změnit tady — udělej to v Google účtu.' },
      { status: 400 },
    );
  }

  const ok = await bcrypt.compare(current, user.password);
  if (!ok) {
    return NextResponse.json({ error: 'Současné heslo nesedí.' }, { status: 400 });
  }

  try {
    const hashed = await bcrypt.hash(next, BCRYPT_ROUNDS);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, updatedAt: new Date() },
    });
  } catch (err) {
    console.error('[change-password] update failed', err);
    return NextResponse.json({ error: 'Nepodařilo se uložit nové heslo.' }, { status: 500 });
  }

  try {
    await sendPasswordChangedEmail({
      to: user.email!,
      replyTo: process.env.RESEND_REPLY_TO,
      props: { name: user.name ?? null, email: user.email!, changedAt: new Date() },
    });
  } catch (err) {
    console.warn('[change-password] confirmation mail failed', err);
  }

  return NextResponse.json({ ok: true });
}
