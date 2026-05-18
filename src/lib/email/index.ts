/**
 * COW.OS email service — single entry point.
 *
 * Usage:
 *   import { sendInvoiceIssuedEmail } from '@/lib/email';
 *   await sendInvoiceIssuedEmail({ to, coworkingName, memberName, invoiceNumber, total, dueDate, invoiceUrl, variableSymbol, iban });
 *
 * Default provider = 'console' (logs only). Set EMAIL_PROVIDER=resend + RESEND_API_KEY to send for real.
 *
 * All helpers return a Promise<EmailSendResult> and never throw — the worst case is a logged warning.
 */

import { sendEmail, type EmailSendResult } from './provider';
import * as t from './templates';

export { sendEmail, __mockOutbox, __clearMockOutbox } from './provider';
export type { EmailPayload, EmailSendResult, EmailProvider } from './provider';

interface SendArgs<P> {
  to: string;
  replyTo?: string;
  props: P;
}

function logIfFailed(result: EmailSendResult, tag: string) {
  if (!result.success) {
    // eslint-disable-next-line no-console
    console.warn(`[email:${tag}] send failed:`, result.error || 'unknown', '(provider:', result.provider + ')');
  }
  return result;
}

export async function sendInvoiceIssuedEmail(args: SendArgs<Parameters<typeof t.invoiceIssued>[0]>) {
  const { subject, html, text } = t.invoiceIssued(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'invoice-issued' });
  return logIfFailed(res, 'invoice-issued');
}

export async function sendInvoiceReminderEmail(args: SendArgs<Parameters<typeof t.invoiceReminder>[0]>) {
  const { subject, html, text } = t.invoiceReminder(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'invoice-reminder' });
  return logIfFailed(res, 'invoice-reminder');
}

export async function sendTrialEndingEmail(args: SendArgs<Parameters<typeof t.trialEnding>[0]>) {
  const { subject, html, text } = t.trialEnding(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'trial-ending' });
  return logIfFailed(res, 'trial-ending');
}

export async function sendPaymentFailedEmail(args: SendArgs<Parameters<typeof t.paymentFailed>[0]>) {
  const { subject, html, text } = t.paymentFailed(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'payment-failed' });
  return logIfFailed(res, 'payment-failed');
}

export async function sendWelcomeMemberEmail(args: SendArgs<Parameters<typeof t.welcomeMember>[0]>) {
  const { subject, html, text } = t.welcomeMember(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'welcome-member' });
  return logIfFailed(res, 'welcome-member');
}

// ─── AUTH FLOW e-maily ────────────────────────────────────────────────────────

export async function sendPasswordResetEmail(args: SendArgs<Parameters<typeof t.passwordResetRequest>[0]>) {
  const { subject, html, text } = t.passwordResetRequest(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'password-reset' });
  return logIfFailed(res, 'password-reset');
}

export async function sendPasswordChangedEmail(args: SendArgs<Parameters<typeof t.passwordChanged>[0]>) {
  const { subject, html, text } = t.passwordChanged(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'password-changed' });
  return logIfFailed(res, 'password-changed');
}

export async function sendVerificationEmail(args: SendArgs<Parameters<typeof t.emailVerification>[0]>) {
  const { subject, html, text } = t.emailVerification(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'email-verification' });
  return logIfFailed(res, 'email-verification');
}

export async function sendRegistrationWelcomeEmail(args: SendArgs<Parameters<typeof t.registrationWelcome>[0]>) {
  const { subject, html, text } = t.registrationWelcome(args.props);
  const res = await sendEmail({ to: args.to, replyTo: args.replyTo, subject, html, text, tag: 'registration-welcome' });
  return logIfFailed(res, 'registration-welcome');
}
