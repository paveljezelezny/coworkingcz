'use client';

// /prihlaseni/nove-heslo?token=XXX
// Formulář pro zadání nového hesla po kliknutí na reset link v mailu.

import { useState, Suspense, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { PD, PD_FONT_DISPLAY, PD_FONT_MONO } from '@/components/paper-diary/tokens';

function NoveHesloForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) {
      setErr('Heslo musí mít aspoň 8 znaků.');
      return;
    }
    if (password !== password2) {
      setErr('Hesla se neshodují.');
      return;
    }
    if (!token) {
      setErr('Chybí reset token v URL. Klikni znovu na odkaz z mailu.');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setErr(data?.error ?? 'Nepodařilo se uložit heslo.');
        return;
      }
      setStatus('done');
      setTimeout(() => router.push('/prihlaseni?reset=1'), 1500);
    } catch {
      setStatus('error');
      setErr('Síťová chyba. Zkus to znovu.');
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 160px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <h1 style={{ fontFamily: PD_FONT_DISPLAY, fontWeight: 700, fontSize: 26, color: PD.ink, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Nové heslo
        </h1>
        <p style={{ color: PD.inkSoft, fontSize: 14, margin: '0 0 24px', lineHeight: 1.55 }}>
          Nastav si nové heslo. Aspoň 8 znaků.
        </p>

        {!token && (
          <p style={{ padding: '10px 12px', background: '#fbece6', border: `1px solid ${PD.coral}`, color: PD.coral, fontSize: 13 }}>
            Chybí reset token. Klikni znovu na odkaz z e-mailu, nebo požádej o nový reset.
          </p>
        )}

        {status === 'done' ? (
          <div style={{ padding: 20, background: PD.paperLt, border: `1.5px solid ${PD.moss}`, color: PD.inkSoft, fontSize: 14, lineHeight: 1.6 }}>
            <p style={{ margin: 0, fontWeight: 600, color: PD.ink }}>Hotovo. Nové heslo je uložené.</p>
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>Přesměrovávám tě na přihlášení…</p>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              Nové heslo
            </label>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
                autoFocus
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="aspoň 8 znaků"
                disabled={status === 'sending'}
                style={{ width: '100%', padding: '11px 40px 11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink, boxSizing: 'border-box' }}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: PD.inkMuted, fontSize: 14, padding: 4 }}
                aria-label="Zobrazit heslo"
              >
                {show ? '🙈' : '👁'}
              </button>
            </div>

            <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
              Nové heslo znovu
            </label>
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              placeholder="zopakuj heslo"
              disabled={status === 'sending'}
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink, boxSizing: 'border-box', marginBottom: 16 }}
            />

            <button
              type="submit"
              disabled={status === 'sending' || !token}
              style={{ width: '100%', padding: '13px 16px', background: PD.ink, color: PD.paperWhite, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: status === 'sending' ? 'wait' : 'pointer', opacity: status === 'sending' || !token ? 0.6 : 1, boxShadow: `3px 3px 0 ${PD.margin}` }}
            >
              {status === 'sending' ? 'Ukládám…' : 'Uložit nové heslo'}
            </button>

            {status === 'error' && err && (
              <p style={{ marginTop: 14, padding: '10px 12px', background: '#fbece6', border: `1px solid ${PD.coral}`, color: PD.coral, fontSize: 13 }}>
                {err}
              </p>
            )}
          </form>
        )}

        <p style={{ marginTop: 20, fontSize: 13, color: PD.inkMuted, textAlign: 'center' }}>
          <Link href="/prihlaseni" style={{ color: PD.margin, textDecoration: 'none' }}>← Zpět na přihlášení</Link>
        </p>
      </div>
    </div>
  );
}

export default function NoveHesloPage() {
  return (
    <Suspense fallback={null}>
      <NoveHesloForm />
    </Suspense>
  );
}
