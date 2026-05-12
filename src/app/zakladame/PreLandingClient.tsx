'use client';

// Pre-landing klient — logo, hero copy, email form a skrytý popup pro kód pozvánky.
// Vizuál v Paper Diary stylu (paper background, ink barvy, handwritten Caveat font).

import { useState, useEffect, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  PD,
  PD_FONT_DISPLAY,
  PD_FONT_BODY,
  PD_FONT_HAND,
  PD_PAPER_BG,
} from '@/components/paper-diary/tokens';

type Status = 'idle' | 'sending' | 'done' | 'error';

// Naparsuje UTM parametry z URL — pošleme je na backend pro analytiku.
function readUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['source', 'medium', 'campaign', 'term', 'content'].forEach(k => {
    const v = params.get(`utm_${k}`);
    if (v) utm[k] = v.slice(0, 100);
  });
  return utm;
}

export default function PreLandingClient() {
  const router = useRouter();

  // --- email form state ---
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errMsg, setErrMsg] = useState<string | null>(null);

  // --- code popup state ---
  const [codeOpen, setCodeOpen] = useState(false);
  const [codeVal, setCodeVal] = useState('');
  const [codeStatus, setCodeStatus] = useState<Status>('idle');
  const [codeErr, setCodeErr] = useState<string | null>(null);

  // ESC zavírá popup
  useEffect(() => {
    if (!codeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCodeOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [codeOpen]);

  async function submitEmail(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErrMsg(null);
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: document.referrer || null,
          utm: readUtm(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErrMsg(data?.error ?? 'Něco se pokazilo, zkus to za chvíli.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setErrMsg('Síťová chyba, zkus to znovu.');
    }
  }

  async function submitCode(e: FormEvent) {
    e.preventDefault();
    setCodeStatus('sending');
    setCodeErr(null);
    try {
      const res = await fetch('/api/invitations/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeVal }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCodeStatus('error');
        setCodeErr(data?.error ?? 'Nesprávný kód.');
        return;
      }
      setCodeStatus('done');
      // hotovo — cookie nastavená, pošli na hlavní web
      setTimeout(() => router.push('/'), 400);
    } catch {
      setCodeStatus('error');
      setCodeErr('Síťová chyba, zkus to znovu.');
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PD_PAPER_BG,
        color: PD.ink,
        fontFamily: PD_FONT_BODY,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Centrální stage */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 1.5rem 2rem',
          textAlign: 'center',
          maxWidth: 640,
          margin: '0 auto',
        }}
      >
        {/* Logo */}
        <Image
          src="/logo-kings.png"
          alt="COWORKINGS.cz"
          width={140}
          height={140}
          priority
          style={{ width: 120, height: 'auto', marginBottom: '2rem' }}
        />

        {/* Hero copy */}
        <h1
          style={{
            fontFamily: PD_FONT_DISPLAY,
            fontWeight: 700,
            fontSize: 'clamp(1.6rem, 4.5vw, 2.4rem)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: 0,
            color: PD.ink,
          }}
        >
          Jste připraveni na spuštění
          <br />
          největší coworkingové platformy v ČR?
        </h1>

        <p
          style={{
            fontFamily: PD_FONT_HAND,
            fontSize: 'clamp(1.6rem, 5vw, 2.2rem)',
            color: PD.coral,
            margin: '2rem 0 0',
            transform: 'rotate(-1.5deg)',
            lineHeight: 1.1,
          }}
        >
          My ještě ne :) ale makáme na tom.
        </p>

        <p
          style={{
            marginTop: '2.5rem',
            fontSize: '1.05rem',
            lineHeight: 1.55,
            color: PD.inkSoft,
            maxWidth: 520,
          }}
        >
          Jestli chceš i tak mrknout, jak jsme na tom, zadej svůj email,
          a pozveme tě rádi dovnitř dříve než ostatní.
        </p>

        {/* Email form */}
        {status !== 'done' ? (
          <form
            onSubmit={submitEmail}
            style={{
              marginTop: '1.75rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              width: '100%',
              maxWidth: 460,
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="tvuj@email.cz"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={status === 'sending'}
                style={{
                  flex: '1 1 220px',
                  padding: '0.9rem 1rem',
                  border: `1.5px solid ${PD.rule}`,
                  borderRadius: 4,
                  background: PD.paperWhite,
                  color: PD.ink,
                  fontFamily: PD_FONT_BODY,
                  fontSize: '1rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={status === 'sending'}
                style={{
                  padding: '0.9rem 1.4rem',
                  background: PD.ink,
                  color: PD.paperWhite,
                  border: 'none',
                  borderRadius: 4,
                  fontFamily: PD_FONT_DISPLAY,
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: status === 'sending' ? 'wait' : 'pointer',
                  letterSpacing: '0.01em',
                  flex: '0 0 auto',
                }}
              >
                {status === 'sending' ? 'Posílám…' : 'Pošli pozvánku'}
              </button>
            </div>
            {status === 'error' && errMsg && (
              <p style={{ color: PD.coral, margin: 0, fontSize: '0.9rem' }}>{errMsg}</p>
            )}
            <p style={{ fontSize: '0.8rem', color: PD.inkMuted, margin: 0 }}>
              Žádný spam — jen jednu pozvánku, až spustíme.
            </p>
          </form>
        ) : (
          <div
            style={{
              marginTop: '1.75rem',
              padding: '1.25rem 1.5rem',
              background: PD.paperWhite,
              border: `1.5px solid ${PD.moss}`,
              borderRadius: 4,
              maxWidth: 460,
            }}
          >
            <p
              style={{
                fontFamily: PD_FONT_HAND,
                fontSize: '1.6rem',
                color: PD.moss,
                margin: 0,
              }}
            >
              Díky! Ozveme se.
            </p>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.95rem', color: PD.inkSoft }}>
              Email <strong>{email}</strong> je na seznamu pozvánek.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem 1.5rem 2.5rem',
          fontSize: '0.78rem',
          color: PD.inkMuted,
          borderTop: `1px solid ${PD.ruleSoft}`,
        }}
      >
        <p style={{ margin: 0 }}>
          Na tomto projektu pracuje tým <strong>Cokoliv s.r.o.</strong>
        </p>
        <p style={{ margin: '0.4rem 0 0' }}>
          <button
            type="button"
            onClick={() => setCodeOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              color: PD.inkMuted,
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              textDecoration: 'underline dotted',
              textUnderlineOffset: 3,
            }}
          >
            &gt; klikni sem, protože víš, co bude následovat &lt;
          </button>
        </p>
      </footer>

      {/* Code popup */}
      {codeOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setCodeOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26,26,26,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 50,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 420,
              background: PD.paperWhite,
              border: `1.5px solid ${PD.rule}`,
              borderRadius: 6,
              padding: '1.75rem',
              position: 'relative',
              boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
            }}
          >
            <button
              type="button"
              aria-label="Zavřít"
              onClick={() => setCodeOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                background: 'none',
                border: 'none',
                fontSize: '1.4rem',
                color: PD.inkMuted,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>

            <h2
              style={{
                fontFamily: PD_FONT_DISPLAY,
                fontSize: '1.3rem',
                fontWeight: 700,
                margin: '0 0 0.4rem',
                color: PD.ink,
              }}
            >
              Máš pozvánkový kód?
            </h2>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.9rem', color: PD.inkSoft }}>
              Zadej kód, který ti přišel — a pustíme tě dovnitř.
            </p>

            {codeStatus !== 'done' ? (
              <form onSubmit={submitCode}>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="kód pozvánky"
                  value={codeVal}
                  onChange={e => setCodeVal(e.target.value)}
                  disabled={codeStatus === 'sending'}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    border: `1.5px solid ${PD.rule}`,
                    borderRadius: 4,
                    background: PD.paper,
                    color: PD.ink,
                    fontFamily: PD_FONT_BODY,
                    fontSize: '1rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  type="submit"
                  disabled={codeStatus === 'sending'}
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.9rem 1.4rem',
                    background: PD.ink,
                    color: PD.paperWhite,
                    border: 'none',
                    borderRadius: 4,
                    fontFamily: PD_FONT_DISPLAY,
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: codeStatus === 'sending' ? 'wait' : 'pointer',
                    letterSpacing: '0.01em',
                  }}
                >
                  {codeStatus === 'sending' ? 'Ověřuju…' : 'Pustit dovnitř'}
                </button>
                {codeStatus === 'error' && codeErr && (
                  <p
                    style={{
                      color: PD.coral,
                      marginTop: '0.75rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {codeErr}
                  </p>
                )}
              </form>
            ) : (
              <p
                style={{
                  fontFamily: PD_FONT_HAND,
                  fontSize: '1.6rem',
                  color: PD.moss,
                  margin: 0,
                }}
              >
                Vítej uvnitř… přesměrovávám.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
