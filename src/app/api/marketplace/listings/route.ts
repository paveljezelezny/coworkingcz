import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hasPaidAccess(userId: string, role: string): Promise<boolean> {
  if (role === 'super_admin') return true;

  // Coworking admin with claimed coworking = paid
  if (role === 'coworking_admin') {
    const edit = await prisma.coworkingEdit.findFirst({ where: { userId } });
    if (edit) return true;
  }

  // Coworker with active membership
  const profile = await prisma.coworkerProfile.findUnique({
    where: { userId },
    select: { membershipTier: true, membershipEnd: true },
  });
  if (
    profile?.membershipTier &&
    profile.membershipEnd &&
    new Date(profile.membershipEnd) > new Date()
  ) {
    return true;
  }

  return false;
}

// ---------------------------------------------------------------------------
// POST — create new listing
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: 'Pro přidání inzerátu se musíte přihlásit.' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const role: string = (session.user as any).role ?? 'coworker';

  // Quota check
  const paid = await hasPaidAccess(userId, role);
  if (!paid) {
    const existingCount = await prisma.marketplaceListing.count({
      where: { userId, isActive: true },
    });
    if (existingCount >= 1) {
      return NextResponse.json(
        {
          error:
            'Bezplatný účet může mít nejvýše 1 aktivní inzerát. Upgradujte členství pro neomezené inzeráty.',
          code: 'QUOTA_EXCEEDED',
        },
        { status: 403 }
      );
    }
  }

  try {
    const body = await req.json();

    const {
      title,
      description,
      category,
      tags,
      price,
      priceType,
      location,
      contactEmail,
      contactPhone,
      externalUrl,
      workType,
      experienceLevel,
      availableFrom,
      condition,
    } = body;

    // Basic validation
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Nadpis je povinný.' }, { status: 400 });
    }
    if (!description?.trim()) {
      return NextResponse.json({ error: 'Popis je povinný.' }, { status: 400 });
    }
    if (!category) {
      return NextResponse.json({ error: 'Kategorie je povinná.' }, { status: 400 });
    }
    if (!contactEmail?.trim()) {
      return NextResponse.json({ error: 'Kontaktní e-mail je povinný.' }, { status: 400 });
    }

    // Encode extra fields into tags so we stay schema-compatible
    const tagArray: string[] = Array.isArray(tags)
      ? tags.filter(Boolean)
      : typeof tags === 'string'
      ? tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [];

    // Store rich meta as JSON-encoded string in the tags field
    // (schema has tags as String?, so we store JSON)
    const meta = {
      tags: tagArray,
      workType: workType ?? null,
      experienceLevel: experienceLevel ?? null,
      availableFrom: availableFrom ?? null,
      condition: condition ?? null,
      externalUrl: externalUrl ?? null,
    };

    const listing = await prisma.marketplaceListing.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        category,
        tags: JSON.stringify(meta),
        price: price ? parseFloat(price) : null,
        priceType: priceType ?? null,
        location: location?.trim() ?? null,
        isActive: true,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone?.trim() ?? null,
      },
    });

    return NextResponse.json({ success: true, id: listing.id });
  } catch (err) {
    console.error('Marketplace create error:', err);
    return NextResponse.json({ error: 'Chyba při ukládání inzerátu.' }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// GET — current user's listings (for quota info)
// ---------------------------------------------------------------------------

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const userId = session.user.id;
  const role: string = (session.user as any).role ?? 'coworker';
  const paid = await hasPaidAccess(userId, role);

  const count = await prisma.marketplaceListing.count({
    where: { userId, isActive: true },
  });

  return NextResponse.json({ count, paid, limit: paid ? null : 1 });
}
