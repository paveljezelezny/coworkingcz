import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface RouteParams {
  params: { slug: string };
}

/**
 * Resolve URL slug to internal slug + CoworkingEdit record.
 * Supports both original slug and customSlug.
 */
async function resolveEdit(urlSlug: string) {
  // Try original slug first
  let edit = await prisma.coworkingEdit.findUnique({
    where: { coworkingSlug: urlSlug },
  });
  if (edit) return edit;

  // Try customSlug
  try {
    edit = await prisma.coworkingEdit.findFirst({
      where: { customSlug: urlSlug } as any,
    });
  } catch {
    // customSlug column may not exist yet before migration
  }
  return edit ?? null;
}

// GET /api/coworkings/[slug]/edit — load edit data for owner
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const edit = await resolveEdit(params.slug);

  if (!edit) {
    return NextResponse.json({ error: 'Coworking nenalezen nebo není ve správě' }, { status: 404 });
  }

  // Only owner or super_admin can access
  if (edit.userId !== session.user.id && session.user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Přístup zamítnut' }, { status: 403 });
  }

  return NextResponse.json({
    data: edit.data,
    updatedAt: edit.updatedAt,
    internalSlug: edit.coworkingSlug,
    customSlug: (edit as any).customSlug ?? null,
    slugChangedAt: (edit as any).slugChangedAt ?? null,
  });
}

// PUT /api/coworkings/[slug]/edit — save edits
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const edit = await resolveEdit(params.slug);

    if (!edit) {
      return NextResponse.json({ error: 'Coworking nenalezen' }, { status: 404 });
    }

    if (edit.userId !== session.user.id && session.user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Přístup zamítnut' }, { status: 403 });
    }

    // Sanitize allowed fields only
    const allowed = [
      'name', 'shortDescription', 'description',
      'phone', 'email', 'website',
      'address', 'city', 'zipCode',
      'openingHours', 'amenities',
      'prices',
      'capacity', 'areaM2',
      'photos',
      'rooms',
      'specialDeal',
      'youtubeUrl', 'matterportUrl',
      'hasEventSpace', 'venueTypes',
    ];

    const sanitized: Record<string, any> = {};
    for (const key of allowed) {
      if (key in body) sanitized[key] = body[key];
    }

    const updated = await prisma.coworkingEdit.update({
      where: { coworkingSlug: edit.coworkingSlug },
      data: { data: sanitized, publishedAt: new Date() },
    });

    // Revalidate both original and custom slug public pages
    revalidatePath(`/coworking/${edit.coworkingSlug}`);
    const customSlug = (edit as any).customSlug;
    if (customSlug) revalidatePath(`/coworking/${customSlug}`);

    return NextResponse.json({ success: true, updatedAt: updated.updatedAt });
  } catch (err) {
    console.error('Edit save error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání' }, { status: 500 });
  }
}
