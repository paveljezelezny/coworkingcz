// Per-coworking layout uvnitř Spravce. Nahrazuje root /spravce sidebar
// kontextovými položkami (Detail, COW.OS, Členové, Fakturace, Tarify, Nastavení).
// Next.js kombinuje layouts hierarchicky — root spravce/layout.tsx obalí tohle.
//
// Aby se nezdvojil PDAdminLayout (vrchní + zde), použiju zde jen vlastní
// horizontální sub-tabs uvnitř hlavního obsahu a nahradím nav PDSubTabs.

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';

const SUB_NAV = (slug: string) => [
  { href: `/spravce/${slug}`,                      label: 'Detail prostoru', icon: '🏢', exact: true },
  { href: `/spravce/${slug}/cow-os`,               label: 'COW.OS dashboard', icon: '🐄', exact: true },
  { href: `/spravce/${slug}/cow-os/clenove`,       label: 'Členové', icon: '👥' },
  { href: `/spravce/${slug}/cow-os/fakturace`,     label: 'Fakturace', icon: '💳' },
  { href: `/spravce/${slug}/cow-os/tarify`,        label: 'Tarify', icon: '🏷️' },
  { href: `/spravce/${slug}/cow-os/nastaveni`,     label: 'Nastavení', icon: '⚙️' },
];

export default function SpravceCoworkingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || '';
  const items = SUB_NAV(slug);

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  return (
    <div>
      {/* Per-coworking sub-tabs */}
      <div style={{ marginBottom: 18, position: 'sticky', top: 70, zIndex: 5, background: PD.paper, padding: '4px 0 8px' }}>
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.margin, marginBottom: 6, transform: 'rotate(-0.6deg)', display: 'inline-block' }}>
          ↘ {decodeURIComponent(slug)}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: `1.5px solid ${PD.ink}`, paddingBottom: 8 }}>
          {items.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: '7px 12px', fontSize: 13, fontWeight: active ? 600 : 400,
                  color: active ? PD.paperWhite : PD.inkSoft,
                  background: active ? PD.ink : PD.paperWhite,
                  border: `1.5px solid ${active ? PD.ink : PD.rule}`,
                  textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontFamily: PD_FONT_BODY,
                }}
              >
                {item.icon && <span style={{ fontSize: 14 }}>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
