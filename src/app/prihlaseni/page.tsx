'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi, Stamp } from '@/components/paper-diary/primitives';

function PrihlaseniForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const verified = searchParams.get('verified') === '1';
  const verifyError = searchParams.get('error');

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      const role = (session?.user as any)?.role;
      if (role === 'coworking_admin' || role === 'super_admin') {
        router.push('/spravce');
      } else {
        router.push(callbackUrl);
      }
    }
  }, [status, session, router, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error === 'EMAIL_NOT_VERIFIED') {
        setError('Nejprve ověř svůj email. Zkontroluj doručenou poštu a klikni na ověřovací odkaz.');
      } else {
        setError('Nesprávný email nebo heslo.');
      }
    } else {
      router.push(callbackUrl);
    }
  };

  const handleGoogle = () => {
    signIn('google', { callbackUrl });
  };

  if (status === 'loading') {
    return (
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
        ↻ načítám…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '40px 20px 60px', minHeight: '70vh' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-12" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: 460 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 26, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                vítej zpátky ↘
              </div>
              <h1 className="text-[40px] md:text-[56px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: '4px 0 8px', color: PD.ink }}>
                Přihlášení
              </h1>
              <p style={{ fontSize: 14, color: PD.inkSoft, margin: 0 }}>
                Přihlas se do svého účtu
              </p>
            </div>

            {/* Card */}
            <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', padding: '28px 26px', position: 'relative' }}>
              <Washi color={PD.amber} seed={701} top={-7} left="40%" />

              {/* Email verified */}
              {verified && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#eaf2e3', border: `1.5px solid ${PD.moss}`, color: '#3e5530', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span>✓</span>
                  <span>Email úspěšně ověřen! Teď se můžeš přihlásit.</span>
                </div>
              )}

              {/* Verification link errors */}
              {verifyError === 'token-expired' && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f6e8c8', border: `1.5px solid ${PD.amber}`, color: '#6a4a10', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span>⚠</span>
                  <span>Ověřovací odkaz vypršel. Zaregistruj se znovu nebo kontaktuj podporu.</span>
                </div>
              )}
              {(verifyError === 'invalid-token' || verifyError === 'server-error') && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f4d9d2', border: `1.5px solid ${PD.coral}`, color: '#7a2c1d', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span>✕</span>
                  <span>Neplatný ověřovací odkaz. Zkus se zaregistrovat znovu.</span>
                </div>
              )}

              {/* Form error */}
              {error && (
                <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f4d9d2', border: `1.5px solid ${PD.coral}`, color: '#7a2c1d', fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span>✕</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Google */}
              <button
                onClick={handleGoogle}
                style={{ width: '100%', padding: '12px 16px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Přihlásit přes Google
              </button>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
                <div style={{ flex: 1, borderTop: `1px dashed ${PD.rule}` }} />
                <span style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase' }}>nebo emailem</span>
                <div style={{ flex: 1, borderTop: `1px dashed ${PD.rule}` }} />
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tvůj@email.cz"
                    required
                    style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink }}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={{ display: 'block', fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                    Heslo
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      style={{ width: '100%', padding: '11px 40px 11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: 'inherit', fontSize: 15, outline: 'none', color: PD.ink }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: PD.inkMuted, fontSize: 14, padding: 4 }}
                      aria-label="Zobrazit heslo"
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '13px 16px', background: PD.ink, color: PD.paperWhite, border: 'none', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.6 : 1, boxShadow: `3px 3px 0 ${PD.margin}` }}
                >
                  {loading ? '↻ Přihlašuji…' : 'Přihlásit se →'}
                </button>
              </form>

              <p style={{ textAlign: 'center', color: PD.inkSoft, fontSize: 13, marginTop: 18, marginBottom: 0 }}>
                Nemáš účet?{' '}
                <Link href="/registrace" style={{ color: PD.margin, fontWeight: 600, textDecoration: 'none' }}>
                  Zaregistruj se
                </Link>
              </p>
            </div>

            {/* Tip pro coworking provozovatele */}
            <div style={{ marginTop: 16, padding: '14px 16px', background: PD.paperLt, border: `1px dashed ${PD.rule}`, fontSize: 13, color: PD.inkSoft }}>
              <span style={{ fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.amber, marginRight: 6 }}>💡</span>
              Provozuješ coworking?{' '}
              <Link href="/registrace?role=coworking" style={{ color: PD.margin, fontWeight: 600, textDecoration: 'none' }}>
                Zaregistruj se jako správce
              </Link>{' '}
              a přivlasť si svůj profil.
            </div>
          </div>
        </div>
      </NotebookPaper>
    </div>
  );
}

export default function PrihlaseniPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
        ↻ načítám…
      </div>
    }>
      <PrihlaseniForm />
    </Suspense>
  );
}
