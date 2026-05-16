/**
 * COW.OS email templates.
 * Plain template-string approach — fast build, no extra deps.
 * If/when we want React Email components, migrate file-by-file.
 *
 * Every template returns { subject, html, text } so the email worker
 * can pass it straight to the provider.
 */

interface BaseProps {
  coworkingName: string;
  memberName: string;
}

interface InvoiceIssuedProps extends BaseProps {
  invoiceNumber: string;
  total: number; // CZK
  dueDate: Date;
  invoiceUrl: string; // absolute URL to /profil/cow-os/doklad/{id}
  variableSymbol: string;
  iban?: string;
}

interface InvoiceReminderProps extends BaseProps {
  invoiceNumber: string;
  total: number;
  daysOverdue: number;
  invoiceUrl: string;
}

interface TrialEndingProps extends BaseProps {
  daysLeft: number;
  pricingUrl: string;
}

interface PaymentFailedProps extends BaseProps {
  amount: number;
  retryUrl: string;
}

interface WelcomeMemberProps extends BaseProps {
  planName: string;
  endDate: Date;
}

function fmtCzk(amount: number): string {
  return new Intl.NumberFormat('cs-CZ', { style: 'currency', currency: 'CZK', maximumFractionDigits: 0 }).format(amount);
}

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat('cs-CZ').format(d);
}

const layoutHtml = (innerHtml: string, footerNote = '') => `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;color:#1c1c1c;line-height:1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f3ee;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#fffdf8;border:1px solid #1c1c1c;max-width:600px;">
        <tr><td style="padding:32px 40px 16px;border-bottom:1px solid #1c1c1c;">
          <div style="font-size:14px;letter-spacing:0.1em;color:#5a5a5a;text-transform:uppercase;">COW.OS</div>
          <div style="font-size:13px;color:#7a7a7a;margin-top:4px;">coworkings.cz</div>
        </td></tr>
        <tr><td style="padding:32px 40px;font-size:15px;">
          ${innerHtml}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid #ddd;font-size:12px;color:#7a7a7a;">
          ${footerNote || 'Tento e-mail vám posílá platforma <strong>COW.OS</strong> v zastoupení vašeho coworkingu.'}<br>
          <a href="https://coworkings.cz" style="color:#7a7a7a;">coworkings.cz</a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

export function invoiceIssued(p: InvoiceIssuedProps) {
  const subject = `Nová faktura ${p.invoiceNumber} — ${p.coworkingName}`;
  const html = layoutHtml(`
    <h1 style="font-size:22px;margin:0 0 16px;">Vystavili jsme vám fakturu</h1>
    <p>Dobrý den ${p.memberName},</p>
    <p>${p.coworkingName} vám vystavil novou fakturu za členství:</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;width:100%;border:1px solid #e0d8c8;">
      <tr><td style="padding:12px 16px;background:#faf6ee;width:40%;">Číslo faktury</td><td style="padding:12px 16px;"><strong>${p.invoiceNumber}</strong></td></tr>
      <tr><td style="padding:12px 16px;background:#faf6ee;">Částka</td><td style="padding:12px 16px;"><strong>${fmtCzk(p.total)}</strong></td></tr>
      <tr><td style="padding:12px 16px;background:#faf6ee;">Splatnost</td><td style="padding:12px 16px;">${fmtDate(p.dueDate)}</td></tr>
      <tr><td style="padding:12px 16px;background:#faf6ee;">Variabilní symbol</td><td style="padding:12px 16px;">${p.variableSymbol}</td></tr>
      ${p.iban ? `<tr><td style="padding:12px 16px;background:#faf6ee;">IBAN</td><td style="padding:12px 16px;">${p.iban}</td></tr>` : ''}
    </table>
    <p style="margin:24px 0;"><a href="${p.invoiceUrl}" style="display:inline-block;padding:12px 24px;background:#1c1c1c;color:#fffdf8;text-decoration:none;font-weight:600;">Zobrazit fakturu →</a></p>
    <p style="color:#5a5a5a;font-size:13px;">Pokud jste platbu už provedli, ignorujte prosím tento e-mail.</p>
  `);
  const text = `Nová faktura ${p.invoiceNumber}

Dobrý den ${p.memberName},

${p.coworkingName} vám vystavil novou fakturu za členství:
- Číslo: ${p.invoiceNumber}
- Částka: ${fmtCzk(p.total)}
- Splatnost: ${fmtDate(p.dueDate)}
- Variabilní symbol: ${p.variableSymbol}
${p.iban ? `- IBAN: ${p.iban}\n` : ''}

Zobrazit fakturu: ${p.invoiceUrl}
`;
  return { subject, html, text };
}

export function invoiceReminder(p: InvoiceReminderProps) {
  const subject = `Připomínka platby: faktura ${p.invoiceNumber}`;
  const html = layoutHtml(`
    <h1 style="font-size:22px;margin:0 0 16px;">Připomínka platby</h1>
    <p>Dobrý den ${p.memberName},</p>
    <p>Faktura <strong>${p.invoiceNumber}</strong> od ${p.coworkingName} (${fmtCzk(p.total)}) je <strong>${p.daysOverdue} dní po splatnosti</strong>.</p>
    <p style="margin:24px 0;"><a href="${p.invoiceUrl}" style="display:inline-block;padding:12px 24px;background:#1c1c1c;color:#fffdf8;text-decoration:none;font-weight:600;">Zobrazit fakturu →</a></p>
    <p style="color:#5a5a5a;font-size:13px;">Pokud jste platbu už provedli, prosím dejte nám vědět.</p>
  `);
  const text = `Připomínka platby: faktura ${p.invoiceNumber}

