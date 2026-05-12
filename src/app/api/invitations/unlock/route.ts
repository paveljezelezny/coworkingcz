// POST /api/invitations/unlock
// Ověří pozvánkový kód a (pokud sedí) nastaví httpOnly cookie `invite_ok` na 90 dní.
// Cookie pak middleware vidí a pustí návštěvníka na hlavní web.

import { NextRequest, NextResponse } from 'next/server';
import {
  INVITE_COOKIE,
  INVITE_COOKIE_MAX_AGE,
  verifyInviteCode,
} from '@/lib/invite';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Neplatný JSON' }, { status: 400 });
  }

  const code = (body.code ?? '').trim();
  if (!code) {
    return NextResponse.json({ error: 'Chybí kód' }, { status: 400 });
  }

  // malé zpoždění proti brute-force (cca 250ms)
  await new Promise(r => setTimeout(r, 250));

  if (!verifyInviteCode(code)) {
    return NextResponse.json({ ok: false, error: 'Nesprávný kód.' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(INVITE_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: INVITE_COOKIE_MAX_AGE,
  });
  return res;
}
