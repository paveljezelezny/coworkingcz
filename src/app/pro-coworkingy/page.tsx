import { Check, X, Globe, Users, Award, HelpCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP } from '@/lib/types';

export default function ProCoworkingPage() {
  const features = [
    { name: 'Profil coworkingu', free: true, small: true, medium: true, large: true },
    { name: 'Fotogalerie', free: false, small: true, medium: true, large: true },
    { name: 'Vybavení', free: false, small: true, medium: true, large: true },
    { name: 'Ceny', free: false, small: true, medium: true, large: true },
    { name: 'Rezervační systém', free: false, small: false, medium: true, large: true },
    { name: 'Event management', free: false, small: false, medium: true, large: true },
    { name: 'Analytics', free: false, small: false, medium: false, large: true },
    { name: 'Email podpora', free: false, small: true, medium: true, large: true },
    { name: 'Prioritní podpora', free: false, small: false, medium: true, large: true },
    { name: 'Dedikovaný account manager', free: false, small: false, medium: false, large: true },
  ];

  const faqs = [
    {
      question: 'Jak dlouho trvá aktivace profilu?',
      answer:
        'Profil je aktivován ihned po registraci a zaplacení. Ověření údajů trvá 1-2 pracovní dny.',
    },
    {
      question: 'Mohu během smlouvy změnit plán?',
      answer:
        'Ano, plán můžete změnit kdykoli. Nový plán se projeví v příští fakturaci.',
    },
    {
      question: 'Jaký je minimální závazek?',
      answer:
        'Minimální závazek je 1 měsíc. Po uplynutí měsíce si můžete plán změnit nebo rušit.',
    },
    {
      question: 'Je možné zálohovat za více měsíců?',
      answer:
        'Ano, při roční smlouvě získáte slevu 20% na cenu měsíčního plánu.',
    },
    {
      question: 'Jak fungují dodatečné adresy?',
      answer:
        'Každá extra adresa Vašeho coworkingu se fakturuje zvlášť. Cena je uvedena v plánu.',
    },
    {
      question: 'Poskytujete bezplatnou migraci z jiné platformy?',
      answer:
        'Ano, naši specialisté Vám s migrací dat pomohou zdarma. Kontaktujte náš support.',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Cenové plány pro coworkingy
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Zvolte si plán, který vyhovuje velikosti a potřebám Vašeho coworkingu
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {PLATFORM_PRICING.map((tier, idx) => {
              const yearlyPrice = Math.round(
                tier.monthlyPrice * 12 * (1 - tier.yearlyDiscount)
              );
              return (
                <div
                  key={tier.tier}
                  className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                    idx === 1
                      ? 'border-2 border-blue-600 shadow-2xl md:scale-105'
                      : 'border border-gray-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div
                    className={`px-8 py-10 ${
                      idx === 1
                        ? 'gradient-primary text-white'
                        : 'bg-gray-50'
                    }`}
                  >
                    {idx === 1 && (
                      <div className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold mb-3">
                        NEJPOPULÁRNĚJŠÍ
                      </div>
                    )}
                    <h3 className={`text-2xl font-bold mb-2 ${idx === 1 ? 'text-white' : 'text-gray-900'}`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm ${idx === 1 ? 'text-blue-100' : 'text-gray-600'}`}>
                      Pro coworkingy do {tier.maxSeats} míst
                    </p>
                  </div>

                  <div className="p-8">
                    {/* Price */}
                    <div className="mb-8">
                      <div className={`text-4xl font-bold mb-2 ${idx === 1 ? 'text-blue-600' : 'text-gray-900'}`}>
                        {tier.monthlyPrice} Kč
                      </div>
                      <p className="text-sm text-gray-600 mb-3">za měsíc</p>
                      <p className="text-sm text-green-600 font-medium">
                        nebo {yearlyPrice} Kč/rok
                        <span className="text-xs text-green-600 block">
                          (20% sleva)
                        </span>
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 mb-8">
                      <li className="flex items-center gap-3">
                        <Users className={`w-5 h-5 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">Až {tier.maxSeats} míst</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Globe className={`w-5 h-5 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">
                          {tier.includedAddresses} adresa/y
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Award className={`w-5 h-5 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900">Standardní podpora</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Plus className={`w-5 h-5 ${idx === 1 ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-gray-900 text-sm">
                          Extra adresa: {tier.extraAddressPrice} Kč/měsíc
                        </span>
                      </li>
                    </ul>

                    {/* CTA Button */}
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

          {/* Pricing Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-gray-600 mb-3">
              💳 Všechny ceny jsou bez DPH. Fakturace měsíčně nebo ročně.
            </p>
            <p className="text-sm text-gray-600">
              Máte dotazy? <Link href="#faq" className="text-blue-600 font-semibold hover:underline">Podívejte se na často kladené otázky</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Srovnění funkcí
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-6 font-bold text-gray-900 w-1/3">
                    Funkce
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">
                    Malý
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900 bg-blue-50">
                    Střední
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-gray-900">
                    Velký
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((feature, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="py-4 px-6 text-gray-900 font-medium">
                      {feature.name}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.small ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center bg-blue-50/50">
                      {feature.medium ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {feature.large ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Coworker Membership Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Členství pro coworkery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Monthly */}
            <div className="border-2 border-gray-200 rounded-xl p-8 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Měsíční</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {COWORKER_MEMBERSHIP.monthlyPrice} Kč
                </div>
                <p className="text-gray-600">za měsíc</p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  {COWORKER_MEMBERSHIP.freeVisitsPerMonth} bezplatná návštěva
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Sleva na coworkingy
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Přístup k evenům
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Stát se členem
              </button>
            </div>

            {/* Yearly */}
            <div className="border-2 border-blue-600 rounded-xl p-8 shadow-lg relative">
              <div className="absolute -top-4 left-6 px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                NEJLEPŠÍ VOLBA
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Roční</h3>
              <div className="mb-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {COWORKER_MEMBERSHIP.yearlyPrice} Kč
                </div>
                <p className="text-gray-600">za rok</p>
                <p className="text-sm text-green-600 font-medium mt-2">
                  Ušetři až 1000 Kč ročně
                </p>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  12 bezplatných návštěv
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Zvýšená sleva (20%)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  Prioritní přístup k eventům
                </li>
              </ul>
              <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Stát se členem
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 bg-gray-50" id="faq">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Často kladené otázky
          </h2>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 transition-colors"
              >
                <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 select-none">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    {faq.question}
                  </span>
                  <span className="text-2xl text-gray-400 group-open:text-blue-600 transition-colors">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 ml-8">{faq.answer}</p>
              </details>
            ))}
          </div>

          {/* Support CTA */}
          <div className="mt-12 p-8 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-3">
              Potřebujete pomoc?
            </h3>
            <p className="text-gray-600 mb-6">
              Náš tým Vám rád zodpoví všechny otázky o plánech a integraci.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Kontaktovat podporu
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
