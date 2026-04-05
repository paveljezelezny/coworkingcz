import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type SessionUser = { id?: string; role?: string } & Record<string, unknown>;

async function ownerCheck(id: string, session: { user?: SessionUser } | null) {
  const userId = session?.user?.id;
  if (!userId) return { error: 'Nepřihlášen', status: 401 };
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id },
    select: { userId: true, isActive: true },
  });
  if (!listing) return { error: 'Inzerát nenalezen', status: 404 };
  const role = session?.user?.role ?? 'coworker';
  if (listing.userId !== userId && role !== 'super_admin') {
    return { error: 'Nemáte oprávnění', status: 403 };
  }
  return { listing };
}

// ---------------------------------------------------------------------------
// GET — single listing (for pre-filling edit form)
// ---------------------------------------------------------------------------

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listing = await prisma.marketplaceListing.findUnique({
    where: { id: params.id },
  });
  if (!listing) return NextResponse.json({ error: 'Nenalezeno' }, { status: 404 });

  return NextResponse.json({
    ...listing,
    tags: (() => { try { return JSON.parse(listing.tags ?? '{}'); } catch { return {}; } })(),
  });
}

// ---------------------------------------------------------------------------
// PATCH — full listing update (owner only)
// ---------------------------------------------------------------------------

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const check = await ownerCheck(params.id, session);
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json();

  // Build tags JSON the same way the create endpoint does
  let tagsJson: string | undefined;
  if (body.tags !== undefined || body.workType !== undefined || body.experienceLevel !== undefined) {
    const tagArray: string[] = Array.isArray(body.tags)
      ? body.tags.filter(Boolean)
      : typeof body.tags === 'string'
      ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : [];

    const meta = {
      tags: tagArray,
      workType: body.workType ?? null,
      experienceLevel: body.experienceLevel ?? null,
      availableFrom: body.availableFrom ?? null,
      condition: body.condition ?? null,
      externalUrl: body.externalUrl ?? null,
    };
    tagsJson = JSON.stringify(meta);
  }

  const updated = await prisma.marketplaceListing.update({
    where: { id: params.id },
    data: {
      ...(body.isActive !== undefined ? { isActive: Boolean(body.isActive) } : {}),
      ...(body.title !== undefined ? { title: String(body.title).trim() } : {}),
      ...(body.description !== undefined ? { description: String(body.description).trim() } : {}),
      ...(body.category !== undefined ? { category: body.category } : {}),
      ...(body.price !== undefined ? { price: body.price ? parseFloat(body.price) : null } : {}),
      ...(body.priceType !== undefined ? { priceType: body.priceType || null } : {}),
      ...(body.location !== undefined ? { location: body.location?.trim() || null } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail.trim() } : {}),
      ...(body.contactPhone !== undefined ? { contactPhone: body.contactPhone?.trim() || null } : {}),
      ...(tagsJson !== undefined ? { tags: tagsJson } : {}),
    },
  });

  return NextResponse.json({
    success: true,
    listing: {
      ...updated,
      tags: (() => { try { return JSON.parse(updated.tags ?? '{}'); } catch { return {}; } })(),
    },
  });
}

// ---------------------------------------------------------------------------
// DELETE — remove listing (owner only)
// ---------------------------------------------------------------------------

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const check = await ownerCheck(params.id, session);
  if ('error' in check) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  await prisma.marketplaceListing.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
