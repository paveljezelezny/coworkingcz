'use client';

// PDAdminLayout — sdílený 2-sloupcový layout pro admin/spravce/profil sekce.
// Postranní sub-nav vlevo (collapsible na mobile), hlavní obsah vpravo.
// Vrchní PDNav z ChromeGate zůstává nahoře.

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from './tokens';
import { HandUnderline } from './primitives';

export interface PDAdminNavItem {
  href: string;
  label: string;
  icon?: string;
  exact?: boolean; // pokud true, match jen exact pathname (nikoli prefix)
}

export interface PDAdminLayoutProps {
  /** Šuplík label v levém horním rohu (např. "šuplík správce", "šuplík admin"). */
  drawerLabel: string;
  /** Hlavní titulek sekce (např. "Super Admin", "COW.OS"). */
  sectionTitle: string;
  /** Krátký podtitulek (volitelný). */
  sectionSubtitle?: string;
  /** Items pro postranní navigaci. */
  navItems: PDAdminNavItem[];
  /** Volitelný extra obsah do sidebar (např. coworking switcher). */
  sidebarExtra?: React.ReactNode;
  /** Hlavní obsah stránky. */
  children: React.ReactNode;
}

export function PDAdminLayout({
  drawerLabel,
  sectionTitle,
  sectionSubtitle,
  navItems,
  sidebarExtra,
  children,
}: PDAdminLayoutProps) {
  const pathname = usePathname() || '';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (item: PDAdminNavItem): boolean => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const sidebar = (
    <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNavOpen(false)}
            style={{
              padding: '10px 14px',
              fontSize: 14,
              fontWeight: active ? 600 : 400,
              color: active ? PD.ink : PD.inkSoft,
              background: active ? PD.paperWhite : 'transparent',
              border: active ? `1.5px solid ${PD.ink}` : '1.5px solid transparent',
              boxShadow: active ? `2px 2px 0 ${PD.margin}` : 'none',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 10,
              transform: active ? 'rotate(-0.4deg)' : 'rotate(0)',
              transition: 'transform 120ms ease',
              position: 'relative',
            }}
          >
            {item.icon && <span style={{ fontSize: 16 }}>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY, minHeight: 'calc(100vh - 70px)' }}>
      {/* Section header */}
      <div style={{ padding: '20px 16px 16px', borderBottom: `1.5px solid ${PD.ink}`, background: PD.paperLt }} className="md:!pl-12 md:!pr-10 md:!py-6">
        <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.margin, marginBottom: 2, transform: 'rotate(-1deg)', display: 'inline-block' }}>
              {drawerLabel}
            </div>
            <div className="text-[24px] md:text-[34px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.02em', lineHeight: 1, fontWeight: 500, color: PD.ink }}>
              {sectionTitle}
            </div>
            {sectionSubtitle && (
              <div style={{ fontSize: 13, color: PD.inkSoft, marginTop: 4 }}>
                {sectionSubtitle}
              </div>
            )}
          </div>

          {/* Mobile sidebar trigger */}
          <button
            className="md:hidden"
            onClick={() => setMobileNavOpen((o) => !o)}
            aria-label="Toggle menu"
            style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, padding: '8px 14px', cursor: 'pointer', fontFamily: PD_FONT_BODY, fontSize: 13, fontWeight: 600 }}
          >
            {mobileNavOpen ? '✕ zavřít' : '☰ menu'}
          </button>
        </div>
      </div>

      {/* Body — sidebar + content */}
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]" style={{ minHeight: 600 }}>
        {/* Sidebar (desktop always visible, mobile via overlay) */}
        <aside
          className="hidden md:block"
          style={{
            background: PD.paperLt,
            borderRight: `1px dashed ${PD.rule}`,
            padding: '20px 14px',
          }}
        >
          <div style={{ position: 'sticky', top: 80 }}>
            {sidebarExtra && <div style={{ marginBottom: 14 }}>{sidebarExtra}</div>}
            <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', padding: '0 14px 8px' }}>
              — Sekce
            </div>
            {sidebar}
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div
            className="md:hidden"
            style={{
              position: 'fixed', inset: 0, zIndex: 60,
              background: 'rgba(0,0,0,0.4)',
            }}
            onClick={() => setMobileNavOpen(false)}
          >
            <aside
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: 'min(280px, 80vw)',
                background: PD.paperLt, borderRight: `2px solid ${PD.ink}`,
                padding: '20px 14px',
                overflowY: 'auto',
                boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
              }}
            >
              {sidebarExtra && <div style={{ marginBottom: 14 }}>{sidebarExtra}</div>}
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', padding: '0 14px 8px' }}>
                — Sekce
              </div>
              {sidebar}
            </aside>
          </div>
        )}

        {/* Main content */}
        <div style={{ padding: '20px 16px 50px', minWidth: 0 }} className="md:!px-10 md:!py-8">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─ PDAdminCard — vizuální karta pro admin obsah ───────────
export function PDAdminCard({
  title,
  hint,
  children,
  tone = 'ink',
}: {
  title?: string;
  hint?: string;
  children: React.ReactNode;
  tone?: 'ink' | 'amber' | 'moss' | 'coral' | 'accent';
}) {
  const borderColor = tone === 'ink' ? PD.rule : (PD as Record<string, string>)[tone] ?? PD.rule;
  return (
    <div style={{ background: PD.paperWhite, border: `1.5px solid ${borderColor}`, padding: '18px 20px', boxShadow: '3px 4px 0 rgba(0,0,0,0.07)', marginBottom: 18 }}>
      {title && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink }}>
            {title}
          </div>
          {hint && (
            <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.inkMuted }}>
              {hint}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─ PDStatCard — KPI tile ───────────────────────────────────
export function PDStatCard({
  label,
  value,
  subtitle,
  tone = 'accent',
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  tone?: 'amber' | 'moss' | 'coral' | 'accent';
}) {
  const c = (PD as Record<string, string>)[tone] ?? PD.accent;
  return (
    <div style={{ background: PD.paperWhite, border: `1.5px solid ${c}`, padding: '14px 18px', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)' }}>
      <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: c, textTransform: 'uppercase', fontWeight: 700, marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 34, fontWeight: 500, letterSpacing: '-0.025em', color: PD.ink, lineHeight: 1, marginBottom: subtitle ? 4 : 0 }}>
        {value}
      </div>
      {subtitle && (
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.inkMuted, marginTop: 2 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
