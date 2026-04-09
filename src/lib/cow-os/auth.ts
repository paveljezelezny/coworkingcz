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
  coworkingSlug?: string;
  error?: string;
  status?: number;
}

/**
 * Verify that the current user owns the given coworking (has approved claim).
 * Pass coworkingSlug from query params.
 */
export async function verifyCowOsOwner(coworkingSlug: string | null): Promise<CowOsAuthResult> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { authorized: false, error: 'Nepřihlášen', status: 401 };
  }

  const userId = (session.user as Record<string, unknown>).id as string;
  const role = (session.user as Record<string, unknown>).role as string;
  const email = session.user.email;

  if (!coworkingSlug) {
    return { authorized: false, error: 'Chybí coworkingSlug', status: 400 };
  }

  // Super admin can access any coworking's COW.OS
  if (role === 'super_admin') {
    return { authorized: true, userId, email, role, coworkingSlug };
  }

  // Check approved claim
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

  return { authorized: true, userId, email, role, coworkingSlug };
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
