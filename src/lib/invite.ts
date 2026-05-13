// Pre-launch invite gate helpers
// — sdílí konstanty mezi middleware, API routes a klientskou pre-landing stránkou.

import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';

/** Cookie name, kterou middleware kontroluje pro průchod gate. */
export const INVITE_COOKIE = 'invite_ok';

/** Životnost cookie po zadání správného kódu (90 dní, sec). */
export const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** Cesta pre-landing stránky. */
export const PRE_LANDING_PATH = '/zakladame';

/**
 * Cesty, které gate NIKDY neblokuje (přihlášení, admin, API, statika, sama pre-landing).
 * Cokoliv mimo seznam → pre-landing redirect.
 */
const ALWAYS_OPEN_PREFIXES = [
  PRE_LANDING_PATH,
  '/admin',          // super-admin musí být dostupný
  '/api',            // API musí jet (invite endpoint, NextAuth, ostatní)
  '/prihlaseni',     // login
  '/registrace',     // sign-up
  '/_next',          // Next.js interní
  '/static',         // statika
];

const ALWAYS_OPEN_FILES = new Set([
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
]);

export function isAlwaysOpen(pathname: string): boolean {
  if (ALWAYS_OPEN_FILES.has(pathname)) return true;
  // soubory v /public (mají tečku) projdou
  if (/\.[a-zA-Z0-9]{2,5}$/.test(pathname)) return true;
  return ALWAYS_OPEN_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

/** Hash IP přes SHA-256 — ukládáme do DB místo plain IP (GDPR-friendly). */
export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash('sha256').update(ip).digest('hex').slice(0, 32);
}

/** Vytáhne (best-effort) IP z requestu pro audit/rate-limit. */
export function getRequestIp(req: NextRequest | Request): string | null {
  const xff = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
  return xff || req.headers.get('x-real-ip') || null;
}

/** Konstantní časové porovnání pro tajné stringy (zamezí timing attacku). */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/** Vrací true, pokud kód odpovídá tomu v env (case-insensitive, trim). */
export function verifyInviteCode(submitted: string): boolean {
  const expected = (process.env.INVITE_CODE ?? '').trim();
  if (!expected) return false;
  const got = submitted.trim();
  return constantTimeEqual(got.toLowerCase(), expected.toLowerCase());
}

/** Je gate vůbec aktivní? */
export function isGateEnabled(): boolean {
  return process.env.DISABLE_INVITE_GATE !== 'true';
}

/** Jednoduchá email validace — nechceme tu plnou RFC, stačí "vypadá rozumně". */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  if (email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
