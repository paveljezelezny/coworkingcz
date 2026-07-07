import * as Sentry from '@sentry/nextjs';

// Edge runtime (middleware — invite gate). Stejný guard jako server config.
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: Boolean(process.env.SENTRY_DSN),
  tracesSampleRate: 0,
  environment: process.env.VERCEL_ENV || 'development',
});
