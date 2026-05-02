'use client';

// PDHomePage — Paper Diary homepage. Bere data z DB jako props ze server
// component (app/page.tsx) a renderuje hero + 4 šuplíky + doporučené prostory
// + události + marketplace preview + statistický strip.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO, toneColor, eventColor, eventTone, PD_EVENT_KIND_TONE } from './tokens';
import { NotebookPaper, Washi, Stamp, PhotoPlaceholder, HandUnderline } from './primitives';

export interface PDHomeData {
  featured: Array<{
    id: string;
    name: string;
    slug: string;
    city?: string | null;
    image?: string | null;
    rating?: number | null;
    pricePerHour?: number | null;
    note?: string | null;
    verified?: boolean;
    tone?: 'amber' | 'moss' | 'coral' | 'accent' | 'ink';
  }>;
  events: Array<{
    id: string;
    title: string;
    startDate: string; // ISO
    eventType?: string | null;
    coworkingName?: string;
    coworkingSlug?: string;
  }>;
  listings: Array<{
    id: string;
    title: string;
    categoryLabel: string;
    kind: 'Nabídka' | 'Poptávka';
    tone: 'amber' | 'moss';
    userName: string;
    location?: string | null;
    ageLabel: string;       // "2 h", "1 d"
    budgetLabel: string;    // např. "12 000 Kč" nebo "Dohodou"
  }>;
  cities: Array<{ name: string; count: number }>;
  stats: {
    coworkings: number;
    cities: number;
    coworkers: number;
    events: number;
    listings: number;
  };
}

const WEEKDAY = ['NE', 'PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO'];
const MONTH = ['LED', 'ÚNO', 'BŘE', 'DUB', 'KVĚ', 'ČER', 'ČVC', 'SRP', 'ZÁŘ', 'ŘÍJ', 'LIS', 'PRO'];

function formatNumberCs(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.', ',') + 'k';
  return String(n);
}

// ageLabelFromDate moved to ./helpers.ts (server-safe)

