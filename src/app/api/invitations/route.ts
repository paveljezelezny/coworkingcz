// POST /api/invitations
// Veřejný endpoint pro pre-landing stránku — uloží email do tabulky Invitation.
// — duplicitní email vrací 200 (idempotentní, neprozrazujeme nic útočníkovi).
// — captures UTM, referrer, IP hash a user-agent pro super-admin analytiku.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashIp, getRequestIp, isValidEmail } from '@/lib/invite';
import { sendInviteConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // crypto.createHash potřebuje Node runtime

interface InvitePayload {
  email?: string;
  source?: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
    term?: string;
    content?: string;
  };
}

export async function POST(req: NextRequest) {
  let payload: InvitePayload;
  try {
    payload = (await req.json()) as InvitePayload;
  } catch {
    return NextResponse.json({ error: 'Neplatný JSON' }, { status: 400 });
  }

  const email = (payload.email ?? '').trim().toLowerCase();
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Neplatný email' }, { status: 400 });
  }

  // Anti-spam: max 300 znaků poznámky / zdroje
  const source = (payload.source ?? req.headers.get('referer') ?? '').slice(0, 300) || null;
  const userAgent = (req.headers.get('user-agent') ?? '').slice(0, 500) || null;
  const ipHash = hashIp(getRequestIp(req));

  // Prisma klient po migraci ještě nemusí mít vygenerované typy v sandboxu —
  // proto cast na any. Na Vercel/lokál Prisma sám generuje při buildu.
  const db = prisma as any;

  let isNewLead = false;
  try {
    // Zjistíme, zda email už není v DB — jen novým leadům posíláme potvrzení,
    // aby duplicitním submitem nešlo spamovat inbox.
    const existing = await db.invitation.findUnique({ where: { email }, select: { id: true } });
    isNewLead = !existing;

    await db.invitation.upsert({
      where: { email },
      create: {
        email,
        status: 'pending',
        source,
        utmSource:   payload.utm?.source   ?? null,
        utmMedium:   payload.utm?.medium   ?? null,
        utmCampaign: payload.utm?.campaign ?? null,
        utmTerm:     payload.utm?.term     ?? null,
        utmContent:  payload.utm?.content  ?? null,
        ipHash,
        userAgent,
      },
      // Pokud email už existuje, aktualizujeme jen "soft" pole.
      // Status záměrně NEpřepisujeme — pokud už `sent`, zůstane `sent`.
      update: {
        source:    source ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    });
  } catch (err) {
    console.error('[invitations] upsert failed', err);
    return NextResponse.json({ error: 'Nepodařilo se uložit, zkus to za chvíli.' }, { status: 500 });
  }

  // Potvrzovací mail jen pro nové leady. Selhání mailu NESMÍ shodit API —
  // záznam je v DB, případnou pozvánku pošleš ručně z /admin/pozvanky.
  if (isNewLead) {
    // await, ne fire-and-forget — Vercel serverless funkce se ukončí hned po response,
    // takže visící promise by se nedokončila. sendInviteConfirmationEmail nikdy nehází.
    await sendInviteConfirmationEmail({
      to: email,
      replyTo: process.env.RESEND_REPLY_TO || process.env.INVITE_REPLY_TO,
      props: { email },
    });
  }

  return NextResponse.json({ ok: true });
}
