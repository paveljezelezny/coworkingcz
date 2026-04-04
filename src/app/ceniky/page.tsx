'use client';

import { Check, X, Globe, Users, Award, HelpCircle, Plus, Building2, User, ChevronDown } from 'lucide-react';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP, COWORKER_MEMBERSHIP_BENEFITS } from '@/lib/types';

export default function CenikyPage() {
  const features = [
    { name: 'Profil coworkingu', small: true, medium: true, large: true },
    { name: 'Fotogalerie', small: true, medium: true, large: true },
    { name: 'Vybavení', small: true, medium: true, large: true },
    { name: 'Ceny', small: true, medium: true, large: true },
    { name: 'Rezervační systém', small: false, medium: true, large: true },
    { name: 'Event management', small: false, medium: true, large: true },
    { name: 'Analytics', small: false, medium: false, large: true },
    { name: 'Email podpora', small: true, medium: true, large: true },
    { name: 'Prioritní podpora', small: false, medium: true, large: true },
    { name: 'Dedikovaný account manager', small: false, medium: false, large: true },
  ];

  const faqs = [
    {
      question: 'Jak dlouho trvá aktivace profilu?',
      answer: 'Profil je aktivován ihned po registraci a zaplacení. Ověření údajů trvá 1–2 pracovní dny.',
    },
    {
      question: 'Mohu během smlouvy změnit plán?',
      answer: 'Ano, plán můžete změnit kdykoli. Nový plán se projeví v příští fakturaci.',
    },
    {
      question: 'Jaký je minimální závazek?',
      answer: 'Minimální závazek je 1 měsíc. Po uplynutí měsíce si můžete plán změnit nebo zrušit.',
    },
    {
      question: 'Je možné platit za více měsíců najednou?',
      answer: 'Ano, při roční smlouvě získáte slevu 20 % na cenu měsíčního plánu.',
    },
    {
      question: 'Jak fungují dodatečné adresy?',
      answer: 'Každá extra adresa Vašeho coworkingu se fakturuje zvlášť. Cena je uvedena v plánu.',
    },
    {
      question: 'Poskytujete bezplatnou migraci z jiné platformy?',
      answer: 'Ano, naši specialisté Vám s migrací dat pomohou zdarma. Kontaktujte náš support.',
    },
  ];

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const monthlySaving = COWORKER_MEMBERSHIP.yearlyMonthlySaving;
  const freeMonths = Math.round(monthlySaving / COWORKER_MEMBERSHIP.monthlyPrice);
  const pricePerPersonMonth = Math.round(
    COWORKER_MEMBERSHIP.teamYearlyPrice / COWORKER_MEMBERSHIP.teamMaxMembers / 12
  );

  return (
    <div className="w-full bg-white">

      {/* ── Hero s tlačítky ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-blue-600 tracking-widest uppercase mb-4">Ceníky</p>
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

      {/* ── Pricing Cards — coworkingy ───────────────────────────────── */}
      <section id="pro-coworkingy" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full mb-4">
              <Building2 className="w-4 h-4" />
              Pro majitele coworkingů
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Plány pro coworkingy</h2>
            <p className="text-gray-500">Zvolte plán podle velikosti a potřeb Vašeho prostoru</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {PLATFORM_PRICING.map((tier, idx) => {
              const yearlyPrice = Math.round(tier.monthlyPrice * 12 * (1 - tier.yearlyDiscount));
              const isLarge = tier.tier === 'large';
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

                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3">
                        <Users className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">
                          {isLarge ? 'Více než 100 míst' : `Až ${tier.maxSeats} míst`}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">{tier.includedAddresses} adresa/y</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">Standardní podpora</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Plus className={`w-5 h-5 flex-shrink-0 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900 text-sm">
                          Extra adresa: {tier.extraAddressPrice} Kč/měsíc
                        </span>
                      </li>
                    </ul>

                    <button
                      className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        idx === 1
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      Zaregistrovat se
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-3">
              💳 Všechny ceny jsou bez DPH. Fakturace měsíčně nebo ročně.
            </p>
            <p className="text-sm text-gray-600">
              Máte dotazy?{' '}
              <a href="#faq" className="text-blue-600 font-semibold hover:underline">
                Podívejte se na často kladené otázky
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── Features Comparison ─────────────────────────────────────── */}
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
        </div>
      </section>

      {/* ── Coworker Membership ──────────────────────────────────────── */}
      <section id="pro-coworkery" className="py-16 sm:py-24 bg-white scroll-mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full mb-4">
              <User className="w-4 h-4" />
              Pro coworkery
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Členství pro coworkery</h2>
            <p className="text-gray-500">Přidej se do komunity a využívej výhody členství</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* ── Měsíční ── */}
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
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
                Začít měsíčně
              </button>
            </div>

            {/* ── Roční — BEST VALUE ── */}
            <div className="border-2 border-blue-600 rounded-2xl p-8 shadow-2xl relative flex flex-col md:scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full whitespace-nowrap">
                NEJLEPŠÍ VOLBA
              </div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Roční</h3>
                <p className="text-sm text-gray-500">Ušetříš {monthlySaving} Kč ročně</p>
              </div>
              <div className="mb-3">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-blue-600">{COWORKER_MEMBERSHIP.yearlyPrice}</span>
                  <span className="text-blue-400 mb-2 text-lg">Kč</span>
                </div>
                <p className="text-sm text-gray-500">ročně</p>
              </div>
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 text-xs text-green-700 font-medium">
                  <Check className="w-3.5 h-3.5" />
                  Ušetříš {monthlySaving} Kč = {freeMonths} měsíce zdarma
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {COWORKER_MEMBERSHIP_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Začít ročně
              </button>
            </div>

            {/* ── Firemní ── */}
            <div className="border-2 border-gray-200 rounded-2xl p-8 hover:border-purple-400 hover:shadow-lg transition-all flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Firemní</h3>
                <p className="text-sm text-gray-500">Tým až {COWORKER_MEMBERSHIP.teamMaxMembers} lidí</p>
              </div>
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-bold text-purple-600">{COWORKER_MEMBERSHIP.teamYearlyPrice}</span>
                  <span className="text-purple-400 mb-2 text-lg">Kč</span>
                </div>
                <p className="text-sm text-gray-500">ročně za celý tým</p>
                <p className="text-xs text-gray-400 mt-1">
                  = {pricePerPersonMonth} Kč / osoba / měsíc
                </p>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {COWORKER_MEMBERSHIP_BENEFITS.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    {benefit}
                  </li>
                ))}
                <li className="flex items-start gap-2.5 text-sm font-semibold text-purple-700">
                  <Users className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                  Správa celého týmu z jednoho účtu
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                Firemní členství
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────── */}
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

          <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Potřebujete pomoc?</h3>
            <p className="text-gray-600 mb-6">Náš tým Vám rád zodpoví všechny otázky o plánech a integraci.</p>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Kontaktovat podporu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
