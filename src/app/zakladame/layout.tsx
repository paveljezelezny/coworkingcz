// Pre-landing má vlastní layout — bez PDNav a PDFooter.
// ChromeGate /zakladame nezná, takže by spadla na legacy Navbar/Footer.
// Tento layout to vyřazuje a renderuje čistý paper-diary kabát.

import type { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'COWORKINGS.cz — připravujeme spuštění',
  description:
    'Největší coworkingová platforma v ČR se chystá. Nech nám email a pošleme ti pozvánku dříve než ostatním.',
  robots: 'noindex, nofollow',
};

export default function ZakladameLayout({ children }: { children: ReactNode }) {
  return <div className="pd-body min-h-screen">{children}</div>;
}
