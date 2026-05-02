'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP, COWORKER_MEMBERSHIP_BENEFITS } from '@/lib/types';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi, Stamp } from '@/components/paper-diary/primitives';

type Audience = 'majitele' | 'coworkery';

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: 'Mám už zápis na coworkings.cz, je placený?',
    a: 'Základní zápis je zdarma. Profil zviditelníš a zavedeš si COW.OS přes placený plán pro provozovatele.',
  },
  {
    q: 'Jak funguje 1 návštěva měsíčně zdarma pro coworkery?',
    a: 'S placeným členstvím dostaneš každý měsíc 1 návštěvu (day pass) v libovolném coworkingu, který je v síti. Stačí ukázat QR kód u recepce.',
  },
  {
    q: 'Můžu zrušit členství kdykoliv?',
    a: 'Ano, oba plány (provozovatelé i coworkeři) můžeš zrušit kdykoliv. Roční předplatné běží do konce zaplaceného období.',
  },
  {
    q: 'Co je COW.OS?',
    a: 'COW.OS je nástroj pro provozovatele coworkingů — správa členů, fakturace, plány, QR vstupy. Součástí každého plánu provozovatele.',
  },
];

export default function CenikyPage() {
  const [audience, setAudience] = useState<Audience>('majitele');
  const [yearly, setYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '32px 20px 50px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-10">
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            šuplík V. ↘
          </div>
          <h1 className="text-[40px] md:text-[64px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: 0, color: PD.ink }}>
            Ceníky
          </h1>
          <p style={{ fontSize: 14, color: PD.inkSoft, marginTop: 10, marginBottom: 28, maxWidth: 600 }}>
            Dva pohledy: pro provozovatele coworkingů (placený zápis + COW.OS) a pro coworkery (členství s benefity).
          </p>

          {/* Audience toggle */}
          <div style={{ display: 'inline-flex', gap: 0, border: `1.5px solid ${PD.ink}`, marginBottom: 22, background: PD.paperWhite, boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
            {(['majitele', 'coworkery'] as Audience[]).map((a) => (
              <button
                key={a}
                onClick={() => setAudience(a)}
                style={{
                  padding: '10px 18px', fontSize: 14, fontFamily: 'inherit',
                  background: audience === a ? PD.ink : 'transparent',
                  color: audience === a ? PD.paperWhite : PD.ink,
                  border: 'none', cursor: 'pointer', fontWeight: audience === a ? 600 : 400,
                  borderRight: a === 'majitele' ? `1px solid ${PD.ink}` : 'none',
                }}
              >
                {a === 'majitele' ? 'Pro provozovatele' : 'Pro coworkery'}
              </button>
            ))}
          </div>

          {/* Yearly toggle */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 14, color: yearly ? PD.inkMuted : PD.ink, fontWeight: yearly ? 400 : 600 }}>Měsíčně</span>
            <button
              onClick={() => setYearly(!yearly)}
              style={{
                width: 48, height: 26, background: yearly ? PD.moss : PD.rule,
                borderRadius: 99, border: `1.5px solid ${PD.ink}`, position: 'relative', cursor: 'pointer',
                padding: 0,
              }}
              aria-label="Přepnout fakturaci"
            >
              <span
                style={{
                  position: 'absolute', top: 1, left: yearly ? 23 : 1,
                  width: 20, height: 20, background: PD.paperWhite,
                  border: `1.5px solid ${PD.ink}`, borderRadius: '50%',
                  transition: 'left 180ms ease',
                }}
              />
            </button>
            <span style={{ fontSize: 14, color: yearly ? PD.ink : PD.inkMuted, fontWeight: yearly ? 600 : 400 }}>
              Ročně
              <span style={{ fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.margin, marginLeft: 6 }}>
                {audience === 'majitele' ? '−20 %' : '−50 %'}
              </span>
            </span>
          </div>

          {/* Plans */}
          {audience === 'majitele' ? (
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 22, marginBottom: 50 }}>
              {PLATFORM_PRICING.map((p, i) => {
                const monthly = p.monthlyPrice;
                const yearlyMonthly = Math.round(monthly * (1 - p.yearlyDiscount));
                const display = yearly ? yearlyMonthly : monthly;
                const tones = [PD.accent, PD.amber, PD.coral];
                const seeds = [13, 27, 41];
                const isMid = i === 1;
                return (
                  <div
                    key={p.tier}
                    style={{
                      background: PD.paperWhite, border: `1.5px solid ${tones[i]}`,
                      padding: '24px 22px 22px', position: 'relative',
                      transform: `rotate(${i === 0 ? -0.6 : i === 1 ? 0.4 : -0.4}deg)`,
                      boxShadow: isMid ? `5px 5px 0 ${PD.ink}` : '3px 4px 0 rgba(0,0,0,0.08)',
                    }}
                  >
                    <Washi color={tones[i]} seed={seeds[i]} />
                    {isMid && (
                      <div style={{ position: 'absolute', top: -14, right: 14 }}>
                        <Stamp color={PD.margin} rotate={6}>doporučujeme</Stamp>
                      </div>
                    )}
                    <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: tones[i], textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 48, fontWeight: 500, letterSpacing: '-0.04em', color: PD.ink, lineHeight: 1 }}>{display}</span>
                      <span style={{ fontSize: 14, color: PD.inkMuted }}>Kč/měs</span>
                    </div>
                    {yearly && (
                      <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin, marginBottom: 10 }}>
                        ušetříš {Math.round((monthly - yearlyMonthly) * 12)} Kč/rok
                      </div>
                    )}
                    <div style={{ borderTop: `1px dashed ${PD.ruleSoft}`, paddingTop: 14, marginTop: 14 }}>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: PD.moss }}>✓</span>
                          <span>Až <b>{p.maxSeats === 99999 ? 'neomezeně' : p.maxSeats}</b> míst, <b>{p.maxArea === 99999 ? 'neomezeně' : `${p.maxArea} m²`}</b></span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: PD.moss }}>✓</span>
                          <span><b>{p.includedAddresses}</b> adresa{p.includedAddresses === 1 ? '' : 'y'} v ceně, další {p.extraAddressPrice} Kč</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: PD.moss }}>✓</span>
                          <span>COW.OS — správa členů, fakturace, QR vstupy</span>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: PD.moss }}>✓</span>
                          <span>Profil v adresáři + zvýraznění</span>
                        </li>
                      </ul>
                    </div>
                    <Link
                      href="/cow-os"
                      style={{
                        display: 'block', textAlign: 'center', marginTop: 16,
                        padding: '12px', background: isMid ? PD.ink : 'transparent',
                        color: isMid ? PD.paperWhite : PD.ink,
                        border: `1.5px solid ${PD.ink}`, fontSize: 14, fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      Vyzkoušet 30 dní zdarma →
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 22, marginBottom: 50, maxWidth: 900 }}>
              <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.coral}`, padding: '24px 22px 22px', position: 'relative', transform: 'rotate(-0.4deg)', boxShadow: '3px 4px 0 rgba(0,0,0,0.08)' }}>
                <Washi color={PD.coral} seed={91} />
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.coral, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
                  Coworker · solo
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', color: PD.ink, lineHeight: 1 }}>
                    {yearly ? COWORKER_MEMBERSHIP.yearlyMonthlyPrice : COWORKER_MEMBERSHIP.monthlyPrice}
                  </span>
                  <span style={{ fontSize: 14, color: PD.inkMuted }}>Kč/měs</span>
                </div>
                {yearly && (
                  <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin, marginBottom: 10 }}>
                    ušetříš {COWORKER_MEMBERSHIP.yearlyMonthlySaving} Kč/rok
                  </div>
                )}
                <div style={{ borderTop: `1px dashed ${PD.ruleSoft}`, paddingTop: 14, marginTop: 14 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    {COWORKER_MEMBERSHIP_BENEFITS.map((b) => (
                      <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: PD.moss }}>✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  href="/registrace"
                  style={{
                    display: 'block', textAlign: 'center', marginTop: 16,
                    padding: '12px', background: PD.ink, color: PD.paperWhite,
                    border: `1.5px solid ${PD.ink}`, fontSize: 14, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Stát se členem →
                </Link>
              </div>

              <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.amber}`, padding: '24px 22px 22px', position: 'relative', transform: 'rotate(0.4deg)', boxShadow: '5px 5px 0 ' + PD.ink }}>
                <Washi color={PD.amber} seed={73} />
                <div style={{ position: 'absolute', top: -14, right: 14 }}>
                  <Stamp color={PD.amber} rotate={4}>tým až 5</Stamp>
                </div>
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.amber, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>
                  Coworker · tým
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 56, fontWeight: 500, letterSpacing: '-0.04em', color: PD.ink, lineHeight: 1 }}>
                    {Math.round(COWORKER_MEMBERSHIP.teamYearlyPrice / 12)}
                  </span>
                  <span style={{ fontSize: 14, color: PD.inkMuted }}>Kč/měs · ročně</span>
                </div>
                <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin, marginBottom: 10 }}>
                  {COWORKER_MEMBERSHIP.teamMaxMembers} lidí · {COWORKER_MEMBERSHIP.teamYearlyPrice} Kč/rok
                </div>
                <div style={{ borderTop: `1px dashed ${PD.ruleSoft}`, paddingTop: 14, marginTop: 14 }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: PD.moss }}>✓</span>
                      <span>Vše co solo plán pro každého z 5 členů</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: PD.moss }}>✓</span>
                      <span>Společný team profil</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: PD.moss }}>✓</span>
                      <span>1 fakturace pro celý tým</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: PD.moss }}>✓</span>
                      <span>5× 1 návštěva zdarma každý měsíc</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/registrace"
                  style={{
                    display: 'block', textAlign: 'center', marginTop: 16,
                    padding: '12px', background: PD.amber, color: '#fff',
                    border: `1.5px solid ${PD.ink}`, fontSize: 14, fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Založit tým →
                </Link>
              </div>
            </div>
          )}

          {/* FAQ */}
          <div style={{ marginTop: 30 }}>
            <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 8 }}>
              — Často kladené otázky
            </div>
            <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 18 }}>
              Co se nejvíc ptáte
            </div>
            <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}>
              {FAQ.map((item, i) => {
                const open = openFaq === i;
                return (
                  <div key={i} style={{ borderBottom: i < FAQ.length - 1 ? `1px dashed ${PD.rule}` : 'none' }}>
                    <button
                      onClick={() => setOpenFaq(open ? null : i)}
                      style={{ width: '100%', padding: '16px 18px', background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, fontFamily: 'inherit' }}
                    >
                      <span style={{ fontSize: 15, fontWeight: 500, color: PD.ink }}>{item.q}</span>
                      <span style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.margin, transform: open ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 200ms ease', display: 'inline-block' }}>+</span>
                    </button>
                    {open && (
                      <div style={{ padding: '0 18px 18px', fontFamily: PD_FONT_HAND, fontSize: 18, lineHeight: 1.5, color: PD.inkSoft }}>
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </NotebookPaper>
    </div>
  );
}
