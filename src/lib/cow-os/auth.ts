/**
 * COW.OS auth helpers — verify coworking ownership for multi-tenant isolation
 */
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export interface CowOsAuthResult {
  authorized: boolean;
  userId?: string;
  email?: string;
  role?: string;
  /** The INTERNAL original coworkingSlug (used as PK in all COW.OS tables) */
  coworkingSlug?: string;
  /** The effective URL slug (custom or original) — use for display only */
  displaySlug?: string;
  error?: string;
  status?: number;
}

/**
 * Resolve a URL slug (either original or customSlug) to the internal coworkingSlug.
 * Checks CoworkingEdit table: first by coworkingSlug, then by customSlug.
 * Returns the internal slug or null if not found.
 */
export async function resolveSlug(urlSlug: string | null): Promise<{
  internalSlug: string;
  displaySlug: string;
} | null> {
  if (!urlSlug) return null;

  try {
    // 1. Direct match on internal slug
    const byOriginal = await prisma.coworkingEdit.findUnique({
      where: { coworkingSlug: urlSlug },
      select: { coworkingSlug: true, customSlug: true },
    });
    if (byOriginal) {
      return {
        internalSlug: byOriginal.coworkingSlug,
        displaySlug: byOriginal.customSlug ?? byOriginal.coworkingSlug,
      };
    }

    // 2. Match on customSlug
    const byCustom = await prisma.coworkingEdit.findFirst({
      where: { customSlug: urlSlug },
      select: { coworkingSlug: true, customSlug: true },
    });
    if (byCustom) {
      return {
        internalSlug: byCustom.coworkingSlug,
        displaySlug: byCustom.customSlug ?? byCustom.coworkingSlug,
      };
    }
  } catch {
    // If customSlug column doesn't exist yet (before migration), fall back to direct match only
    return { internalSlug: urlSlug, displaySlug: urlSlug };
  }

  return null;
}

/**
 * Verify that the current user owns the given coworking (has approved claim).
 * Accepts either the original slug or a customSlug.
 */
export async function verifyCowOsOwner(slugParam: string | null): Promise<CowOsAuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { authorized: false, error: 'Nepřihlášen', status: 401 };
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const role = (session.user as Record<string, unknown>).role as string;
  const email = session.user.email;

  if (!slugParam) {
    return { authorized: false, error: 'Chybí coworkingSlug', status: 400 };
  }

  // Resolve slug (handles both original and custom slugs)
  const resolved = await resolveSlug(slugParam);
  const coworkingSlug = resolved?.internalSlug ?? slugParam;
  const displaySlug = resolved?.displaySlug ?? slugParam;

  // Super admin can access any coworking's COW.OS
  if (role === 'super_admin') {
    return { authorized: true, userId, email, role, coworkingSlug, displaySlug };
  }

  // Check approved claim (always against the internal/original slug)
  const claim = await prisma.coworkingClaim.findFirst({
    where: {
      userId,
      coworkingSlug,
      status: 'approved',
    },
  });

  if (!claim) {
    return { authorized: false, error: 'Nemáte oprávnění k tomuto coworkingu', status: 403 };
  }

  return { authorized: true, userId, email, role, coworkingSlug, displaySlug };
}

/**
 * Verify current user is authenticated (for coworker-facing endpoints).
 */
export async function verifyAuthenticated(): Promise<CowOsAuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { authorized: false, error: 'Nepřihlášen', status: 401 };
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const role = (session.user as Record<string, unknown>).role as string;

  return { authorized: true, userId, email: session.user.email, role };
}
