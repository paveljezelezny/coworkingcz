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

// ─── AUTH FLOW (password reset, email verification, welcome) ─────────────────
// Vlastní layout — auth e-maily nejsou COW.OS workflow.
// Čistá paper-diary plocha s coworkings.cz brandem.

const authLayout = (innerHtml: string) => `<!doctype html>
<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#efe9dc;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#efe9dc;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#fdfbf4;border:1px solid #d9d1bf;border-radius:6px;padding:32px;">
        <tr><td style="text-align:center;">
          <p style="margin:0 0 24px;font-size:28px;font-weight:600;letter-spacing:-1.2px;color:#1a1a1a;">
            coworkings<span style="color:#c76a54;font-family:'Bradley Hand',cursive;">.cz</span>
          </p>
          ${innerHtml}
        </td></tr>
      </table>
      <p style="margin:18px 0 0;font-size:11px;color:#8a8470;">
        Tenhle e-mail ti přišel z coworkings.cz. Pokud jsi o nic nežádal/a, klidně ho ignoruj.
      </p>
    </td></tr>
  </table>
</body></html>`;

// 1) Žádost o reset hesla — odkaz s tokenem, vyprší za N hodin
interface PasswordResetRequestProps {
  name: string | null;
  email: string;
  resetUrl: string;
  expiresHours: number;
}
export function passwordResetRequest(p: PasswordResetRequestProps) {
  const subject = 'Reset hesla na COWORKINGS.cz';
  const greeting = p.name ? `Ahoj ${p.name},` : 'Ahoj,';
  const html = authLayout(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;">Reset hesla</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">
      Někdo (pravděpodobně ty) si vyžádal reset hesla pro účet <strong>${p.email}</strong>.
      Klikni na odkaz a nastav si nové heslo:
    </p>
    <p style="margin:24px 0;">
      <a href="${p.resetUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fdfbf4;text-decoration:none;font-weight:600;border-radius:4px;">Nastavit nové heslo →</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6b6558;text-align:left;">
      Odkaz vyprší za ${p.expiresHours} hodin/y. Pokud tě po té zlomí klikni, jdi na
      <a href="https://coworkings.cz/prihlaseni/zapomenute-heslo" style="color:#2e5fa1;">coworkings.cz/prihlaseni/zapomenute-heslo</a>
      a požádej znovu.
    </p>
  `);
  const text = `${greeting}

Někdo si vyžádal reset hesla pro účet ${p.email}.
Nastav si nové heslo: ${p.resetUrl}

Odkaz vyprší za ${p.expiresHours} hodin/y. Pokud jsi reset nežádal/a, e-mail klidně ignoruj.`;
  return { subject, html, text };
}

// 2) Potvrzení po úspěšné změně hesla
interface PasswordChangedProps {
  name: string | null;
  email: string;
  changedAt: Date;
}
export function passwordChanged(p: PasswordChangedProps) {
  const subject = 'Heslo na COWORKINGS.cz bylo změněno';
  const greeting = p.name ? `Ahoj ${p.name},` : 'Ahoj,';
  const html = authLayout(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;">Heslo bylo změněno</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">
      Tvoje heslo pro účet <strong>${p.email}</strong> bylo právě změněno
      (${fmtDate(p.changedAt)} ${p.changedAt.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}).
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">
      Pokud jsi to nebyl/a ty, někdo má přístup k tvému e-mailu. Okamžitě
      <a href="https://coworkings.cz/prihlaseni/zapomenute-heslo" style="color:#c76a54;">znovu resetuj heslo</a>
      a kontaktuj nás na pavel@pracovna.cz.
    </p>
  `);
  const text = `${greeting}

Tvoje heslo pro účet ${p.email} bylo změněno ${fmtDate(p.changedAt)}.

Pokud jsi to nebyl/a ty, znovu resetuj heslo na https://coworkings.cz/prihlaseni/zapomenute-heslo a napiš nám na pavel@pracovna.cz.`;
  return { subject, html, text };
}

// 3) Ověření e-mailu po registraci
interface EmailVerificationProps {
  name: string | null;
  email: string;
  verifyUrl: string;
}
export function emailVerification(p: EmailVerificationProps) {
  const subject = 'Ověř si e-mail na COWORKINGS.cz';
  const greeting = p.name ? `Ahoj ${p.name},` : 'Ahoj,';
  const html = authLayout(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;">Vítej na palubě!</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">${greeting}</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">
      Díky za registraci na COWORKINGS.cz. Než půjdeme dál, klikni na tlačítko a ověř, že <strong>${p.email}</strong> patří fakt tobě:
    </p>
    <p style="margin:24px 0;">
      <a href="${p.verifyUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fdfbf4;text-decoration:none;font-weight:600;border-radius:4px;">Ověřit e-mail →</a>
    </p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.5;color:#6b6558;text-align:left;">
      Odkaz vyprší za 24 hodin. Pokud jsi se neregistroval/a, ignoruj e-mail — bez ověření se s účtem nic neděje.
    </p>
  `);
  const text = `${greeting}

Díky za registraci na COWORKINGS.cz.
Ověř svůj e-mail kliknutím: ${p.verifyUrl}

Odkaz vyprší za 24 hodin.`;
  return { subject, html, text };
}

// 4) Welcome po dokončené verifikaci
interface RegistrationWelcomeProps {
  name: string | null;
  email: string;
}
export function registrationWelcome(p: RegistrationWelcomeProps) {
  const subject = 'Vítej v COWORKINGS.cz! 🎉';
  const greeting = p.name ? `Ahoj ${p.name},` : 'Ahoj,';
  const html = authLayout(`
    <h1 style="margin:0 0 14px;font-size:22px;font-weight:700;line-height:1.3;color:#1a1a1a;">E-mail máš ověřený. Vítej!</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">${greeting}</p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#3a3a3a;text-align:left;">
      Máš účet (${p.email}) plně aktivní. Pár tipů, kde začít:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:15px;line-height:1.7;color:#3a3a3a;text-align:left;">
      <li><a href="https://coworkings.cz/coworkingy" style="color:#2e5fa1;">Prozkoumej coworkingy</a> — všech 90+ v Česku</li>
      <li><a href="https://coworkings.cz/udalosti" style="color:#2e5fa1;">Mrkni na události</a> — co se kde děje</li>
      <li><a href="https://coworkings.cz/profil" style="color:#2e5fa1;">Doplň si profil</a> — ostatní coworkeři tě poznají</li>
    </ul>
    <p style="margin:24px 0 0;font-family:'Bradley Hand','Caveat',cursive;font-size:22px;color:#c76a54;text-align:left;">
      Brzy na viděnou! — tým Cokoliv s.r.o.
    </p>
  `);
  const text = `${greeting}

E-mail máš ověřený, účet ${p.email} je aktivní.

Kde začít:
  • Coworkingy: https://coworkings.cz/coworkingy
  • Události:   https://coworkings.cz/udalosti
  • Profil:     https://coworkings.cz/profil

Brzy na viděnou!
— tým Cokoliv s.r.o.`;
  return { subject, html, text };
}
