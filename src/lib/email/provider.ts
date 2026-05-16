/**
 * Email provider abstraction for COW.OS.
 *
 * Switch between providers via ENV: EMAIL_PROVIDER=console|resend|mock
 * Default = 'console' (logs to stdout, doesn't send anywhere).
 *
 * To activate Resend in production:
 *   1. npm install resend
 *   2. Set ENV: EMAIL_PROVIDER=resend, RESEND_API_KEY=re_..., EMAIL_FROM="COW.OS <noreply@coworkings.cz>"
 *   3. Verify the sender domain in Resend dashboard.
 *
 * 'mock' is for unit tests — captures sent emails into an in-memory list.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  /** Optional reply-to address (e.g. the coworking's contact email) */
  replyTo?: string;
  /** Optional tag for analytics / log filtering */
  tag?: string;
}

export interface EmailSendResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
}

export type EmailProvider = 'console' | 'resend' | 'mock';

function getProvider(): EmailProvider {
  const raw = (process.env.EMAIL_PROVIDER || '').toLowerCase().trim();
  if (raw === 'resend' || raw === 'mock' || raw === 'console') return raw;
  // Auto-detect: if RESEND_API_KEY is set, use resend. Otherwise console.
  if (process.env.RESEND_API_KEY) return 'resend';
  return 'console';
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'COW.OS <noreply@coworkings.cz>';
}

// In-memory store for 'mock' provider (used in tests)
export const __mockOutbox: EmailPayload[] = [];

async function sendViaConsole(payload: EmailPayload): Promise<EmailSendResult> {
  // eslint-disable-next-line no-console
  console.log('📧 [EMAIL:console]', {
    to: payload.to,
    subject: payload.subject,
    tag: payload.tag,
    textPreview: (payload.text || payload.html.replace(/<[^>]+>/g, '')).slice(0, 200),
  });
  return { success: true, provider: 'console', messageId: 'console-' + Date.now() };
}

async function sendViaResend(payload: EmailPayload): Promise<EmailSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { success: false, provider: 'resend', error: 'RESEND_API_KEY not configured' };
  }

  try {
    // We talk to Resend over HTTP to avoid pinning the SDK version here.
    // When you `npm install resend`, you can swap this for: new Resend(apiKey).emails.send(...)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromAddress(),
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
        tags: payload.tag ? [{ name: 'category', value: payload.tag }] : undefined,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { success: false, provider: 'resend', error: `Resend ${res.status}: ${errText.slice(0, 200)}` };
    }
    const data = await res.json();
    return { success: true, provider: 'resend', messageId: data.id };
  } catch (err) {
    return { success: false, provider: 'resend', error: (err as Error).message };
  }
}

async function sendViaMock(payload: EmailPayload): Promise<EmailSendResult> {
  __mockOutbox.push(payload);
  return { success: true, provider: 'mock', messageId: 'mock-' + __mockOutbox.length };
}

/**
 * Send an email via the configured provider.
 * Never throws — always returns a result object.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const provider = getProvider();
  switch (provider) {
    case 'resend': return sendViaResend(payload);
    case 'mock': return sendViaMock(payload);
    case 'console':
    default: return sendViaConsole(payload);
  }
}

/** Used in tests — clear mock outbox between runs */
export function __clearMockOutbox() {
  __mockOutbox.length = 0;
}
