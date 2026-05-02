import type { Metadata } from 'next';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { ChromeGate } from '@/components/paper-diary/ChromeGate';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const SITE_URL = 'https://coworkings.cz';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'COWORKINGS.cz - Najdi svůj coworking v České republice',
  description:
    'Najděte ideální coworking prostor v České republice. Vyber si z 90+ coworkingů v 15+ městech. Rezervuj den, hodinu nebo měsíc.',
  keywords: 'coworking, Česko, Praha, Brno, kancelář, pracovna, startup, freelancer',
  authors: [{ name: 'COWORKINGS.cz' }],
  creator: 'COWORKINGS.cz',
  publisher: 'COWORKINGS.cz',
  robots: 'index, follow',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: SITE_URL,
    siteName: 'COWORKINGS.cz',
    title: 'COWORKINGS.cz - Najdi svůj coworking',
    description: 'Najdi ideální coworking prostor v České republice',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200',
        width: 1200,
        height: 630,
        alt: 'COWORKINGS.cz',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'COWORKINGS.cz',
    description: 'Najdi ideální coworking prostor v České republice',
  },
};

// JSON-LD strukturovaná data – Organization + WebSite se SearchAction
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}#organization`,
      name: 'COWORKINGS.cz',
      url: SITE_URL,
      logo: `${SITE_URL}/logo-kings.png`,
      sameAs: [],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@coworkings.cz',
        contactType: 'customer support',
        areaServed: 'CZ',
        availableLanguage: ['Czech'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}#website`,
      url: SITE_URL,
      name: 'COWORKINGS.cz',
      inLanguage: 'cs-CZ',
      publisher: { '@id': `${SITE_URL}#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/coworkingy?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          // JSON-LD pro vyhledávače
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="flex flex-col min-h-screen">
        <SessionProvider>
          <ChromeGate>{children}</ChromeGate>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
