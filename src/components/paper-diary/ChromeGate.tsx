'use client';

// ChromeGate — rozhodne, jestli stránka dostane nový Paper Diary chrome
// (PDNav + PDFooter), nebo zůstane u původního Navbar + Footer.
//
// V první migrační vlně dostávají nový design POUZE veřejné stránky:
//   /, /coworkingy, /coworking/*, /udalosti, /marketplace, /coworkeri,
//   /ceniky, /cow-os, /pro-coworkingy, /podminky, /soukromi, /cookies
//
// Admin/spravce/profil/přihlášení/registrace zůstávají na původním chrome,
// dokud je v dalším kole nepřepíšeme.

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
];

function isPdRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  return PD_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/';
  const usePD = isPdRoute(pathname);

  if (usePD) {
    return (
      <>
        <PDNav />
        <main className="flex-1 pd-body">{children}</main>
        <PDFooter />
      </>
    );
  }

  // Legacy chrome pro admin/spravce/profil atd.
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
