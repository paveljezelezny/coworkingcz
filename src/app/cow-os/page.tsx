'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi } from '@/components/paper-diary/primitives';

interface ActiveCow {
  slug: string;
  name: string;
}

const FEATURES = [
  { icon: '👥', title: 'Členové', desc: 'Přehled aktivních členů, end dates, automatické připomínky před koncem členství.', tone: PD.accent },
  { icon: '💳', title: 'Fakturace', desc: 'Generuje faktury, pošle je e-mailem, sleduje platby. QR kódy pro rychlý převod.', tone: PD.amber },
  { icon: '📱', title: 'QR vstupy', desc: 'Členové se přihlásí QR kódem u recepce. Statistiky návštěvnosti rovnou v adminu.', tone: PD.moss },
  { icon: '📊', title: 'Reporty', desc: 'Měsíční obsazenost, MRR, nejvytíženější dny, top členové. Bez Excelu.', tone: PD.coral },
  { icon: '🏷️', title: 'Plány', desc: 'Definuj day pass, fix desk, virtual office. Cenotvorba, slevy, balíčky.', tone: PD.accent },
  { icon: '🎯', title: 'Marketing', desc: 'Tvůj profil v adresáři, SEO, push do marketplace, eventy. Vidí tě 10k+ coworkerů.', tone: PD.amber },
];

