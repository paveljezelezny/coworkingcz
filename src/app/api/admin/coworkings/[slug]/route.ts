import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { coworkingsData } from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { slug: string };
}

/**
 * GET /api/admin/coworkings/[slug]
 * Returns a single coworking with DB overrides merged
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const base = coworkingsData.find((cw) => cw.slug === params.slug);
    if (!base) {
      return NextResponse.json({ error: 'Coworking not found' }, { status: 404 });
    }

    let override = null;
    try {
      const edit = await prisma.coworkingEdit.findUnique({
        where: { coworkingSlug: params.slug },
      });
      if (edit) {
        override = edit.data;
      }
    } catch (dbError) {
      console.warn('DB unavailable, using static data only:', dbError);
    }

    const result = override ? { ...base, ...(override as object) } : base;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching coworking:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/coworkings/[slug]
 * Saves edits — vyžaduje super_admin session
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Auth: pouze super_admin
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
    }

    const userId = (session.user as any)?.id as string;
    if (!userId) {
      return NextResponse.json({ error: 'Chybí userId v session' }, { status: 401 });
    }

    const body = await request.json();

    const base = coworkingsData.find((cw) => cw.slug === params.slug);
    if (!base) {
      return NextResponse.json({ error: 'Coworking not found' }, { status: 404 });
    }

    // Uložit do DB s reálným userId ze session — žádné tiché spolknutí chyby
    await prisma.coworkingEdit.upsert({
      where: { coworkingSlug: params.slug },
      update: {
        data: body,
        userId,
      },
      create: {
        coworkingSlug: params.slug,
        data: body,
        userId,
      },
    });

    const merged = { ...base, ...body };
    return NextResponse.json(merged);
  } catch (error: any) {
    console.error('PUT coworking error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Chyba při ukládání' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coworkings/[slug]
 * Marks coworking as deleted — vyžaduje super_admin session
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Přístup odmítnut' }, { status: 403 });
    }

    const userId = (session.user as any)?.id as string;
    if (!userId) {
      return NextResponse.json({ error: 'Chybí userId v session' }, { status: 401 });
    }

    const base = coworkingsData.find((cw) => cw.slug === params.slug);
    if (!base) {
      return NextResponse.json({ error: 'Coworking not found' }, { status: 404 });
    }

    await prisma.coworkingEdit.upsert({
      where: { coworkingSlug: params.slug },
      update: { data: { deleted: true }, userId },
      create: { coworkingSlug: params.slug, data: { deleted: true }, userId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE coworking error:', error);
    return NextResponse.json(
      { error: error?.message ?? 'Chyba při mazání' },
      { status: 500 }
    );
  }
}
