import { prisma } from '@/lib/prisma';

/**
 * Paid tiers — anything above "free" (or null) that isn't expired.
 * Corporate has no mandatory expiry — active unless explicitly expired.
 */
const PAID_TIERS = new Set(['monthly', 'yearly', 'corporate', 'trial_monthly', 'trial_yearly']);

function isPaidTierActive(tier: string | null, end: Date | null): boolean {
  if (!tier || tier === 'free') return false;
  if (!PAID_TIERS.has(tier) && !tier.startsWith('trial')) return false;
  // No expiry set = treat as active (admin intentionally left it open)
  if (!end) return true;
  return new Date(end) > new Date();
}

export async function hasPaidAccess(userId: string, role: string): Promise<boolean> {
  // Super admin always has full access
  if (role === 'super_admin') return true;

  // Coworking admin with a claimed coworking = full access
  if (role === 'coworking_admin') {
    const edit = await prisma.coworkingEdit.findFirst({ where: { userId } });
    if (edit) return true;
  }

  const profile = await prisma.coworkerProfile.findUnique({
    where: { userId },
    select: { membershipTier: true, membershipEnd: true },
  });

  return isPaidTierActive(
    profile?.membershipTier ?? null,
    profile?.membershipEnd ? new Date(profile.membershipEnd) : null
  );
}

/** Free tier limit: 1 listing, 1 event */
export const FREE_LIMITS = { listings: 1, events: 1 };
