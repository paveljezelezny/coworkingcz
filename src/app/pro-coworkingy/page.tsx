import type { Metadata } from 'next';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi, Stamp } from '@/components/paper-diary/primitives';
import { PLATFORM_PRICING } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Pro coworkingy | COWORKINGS.cz',
  description: 'Zviditelni svůj coworking, získej rezervace a spravuj členy přes COW.OS.',
  alternates: { canonical: '/pro-coworkingy' },
};

const BENEFITS = [
  { icon: '👀', title: 'Vidí tě 10k+ coworkerů', desc: 'Profil v adresáři + special deal badge na kartě.' },
  { icon: '📅', title: 'Eventy a workshopy', desc: 'Přidávej vlastní akce, dostávej je do kalendáře.' },
  { icon: '🏷️', title: 'Marketplace', desc: 'Inzeruj nabídky práce, zasedaček, sdílených stolů.' },
  { icon: '🐄', title: 'COW.OS — admin v ceně', desc: 'Správa členů, automatická fakturace, QR vstupy.' },
  { icon: '📊', title: 'Analytika profilu', desc: 'Statistiky návštěvnosti, MRR, top dny v měsíci.' },
  { icon: '⭐', title: 'Email podpora', desc: 'Reagujeme do 24 h. Žádný robot, jen lidi.' },
];

export default function ProCoworkingPage() {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      {/* Hero */}
      <NotebookPaper style={{ padding: '40px 20px 50px', position: 'relative' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-12">
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 6, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            ↘ pro provozovatele
          </div>
          <h1 className="text-[44px] md:text-[80px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: '0 0 14px', color: PD.ink, textWrap: 'balance', maxWidth: 1000 }}>
            Provozuješ coworking?{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: PD.accent }}>Postav ho do reflektorů.</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: PD.inkSoft, margin: 0, maxWidth: 680 }}>
            Zviditelni profil, získej nové členy, spravuj fakturaci a QR vstupy přes COW.OS — to vše
            z jednoho ceníku. {PLATFORM_PRICING[0].monthlyPrice} Kč/měs s 20 % slevou ročně.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/registrace?role=coworking" style={{ padding: '14px 24px', background: PD.ink, color: PD.paperWhite, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}>
              30 dní zdarma →
            </Link>
            <Link href="/ceniky" style={{ padding: '14px 24px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              Ceník
            </Link>
            <Link href="/cow-os" style={{ padding: '14px 24px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
              🐄 COW.OS
            </Link>
          </div>
        </div>
      </NotebookPaper>

      {/* Benefits grid */}
      <div style={{ padding: '40px 24px 30px', background: PD.paperLt, borderTop: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-14 md:!py-12">
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
        <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
          — Co dostaneš
        </div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 28 }} className="md:!text-[32px]">
          Šest věcí, co zvednou tvůj coworking
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 22 }}>
          {BENEFITS.map((f, i) => (
            <div
              key={i}
              style={{
                background: PD.paperWhite, border: `1.5px solid ${PD.rule}`,
                padding: '22px 20px', position: 'relative',
                transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)`,
                boxShadow: '3px 4px 0 rgba(0,0,0,0.07)',
              }}
            >
              <Washi color={i % 3 === 0 ? PD.amber : i % 3 === 1 ? PD.moss : PD.coral} seed={500 + i * 17} />
              <div style={{ fontSize: 30, marginBottom: 10 }}>{f.icon}</div>
              <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 19, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink, marginBottom: 6 }}>
                {f.title}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: PD.inkSoft }}>
                {f.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing summary */}
      <div style={{ padding: '40px 24px', background: PD.paper, borderTop: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-14 md:!py-12">
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
        <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
          — Ceník
        </div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 22 }} className="md:!text-[32px]">
          Tři plány podle velikosti
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 22 }}>
          {PLATFORM_PRICING.map((p, i) => {
            const tones = [PD.accent, PD.amber, PD.coral];
            const isMid = i === 1;
            return (
              <div
                key={p.tier}
                style={{
                  background: PD.paperWhite, border: `1.5px solid ${tones[i]}`,
                  padding: '22px 20px', position: 'relative',
                  transform: `rotate(${i === 0 ? -0.5 : i === 1 ? 0.4 : -0.3}deg)`,
                  boxShadow: isMid ? `5px 5px 0 ${PD.ink}` : '3px 4px 0 rgba(0,0,0,0.08)',
                }}
              >
                {isMid && (
                  <div style={{ position: 'absolute', top: -14, right: 14 }}>
                    <Stamp color={PD.margin} rotate={6}>doporučujeme</Stamp>
                  </div>
                )}
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: tones[i], textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>
                  {p.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                  <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 44, fontWeight: 500, letterSpacing: '-0.04em', color: PD.ink, lineHeight: 1 }}>
                    {p.monthlyPrice}
                  </span>
                  <span style={{ fontSize: 13, color: PD.inkMuted }}>Kč/měs</span>
                </div>
                <div style={{ fontSize: 13, color: PD.inkSoft, lineHeight: 1.5 }}>
                  Až {p.maxSeats === 99999 ? 'neomezeně' : p.maxSeats} míst,{' '}
                  {p.maxArea === 99999 ? 'neomezeně' : `${p.maxArea} m²`}.{' '}
                  {p.includedAddresses} adresa{p.includedAddresses === 1 ? '' : 'y'} v ceně.
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20 }}>
          <Link href="/ceniky" style={{ fontFamily: PD_FONT_HAND, fontSize: 19, color: PD.margin, textDecoration: 'none' }}>
            → kompletní porovnání plánů
          </Link>
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ padding: '40px 24px', background: PD.ink, color: PD.paperLt, textAlign: 'center' }} className="md:!py-14">
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 6 }}>žádná kreditka, žádný závazek</div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 18 }} className="md:!text-[36px]">
          Vyzkoušej platformu zdarma na 30 dní
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/registrace?role=coworking" style={{ display: 'inline-block', padding: '14px 24px', background: PD.paperWhite, color: PD.ink, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}>
            Začít zdarma →
          </Link>
          <a href="mailto:info@coworkings.cz" style={{ display: 'inline-block', padding: '14px 24px', background: PD.margin, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
            ✉ Mám otázku
          </a>
        </div>
      </div>
    </div>
  );
}
