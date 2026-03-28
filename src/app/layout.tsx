import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SessionProvider from '@/components/SessionProvider';

export const metadata: Metadata = {
  title: 'COWORKINGS.cz - Najdi svůj coworking v České republice',
  description:
    'Najděte ideální coworking prostor v České republice. Vyber si z 90+ coworkingů v 15+ městech. Rezervuj den, hodinu nebo měsíc.',
  keywords: 'coworking, Česko, Praha, Brno, kancelář, pracovna, startup, freelancer',
  authors: [{ name: 'COWORKINGS.cz' }],
  creator: 'COWORKINGS.cz',
  publisher: 'COWORKINGS.cz',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'cs_CZ',
    url: 'https://coworkings.cz',
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
      </head>
      <body className="flex flex-col min-h-screen bg-white">
        <SessionProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
