'use client';

// /prihlaseni/zapomenute-heslo
// Formulář pro vyžádání reset linku. Po submitu vždy ukáže neutrální zprávu
// (anti enumeration — neprozradí, jestli email v DB existuje).

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_MONO } from '@/components/paper-diary/tokens';

export default function ZapomenuteHesloPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setErr(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErr(data?.error ?? 'Nepodařilo se odeslat. Zkus to za chvíli.');
        return;
      }
      setStatus('done');
    } catch {
      setStatus('error');
      setErr('Síťová chyba. Zkus to znovu.');
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontFamily: PD_FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: PD.ink, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Zapomenuté heslo
        </h1>
        <p style={{ color: PD.inkSoft, fontSize: 14, margin: '0 0 24px', lineHeight: 1.55 }}>
          Zadej email, který používáš pro přihlášení. Pošleme ti odkaz na nastavení nového hesla.
        </p>

        {status !== 'done' ? (
          <form onSubmit={onSubmit}>
            <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tvuj@email.cz"
              disabled={status === 'sending'}
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <button
              type="submit"
              disabled={status === 'sending'}
              style={{ width: '100%', padding: '13px 16px', background: PD.ink, color: PD.paperWhite, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: status === 'sending' ? 'wait' : 'pointer', opacity: status === 'sending' ? 0.6 : 1, boxShadow: `3px 3px 0 ${PD.margin}` }}
            >
              {status === 'sending' ? 'Posílám…' : 'Poslat reset odkaz'}
            </button>

            {status === 'error' && err && (
              <p style={{ marginTop: 14, padding: '10px 12px', background: '#fbece6', border: `1px solid ${PD.coral}`, color: PD.coral, fontSize: 13 }}>
                {err}
              </p>
            )}
          </form>
        ) : (
          <div style={{ padding: 20, background: PD.paperLt, border: `1.5px solid ${PD.moss}`, color: PD.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
            <p style={{ margin: 0, fontWeight: 600, color: PD.ink }}>
              Pokud k <strong>{email}</strong> existuje účet, dorazí ti během chvíle email s odkazem.
            </p>
            <p style={{ margin: '12px 0 0', fontSize: 13 }}>
              Mrkni i do spamu. Odkaz vyprší za 1 hodinu.
            </p>
          </div>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: PD.inkMuted, textAlign: 'center' }}>
          <Link href="/prihlaseni" style={{ color: PD.margin, textDecoration: 'none' }}>← Zpět na přihlášení</Link>
        </p>
      </div>
    </div>
  );
}
