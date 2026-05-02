'use client';

import React from 'react';
import Link from 'next/link';
import { PD, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from './tokens';

const COLS = [
  {
    title: 'Coworkings.cz',
    links: [
      { href: '/coworkingy',  label: 'Coworkingy' },
      { href: '/udalosti',    label: 'Události' },
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/coworkeri',   label: 'Coworkeři' },
    ],
  },
  {
    title: 'Pro provozovatele',
    links: [
      { href: '/cow-os',         label: '🐄 COW.OS' },
      { href: '/ceniky',         label: 'Ceníky' },
      { href: '/pro-coworkingy', label: 'Pro coworkingy' },
      { href: '/spravce',        label: 'Správce' },
    ],
  },
  {
    title: 'Účet',
    links: [
      { href: '/prihlaseni', label: 'Přihlášení' },
      { href: '/registrace', label: 'Registrace' },
      { href: '/profil',     label: 'Profil' },
    ],
  },
  {
    title: 'Drobné',
    links: [
      { href: '/podminky', label: 'Podmínky' },
      { href: '/soukromi', label: 'Soukromí' },
      { href: '/cookies',  label: 'Cookies' },
    ],
  },
];

export function PDFooter() {
  return (
    <footer
      style={{
        background: PD.ink, color: PD.paperWhite,
        fontFamily: PD_FONT_BODY,
        marginTop: 60,
      }}
    >
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '50px 24px 30px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 32, marginBottom: 40,
          }}
        >
          {/* Brand col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 12 }}>
              <span style={{ fontFamily: '"Inter Tight", sans-serif', fontWeight: 600, fontSize: 22, letterSpacing: '-0.8px' }}>
                coworkings
              </span>
              <span style={{ fontFamily: PD_FONT_HAND, fontSize: 26, color: PD.margin }}>
                .cz
              </span>
            </div>
            <p style={{ fontSize: 13, opacity: 0.7, lineHeight: 1.6, margin: 0 }}>
              Největší coworkingový portál v ČR. Najdi prostor, eventy, lidi a zakázky.
            </p>
          </div>

          {COLS.map(col => (
            <div key={col.title}>
              <div
                style={{
                  fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5,
                  textTransform: 'uppercase', opacity: 0.55, marginBottom: 12,
                }}
              >
                {col.title}
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.links.map(l => (
                  <li key={l.href}>
                    <Link href={l.href} style={{ color: PD.paperWhite, opacity: 0.85, textDecoration: 'none', fontSize: 14 }}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          style={{
            paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
            fontSize: 12, opacity: 0.6,
          }}
        >
          <span>© {new Date().getFullYear()} Coworkings.cz · Made with ☕ in Prague</span>
          <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin, opacity: 0.9 }}>
            psáno rukou, kódováno strojem
          </span>
        </div>
      </div>
    </footer>
  );
}