export default function CowOsPage() {
  const { data: session, status } = useSession();
  const [activeCows, setActiveCows] = useState<ActiveCow[]>([]);
  const [cowsChecked, setCowsChecked] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') {
      if (status === 'unauthenticated') setCowsChecked(true);
      return;
    }
    fetch('/api/claims')
      .then((r) => r.ok ? r.json() : { claims: [] })
      .then((data) => {
        const claims = (data?.claims || data || []).filter((c: any) => c?.status === 'approved');
        setActiveCows(claims.map((c: any) => ({ slug: c.coworkingSlug, name: c.coworkingName || c.coworkingSlug })));
      })
      .catch(() => setActiveCows([]))
      .finally(() => setCowsChecked(true));
  }, [status]);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      {/* Hero */}
      <NotebookPaper style={{ padding: '40px 20px 50px', position: 'relative' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-12">
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.moss, marginBottom: 6, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            🐄 šuplík provozovatele ↘
          </div>
          <h1 className="text-[44px] md:text-[88px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: '0 0 14px', color: PD.ink, textWrap: 'balance', maxWidth: 1000 }}>
            COW.OS — operační systém{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 400, color: PD.accent }}>pro tvůj coworking</span>.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, color: PD.inkSoft, margin: 0, maxWidth: 680 }}>
            Správa členů, automatická fakturace, QR platby, reporty. Vše v jednom adminu, který používáš z prohlížeče i z mobilu.
          </p>

          {/* Hand-drawn cow */}
          <div style={{ position: 'absolute', right: 30, top: 30, transform: 'rotate(8deg)' }} className="hidden lg:block">
            <svg width="180" height="160" viewBox="0 0 180 160">
              <ellipse cx="90" cy="100" rx="58" ry="38" fill={PD.paperWhite} stroke={PD.ink} strokeWidth="2.5" />
              <ellipse cx="68" cy="92" rx="14" ry="10" fill={PD.ink} opacity="0.85" />
              <ellipse cx="108" cy="108" rx="11" ry="8" fill={PD.ink} opacity="0.85" />
              <ellipse cx="125" cy="86" rx="8" ry="6" fill={PD.ink} opacity="0.85" />
              <ellipse cx="42" cy="78" rx="22" ry="20" fill={PD.paperWhite} stroke={PD.ink} strokeWidth="2.5" />
              <ellipse cx="32" cy="62" rx="6" ry="9" fill={PD.coral} stroke={PD.ink} strokeWidth="2" transform="rotate(-30 32 62)" />
              <ellipse cx="52" cy="60" rx="6" ry="9" fill={PD.coral} stroke={PD.ink} strokeWidth="2" transform="rotate(30 52 60)" />
              <path d="M 36 56 Q 30 48 28 50" stroke={PD.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 50 54 Q 56 46 58 48" stroke={PD.ink} strokeWidth="2" fill="none" strokeLinecap="round" />
              <ellipse cx="42" cy="86" rx="9" ry="6" fill={PD.coral} stroke={PD.ink} strokeWidth="1.8" />
              <circle cx="38" cy="86" r="1.4" fill={PD.ink} />
              <circle cx="46" cy="86" r="1.4" fill={PD.ink} />
              <circle cx="42" cy="74" r="2" fill={PD.ink} />
              <line x1="64" y1="135" x2="64" y2="148" stroke={PD.ink} strokeWidth="3" strokeLinecap="round" />
              <line x1="84" y1="138" x2="84" y2="152" stroke={PD.ink} strokeWidth="3" strokeLinecap="round" />
              <line x1="104" y1="138" x2="104" y2="152" stroke={PD.ink} strokeWidth="3" strokeLinecap="round" />
              <line x1="124" y1="135" x2="124" y2="148" stroke={PD.ink} strokeWidth="3" strokeLinecap="round" />
              <path d="M 148 100 Q 162 96 158 84" stroke={PD.ink} strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <circle cx="158" cy="82" r="3" fill={PD.ink} />
            </svg>
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            {status === 'authenticated' && cowsChecked && activeCows.length > 0 ? (
              <>
                {activeCows.slice(0, 1).map((cow) => (
                  <Link
                    key={cow.slug}
                    href={`/cow-os/${cow.slug}/dashboard`}
                    style={{ padding: '14px 24px', background: PD.ink, color: PD.paperWhite, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}
                  >
                    Otevřít admin: {cow.name} →
                  </Link>
                ))}
                <Link href="/spravce" style={{ padding: '14px 24px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                  Všechny moje coworkingy
                </Link>
              </>
            ) : (
              <>
                <Link href="/registrace" style={{ padding: '14px 24px', background: PD.ink, color: PD.paperWhite, fontSize: 15, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}>
                  Vyzkoušet 30 dní zdarma →
                </Link>
                <Link href="/ceniky" style={{ padding: '14px 24px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                  Ceník
                </Link>
              </>
            )}
          </div>
        </div>
      </NotebookPaper>

      {/* Features */}
      <div style={{ padding: '40px 24px 30px', background: PD.paperLt, borderTop: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-14 md:!py-12">
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
        <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
          — Co COW.OS umí
        </div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 28 }} className="md:!text-[32px]">
          Šest věcí, co ti ušetří týden v měsíci
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 22 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              style={{
                background: PD.paperWhite, border: `1.5px solid ${PD.rule}`,
                padding: '22px 20px', position: 'relative',
                transform: `rotate(${i % 2 === 0 ? -0.5 : 0.5}deg)`,
                boxShadow: '3px 4px 0 rgba(0,0,0,0.07)',
              }}
            >
              <Washi color={f.tone} seed={300 + i * 13} />
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

      {/* "How it works" */}
      <div style={{ padding: '40px 24px', background: PD.paper, borderTop: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-14 md:!py-12">
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
        <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
          — Jak to rozjedeš
        </div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 28 }} className="md:!text-[32px]">
          Tři kroky, žádný onboarding poplatek
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24 }}>
          {[
            { n: '01', t: 'Najdi svůj coworking', d: 'Najdi se v adresáři. Pokud tam ještě nejsi, založ profil zdarma.', c: PD.accent },
            { n: '02', t: 'Nárokuj si profil', d: 'Pošli claim — ověříme, že jsi provozovatel. Trvá to obvykle do 24 h.', c: PD.amber },
            { n: '03', t: 'Aktivuj COW.OS', d: 'Vyber plán, zaplať. Hned dostaneš přístup do admin dashboardu.', c: PD.moss },
          ].map((step, i) => (
            <div key={i} style={{ background: PD.paperWhite, border: `1.5px solid ${step.c}`, padding: '22px 20px', position: 'relative' }}>
              <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 56, fontWeight: 500, letterSpacing: '-0.05em', color: step.c, lineHeight: 1, marginBottom: 8 }}>
                {step.n}
              </div>
              <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 19, fontWeight: 500, color: PD.ink, marginBottom: 6 }}>
                {step.t}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.5, color: PD.inkSoft }}>
                {step.d}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ padding: '40px 24px', background: PD.ink, color: PD.paperLt, textAlign: 'center' }} className="md:!py-14">
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 6 }}>30 dní bez závazku</div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 18 }} className="md:!text-[36px]">
          Vyzkoušej COW.OS pro tvůj coworking
        </div>
        <Link href="/registrace" style={{ display: 'inline-block', padding: '14px 24px', background: PD.paperWhite, color: PD.ink, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}>
          Začít zdarma →
        </Link>
      </div>
    </div>
  );
}
