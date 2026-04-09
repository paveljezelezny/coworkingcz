'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

export default function CowOsPage() {
  const features = [
    {
      icon: '👥',
      title: 'Správa členů',
      description:
        'Přehledná evidence všech vašich coworkerů. Přidávejte členy, přidělujte jim tarify, sledujte stav jejich členství.',
    },
    {
      icon: '📄',
      title: 'Automatická fakturace',
      description:
        'Systém automaticky generuje faktury při prolongaci členství. Každá faktura obsahuje QR platební kód pro české a slovenské banky.',
    },
    {
      icon: '🔄',
      title: 'Prolongační engine',
      description:
        'Členství se automaticky prodlužuje. Žádné ruční obnovování — systém hlídá expirace a sám vytváří nové fakturační období.',
    },
    {
      icon: '📱',
      title: 'QR platby (SPAYD)',
      description:
        'Každá faktura obsahuje QR kód kompatibilní se všemi českými a slovenskými bankami. Stačí naskenovat a zaplatit.',
    },
    {
      icon: '🏷️',
      title: 'Tarify na míru',
      description:
        'Vytvořte si vlastní tarify: Hot Desk, Fix Desk, Privátní kancelář... Každý s vlastní cenou a fakturačním intervalem.',
    },
    {
      icon: '📊',
      title: 'Přehledný dashboard',
      description:
        'Aktivní členové, vydané faktury, měsíční příjmy — vše na jednom místě v reálném čase.',
    },
  ];

  const steps = [
    {
      number: 1,
      title: 'Přivlastněte si coworking',
      description: 'Zaregistrujte se a ověřte vlastnictví vašeho prostoru.',
    },
    {
      number: 2,
      title: 'Nastavte fakturační údaje',
      description: 'Vyplňte IČO, bankovní účet a další údaje vaší firmy.',
    },
    {
      number: 3,
      title: 'Vytvořte tarify a přidejte členy',
      description: 'Nastavte cenové plány a přidejte své coworkery.',
    },
    {
      number: 4,
      title: 'Nechte COW.OS pracovat',
      description:
        'Automatická prolongace, fakturace a QR platby. Vy se staráte o komunitu.',
    },
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <section className="py-20 sm:py-32 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 text-6xl sm:text-7xl">🐄</div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4">
            COW.OS
          </h1>
          <p className="text-2xl font-semibold text-gray-700 mb-6">
            Operační systém pro váš coworking
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Správa členů, automatická fakturace, QR platby a přehled o vašem podnikání — vše na jednom místě.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/spravce"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              Aktivovat COW.OS zdarma
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Zjistit více
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white" id="features">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Všechno, co potřebujete
            </h2>
            <p className="text-xl text-gray-600">
              Komplexní řešení pro správu moderního coworkingu
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg hover:border-blue-300 transition-all p-8"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Jednoduchý ceník
            </h2>
            <p className="text-xl text-gray-600">
              Vyberte si plán, který vyhovuje vaší situaci
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Zdarma
                </h3>
                <p className="text-gray-600 text-sm">
                  Součást vašeho stávajícího balíčku
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  0 Kč
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Až 5 členů coworkingu</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Správa členství</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Automatická fakturace</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">QR platby</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Přehledný dashboard</span>
                </li>
              </ul>

              <Link
                href="/spravce"
                className="w-full block text-center px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              >
                Začít zdarma
              </Link>
            </div>

            {/* Standard Plan */}
            <div className="bg-white border-2 border-blue-600 rounded-xl shadow-xl p-8 relative md:scale-105 origin-center hover:shadow-2xl transition-shadow">
              <div className="absolute -top-4 left-6 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                NEJPOPULÁRNĚJŠÍ
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Standard
                </h3>
                <p className="text-gray-600 text-sm">
                  Pro rostoucí coworkingy
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  750 Kč
                </div>
                <p className="text-gray-600 text-sm">/ měsíc</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Až 100 členů coworkingu</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Vše z bezplatného plánu</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Prioritní podpora</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Pokročilé reporty</span>
                </li>
              </ul>

              <Link
                href="/spravce"
                className="w-full block text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aktivovat Standard
              </Link>
            </div>
          </div>

          {/* Enterprise Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
            <p className="text-gray-700 font-medium">
              Nad 100 členů? Kontaktujte nás pro individuální nabídku na{' '}
              <a
                href="mailto:info@coworkings.cz"
                className="text-blue-600 font-bold hover:underline"
              >
                info@coworkings.cz
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Jak to funguje
            </h2>
            <p className="text-xl text-gray-600">
              4 snadné kroky k plně automatizovanému systému
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="relative">
                {/* Circle with number */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Connector line (hidden on last item and mobile) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-1 bg-gradient-to-r from-blue-300 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Připraveni na budoucnost vašeho coworkingu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Začněte s COW.OS zdarma. Žádné kreditní karty, žádné povinnosti.
          </p>
          <Link
            href="/spravce"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-xl hover:shadow-2xl text-lg"
          >
            Začít s COW.OS
          </Link>
        </div>
      </section>
    </div>
  );
}
