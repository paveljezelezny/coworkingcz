import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCowOsOwner, verifyAuthenticated } from '@/lib/cow-os/auth';
import { ensureCowOsTables } from '@/lib/cow-os/ensure-tables';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const slug = req.nextUrl.searchParams.get('slug');

  try {
    await ensureCowOsTables();
    // Fetch invoice with member info
    const invoiceResult = await prisma.$queryRawUnsafe<Record<string, unknown>[]>(
      `SELECT i.*, m."userId", m."name" as "memberName", m."email" as "memberEmail"
       FROM "CowOsInvoice" i
       JOIN "CowOsMember" m ON i."memberId" = m."id"
       WHERE i."id" = $1`,
      id
    );

    if (invoiceResult.length === 0) {
      return NextResponse.json({ error: 'Faktura nenalezena' }, { status: 404 });
    }

    const invoice = invoiceResult[0];
    const memberId = invoice.memberId as string;
    const invoiceCoworkingSlug = invoice.coworkingSlug as string;
    const memberUserId = invoice.userId as string;

    // Check authorization: either coworking owner or the member themselves
    if (slug) {
      // Coworking owner view
      const auth = await verifyCowOsOwner(slug);
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      // Verify invoice belongs to this coworking
      if (auth.coworkingSlug !== invoiceCoworkingSlug) {
        return NextResponse.json(
          { error: 'Nemáte oprávnění k této faktuře' },
          { status: 403 }
        );
      }

      return NextResponse.json(invoice, { status: 200 });
    } else {
      // Member view
      const auth = await verifyAuthenticated();
      if (!auth.authorized) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      // Verify member is the invoice's member
      if (auth.userId !== memberUserId) {
        return NextResponse.json(
          { error: 'Nemáte oprávnění k této faktuře' },
          { status: 403 }
        );
      }

      return NextResponse.json(invoice, { status: 200 });
    }
  } catch (error) {
    console.error('GET invoice error:', error);
    return NextResponse.json({ error: 'Chyba při načítání faktury' }, { status: 500 });
  }
}
