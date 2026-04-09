import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { coworkingsData } from '@/lib/data/coworkings';

interface RouteParams {
  params: { slug: string };
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MIN = 3;
const SLUG_MAX = 80;
const RATE_LIMIT_DAYS = 30;

/**
 * POST /api/coworkings/[slug]/change-slug
 * Body: { newSlug: string }
 *
 * Rate limit: once per 30 days (bypassed by super_admin)
 * Validates: format, uniqueness, not already taken
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user as Record<string, unknown>).role as string;
  const isSuperAdmin = role === 'super_admin';

  // Resolve current edit record (supports both original and customSlug)
  let edit = await prisma.coworkingEdit.findUnique({
    where: { coworkingSlug: params.slug },
  });

  if (!edit) {
    try {
      edit = await prisma.coworkingEdit.findFirst({
        where: { customSlug: params.slug } as any,
      }) as any;
    } catch {}
  }

  if (!edit) {
    return NextResponse.json({ error: 'Coworking nenalezen' }, { status: 404 });
  }

  // Authorization check
  if (edit.userId !== userId && !isSuperAdmin) {
    return NextResponse.json({ error: 'Přístup zamítnut' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const newSlug: string = (body.newSlug || '').trim().toLowerCase();

  // ── Validation ──────────────────────────────────────────────────────────────

  if (!newSlug) {
    return NextResponse.json({ error: 'Nový slug je povinný' }, { status: 400 });
  }

  if (newSlug.length < SLUG_MIN || newSlug.length > SLUG_MAX) {
    return NextResponse.json(
      { error: `Slug musí být ${SLUG_MIN}–${SLUG_MAX} znaků` },
      { status: 400 }
    );
  }

  if (!SLUG_REGEX.test(newSlug)) {
    return NextResponse.json(
      { error: 'Slug smí obsahovat pouze malá písmena a-z, číslice 0-9 a pomlčky. Žádné háčky ani mezery.' },
      { status: 400 }
    );
  }

  // Cannot be the same as current
  const currentCustom = (edit as any).customSlug as string | null;
  const currentInternal = edit.coworkingSlug;
  if (newSlug === currentCustom || newSlug === currentInternal) {
    return NextResponse.json({ error: 'Slug je shodný se současným' }, { status: 400 });
  }

  // ── Rate limit ──────────────────────────────────────────────────────────────
  if (!isSuperAdmin) {
    const slugChangedAt = (edit as any).slugChangedAt as Date | null;
    if (slugChangedAt) {
      const daysSince = (Date.now() - new Date(slugChangedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < RATE_LIMIT_DAYS) {
        const daysLeft = Math.ceil(RATE_LIMIT_DAYS - daysSince);
        return NextResponse.json(
          { error: `Slug lze měnit jen jednou za ${RATE_LIMIT_DAYS} dní. Zbývá ${daysLeft} dní.` },
          { status: 429 }
        );
      }
    }
  }

  // ── Uniqueness check ────────────────────────────────────────────────────────

  // 1. Must not clash with any original static slug
  const staticSlugs = coworkingsData.map((c) => c.slug);
  if (staticSlugs.includes(newSlug) && newSlug !== currentInternal) {
    return NextResponse.json(
      { error: 'Tento slug je již obsazen jiným coworkingem' },
      { status: 409 }
    );
  }

  // 2. Must not clash with any other CoworkingEdit.coworkingSlug (original) except own
  const clashOriginal = await prisma.coworkingEdit.findUnique({
    where: { coworkingSlug: newSlug },
  });
  if (clashOriginal && clashOriginal.id !== edit.id) {
    return NextResponse.json(
      { error: 'Tento slug je již obsazen jiným coworkingem' },
      { status: 409 }
    );
  }

  // 3. Must not clash with any other CoworkingEdit.customSlug
  try {
    const clashCustom = await prisma.coworkingEdit.findFirst({
      where: { customSlug: newSlug } as any,
    }) as any;
    if (clashCustom && clashCustom.id !== edit.id) {
      return NextResponse.json(
        { error: 'Tento slug je již obsazen jiným coworkingem' },
        { status: 409 }
      );
    }
  } catch {}

  // ── Apply change ─────────────────────────────────────────────────────────────

  const now = new Date();

  // Store redirect from old custom slug → new slug
  if (currentCustom && currentCustom !== newSlug) {
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "SlugRedirect" ("id", "fromSlug", "toSlug", "createdAt")
         VALUES (gen_random_uuid()::text, $1, $2, $3)
         ON CONFLICT ("fromSlug") DO UPDATE SET "toSlug" = $2, "createdAt" = $3`,
        currentCustom,
        newSlug,
        now
      );
    } catch (err) {
      // SlugRedirect table may not exist yet — not critical, continue
      console.warn('SlugRedirect insert failed (table may not exist):', err);
    }
  }

  // Update CoworkingEdit with new customSlug
  try {
    await prisma.$executeRawUnsafe(
      `UPDATE "CoworkingEdit"
       SET "customSlug" = $1, "slugChangedAt" = $2, "updatedAt" = $3
       WHERE "id" = $4`,
      newSlug,
      now,
      now,
      edit.id
    );
  } catch (err) {
    // If customSlug column doesn't exist yet (before migration), this will fail
    console.error('Change slug update failed:', err);
    return NextResponse.json(
      { error: 'Slug nelze změnit — databáze ještě nebyla migrována. Zkuste znovu po nasazení.' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    newSlug,
    internalSlug: edit.coworkingSlug,
    slugChangedAt: now,
    message: `Slug úspěšně změněn. Nová URL: /coworking/${newSlug}`,
  });
}

/**
 * GET /api/coworkings/[slug]/change-slug
 * Returns current slug info and rate limit status.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = session.user.id;
  const role = (session.user as Record<string, unknown>).role as string;
  const isSuperAdmin = role === 'super_admin';

  let edit = await prisma.coworkingEdit.findUnique({
    where: { coworkingSlug: params.slug },
  });
  if (!edit) {
    try {
      edit = await prisma.coworkingEdit.findFirst({
        where: { customSlug: params.slug } as any,
      }) as any;
    } catch {}
  }

  if (!edit) {
    return NextResponse.json({ error: 'Coworking nenalezen' }, { status: 404 });
  }

  if (edit.userId !== userId && !isSuperAdmin) {
    return NextResponse.json({ error: 'Přístup zamítnut' }, { status: 403 });
  }

  const customSlug = (edit as any).customSlug as string | null;
  const slugChangedAt = (edit as any).slugChangedAt as Date | null;
  const internalSlug = edit.coworkingSlug;
  const effectiveSlug = customSlug ?? internalSlug;

  let daysUntilChange: number | null = null;
  let canChange = true;

  if (!isSuperAdmin && slugChangedAt) {
    const daysSince = (Date.now() - new Date(slugChangedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < RATE_LIMIT_DAYS) {
      daysUntilChange = Math.ceil(RATE_LIMIT_DAYS - daysSince);
      canChange = false;
    }
  }

  return NextResponse.json({
    internalSlug,
    customSlug,
    effectiveSlug,
    slugChangedAt,
    canChange,
    daysUntilChange,
    rateLimitDays: RATE_LIMIT_DAYS,
  });
}
