import * as Sentry from '@sentry/nextjs';

// Server-only Sentry. Aktivní jen když je nastavený SENTRY_DSN (Vercel ENV) —
// bez něj no-op, deploy je bezpečný i před založením Sentry účtu.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0, // jen error tracking, žádný performance sampling
  environment: process.env.VERCEL_ENV || 'development',
});
