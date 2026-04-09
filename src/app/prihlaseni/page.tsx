'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="text-2xl font-bold text-gray-900">COWORKINGS<span className="text-blue-600">.cz</span></span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Přihlášení</h1>
            <p className="text-gray-600">Přihlaš se do svého účtu</p>
          </div>

          {/* Email verified success */}
          {verified && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Email úspěšně ověřen! Teď se můžeš přihlásit.
            </div>
          )}

          {/* Verification link error */}
          {verifyError === 'token-expired' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Ověřovací odkaz vypršel. Registruj se znovu nebo kontaktuj podporu.
            </div>
          )}
          {(verifyError === 'invalid-token' || verifyError === 'server-error') && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              Neplatný ověřovací odkaz. Zkus se zaregistrovat znovu.
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={handleGoogle}
            className="w-full py-3 px-4 border-2 border-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Přihlásit přes Google
          </button>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">nebo emailem</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tvůj@email.cz"
                  className="input-field pl-12 w-full"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-12 pr-10 w-full"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Přihlašuji...
                </span>
              ) : 'Přihlásit se'}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6">
            Nemáš účet?{' '}
            <Link href="/registrace" className="text-blue-600 hover:text-blue-700 font-semibold">
              Zaregistruj se
            </Link>
          </p>
        </div>

        <div className="mt-4 p-4 bg-white rounded-lg border border-gray-100 text-sm text-gray-600">
          <p className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <span>
              Provozuješ coworking? <Link href="/registrace" className="text-blue-600 font-semibold hover:underline">Zaregistruj se jako správce</Link> a přivlasť si svůj profil.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PrihlaseniPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <PrihlaseniForm />
    </Suspense>
  );
}
