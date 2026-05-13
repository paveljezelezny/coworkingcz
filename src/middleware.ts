// Edge middleware — dvě role v jednom:
//   1) Pre-launch invite gate: kdo nemá cookie `invite_ok` ani aktivní session,
//      je přesměrován na /zakladame (pre-landing).
//   2) Auth ochrana /admin /spravce /profil (původní logika z withAuth).
//
// /admin (super_admin) i /api (NextAuth, invite endpoint) gate obchází
// přes isAlwaysOpen() — nikdy je nepřesměrováváme na pre-landing.

import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { INVITE_COOKIE, PRE_LANDING_PATH, isAlwaysOpen, isGateEnabled } from '@/lib/invite';

const AUTH_PROTECTED_PREFIXES = ['/admin', '/spravce', '/profil'];

function isAuthProtected(pathname: string): boolean {
  return AUTH_PROTECTED_PREFIXES.some(
    p => pathname === p || pathname.startsWith(p + '/'),
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1) Auth-chráněné cesty (admin/spravce/profil) ─────────────────────────
  if (isAuthProtected(pathname)) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/prihlaseni';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/admin') && (token as any).role !== 'super_admin') {
      const url = req.nextUrl.clone();
      url.pathname = '/prihlaseni';
      url.searchParams.set('callbackUrl', pathname);
      url.searchParams.set('error', 'AccessDenied');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

  // ── 2) Pre-launch invite gate ─────────────────────────────────────────────
  if (!isGateEnabled()) return NextResponse.next();
  if (isAlwaysOpen(pathname)) return NextResponse.next();

  const hasCookie = req.cookies.get(INVITE_COOKIE)?.value === '1';
  if (hasCookie) return NextResponse.next();

  // Přihlášený uživatel s tokenem (jakákoliv role) gate obejde — má účet, prošel ručně.
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) return NextResponse.next();

  // Bez kódu a bez session → pre-landing
  const url = req.nextUrl.clone();
  url.pathname = PRE_LANDING_PATH;
  url.search = ''; // nešíříme citlivé query parametry
  return NextResponse.redirect(url);
}

export const config = {
  // matcher pokrývá:
  //   • chráněné sekce (admin/spravce/profil) řešené větví 1,
  //   • celý zbytek webu pro invite gate, BEZ /_next, /api, statiky a souborů s příponou.
  matcher: [
    '/((?!_next|api|static|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)',
  ],
};
