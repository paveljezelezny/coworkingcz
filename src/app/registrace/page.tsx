'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail, Lock, User, Eye, EyeOff, Building2,
  AlertCircle, CheckCircle, Zap, Star, ArrowRight,
  Gift, Calendar, Users, TrendingUp,
} from 'lucide-react';

type Tab = 'coworker' | 'coworking';
type Step = 'form' | 'trial' | 'done';
type Plan = 'monthly' | 'yearly';

const COWORKER_MONTHLY = 79;
const COWORKER_YEARLY  = 790;
const COWORKING_MONTHLY = 490;
const COWORKING_YEARLY  = Math.round(COWORKING_MONTHLY * 12 * 0.8);

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
  'Marketplace — neomezené inzeráty',
  'Analytika a statistiky profilu',
];

export default function RegistracePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('coworker');
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activatingTrial, setActivatingTrial] = useState(false);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<Plan>('yearly');

  const monthlyPrice  = tab === 'coworker' ? COWORKER_MONTHLY  : COWORKING_MONTHLY;
  const yearlyPrice   = tab === 'coworker' ? COWORKER_YEARLY   : COWORKING_YEARLY;
  const yearlySaving  = Math.round(monthlyPrice * 12 - yearlyPrice);
  const benefits      = tab === 'coworker' ? COWORKER_BENEFITS : COWORKING_BENEFITS;

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
      if (!res.ok) { setError(data.error || 'Registrace se nezdařila'); return; }

      // Auto sign-in, then show trial offer
      await signIn('credentials', { email, password, redirect: false });
      setStep('trial');
    } catch {
      setError('Chyba serveru. Zkus to znovu.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateTrial = async () => {
    setActivatingTrial(true);
    try {
      await fetch('/api/trial/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      setStep('done');
      setTimeout(() => {
        router.push(tab === 'coworking' ? '/spravce' : '/');
      }, 2200);
    } catch {
      setStep('done');
      setTimeout(() => router.push('/'), 1500);
    } finally {
      setActivatingTrial(false);
    }
  };

  const handleSkipTrial = () => {
    router.push(tab === 'coworking' ? '/spravce' : '/');
  };

  // ─── STEP: done ──────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vítejte na palubě! 🚀</h2>
          <p className="text-gray-600">Váš 30denní trial je aktivní. Přesměrovávám…</p>
        </div>
      </div>
    );
  }

  // ─── STEP: trial offer ───────────────────────────────────────────────
  if (step === 'trial') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-bold rounded-full mb-6">
              <Gift className="w-4 h-4" />
              Účet vytvořen úspěšně!
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              30 dní <span className="text-blue-600">zdarma</span> — žádná karta
            </h1>
            <p className="text-lg text-gray-600">
              Vyzkoušejte všechny funkce bez závazků. Teprve po 30 dnech začne platit váš vybraný plán.
            </p>
          </div>

          {/* Plan toggle */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex mb-8 max-w-xs mx-auto">
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                selectedPlan === 'monthly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Měsíční
            </button>
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
                selectedPlan === 'yearly' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Roční
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${selectedPlan === 'yearly' ? 'bg-green-400 text-green-900' : 'bg-green-100 text-green-700'}`}>
                -{Math.round(yearlySaving / (monthlyPrice * 12) * 100)}%
              </span>
            </button>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

            {/* Trial card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm font-bold text-blue-100">TRIAL — prvních 30 dní</span>
                </div>
                <div className="text-5xl font-black mb-1">0 Kč</div>
                <p className="text-blue-200 text-sm mb-5">bez nutnosti platební karty</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-300" />
                  <span>Pak {selectedPlan === 'yearly'
                    ? `${yearlyPrice} Kč/rok`
                    : `${monthlyPrice} Kč/měs`}</span>
                </div>
              </div>
            </div>

            {/* After trial card */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-gray-600">
                  PO TRIALU — {selectedPlan === 'yearly' ? 'Roční' : 'Měsíční'} plán
                </span>
              </div>
              <div className="mb-5">
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-gray-900">
                    {selectedPlan === 'yearly'
                      ? Math.round(yearlyPrice / 12)
                      : monthlyPrice}
                  </span>
                  <span className="text-gray-500 mb-1.5">Kč/měs</span>
                </div>
                {selectedPlan === 'yearly' && (
                  <p className="text-xs text-gray-500">
                    Fakturováno ročně — {yearlyPrice} Kč/rok
                    <span className="ml-2 text-green-600 font-semibold">ušetříte {yearlySaving} Kč</span>
                  </p>
                )}
              </div>
              <ul className="space-y-2">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Perks row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: <Gift className="w-5 h-5 text-blue-600" />, label: '30 dní', sub: 'zdarma' },
              { icon: <TrendingUp className="w-5 h-5 text-green-600" />, label: 'Zrušení', sub: 'kdykoliv' },
              { icon: <Users className="w-5 h-5 text-purple-600" />, label: '100+', sub: 'coworkingů' },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
                <div className="flex justify-center mb-2">{p.icon}</div>
                <div className="font-bold text-gray-900 text-sm">{p.label}</div>
                <div className="text-xs text-gray-500">{p.sub}</div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <button
              onClick={handleActivateTrial}
              disabled={activatingTrial}
              className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
            >
              {activatingTrial ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Aktivuji…
                </span>
              ) : (
                <>
                  <Gift className="w-6 h-6" />
                  Aktivovat 30 dní zdarma
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <button
              onClick={handleSkipTrial}
              className="w-full py-3 text-gray-500 hover:text-gray-700 text-sm transition-colors"
            >
              Přeskočit — pokračovat bez trialu
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Po 30 dnech vám zašleme e-mail s připomínkou. Platbu aktivujete ručně — nic se nestrhne automaticky bez vašeho souhlasu.
          </p>
        </div>
      </div>
    );
  }

  // ─── STEP: registration form ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
              <span className="text-2xl font-bold text-gray-900">COWORKINGS<span className="text-blue-600">.cz</span></span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Registrace</h1>
            <p className="text-sm text-gray-500">30 dní zdarma · bez platební karty</p>
          </div>

          {/* Trial badge */}
          <div className="mb-6 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 text-blue-800 text-sm font-semibold rounded-full">
              <Gift className="w-4 h-4 text-green-600" />
              Vyzkoušejte zdarma po dobu 30 dní
            </div>
          </div>

          {/* Tabs */}
          <div className="grid grid-cols-2 gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('coworker')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                tab === 'coworker' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4" />
              Jsem coworker
            </button>
            <button
              onClick={() => setTab('coworking')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
                tab === 'coworking' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Mám coworking
            </button>
          </div>

          {/* Info box */}
          <div className={`mb-6 p-4 rounded-xl text-sm ${tab === 'coworking' ? 'bg-blue-50 border border-blue-200 text-blue-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
            {tab === 'coworking' ? (
              <><strong>Správce coworkingu:</strong> Po registraci si přivlastníte svůj coworking a budete moct editovat celý profil.</>
            ) : (
              <><strong>Coworker:</strong> Získáte přístup do sítě coworkingů, marketplace a kalendáře akcí.</>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/api/trial/activate?redirect=true' })}
            className="w-full py-3 px-4 border-2 border-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Registrovat přes Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">nebo emailem</span></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Jméno a příjmení</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jan Novák" className="input-field pl-12 w-full" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tvůj@email.cz" className="input-field pl-12 w-full" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 znaků" className="input-field pl-12 pr-10 w-full" required minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Registruji…</>
              ) : (
                <><Gift className="w-5 h-5" /> Vytvořit účet a získat 30 dní zdarma</>
              )}
            </button>
          </form>

          <p className="text-center text-gray-600 mt-6 text-sm">
            Máš účet?{' '}
            <Link href="/prihlaseni" className="text-blue-600 hover:text-blue-700 font-semibold">Přihlaš se</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