export function PDHomePage({ data }: { data: PDHomeData }) {
  const router = useRouter();
  const [searchCity, setSearchCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const today = new Date();
  const todayStr = `${today.getDate()}. ${today.getMonth() + 1}. ${today.getFullYear()}`;

  const onSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchQuery) params.set('q', searchQuery);
    const qs = params.toString();
    router.push(qs ? `/coworkingy?${qs}` : '/coworkingy');
  };

  return (
    <div style={{ position: 'relative', maxWidth: 1440, margin: '0 auto', background: PD.paper, minHeight: '100vh', overflow: 'hidden', fontFamily: PD_FONT_BODY }}>
      {/* ─ Hero ─────────────────────────────────────────────── */}
      <NotebookPaper style={{ padding: '48px 24px 40px', minHeight: 480 }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-16 md:!pb-14" style={{ position: 'relative' }}>
          {/* Top meta */}
          <div
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2,
              textTransform: 'uppercase', color: PD.inkMuted, marginBottom: 24,
              flexWrap: 'wrap', gap: 8,
            }}
          >
            <span>Vol. VII · č. 18 · aktualizováno {todayStr}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: 99, background: PD.moss, animation: 'pdPulse 2s infinite', display: 'inline-block' }} />
              {data.stats.coworkers > 0 ? `${formatNumberCs(data.stats.coworkers)} coworkerů v komunitě` : 'live'}
            </span>
          </div>

          {/* Hand-written tag */}
          <div
            style={{
              fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin,
              marginBottom: 6, transform: 'rotate(-1deg)', display: 'inline-block',
            }}
          >
            nepracuj z domova ↘
          </div>

          {/* Headline */}
          <h1
            className="text-[44px] md:text-[88px] lg:text-[112px]"
            style={{
              fontFamily: PD_FONT_DISPLAY,
              lineHeight: 0.92, letterSpacing: '-0.025em',
              fontWeight: 500, margin: '0 0 22px', color: PD.ink,
              textWrap: 'balance', maxWidth: 1100,
            }}
          >
            Největší coworkingový{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: PD.accent, position: 'relative', display: 'inline-block' }}>
              portál
              <HandUnderline color={PD.margin} offset={-8} />
            </span>{' '}
            v Česku.
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.5, color: PD.inkSoft, margin: 0, maxWidth: 620 }}>
            {data.stats.coworkings}+ prostorů, {data.stats.events}+ událostí, {data.stats.listings}+ zakázek a {formatNumberCs(data.stats.coworkers)}+ lidí.
            Všechno, co potřebuje někdo, kdo nepracuje z domova.
          </p>

          {/* Search block */}
          <div style={{ marginTop: 36, maxWidth: 860 }}>
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkSoft, marginBottom: 10 }}>
              kde chceš dneska pracovat? ↓
            </div>
            <div
              className="flex flex-col md:flex-row"
              style={{
                background: PD.paperWhite,
                border: `1.5px solid ${PD.ink}`,
                boxShadow: '4px 4px 0 rgba(0,0,0,0.1)',
              }}
            >
              <select
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{
                  border: 'none', borderBottom: `1px solid ${PD.rule}`,
                  padding: '14px 18px', background: 'transparent',
                  fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink,
                  minWidth: 170,
                }}
                className="md:!border-b-0 md:!border-r md:!border-r-[var(--pd-rule)]"
              >
                <option value="">Celé ČR</option>
                {data.cities.slice(0, 20).map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} {c.count ? `· ${c.count}` : ''}
                  </option>
                ))}
              </select>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') onSearch(); }}
                placeholder="coworking, zasedačka, dětský koutek…"
                style={{
                  flex: 1, border: 'none', background: 'transparent',
                  padding: '16px 18px', fontFamily: 'inherit', fontSize: 15, outline: 'none',
                }}
              />
              <button
                onClick={onSearch}
                style={{
                  padding: '16px 28px', background: PD.ink, color: PD.paperWhite,
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                Hledat <span style={{ fontSize: 18 }}>→</span>
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.inkMuted, marginRight: 4 }}>populární:</span>
              {['Praha 24/7', 'Brno zasedačka', 'Dětský koutek', 'Day pass <300', 'Parking zdarma'].map((q) => (
                <Link
                  key={q}
                  href={`/coworkingy?q=${encodeURIComponent(q)}`}
                  style={{
                    padding: '5px 12px', fontFamily: 'inherit', fontSize: 12,
                    border: `1px solid ${PD.rule}`, borderRadius: 99,
                    background: PD.paperWhite, color: PD.inkSoft, textDecoration: 'none',
                  }}
                >
                  {q}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </NotebookPaper>

      {/* ─ Ekosystém — 4 šuplíky ────────────────────────────── */}
      <div
        style={{
          padding: '40px 24px 28px',
          borderTop: `1px solid ${PD.rule}`,
          background: PD.paper,
          position: 'relative',
        }}
        className="md:!pl-24 md:!pr-14 md:!py-12"
      >
        <div
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 56, width: 1,
            background: PD.margin, opacity: 0.6,
          }}
          className="hidden md:block"
        />

        <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, gap: 8 }}>
          <div>
            <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              — Čtyři šuplíky
            </div>
            <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink }} className="md:!text-[28px]">
              Vyber si, co dneska potřebuješ.
            </div>
          </div>
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.inkMuted }}>
            všechno propojené ✦
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
          {[
            { kind: 'PROSTORY', n: `${data.stats.coworkings}+`,            label: 'Najdi coworking', hint: 'mapa · filtry · rezervace', rot: -1,   c: 'accent' as const, href: '/coworkingy',   washi: PD.accent, paper: '#e6edf5', seed: 11 },
            { kind: 'UDÁLOSTI', n: `${data.stats.events}+`,                label: 'Události',        hint: 'workshopy · meetupy',       rot:  1,   c: 'amber' as const,  href: '/udalosti',     washi: PD.amber,  paper: '#f4ecd6', seed: 23 },
            { kind: 'ZAKÁZKY',  n: `${data.stats.listings}+`,              label: 'Marketplace',     hint: 'nabídka · poptávka',        rot: -0.6, c: 'moss' as const,   href: '/marketplace',  washi: PD.moss,   paper: '#e8ede0', seed: 37 },
            { kind: 'LIDÉ',     n: formatNumberCs(data.stats.coworkers),   label: 'Coworkeři',       hint: 'skills · dostupnost',       rot:  1.5, c: 'coral' as const,  href: '/coworkeri',    washi: PD.coral,  paper: '#f3e3dd', seed: 59 },
          ].map((card, i) => (
            <Link
              key={i}
              href={card.href}
              style={{
                background: card.paper,
                border: `1px solid ${PD.rule}`,
                padding: '24px 20px 20px',
                transform: `rotate(${card.rot}deg)`,
                boxShadow: '3px 4px 0 rgba(0,0,0,0.07)',
                position: 'relative', textDecoration: 'none',
                transition: 'transform 0.2s, box-shadow 0.2s',
                display: 'block',
              }}
            >
              <Washi color={card.washi} seed={card.seed} opacity={0.92} />
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 13, letterSpacing: 2, fontWeight: 700, color: toneColor(card.c), marginBottom: 12 }}>
                {card.kind}
              </div>
              <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: '-0.04em', fontFamily: PD_FONT_DISPLAY, lineHeight: 1, marginBottom: 8, color: PD.ink }}>
                {card.n}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, color: PD.ink, marginBottom: 6 }}>
                {card.label}
              </div>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.inkSoft, lineHeight: 1.15 }}>
                → {card.hint}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─ Doporučené prostory ──────────────────────────────── */}
      {data.featured.length > 0 && (
        <div
          style={{ padding: '40px 24px 32px', background: PD.paperLt, position: 'relative' }}
          className="md:!pl-24 md:!pr-14 md:!py-12"
        >
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, left: 56, width: 1,
              background: PD.margin, opacity: 0.6,
            }}
            className="hidden md:block"
          />
          <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20, gap: 8 }}>
            <div>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                — Doporučujeme tento týden
              </div>
              <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink }} className="md:!text-[28px]">
                Tři místa, co se teď vyplatí zkusit.
              </div>
            </div>
            <Link
              href="/coworkingy"
              style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.ink, textDecoration: 'none' }}
            >
              všechny {data.stats.coworkings}+ prostory →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 20 }}>
            {data.featured.slice(0, 3).map((s, i) => (
              <Link
                key={s.id}
                href={`/coworking/${s.slug}`}
                style={{
                  background: PD.paperWhite,
                  border: `1px solid ${PD.rule}`,
                  padding: 12,
                  transform: `rotate(${i === 1 ? 0.6 : i === 0 ? -0.6 : 0.3}deg)`,
                  boxShadow: '3px 4px 0 rgba(0,0,0,0.08)',
                  textDecoration: 'none', position: 'relative', display: 'block',
                }}
              >
                {s.verified && (
                  <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                    <Stamp rotate={6}>ověřeno</Stamp>
                  </div>
                )}
                {s.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.image} alt={s.name} style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }} />
                ) : (
                  <PhotoPlaceholder label={s.name.toLowerCase()} tone={s.tone || 'ink'} style={{ height: 180 }} />
                )}
                <div style={{ padding: '14px 10px 6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2, gap: 8 }}>
                    <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 19, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink }}>
                      {s.name}
                    </div>
                    {s.rating != null && (
                      <div style={{ fontFamily: PD_FONT_MONO, fontSize: 12, color: PD.inkMuted, whiteSpace: 'nowrap' }}>
                        ★ {s.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  {s.city && <div style={{ fontSize: 13, color: PD.inkMuted, marginBottom: 8 }}>{s.city}</div>}
                  {s.note && (
                    <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.inkSoft, marginBottom: 10 }}>
                      → {s.note}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, borderTop: `1px dashed ${PD.ruleSoft}` }}>
                    {s.pricePerHour != null ? (
                      <span style={{ fontSize: 12, color: PD.inkMuted }}>
                        od <b style={{ color: PD.ink, fontSize: 15 }}>{s.pricePerHour} Kč</b>/h
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: PD.inkMuted }}>cena na vyžádání</span>
                    )}
                    <span style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.margin }}>zobrazit →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ─ Eventy + Marketplace preview ─────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr]" style={{ borderTop: `1px solid ${PD.rule}` }}>
        {/* Events */}
        <div style={{ padding: '36px 24px 40px', background: PD.paper, borderRight: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-10 md:!py-10">
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
            — Kalendář
          </div>
          <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 18 }}>
            Nadcházející události
          </div>
          {data.events.length === 0 && (
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.inkMuted, padding: '24px 0' }}>
              → zatím tu nic není, brzy přibudou
            </div>
          )}
          {data.events.slice(0, 4).map((e) => {
            // map prisma eventType to PD tag (defaults to Workshop)
            const tagMap: Record<string, keyof typeof PD_EVENT_KIND_TONE> = {
              workshop: 'Workshop', meetup: 'Meetup', networking: 'Networking', komunita: 'Komunita', community: 'Komunita',
            };
            const tag = tagMap[(e.eventType || '').toLowerCase()] || 'Workshop';
            const ec = eventColor({ tag });
            const d = new Date(e.startDate);
            return (
              <Link
                key={e.id}
                href={`/coworking/${e.coworkingSlug}`}
                style={{
                  display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: 14, padding: '12px 0',
                  borderBottom: `1px dashed ${PD.ruleSoft}`, alignItems: 'center', textDecoration: 'none',
                }}
              >
                <div style={{ textAlign: 'center', border: `1.5px solid ${ec}`, padding: '6px 0' }}>
                  <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1, color: ec, fontWeight: 700 }}>{WEEKDAY[d.getDay()]}</div>
                  <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 22, fontWeight: 600, lineHeight: 1, color: PD.ink }}>{d.getDate()}</div>
                  <div style={{ fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1, color: PD.inkMuted }}>{MONTH[d.getMonth()]}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1, fontWeight: 700, padding: '1px 6px', background: ec, color: '#fff' }}>
                      {tag.toUpperCase()}
                    </span>
                    <div style={{ fontSize: 14, fontWeight: 500, color: ec }}>{e.title}</div>
                  </div>
                  <div style={{ fontSize: 12, color: PD.inkMuted }}>
                    {e.coworkingName || ''} · {d.getHours()}:{String(d.getMinutes()).padStart(2, '0')}
                  </div>
                </div>
                <div style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.inkSoft }}>
                  →
                </div>
              </Link>
            );
          })}
        </div>

        {/* Marketplace preview */}
        <div style={{ padding: '36px 24px 40px', background: PD.paperLt }} className="md:!pl-10 md:!pr-14 md:!py-10">
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
            — Marketplace · čerstvé
          </div>
          <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 18 }}>
            Nabídky a poptávky
          </div>
          {data.listings.length === 0 && (
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.inkMuted, padding: '24px 0' }}>
              → marketplace je tichý — buď první
            </div>
          )}
          {data.listings.slice(0, 4).map((m) => (
            <Link
              key={m.id}
              href="/marketplace"
              style={{
                display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 14, padding: '12px 0',
                borderBottom: `1px dashed ${PD.ruleSoft}`, alignItems: 'center', textDecoration: 'none',
              }}
            >
              <span
                style={{
                  fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1.2, fontWeight: 700,
                  padding: '4px 0', textAlign: 'center',
                  color: toneColor(m.tone), border: `1px solid ${toneColor(m.tone)}`,
                }}
              >
                {m.kind.toUpperCase()}
              </span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: PD.ink, marginBottom: 2 }}>{m.title}</div>
                <div style={{ fontSize: 12, color: PD.inkMuted }}>
                  {m.userName} · {m.location || '—'} · {m.ageLabel}
                </div>
              </div>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 12, color: PD.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>
                {m.budgetLabel}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─ Bottom stat strip ────────────────────────────────── */}
      <div
        style={{ padding: '24px', background: PD.ink, color: PD.paperLt }}
        className="grid grid-cols-2 md:grid-cols-4 md:!px-14 md:!py-7 gap-x-6 gap-y-4"
      >
        {[
          { k: `${data.stats.coworkings}+`,            l: 'coworkingů' },
          { k: `${data.stats.cities}+`,                l: 'měst v ČR' },
          { k: `${formatNumberCs(data.stats.coworkers)}+`, l: 'coworkerů' },
          { k: `${data.stats.events}+`,                l: 'akcí v plánu' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 36, fontWeight: 500, letterSpacing: '-0.04em' }} className="md:!text-[44px]">
              {s.k}
            </div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helpers (listingKindFromCategory, ageLabelFromDate) jsou v helpers.ts —
// musí být v non-client modulu, jinak Next.js SSR build padá s "l is not a function".
