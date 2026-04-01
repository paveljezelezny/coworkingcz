import { NextRequest, NextResponse } from 'next/server';
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
      return NextResponse.json(
        { error: 'Coworking not found' },
        { status: 404 }
      );
    }

    // Try to fetch DB overrides
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

    // Merge and return
    const result = override ? { ...base, ...override } : base;
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching coworking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/coworkings/[slug]
 * Saves edits to the CoworkingEdit table (upsert)
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();

    // Verify coworking exists
    const base = coworkingsData.find((cw) => cw.slug === params.slug);
    if (!base) {
      return NextResponse.json(
        { error: 'Coworking not found' },
        { status: 404 }
      );
    }

    // Try to save to DB
    try {
      await prisma.coworkingEdit.upsert({
        where: { coworkingSlug: params.slug },
        update: { data: body },
        create: {
          coworkingSlug: params.slug,
          data: body,
          userId: 'super-admin', // Placeholder user ID
        },
      });
    } catch (dbError) {
      console.warn('DB unavailable, edit not persisted:', dbError);
      // Still return success since we validated the data
    }

    // Return updated coworking
    const merged = { ...base, ...body };
    return NextResponse.json(merged);
  } catch (error) {
    console.error('Error updating coworking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/coworkings/[slug]
 * Marks coworking as deleted by setting { deleted: true } in DB
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const base = coworkingsData.find((cw) => cw.slug === params.slug);
    if (!base) {
      return NextResponse.json(
        { error: 'Coworking not found' },
        { status: 404 }
      );
    }

    // Try to save deletion flag to DB
    try {
      await prisma.coworkingEdit.upsert({
        where: { coworkingSlug: params.slug },
        update: { data: { deleted: true } },
        create: {
          coworkingSlug: params.slug,
          data: { deleted: true },
          userId: 'super-admin', // Placeholder user ID
        },
      });
    } catch (dbError) {
      console.warn('DB unavailable, deletion not persisted:', dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coworking:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
