import { NextResponse } from 'next/server';
import { coworkingsData } from '@/lib/data/coworkings';
import { prisma } from '@/lib/prisma';

// Always serve fresh data — never serve a cached build-time snapshot
export const dynamic = 'force-dynamic';

/**
 * GET /api/coworkings
 * Public endpoint: returns all coworkings with DB overrides merged.
 * Mirrors /api/admin/coworkings but requires no authentication.
 */
export async function GET() {
  try {
    // Load DB overrides
    let overrides: Record<string, Record<string, unknown>> = {};
    try {
      const edits = await prisma.coworkingEdit.findMany();
      for (const edit of edits) {
        const data = edit.data as Record<string, unknown>;
        overrides[edit.coworkingSlug] = data;
      }
    } catch {
      // DB unavailable — serve static data as-is
    }

    // Merge overrides into static data and filter deleted
    const merged = coworkingsData
      .map((cw) => {
        const override = overrides[cw.slug];
        return override ? { ...cw, ...override } : cw;
      })
      .filter((cw) => !(cw as unknown as Record<string, unknown>).isDeleted);

    return NextResponse.json(merged, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('Error fetching coworkings:', error);
    // Graceful fallback to static data
    return NextResponse.json(coworkingsData);
  }
}
