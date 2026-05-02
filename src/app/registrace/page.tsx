'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi, Stamp } from '@/components/paper-diary/primitives';

type Tab = 'coworker' | 'coworking';
type Step = 'form' | 'verify';

const COWORKER_BENEFITS = [
  'Přístup do sítě 100+ coworkingů',
  'Marketplace — neomezené inzeráty',
  'Přidávání eventů do kalendáře',
  'Profil v adresáři coworkerů',
  'Special Deal nabídky',
];

const COWORKING_BENEFITS = [
  'Zvýrazněný profil v katalogu',
  'Special Deal badge na kartě',
  'Přidávání eventů (neomezeno)',
  'COW.OS — správa členů, fakturace, QR vstupy',
  'Analytika a statistiky profilu',
];

function RegistraceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRole = searchParams.get('role');

  const [tab, setTab] = useState<Tab>(paramRole === 'coworking' ? 'coworking' : 'coworker');
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const benefits = tab === 'coworker' ? COWORKER_BENEFITS : COWORKING_BENEFITS;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, password,
          role: tab === 'coworking' ? 'coworking_admin' : 'coworker',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Registrace se nezdařila');
        return;
      }
      setStep('verify');
    } catch {
      setError('Chyba serveru. Zkus to znovu.');
    } finally {
      setLoading(false);
    }
  };

  // ── VERIFY EMAIL screen ────────────────────────────────────
  if (step === 'verify') {
    return (
      <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
        <NotebookPaper style={{ padding: '60px 20px', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 460, textAlign: 'center' }}>
            <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', padding: '36px 28px', position: 'relative' }}>
              <Washi color={PD.moss} seed={888} />
              <div style={{ fontSize: 48, marginBottom: 16 }}>✉</div>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                ↘ skoro hotovo
              </div>
              <h2 style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 32, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, margin: '6px 0 12px' }}>
                Ověř svůj email
              </h2>
              <p style={{ fontSize: 14, color: PD.inkSoft, margin: '0 0 6px' }}>
                Poslali jsme ti ověřovací odkaz na
              </p>
              <p style={{ fontFamily: PD_FONT_MONO, fontSize: 13, color: PD.ink, margin: '0 0 18px', wordBreak: 'break-all' }}>
                {email}
              </p>
              <p style={{ fontSize: 13, color: PD.inkSoft, lineHeight: 1.5, margin: '0 0 22px' }}>
                Klikni na odkaz v emailu pro dokončení registrace.
                Pak se budeš moct přihlásit.
              </p>
              <Link
                href="/prihlaseni"
                style={{ display: 'inline-block', padding: '12px 22px', background: PD.ink, color: PD.paperWhite, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}` }}
              >
                Pokračovat na přihlášení →
              </Link>
            </div>
          </div>
        </NotebookPaper>
      </div>
    );
  }

  // ── FORM screen ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '40px 20px 60px', minHeight: '70vh' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-12" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 720 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                ↘ založ si účet
              </div>
              <h1 className="text-[40px] md:text-[56px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: '4px 0 8px', color: PD.ink }}>
                Registrace
              </h1>
              <p style={{ fontSize: 14, color: PD.inkSoft, margin: 0 }}>
                30 dní zdarma · bez platební karty · zruš kdykoliv
              </p>
            </div>

            {/* Tab toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
              <div style={{ display: 'inline-flex', border: `1.5px solid ${PD.ink}`, background: PD.paperWhite, boxShadow: '3px 3px 0 rgba(0,0,0,0.08)' }}>
                {(['coworker', 'coworking'] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    style={{
                      padding: '10px 18px', fontSize: 13, fontFamily: 'inherit',
                      background: tab === t ? PD.ink : 'transparent',
                      color: tab === t ? PD.paperWhite : PD.ink,
                      border: 'none', cursor: 'pointer', fontWeight: tab === t ? 600 : 400,
                      borderRight: t === 'coworker' ? `1px solid ${PD.ink}` : 'none',
                    }}
                  >
                    {t === 'coworker' ? 'Coworker' : 'Provozovatel coworkingu'}
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]" style={{ gap: 22 }}>
              {/* Form */}
              <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', padding: '24px 22px', position: 'relative' }}>
                <Washi color={PD.amber} seed={tab === 'coworker' ? 401 : 412} />

                {error && (
                  <div style={{ marginBottom: 14, padding: '10px 14px', background: '#f4d9d2', border: `1.5px solid ${PD.coral}`, color: '#7a2c1d', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <span>✕</span>
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Jméno
                    </label>
                    <input
                      type="text" value={name} onChange={(e) => setName(e.target.value)}
                      placeholder={tab === 'coworking' ? 'Tvé jméno (správce)' : 'Jan Novák'} required
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Email
                    </label>
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="tvůj@email.cz" required
                      style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink }}
                    />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                      Heslo
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="alespoň 8 znaků" required minLength={8}
                        style={{ width: '100%', padding: '11px 40px 11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink }}
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: PD.inkMuted, fontSize: 14 }}
                        aria-label="Zobrazit heslo"
                      >
                        {showPassword ? '🙈' : '👁'}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit" disabled={loading}
                    style={{ width: '100%', padding: '13px 16px', background: PD.ink, color: PD.paperWhite, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: `3px 3px 0 ${PD.margin}` }}
                  >
                    {loading ? '↻ Registruji…' : `Vytvořit účet ${tab === 'coworking' ? 'správce' : 'coworkera'} →`}
                  </button>
                </form>

                <p style={{ textAlign: 'center', color: PD.inkSoft, fontSize: 13, marginTop: 18, marginBottom: 0 }}>
                  Už máš účet?{' '}
                  <Link href="/prihlaseni" style={{ color: PD.margin, fontWeight: 600, textDecoration: 'none' }}>
                    Přihlaš se
                  </Link>
                </p>
              </div>

              {/* Benefits sidebar */}
              <div style={{ background: PD.paperLt, border: `1px dashed ${PD.rule}`, padding: '22px 20px' }}>
                <div style={{ position: 'absolute', marginTop: -32 }}>
                  <Stamp rotate={-4} color={PD.moss}>30 dní zdarma</Stamp>
                </div>
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6, marginTop: 4 }}>
                  — Co dostaneš
                </div>
                <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, marginBottom: 14 }}>
                  {tab === 'coworker' ? 'Coworker plán' : 'Provozovatel plán'}
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  {benefits.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: PD.inkSoft }}>
                      <span style={{ color: PD.moss, fontWeight: 700 }}>✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 18, paddingTop: 14, borderTop: `1px dashed ${PD.rule}`, fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.inkMuted }}>
                  → bez platební karty, zruš kdykoliv
                </div>
              </div>
            </div>
          </div>
        </div>
      </NotebookPaper>
    </div>
  );
}

export default function RegistracePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
        ↻ načítám…
      </div>
    }>
      <RegistraceInner />
    </Suspense>
  );
}
