'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Check, X, Globe, Users, Award, HelpCircle, Plus,
  Building2, User, ChevronDown, Gift, ArrowRight, Zap,
  BadgeCheck, CalendarPlus, ShoppingBag,
} from 'lucide-react';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP, COWORKER_MEMBERSHIP_BENEFITS } from '@/lib/types';

export default function CenikyPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [activating, setActivating] = useState<string | null>(null);

  // ── Button handlers ──────────────────────────────────────────────────────

  const goToRegistrace = (role: 'coworking' | 'coworker', plan: string) => {
    router.push(`/registrace?role=${role}&plan=${plan}`);
  };

  // For already-logged-in users: activate trial directly
  const activateTrial = async (plan: string, redirectTo: string) => {
    setActivating(plan);
    try {
      await fetch('/api/trial/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.includes('year') ? 'yearly' : 'monthly' }),
      });
      router.push(redirectTo);
    } catch {
      router.push(redirectTo);
    } finally {
      setActivating(null);
    }
  };

  const handleCoworkingPlan = (tier: string) => {
    if (session) {
      // Already logged in — activate and go to manager
      const plan = tier === 'large' ? 'yearly' : 'monthly';
      activateTrial(plan, '/spravce');
    } else {
      goToRegistrace('coworking', tier);
    }
  };

  const handleCoworkerPlan = (plan: string) => {
    if (session) {
      activateTrial(plan, '/profil');
    } else {
      goToRegistrace('coworker', plan);
    }
  };

  // ── Data ─────────────────────────────────────────────────────────────────

  const features = [
    { name: 'Profil coworkingu',                              small: true,  medium: true,  large: true  },
    { name: 'Fotogalerie',                                    small: true,  medium: true,  large: true  },
    { name: 'Vybavení & ceny',                                small: true,  medium: true,  large: true  },
    { name: 'Rezervační systém',                              small: false, medium: true,  large: true  },
    { name: 'Event management',                               small: false, medium: true,  large: true  },
    { name: 'Special Deal — zvýhodněná nabídka na kartě',     small: false, medium: true,  large: true  },
    { name: 'Analytics',                                      small: false, medium: false, large: true  },
    { name: 'Email podpora',                                  small: true,  medium: true,  large: true  },
    { name: 'Prioritní podpora',                              small: false, medium: true,  large: true  },
    { name: 'Dedikovaný account manager',                     small: false, medium: false, large: true  },
  ];

  const faqs = [
    { question: 'Jak dlouho trvá aktivace profilu?',           answer: 'Profil je aktivován ihned po registraci. Ověření údajů trvá 1–2 pracovní dny.' },
    { question: 'Mohu během smlouvy změnit plán?',             answer: 'Ano, plán můžete změnit kdykoli. Nový plán se projeví v příští fakturaci.' },
    { question: 'Jaký je minimální závazek?',                  answer: 'Minimální závazek je 1 měsíc. Kdykoli můžete plán změnit nebo zrušit.' },
    { question: 'Je možné platit ročně se slevou?',            answer: 'Ano, při roční smlouvě získáte slevu 20 % na cenu měsíčního plánu.' },
    { question: 'Jak fungují dodatečné adresy?',               answer: 'Každá extra adresa se fakturuje zvlášť. Cena je uvedena v plánu.' },
    { question: 'Poskytujete bezplatnou migraci?',             answer: 'Ano, naši specialisté Vám s migrací dat pomohou zdarma. Kontaktujte support.' },
    { question: 'Mohu to nejdřív vyzkoušet zdarma?',          answer: 'Ano! Každý nový účet získá 30 dní zdarma bez nutnosti platební karty. Teprve poté začne placení.' },
  ];

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const monthlySaving       = COWORKER_MEMBERSHIP.yearlyMonthlySaving;
  const yearlyMonthlyPrice  = COWORKER_MEMBERSHIP.yearlyMonthlyPrice; // 49 Kč/měs
  const yearlyDiscount      = Math.round((1 - yearlyMonthlyPrice / COWORKER_MEMBERSHIP.monthlyPrice) * 100); // ~50 %
  const pricePerPersonMonth = Math.round(COWORKER_MEMBERSHIP.teamYearlyPrice / COWORKER_MEMBERSHIP.teamMaxMembers / 12);

  // ── Trial badge shown on every CTA ──────────────────────────────────────
  const TrialBadge = () => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full ml-2">
      <Gift className="w-3 h-3" />30 dní zdarma
    </span>
  );

  // ── Free link shown under each CTA ──────────────────────────────────────
  const FreeLink = ({ role }: { role: 'coworking' | 'coworker' }) => (
    <div className="text-center mt-3">
      <Link
        href={`/registrace?role=${role}&plan=free`}
        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
      >
        nebo zaregistrovat zdarma (základní profil)
      </Link>
    </div>
  );

  return (
    <div className="w-full bg-white">

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 text-sm font-bold rounded-full mb-6">
            <Gift className="w-4 h-4" />
            Každý nový účet: 30 dní zdarma · bez platební karty
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Vyberte si svůj plán</h1>
          <p className="text-xl text-gray-500 mb-10">
            Různé plány pro majitele coworkingů i pro freelancery a týmy.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollTo('pro-coworkingy')}
              className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md text-base"
            >
              <Building2 className="w-5 h-5" />
              Pro majitele coworkingů
              <ChevronDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo('pro-coworkery')}
              className="group flex items-center gap-3 px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-md text-base"
            >
              <User className="w-5 h-5" />
              Pro coworkery
              <ChevronDown className="w-4 h-4 opacity-70 group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Coworking plans ─────────────────────────────────────────────── */}
      <section id="pro-coworkingy" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              <Building2 className="w-4 h-4" />Pro majitele coworkingů
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Plány pro coworkingy</h2>
            <p className="text-gray-500">Zvolte plán podle velikosti a potřeb Vašeho prostoru</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {PLATFORM_PRICING.map((tier, idx) => {
              const yearlyPrice = Math.round(tier.monthlyPrice * 12 * (1 - tier.yearlyDiscount));
              const isLarge = tier.tier === 'large';
              const isLoading = activating === tier.tier;
              return (
                <div
                  key={tier.tier}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    idx === 1
                      ? 'border-2 border-blue-600 shadow-2xl md:scale-105'
                      : 'border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className={`px-8 py-10 ${idx === 1 ? 'gradient-primary text-white' : 'bg-gray-50'}`}>
                    {idx === 1 && (
                      <div className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mb-3">
                        NEJPOPULÁRNĚJŠÍ
                      </div>
                    )}
                    <h3 className={`text-2xl font-bold mb-2 ${idx === 1 ? 'text-white' : 'text-gray-900'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm ${idx === 1 ? 'text-blue-100' : 'text-gray-600'}`}>
                      {isLarge ? 'Více než 100 míst' : `Pro coworkingy do ${tier.maxSeats} míst`}
                    </p>
                  </div>

                  <div className="p-8">
                    <div className="mb-8">
                      <div className={`text-4xl font-bold mb-2 ${idx === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                        {tier.monthlyPrice} Kč
                      </div>
                      <p className="text-sm text-gray-600 mb-3">za měsíc</p>
                      <p className="text-sm text-green-600 font-medium">
                        nebo {yearlyPrice} Kč/rok
                        <span className="text-xs text-green-600 block">(20 % sleva)</span>
                      </p>
                    </div>

                    <ul className="space-y-4 mb-6">
                      <li className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">{tier.includedAddresses} adresa/y</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <BadgeCheck className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">Štítek „ověřeno" u profilu</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <CalendarPlus className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">5 eventů měsíčně</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <ShoppingBag className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">5 inzerátů na marketplace měsíčně</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">Standardní podpora</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Plus className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900 text-sm">Extra adresa: {tier.extraAddressPrice} Kč/měsíc</span>
                      </li>
                    </ul>

                    {/* Add-on upsell block — skryto, zatím neaktivní */}

                    {/* Primary CTA */}
                    <button
                      onClick={() => handleCoworkingPlan(tier.tier)}
                      disabled={isLoading}
                      className={`w-full py-3.5 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        idx === 1
                          ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      } disabled:opacity-60`}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Aktivuji…
                        </span>
                      ) : (
                        <>
                          Začít zdarma
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Trial note */}
                    <p className="text-center text-xs text-green-700 font-semibold mt-2 flex items-center justify-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      30 dní zdarma — pak {tier.monthlyPrice} Kč/měs
                    </p>

                    <FreeLink role="coworking" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info bar */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-3">💳 Všechny ceny jsou bez DPH. Fakturace měsíčně nebo ročně. Zrušení kdykoliv.</p>
            <p className="text-sm text-gray-600">
              Máte dotazy?{' '}
              <a href="#faq" className="text-blue-600 font-semibold hover:underline">Podívejte se na FAQ</a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Features comparison ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Srovnání funkcí</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 w-1/3">Funkce</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Malý</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900 bg-blue-50">Střední</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">Velký</th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr key={idx} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="py-4 px-6 text-gray-900 font-medium">{feature.name}</td>
                    <td className="py-4 px-6 text-center">
                      {feature.small ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-4 px-6 text-center bg-blue-50/50">
                      {feature.medium ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.large ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : <X className="w-5 h-5 text-gray-300 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-8 p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
            <span className="text-2xl flex-shrink-0">🏷️</span>
            <div>
              <p className="font-semibold text-amber-900 mb-1">Special Deal — exkluzivně pro roční plány</p>
              <p className="text-sm text-amber-800">
                Při roční registraci aktivujte vlastní <strong>Special Deal</strong> — zvýhodněnou nabídku
                zobrazenou na kartě vašeho coworkingu ve výpisu i v detailu. Coworkeři mohou filtrovat
                coworkingy se Special Dealem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Coworker membership ─────────────────────────────────────────── */}
      <section id="pro-coworkery" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
              <User className="w-4 h-4" />Pro coworkery
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Členství pro coworkery</h2>
            <p className="text-gray-500">Přidej se do komunity a využívej výhody členství</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

            {/* Zdarma */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-400 hover:shadow-lg transition-all flex flex-col bg-gray-50">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-gray-200 text-gray-600 rounded-full mb-2">
                  Základní
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Zdarma</h3>
                <p className="text-sm text-gray-500">Základní přístup bez závazků</p>
              </div>
              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-gray-700">0</span>
                  <span className="text-gray-400 mb-2 text-lg">Kč</span>
                </div>
                <p className="text-sm text-gray-400">navždy zdarma</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  1 aktivní inzerát na marketplace
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  1 event, který pořádáte/spolupořádáte
                </li>
                <li className="flex items-start gap-2.5 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  Možnost účastnit se našich eventů a akcí
                </li>
              </ul>
              <Link
                href="/registrace?role=coworker&plan=free"
                className="w-full py-3.5 px-4 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors text-center block"
              >
                Registrovat zdarma
              </Link>
            </div>

            {/* Měsíční */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Měsíční</h3>
                <p className="text-sm text-gray-500">Flexibilní, bez závazků</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-gray-900">{COWORKER_MEMBERSHIP.monthlyPrice}</span>
                  <span className="text-gray-500 mb-2 text-lg">Kč</span>
                </div>
                <p className="text-sm text-gray-500">měsíčně</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {COWORKER_MEMBERSHIP_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />{benefit}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCoworkerPlan('monthly')}
                disabled={activating === 'monthly'}
                className="w-full py-3.5 px-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {activating === 'monthly' ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Aktivuji…</>
                ) : (
                  <>Začít zdarma <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-center text-xs text-green-700 font-semibold mt-2 flex items-center justify-center gap-1">
                <Gift className="w-3.5 h-3.5" />30 dní zdarma — pak {COWORKER_MEMBERSHIP.monthlyPrice} Kč/měs
              </p>
              <FreeLink role="coworker" />
            </div>

            {/* Roční — BEST VALUE */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 shadow-2xl relative flex flex-col xl:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                NEJLEPŠÍ VOLBA
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Roční</h3>
                <p className="text-sm text-gray-500">Nejlepší cena, platba jednou ročně</p>
              </div>
              <div className="mb-3">
                {/* Hlavní cena: měsíční ekvivalent */}
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-blue-600">{yearlyMonthlyPrice}</span>
                  <span className="text-blue-400 mb-2 text-lg">Kč<span className="text-sm font-normal">/měs</span></span>
                </div>
                {/* Roční platba + sleva badge */}
                <div className="flex items-center gap-2 mt-1.5">
                  <p className="text-sm text-gray-500">platba ročně {COWORKER_MEMBERSHIP.yearlyPrice} Kč</p>
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    Sleva {yearlyDiscount}&nbsp;%
                  </span>
                </div>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Ušetříš {monthlySaving} Kč oproti měsíčnímu plánu
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {COWORKER_MEMBERSHIP_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />{benefit}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleCoworkerPlan('yearly')}
                disabled={activating === 'yearly'}
                className="w-full py-3.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                {activating === 'yearly' ? (
                  <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Aktivuji…</>
                ) : (
                  <>Začít zdarma <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              <p className="text-center text-xs text-green-700 font-semibold mt-2 flex items-center justify-center gap-1">
                <Gift className="w-3.5 h-3.5" />30 dní zdarma — pak {COWORKER_MEMBERSHIP.yearlyPrice} Kč/rok
              </p>
              <FreeLink role="coworker" />
            </div>

            {/* Firemní — připravujeme */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 flex flex-col opacity-75">
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-600 rounded-full mb-2">
                  Brzy dostupné
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Firemní</h3>
                <p className="text-sm text-gray-500">Tým až {COWORKER_MEMBERSHIP.teamMaxMembers} lidí</p>
              </div>
              <div className="mb-6">
                <p className="text-3xl font-bold text-purple-400">Připravujeme</p>
                <p className="text-sm text-gray-400 mt-1">Cena bude brzy zveřejněna</p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {COWORKER_MEMBERSHIP_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />{benefit}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm font-semibold text-purple-400">
                  <Users className="w-4 h-4 text-purple-300 flex-shrink-0 mt-0.5" />
                  Správa celého týmu z jednoho účtu
                </li>
              </ul>
              <button
                disabled
                className="w-full py-3.5 px-4 bg-gray-200 text-gray-400 font-bold rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
              >
                Připravujeme
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gray-50" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Často kladené otázky</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 select-none list-none">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-colors ml-4 flex-shrink-0">+</span>
                </summary>
                <p className="mt-4 text-gray-600 ml-8">{faq.answer}</p>
              </details>
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-12 p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl text-center text-white">
            <Zap className="w-8 h-8 mx-auto mb-3 text-yellow-300" />
            <h3 className="text-xl font-bold mb-2">Připraveni začít?</h3>
            <p className="text-blue-100 mb-6 text-sm">Žádná platební karta. Prvních 30 dní zdarma.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => scrollTo('pro-coworkingy')}
                className="px-6 py-3 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Mám coworking
              </button>
              <button
                onClick={() => scrollTo('pro-coworkery')}
                className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors border border-blue-400"
              >
                Jsem coworker
              </button>
            </div>
            <p className="text-xs text-blue-300 mt-4">
              Nebo{' '}
              <Link href="/registrace?plan=free" className="underline hover:text-white">
                základní registrace zdarma
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
