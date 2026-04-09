'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function CowOsPage() {
  const features = [
    {
      img: '/cow-os/cow-checklist.png',
      title: 'Správa členů',
      description:
        'Přehledná evidence všech vašich coworkerů. Přidávejte členy, přidělujte jim tarify, sledujte stav jejich členství.',
    },
    {
      img: '/cow-os/cow-invoice.png',
      title: 'Automatická fakturace',
      description:
        'Systém automaticky generuje faktury při prolongaci členství. Každá faktura obsahuje QR platební kód pro české a slovenské banky.',
    },
    {
      img: '/cow-os/cow-renewal.png',
      title: 'Prolongační engine',
      description:
        'Členství se automaticky prodlužuje. Žádné ruční obnovování — systém hlídá expirace a sám vytváří nové fakturační období.',
    },
    {
      img: '/cow-os/cow-mobile.png',
      title: 'QR platby (SPAYD)',
      description:
        'Každá faktura obsahuje QR kód kompatibilní se všemi českými a slovenskými bankami. Stačí naskenovat a zaplatit.',
    },
    {
      img: '/cow-os/cow-app.png',
      title: 'Tarify na míru',
      description:
        'Vytvořte si vlastní tarify: Hot Desk, Fix Desk, Privátní kancelář... Každý s vlastní cenou a fakturačním intervalem.',
    },
    {
      img: '/cow-os/cow-dashboard.png',
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
      <section className="py-20 sm:py-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-100 rounded-full opacity-20 blur-3xl" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Mascot logo */}
          <div className="mb-6">
            <img
              src="/cow-os-logo.png"
              alt="COW.OS — kráva s notebookem"
              className="mx-auto w-64 sm:w-80 h-auto drop-shadow-xl"
              draggable={false}
            />
          </div>

          <p className="text-2xl font-semibold text-gray-700 mb-6">
            Operační systém pro váš coworking
          </p>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Správa členů, automatická fakturace, QR platby a přehled o vašem podnikání — vše na jednom místě.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              href="/spravce"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Aktivovat COW.OS zdarma
            </Link>
            <button
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
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
                className="group bg-white border border-gray-200 rounded-2xl p-8 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="mb-5 flex justify-center">
                  <img
                    src={feature.img}
                    alt={feature.title}
                    className="w-24 h-24 object-contain drop-shadow-md group-hover:scale-105 transition-transform duration-300"
                    draggable={false}
                  />
                </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
            {/* Free Plan */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 hover:shadow-lg transition-shadow">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Zdarma
                </h3>
                <p className="text-gray-500 text-sm">
                  Součást vašeho stávajícího balíčku
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-gray-900">
                  0 Kč
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {['Až 5 členů coworkingu', 'Správa členství', 'Automatická fakturace', 'QR platby', 'Přehledný dashboard'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  )
                )}
              </ul>

              <Link
                href="/spravce"
                className="w-full block text-center px-6 py-3 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Začít zdarma
              </Link>
            </div>

            {/* Standard Plan */}
            <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-xl p-8 relative hover:shadow-2xl transition-shadow">
              <div className="absolute -top-3.5 left-6 px-4 py-1 bg-blue-600 text-white text-xs font-bold rounded-full tracking-wide">
                NEJPOPULÁRNĚJŠÍ
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Standard
                </h3>
                <p className="text-gray-500 text-sm">
                  Pro rostoucí coworkingy
                </p>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold text-blue-600">
                  750 Kč
                </div>
                <p className="text-gray-500 text-sm">/ měsíc</p>
              </div>

              <ul className="space-y-4 mb-8">
                {['Až 100 členů coworkingu', 'Vše z bezplatného plánu', 'Prioritní podpora', 'Pokročilé reporty'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  )
                )}
              </ul>

              <Link
                href="/spravce"
                className="w-full block text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                Aktivovat Standard
              </Link>
            </div>
          </div>

          {/* Enterprise Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center max-w-4xl mx-auto">
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
                {/* Circle with number — sketch style */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <svg viewBox="0 0 64 64" className="w-16 h-16 text-blue-600">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"
                        strokeDasharray={idx % 2 === 0 ? '0' : '0'}
                      />
                      <circle cx="32" cy="32" r="28" fill="currentColor" opacity="0.08" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-blue-600 text-2xl font-bold">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Connector line (hidden on last item and mobile) */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[40%] h-px bg-blue-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
            <circle cx="50" cy="100" r="120" fill="white" />
            <circle cx="350" cy="60" r="80" fill="white" />
          </svg>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Připraveni na budoucnost vašeho coworkingu?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Začněte s COW.OS zdarma. Žádné kreditní karty, žádné povinnosti.
          </p>
          <Link
            href="/spravce"
            className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-lg"
          >
            Začít s COW.OS
          </Link>
        </div>
      </section>
    </div>
  );
}
