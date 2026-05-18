import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { randomUUID } from 'crypto';

function publicAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'https://coworkings.cz';
}

async function logAudit(claimId: string, action: string, actorUserId: string | null, fromStatus: string | null, toStatus: string | null, note?: string) {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ClaimAuditLog" ("id", "claimId", "action", "actorUserId", "fromStatus", "toStatus", "note", "createdAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      randomUUID(),
      claimId,
      action,
      actorUserId,
      fromStatus,
      toStatus,
      note ?? null,
      new Date(),
    );
  } catch (err) {
    // Audit log nesmí blokovat akci. Jen zalogovat error a pokračovat.
    console.error('[audit] insert failed:', (err as Error).message);
  }
}

// POST /api/claims — submit a coworking claim
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Musíš být přihlášen' }, { status: 401 });
  }

  try {
    const { coworkingSlug, coworkingName, businessEmail, message } = await req.json();

    if (!coworkingSlug || !coworkingName) {
      return NextResponse.json({ error: 'Chybí povinná pole' }, { status: 400 });
    }

    const userId = session.user.id;
    const userRole = (session.user as any).role as string | undefined;
    const userEmail = session.user.email as string | undefined;
    const userName = session.user.name as string | undefined;
    const isSuperAdmin = userRole === 'super_admin';

    // Check if already claimed by this user
    const existing = await prisma.coworkingClaim.findUnique({
      where: { userId_coworkingSlug: { userId, coworkingSlug } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Tento coworking jsi již nárokoval' }, { status: 400 });
    }

    // Check if this coworking is already claimed by someone else
    const otherClaim = await prisma.coworkingEdit.findUnique({
      where: { coworkingSlug },
    });
    const alreadyOwned = !!(otherClaim && otherClaim.userId !== userId);

    // Determine initial status:
    //   - super_admin claimující volný coworking → auto-approved
    //   - jakýkoli user na obsazený coworking → transfer_pending (žádost o převod)
    //   - běžný user na volný coworking → pending (čeká na schválení)
    let initialStatus: 'pending' | 'approved' | 'transfer_pending' = 'pending';
    let auditAction = 'created';
    if (alreadyOwned) {
      initialStatus = 'transfer_pending';
      auditAction = 'transfer_requested';
    } else if (isSuperAdmin) {
      initialStatus = 'approved';
      auditAction = 'auto_approved';
    }

    // Create claim
    const claim = await prisma.coworkingClaim.create({
      data: {
        userId,
        coworkingSlug,
        coworkingName,
        businessEmail,
        message,
        status: initialStatus,
      },
    });

    await logAudit(claim.id, auditAction, userId, null, initialStatus);

    // For auto-approve super_admin: rovnou vytvořit CoworkingEdit
    if (initialStatus === 'approved') {
      await prisma.coworkingEdit.upsert({
        where: { coworkingSlug },
        create: { coworkingSlug, userId, data: {} },
        update: { userId },
      });
      // Note: super_admin už role nepotřebuje upgradovat
    }

    // Pošli email super_adminovi (pokud claimuje běžný user nebo jde o transfer)
    if (initialStatus !== 'approved') {
      try {
        // Najdi všechny super_admin uživatele
        const admins = await prisma.user.findMany({
          where: { role: 'super_admin' },
          select: { email: true, name: true },
        });
        const subject = initialStatus === 'transfer_pending'
          ? `[COW] Žádost o převod: ${coworkingName}`
          : `[COW] Nová žádost o přivlastnění: ${coworkingName}`;
        const claimerLabel = userName ? `${userName} <${userEmail}>` : (userEmail || userId);
        const text = `Nová žádost čeká na schválení v admin panelu.

Coworking: ${coworkingName} (${coworkingSlug})
Žadatel:   ${claimerLabel}
Typ:       ${initialStatus === 'transfer_pending' ? 'PŘEVOD — coworking už má aktivního ownera' : 'Přivlastnění volného coworkingu'}
${businessEmail ? `Firemní email: ${businessEmail}\n` : ''}${message ? `Zpráva žadatele:\n${message}\n` : ''}
Schválit / zamítnout: ${publicAppUrl()}/admin/zadosti
`;
        const html = `<!doctype html><html><body style="font-family:system-ui;color:#1c1c1c;line-height:1.5;padding:20px;background:#f5f3ee;">
<div style="max-width:560px;margin:0 auto;background:#fffdf8;border:1px solid #1c1c1c;padding:24px 28px;">
<h2 style="margin:0 0 12px;font-size:18px;">${subject.replace('[COW] ', '')}</h2>
<p><strong>Coworking:</strong> ${coworkingName} <code style="font-size:12px;color:#666;">(${coworkingSlug})</code></p>
<p><strong>Žadatel:</strong> ${claimerLabel}</p>
<p><strong>Typ:</strong> ${initialStatus === 'transfer_pending' ? '⚠️ PŘEVOD — coworking už má aktivního ownera' : 'Přivlastnění volného coworkingu'}</p>
${businessEmail ? `<p><strong>Firemní email:</strong> ${businessEmail}</p>` : ''}
${message ? `<p><strong>Zpráva žadatele:</strong></p><blockquote style="margin:8px 0;padding:8px 12px;border-left:3px solid #c76a54;background:#faf6ee;">${message}</blockquote>` : ''}
<p style="margin-top:18px;"><a href="${publicAppUrl()}/admin/zadosti" style="display:inline-block;padding:10px 18px;background:#1c1c1c;color:#fffdf8;text-decoration:none;font-weight:600;">Otevřít admin žádostí →</a></p>
</div></body></html>`;
        // Fire-and-forget per admin
        for (const a of admins) {
          if (!a.email) continue;
          sendEmail({
            to: a.email,
            subject,
            text,
            html,
            tag: 'claim-admin-notif',
          }).catch(() => { /* logged inside */ });
        }
      } catch (err) {
        console.error('[claim:notify] failed:', (err as Error).message);
      }
    }

    return NextResponse.json({
      success: true,
      status: initialStatus,
      autoApproved: initialStatus === 'approved',
      transferRequest: initialStatus === 'transfer_pending',
      redirectTo: initialStatus === 'approved' ? `/spravce/${coworkingSlug}` : undefined,
    });
  } catch (err) {
    console.error('Claim error:', err);
    return NextResponse.json({ error: 'Chyba serveru' }, { status: 500 });
  }
}

// GET /api/claims — get all claims for current user
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Nepřihlášen' }, { status: 401 });
  }

  const claims = await prisma.coworkingClaim.findMany({
    where: { userId: session.user.id },
    select: { coworkingSlug: true, coworkingName: true, status: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });

  // Enrich approved claims with edited names from CoworkingEdit (owner may have renamed)
  const slugs = claims.filter((c: { status: string }) => c.status === 'approved').map((c: { coworkingSlug: string }) => c.coworkingSlug);
  let editedNames: Record<string, string> = {};
  if (slugs.length > 0) {
    try {
      const edits = await prisma.coworkingEdit.findMany({
        where: { coworkingSlug: { in: slugs } },
        select: { coworkingSlug: true, data: true },
      });
      for (const edit of edits) {
        const data = edit.data as Record<string, any> | null;
        if (data && typeof data.name === 'string' && data.name.trim()) {
          editedNames[edit.coworkingSlug] = data.name;
        }
      }
    } catch {
      // DB issue — fall back to original claim names
    }
  }

  const enriched = claims.map((c: { coworkingSlug: string; coworkingName: string; status: string; createdAt: Date }) => ({
    ...c,
    coworkingName: editedNames[c.coworkingSlug] ?? c.coworkingName,
  }));

  return NextResponse.json({ claims: enriched });
}
