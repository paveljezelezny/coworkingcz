// Transactional email helpers (Resend přes fetch — bez extra dependency).
//
// Resend setup:
//   1. Účet na resend.com → API Keys → vytvoř klíč (re_…)
//   2. Domains → přidej coworkings.cz, do DNS přidej SPF/DKIM/Return-Path
//      (Resend ti záznamy ukáže — propaguje se ~1h)
//   3. Vercel ENV:
//        RESEND_API_KEY=re_...
//        RESEND_FROM="COWORKINGS.cz <pozvanky@coworkings.cz>"
//
// Bez ověřené domény Resend dovoluje posílat jen z onboarding@resend.dev
// a jen na email vlastníka účtu — pro produkci je verifikace nutná.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

interface ResendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

async function sendViaResend({ to, subject, html, text, replyTo }: SendArgs): Promise<ResendResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || 'COWORKINGS.cz <onboarding@resend.dev>';

  if (!apiKey) {
    return { ok: false, error: 'RESEND_API_KEY není nastaven' };
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        text,
        reply_to: replyTo,
      }),
    });

    const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string; name?: string };

    if (!res.ok) {
      return { ok: false, error: data?.message ?? `HTTP ${res.status}` };
    }
    return { ok: true, id: data?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message ?? 'send failed' };
  }
}

// ─── Templates ───────────────────────────────────────────────────────────────

/** Potvrzovací email po zápisu na pre-landing waitlist. */
export function sendInviteConfirmation(toEmail: string): Promise<ResendResult> {
  const subject = 'Jsi na seznamu — díky! ✉️ COWORKINGS.cz';

  // Vědomě jednoduché HTML — žádné CSS reset hacks, dobré rendering ve většině klientů.
  const html = `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#efe9dc;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe9dc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#fdfbf4;border:1px solid #d9d1bf;border-radius:6px;padding:32px;">
          <tr>
            <td style="text-align:center;">
              <p style="margin:0 0 8px;font-size:30px;font-weight:600;letter-spacing:-1.2px;color:#1a1a1a;">
                coworkings<span style="color:#c76a54;font-family:'Bradley Hand',cursive;">.cz</span>
              </p>
              <p style="margin:0 0 24px;font-size:13px;color:#6b6558;text-transform:uppercase;letter-spacing:0.08em;">
                největší coworkingová platforma v ČR
              </p>

              <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;">
                Díky! Zapsali jsme tě na seznam.
              </h1>

              <p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#3a3a3a;">
                Jakmile spustíme, dostaneš od nás osobní pozvánku s kódem,
                kterým se dostaneš dovnitř <strong>dřív než ostatní</strong>.
              </p>

              <p style="margin:0 0 28px;font-size:16px;line-height:1.55;color:#3a3a3a;">
                Mezitím makáme &mdash; a kdyby tě v hlavě napadla
                jakákoliv otázka, můžeš na tenhle email rovnou odpovědět.
              </p>

              <p style="margin:0;font-family:'Bradley Hand','Caveat',cursive;font-size:24px;color:#c76a54;transform:rotate(-1.5deg);">
                Brzy na viděnou! &mdash; tým Cokoliv s.r.o.
              </p>
            </td>
          </tr>
        </table>

        <p style="margin:18px 0 0;font-size:11px;color:#8a8470;">
          Tenhle mail ti přišel, protože jsi nechal/a svůj email na coworkings.cz/zakladame.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    'Díky! Zapsali jsme tě na seznam.',
    '',
    'Jakmile COWORKINGS.cz spustíme, dostaneš od nás osobní pozvánku s kódem,',
    'kterým se dostaneš dovnitř dřív než ostatní.',
    '',
    'Mezitím makáme — a kdyby tě v hlavě napadla jakákoliv otázka,',
    'můžeš na tenhle email rovnou odpovědět.',
    '',
    'Brzy na viděnou!',
    '— tým Cokoliv s.r.o.',
  ].join('\n');

  const replyTo = process.env.RESEND_REPLY_TO?.trim() || undefined;

  return sendViaResend({ to: toEmail, subject, html, text, replyTo });
}
