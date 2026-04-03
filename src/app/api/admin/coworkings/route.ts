import { NextRequest, NextResponse } from 'next/server';
import { coworkingsData } from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';

// Always fetch live data — never serve a cached build-time snapshot
export const dynamic = 'force-dynamic';

interface CoworkingWithOverride {
  [key: string]: any;
  isDeleted?: boolean;
}

/**
 * GET /api/admin/coworkings
 * Returns all coworkings with DB overrides merged
 */
export async function GET(request: NextRequest) {
  try {
    // Get all coworkings from static data
    let result = [...coworkingsData];

    // Fetch DB overrides if possible
    let overrides: Record<string, any> = {};
    try {
      const edits = await prisma.coworkingEdit.findMany();
      for (const edit of edits) {
        overrides[edit.coworkingSlug] = edit.data;
      }
    } catch (dbError) {
      // Gracefully handle DB connection failure
      console.warn('DB unavailable, using static data only:', dbError);
    }

    // Merge overrides into results
    const merged = result.map((cw) => {
      const override = overrides[cw.slug];
      if (override) {
        return { ...cw, ...override };
      }
      return cw;
    });

    // Filter out deleted coworkings for the list view
    const visible = merged.filter((cw: CoworkingWithOverride) => !cw.isDeleted);

    return NextResponse.json(visible, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching coworkings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