Faktura ${p.invoiceNumber} (${fmtCzk(p.total)}) je ${p.daysOverdue} dní po splatnosti.

Zobrazit: ${p.invoiceUrl}`;
  return { subject, html, text };
}

export function trialEnding(p: TrialEndingProps) {
  const subject = `Vaše zkušební období končí za ${p.daysLeft} dní`;
  const html = layoutHtml(`
    <h1 style="font-size:22px;margin:0 0 16px;">Trial brzy končí</h1>
    <p>Dobrý den ${p.memberName},</p>
    <p>Vaše zkušební období v ${p.coworkingName} skončí za <strong>${p.daysLeft} dní</strong>. Pokud chcete pokračovat, vyberte si některý z placených tarifů.</p>
    <p style="margin:24px 0;"><a href="${p.pricingUrl}" style="display:inline-block;padding:12px 24px;background:#1c1c1c;color:#fffdf8;text-decoration:none;font-weight:600;">Zobrazit tarify →</a></p>
  `);
  const text = `Vaše zkušební období v ${p.coworkingName} končí za ${p.daysLeft} dní.
Zobrazit tarify: ${p.pricingUrl}`;
  return { subject, html, text };
}

export function paymentFailed(p: PaymentFailedProps) {
  const subject = `Platba selhala — ${p.coworkingName}`;
  const html = layoutHtml(`
    <h1 style="font-size:22px;margin:0 0 16px;">Platba selhala</h1>
    <p>Dobrý den ${p.memberName},</p>
    <p>Nepodařilo se nám zpracovat vaši platbu ${fmtCzk(p.amount)} pro ${p.coworkingName}. Prosím zkontrolujte platební metodu.</p>
    <p style="margin:24px 0;"><a href="${p.retryUrl}" style="display:inline-block;padding:12px 24px;background:#1c1c1c;color:#fffdf8;text-decoration:none;font-weight:600;">Zkusit znovu →</a></p>
  `);
  const text = `Platba ${fmtCzk(p.amount)} pro ${p.coworkingName} selhala.
Zkusit znovu: ${p.retryUrl}`;
  return { subject, html, text };
}

export function welcomeMember(p: WelcomeMemberProps) {
  const subject = `Vítejte v ${p.coworkingName}`;
  const html = layoutHtml(`
    <h1 style="font-size:22px;margin:0 0 16px;">Vítejte!</h1>
    <p>Dobrý den ${p.memberName},</p>
    <p>${p.coworkingName} vás přidal jako člena s tarifem <strong>${p.planName}</strong>. Členství je platné do <strong>${fmtDate(p.endDate)}</strong>.</p>
    <p>Veškeré faktury, doklady a historii svého členství najdete ve svém profilu na <a href="https://coworkings.cz/profil/cow-os">coworkings.cz</a>.</p>
  `);
  const text = `Vítejte v ${p.coworkingName}!
Tarif: ${p.planName}
Platnost: do ${fmtDate(p.endDate)}
Profil: https://coworkings.cz/profil/cow-os`;
  return { subject, html, text };
}

// ── Pre-launch invite (waitlist) ──────────────────────────────────────────────
// Vlastní layout — pre-launch waitlist není COW.OS workflow, takže nechceme
// COW.OS branding hlavičky. Čistá paper-diary plocha s coworkings.cz brandem.

interface InviteConfirmationProps {
  email: string;
}

const preLaunchLayout = (innerHtml: string) => `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#efe9dc;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe9dc;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#fdfbf4;border:1px solid #d9d1bf;border-radius:6px;padding:32px;">
        <tr><td style="text-align:center;">
          <p style="margin:0 0 8px;font-size:30px;font-weight:600;letter-spacing:-1.2px;color:#1a1a1a;">
            coworkings<span style="color:#c76a54;font-family:'Bradley Hand',cursive;">.cz</span>
          </p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b6558;text-transform:uppercase;letter-spacing:0.08em;">
            největší coworkingová platforma v ČR
          </p>
          ${innerHtml}
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:11px;color:#8a8470;">
        Tenhle mail ti přišel, protože jsi nechal/a svůj email na coworkings.cz/zakladame.
      </p>
    </td></tr>
  </table>
</body></html>`;

export function inviteConfirmation(_p: InviteConfirmationProps) {
  const subject = 'Jsi na seznamu — díky! ✉️ COWORKINGS.cz';
  const html = preLaunchLayout(`
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
    <p style="margin:0;font-family:'Bradley Hand','Caveat',cursive;font-size:24px;color:#c76a54;">
      Brzy na viděnou! &mdash; tým Cokoliv s.r.o.
    </p>
  `);
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
  return { subject, html, text };
}
