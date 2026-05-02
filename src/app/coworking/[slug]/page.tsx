import { notFound, redirect } from 'next/navigation';
import { coworkingsData } from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';
import { PDCoworkingDetail, type PDDetailCoworking } from '@/components/paper-diary/PDCoworkingDetail';

// Server-side renderování — DB overrides musí být live
export const dynamic = 'force-dynamic';

interface CoworkingDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return coworkingsData.map((coworking) => ({ slug: coworking.slug }));
}

/**
 * Resolve a URL slug to the internal coworkingSlug.
 * Returns null if neither original nor custom slug matches.
 * Returns { internalSlug, redirectTo } if a redirect is needed.
 */
async function resolvePublicSlug(urlSlug: string): Promise<{
  internalSlug: string;
  effectiveSlug: string;
  redirectTo?: string;
} | null> {
  // 1. Direct original slug
  const staticMatch = coworkingsData.find((c) => c.slug === urlSlug);
  if (staticMatch) {
    try {
      const edit = (await prisma.coworkingEdit.findUnique({
        where: { coworkingSlug: urlSlug },
        select: { coworkingSlug: true, customSlug: true } as any,
      })) as any;
      if (edit?.customSlug && edit.customSlug !== urlSlug) {
        return { internalSlug: urlSlug, effectiveSlug: edit.customSlug, redirectTo: edit.customSlug };
      }
    } catch {}
    return { internalSlug: urlSlug, effectiveSlug: urlSlug };
  }

  // 2. customSlug match
  try {
    const byCustom = (await prisma.coworkingEdit.findFirst({
      where: { customSlug: urlSlug } as any,
      select: { coworkingSlug: true, customSlug: true } as any,
    })) as any;
    if (byCustom) {
      return { internalSlug: byCustom.coworkingSlug, effectiveSlug: urlSlug };
    }
  } catch {}

  // 3. SlugRedirect table
  try {
    const redir = (await prisma.$queryRawUnsafe(
      `SELECT "toSlug" FROM "SlugRedirect" WHERE "fromSlug" = $1 LIMIT 1`,
      urlSlug
    )) as { toSlug: string }[];
    if (redir.length > 0) {
      return { internalSlug: urlSlug, effectiveSlug: redir[0].toSlug, redirectTo: redir[0].toSlug };
    }
  } catch {}

  return null;
}

async function getDbOverrides(internalSlug: string) {
  try {
    const edit = await prisma.coworkingEdit.findUnique({
      where: { coworkingSlug: internalSlug },
      select: { data: true },
    });
    return (edit?.data as Record<string, any>) ?? null;
  } catch {
    return null;
  }
}

export default async function CoworkingDetailPage({ params }: CoworkingDetailPageProps) {
  const resolved = await resolvePublicSlug(params.slug);
  if (!resolved) notFound();
  if (resolved.redirectTo) redirect(`/coworking/${resolved.redirectTo}`);

  const base = coworkingsData.find((cw) => cw.slug === resolved.internalSlug);
  if (!base) notFound();

  const overrides = await getDbOverrides(resolved.internalSlug);
  const merged: any = overrides && Object.keys(overrides).length > 0
    ? { ...base, ...overrides }
    : base;

  if (merged.deleted) notFound();

  const cw: PDDetailCoworking = {
    name: merged.name,
    slug: merged.slug,
    city: merged.city,
    address: merged.address ?? null,
    zipCode: merged.zipCode ?? null,
    phone: merged.phone ?? null,
    email: merged.email ?? null,
    website: merged.website ?? null,
    shortDescription: merged.shortDescription ?? null,
    description: merged.description ?? null,
    isVerified: !!merged.isVerified,
    isFeatured: !!merged.isFeatured,
    capacity: merged.capacity ?? null,
    areaM2: merged.areaM2 ?? null,
    amenities: merged.amenities ?? [],
    photos: merged.photos ?? [],
    prices: merged.prices ?? undefined,
    openingHours: merged.openingHours ?? undefined,
    location: merged.location ?? undefined,
  };

  return <PDCoworkingDetail cw={cw} />;
}
