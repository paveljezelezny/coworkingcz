// Token helpery pro password reset a email verification.
// Reuse Prisma model `VerificationToken` — rozlišujeme přes prefix v `identifier`:
//   • `email@x.com`           — email verification po registraci
//   • `pwreset:email@x.com`   — password reset request
// Token sám (sloupec `token`) je vždy hex 64 znaků (32 bytes), unikátní napříč modelem.

import { randomBytes, createHash, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

export const PWRESET_PREFIX = 'pwreset:';

/** Životnost tokenu v hodinách. */
export const PASSWORD_RESET_TOKEN_HOURS = 1;
export const EMAIL_VERIFICATION_TOKEN_HOURS = 24;

/** Generátor URL-safe tokenu (64 hex znaků). */
export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA-256 hash tokenu — ukládáme jen hash, ne plain. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Konstantní časové porovnání pro stringy. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  try { return timingSafeEqual(Buffer.from(a), Buffer.from(b)); } catch { return false; }
}

// ─── PASSWORD RESET ──────────────────────────────────────────────────────────

/**
 * Vytvoří nový password-reset token pro daný email.
 * Smaže všechny předchozí pending resety pro stejný email (jen jeden aktivní v čase).
 * Vrací PLAIN token (k poslání v mailu) a expiraci.
 */
export async function createPasswordResetToken(email: string): Promise<{ token: string; expires: Date }> {
  const identifier = PWRESET_PREFIX + email.toLowerCase();
  const token = generateToken();
  const hashed = hashToken(token);
  const expires = new Date(Date.now() + PASSWORD_RESET_TOKEN_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } }).catch(() => {});
  await prisma.verificationToken.create({
    data: { identifier, token: hashed, expires },
  });

  return { token, expires };
}

/**
 * Ověří plain reset token a vrátí email, ke kterému patří.
 * Token nemaže — to dělá explicitně až po úspěšném update hesla.
 * Vrací null pokud token neexistuje nebo vypršel.
 */
export async function findPasswordResetEmail(plainToken: string): Promise<string | null> {
  if (!plainToken || plainToken.length !== 64) return null;
  const hashed = hashToken(plainToken);
  const record = await prisma.verificationToken.findUnique({ where: { token: hashed } });
  if (!record) return null;
  if (!record.identifier.startsWith(PWRESET_PREFIX)) return null; // ne reset, ale email verify
  if (new Date() > record.expires) {
    await prisma.verificationToken.delete({ where: { token: hashed } }).catch(() => {});
    return null;
  }
  return record.identifier.slice(PWRESET_PREFIX.length);
}

/** Smaže reset token po úspěšném použití. */
export async function consumePasswordResetToken(plainToken: string): Promise<void> {
  const hashed = hashToken(plainToken);
  await prisma.verificationToken.delete({ where: { token: hashed } }).catch(() => {});
}

// ─── EMAIL VERIFICATION ──────────────────────────────────────────────────────

/**
 * Vytvoří verification token pro registraci.
 * Ukládáme PLAIN token (existing register flow) — později můžeme přepnout na hash,
 * teď zachováváme zpětnou kompatibilitu s `/api/auth/verify-email` co existuje.
 */
export async function createEmailVerificationToken(email: string): Promise<{ token: string; expires: Date }> {
  const identifier = email.toLowerCase();
  const token = generateToken();
  const expires = new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_HOURS * 60 * 60 * 1000);

  await prisma.verificationToken.deleteMany({ where: { identifier } }).catch(() => {});
  await prisma.verificationToken.create({ data: { identifier, token, expires } });

  return { token, expires };
}

/** Validace hesla — minimum requirements. */
export function validatePassword(pw: string): { ok: boolean; reason?: string } {
  if (!pw || typeof pw !== 'string') return { ok: false, reason: 'Heslo je povinné.' };
  if (pw.length < 8) return { ok: false, reason: 'Heslo musí mít aspoň 8 znaků.' };
  if (pw.length > 200) return { ok: false, reason: 'Heslo je moc dlouhé (max 200 znaků).' };
  return { ok: true };
}
