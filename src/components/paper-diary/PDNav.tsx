'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND } from './tokens';
import { HandUnderline } from './primitives';
import { PDDiaryDrawer } from './PDDiaryDrawer';

const NAV_ITEMS = [
  { href: '/',            label: 'Domů',        match: (p: string) => p === '/' },
  { href: '/coworkingy',  label: 'Coworkingy',  match: (p: string) => p.startsWith('/coworkingy') || p.startsWith('/coworking') },
  { href: '/udalosti',    label: 'Události',    match: (p: string) => p.startsWith('/udalosti') },
  { href: '/marketplace', label: 'Marketplace', match: (p: string) => p.startsWith('/marketplace') },
  { href: '/coworkeri',   label: 'Coworkeři',   match: (p: string) => p.startsWith('/coworkeri') },
  { href: '/ceniky',      label: 'Ceníky',      match: (p: string) => p.startsWith('/ceniky') },
  { href: '/cow-os',      label: '🐄 COW.OS',   match: (p: string) => p.startsWith('/cow-os') },
];

export function PDNav() {
  const pathname = usePathname() || '/';
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header
        style={{
          background: PD.paperLt,
          borderBottom: `1.5px solid ${PD.ink}`,
          fontFamily: PD_FONT_BODY,
          position: 'sticky', top: 0, zIndex: 50,
        }}
      >
        <div
          style={{
            maxWidth: 1440, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 24px',
          }}
          className="md:px-12 md:py-[18px]"
        >
          {/* Logo + desktop nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 2, textDecoration: 'none' }}>
              <span
                style={{
                  fontFamily: PD_FONT_DISPLAY, fontWeight: 600, fontSize: 22,
                  letterSpacing: '-0.8px', color: PD.ink,
                }}
              >
                coworkings
              </span>
              <span
                style={{
                  fontFamily: PD_FONT_HAND, fontSize: 26, color: PD.margin,
                  marginLeft: 2, transform: 'translateY(-2px)', display: 'inline-block',
                }}
              >
                .cz
              </span>
            </Link>

            <nav className="hidden md:flex" style={{ gap: 26, fontSize: 14 }}>
              {NAV_ITEMS.map(item => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      textDecoration: 'none',
                      color: active ? PD.ink : PD.inkMuted,
                      fontWeight: active ? 600 : 400,
                      position: 'relative', padding: '2px 0',
                    }}
                  >
                    {item.label}
                    {active && <HandUnderline offset={-6} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex" style={{ gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => setDrawerOpen(true)}
              style={{
                background: 'none', border: `1.5px solid ${PD.ink}`,
                padding: '7px 14px',
                fontFamily: PD_FONT_HAND, fontSize: 18,
                color: PD.ink, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                transform: 'rotate(-0.6deg)',
              }}
              aria-label="Otevřít můj deník"
            >
              📔 můj dnešek
            </button>
            {session ? (
              <>
                <Link href="/profil" style={{ color: PD.inkMuted, fontSize: 14, textDecoration: 'none' }}>
                  {session.user?.name || 'Profil'}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    padding: '8px 16px', background: PD.ink, color: PD.paperWhite,
                    border: 'none', fontFamily: PD_FONT_BODY, fontSize: 13, fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Odhlásit
                </button>
              </>
            ) : (
              <>
                <Link href="/prihlaseni" style={{ color: PD.inkMuted, fontSize: 14, textDecoration: 'none' }}>
                  Přihlásit
                </Link>
                <Link
                  href="/registrace"
                  style={{
                    padding: '8px 16px', background: PD.ink, color: PD.paperWhite,
                    fontFamily: PD_FONT_BODY, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', display: 'inline-block',
                  }}
                >
                  Registrovat →
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
            style={{
              background: 'none', border: `1.5px solid ${PD.ink}`,
              padding: '8px 12px', cursor: 'pointer', color: PD.ink,
              fontFamily: PD_FONT_BODY, fontSize: 14,
            }}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            className="md:hidden"
            style={{
              borderTop: `1px solid ${PD.rule}`,
              background: PD.paperLt,
              padding: '12px 24px 20px',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {NAV_ITEMS.map(item => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      textDecoration: 'none',
                      color: active ? PD.ink : PD.inkMuted,
                      fontWeight: active ? 600 : 400,
                      padding: '10px 0',
                      borderBottom: `1px solid ${PD.ruleSoft}`,
                      fontSize: 16,
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
              <button
                onClick={() => { setDrawerOpen(true); setMobileOpen(false); }}
                style={{
                  background: 'none', border: `1.5px solid ${PD.ink}`,
                  padding: '8px 14px', fontFamily: PD_FONT_HAND, fontSize: 18,
                  color: PD.ink, cursor: 'pointer',
                }}
              >
                📔 můj dnešek
              </button>
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  style={{
                    padding: '10px 16px', background: PD.ink, color: PD.paperWhite,
                    border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Odhlásit
                </button>
              ) : (
                <>
                  <Link
                    href="/prihlaseni"
                    onClick={() => setMobileOpen(false)}
                    style={{ color: PD.inkMuted, fontSize: 14, textDecoration: 'none', alignSelf: 'center' }}
                  >
                    Přihlásit
                  </Link>
                  <Link
                    href="/registrace"
                    onClick={() => setMobileOpen(false)}
                    style={{
                      padding: '10px 16px', background: PD.ink, color: PD.paperWhite,
                      fontSize: 14, fontWeight: 600, textDecoration: 'none',
                    }}
                  >
                    Registrovat →
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <PDDiaryDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
