'use client';

import Link from 'next/link';
import { Check, Search, ShieldCheck, Settings, Zap, ArrowRight } from 'lucide-react';

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
      description: 'Najděte váš prostor v katalogu a požádejte o správu. Po schválení adminem dostanete plný přístup.',
    },
    {
      number: 2,
      title: 'Aktivujte COW.OS',
      description: 'V panelu správce přejděte do sekce COW.OS, vyplňte fakturační údaje a spusťte systém.',
    },
    {
      number: 3,
      title: 'Vytvořte tarify a přidejte členy',
      description: 'Nastavte cenové plány (Hot Desk, Fix Desk, Privátní kancelář…) a přidejte své coworkery.',
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

      {/* How to Get Started — onboarding steps */}
      <section className="py-16 sm:py-24 bg-gray-50" id="jak-zacit">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Jak začít s COW.OS
            </h2>
            <p className="text-xl text-gray-600">
              Čtyři kroky k plně automatizované správě vašeho coworkingu
            </p>
          </div>

          {/* Step cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {[
              {
                icon: <Search className="w-7 h-7" />,
                step: '1',
                title: 'Najděte váš coworking',
                description: 'Vyhledejte váš prostor v katalogu COWORKINGS.cz nebo ho přidejte, pokud tam ještě není.',
                color: 'bg-blue-100 text-blue-600',
                action: { label: 'Procházet katalog', href: '/' },
              },
              {
                icon: <ShieldCheck className="w-7 h-7" />,
                step: '2',
                title: 'Přivlastněte si ho',
                description: 'Na stránce coworkingu klikněte na „Přivlastnit" a odešlete žádost. Po ručním schválení administrátorem dostanete přístup do správcovského panelu.',
                color: 'bg-violet-100 text-violet-600',
                action: null,
              },
              {
                icon: <Settings className="w-7 h-7" />,
                step: '3',
                title: 'Nastavte fakturační údaje',
                description: 'V panelu správce vyplňte IČO, bankovní účet a kontaktní údaje firmy — tyto informace se zobrazí na každé faktuře.',
                color: 'bg-orange-100 text-orange-600',
                action: null,
              },
              {
                icon: <Zap className="w-7 h-7" />,
                step: '4',
                title: 'Aktivujte COW.OS',
                description: 'Přejděte do sekce COW.OS v panelu správce, aktivujte systém a přidejte první tarify a členy. Základní verze do 5 členů je zdarma.',
                color: 'bg-emerald-100 text-emerald-600',
                action: { label: 'Zobrazit správce', href: '/spravce' },
              },
            ].map((item, idx, arr) => (
              <div key={idx} className="relative">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                  {/* Icon + step number */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      {item.icon}
                    </div>
                    <span className="text-3xl font-black text-gray-200">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed flex-1">{item.description}</p>
                  {item.action && (
                    <Link
                      href={item.action.href}
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      {item.action.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
                {/* Connector arrow between cards on lg */}
                {idx < arr.length - 1 && (
                  <div className="hidden lg:flex absolute top-10 -right-3 z-10 w-6 h-6 bg-gray-100 border border-gray-200 rounded-full items-center justify-center text-gray-400 text-xs font-bold">›</div>
                )}
              </div>
            ))}
          </div>

          {/* Pricing note box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-7 text-center max-w-3xl mx-auto">
            <p className="text-xl font-bold text-gray-900 mb-2">
              🐄 COW.OS je součástí každého plánu
            </p>
            <p className="text-gray-600 mb-4">
              Základní verze pro <strong>až 5 členů</strong> je zdarma v každém balíčku. Pro větší coworkingy je plná verze dostupná jako rozšíření — podrobný ceník najdete na stránce ceníků.
            </p>
            <Link
              href="/ceniky#pro-coworkingy"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
            >
              Zobrazit ceník <ArrowRight className="w-4 h-4" />
            </Link>
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
            Základní verze pro až 5 členů je součástí každého plánu — zdarma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ceniky#pro-coworkingy"
              className="inline-block px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 text-lg"
            >
              Zobrazit ceník
            </Link>
            <Link
              href="/#katalog"
              className="inline-block px-10 py-4 bg-blue-500/40 text-white font-bold rounded-xl border border-white/30 hover:bg-blue-500/60 transition-all text-lg"
            >
              Najít můj coworking
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
