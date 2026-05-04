'use client';

// ChromeGate — rozhodne, jestli stránka dostane nový Paper Diary chrome
// (PDNav + PDFooter), nebo zůstane u původního Navbar + Footer.
//
// Po vlně 2/3 dostávají PD chrome VŠECHNY interní stránky včetně admin sekcí.
// Original Navbar/Footer fallback zůstává jen jako bezpečnostní síť pro neznámé
// budoucí cesty (PD_PREFIXES je teď whitelist VŠEHO co máme).

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { PDNav } from './PDNav';
import { PDFooter } from './PDFooter';

const PD_PREFIXES = [
  '/coworkingy',
  '/coworking',
  '/udalosti',
  '/marketplace',
  '/coworkeri',
  '/ceniky',
  '/cow-os',
  '/pro-coworkingy',
  '/podminky',
  '/soukromi',
  '/cookies',
  '/mapa',
  '/prihlaseni',
  '/registrace',
  '/admin',
  '/spravce',
  '/profil',
];

// Admin sekce mají vlastní postranní navigaci a interaktivní obsah —
// nepoužívají PDFooter (footer by zabíral screen real estate).
const NO_FOOTER_PREFIXES = ['/admin', '/spravce', '/profil'];

function isPdRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PD_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function shouldHideFooter(pathname: string): boolean {
  return NO_FOOTER_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const usePD = isPdRoute(pathname);
  const hideFooter = shouldHideFooter(pathname);

  if (usePD) {
    return (
      <>
        <PDNav />
        <main className="flex-1 pd-body">{children}</main>
        {!hideFooter && <PDFooter />}
      </>
    );
  }

  // Legacy chrome — fallback pro nové neznámé cesty.
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
