import { Search, MapPin, Users, Zap, BarChart3, Award, Globe, ArrowRight, Calendar, Tag, DollarSign, Plus } from 'lucide-react';
import Link from 'next/link';
import CoworkingCard from '@/components/CoworkingCard';
import {
  getFeaturedCoworkings,
  getCitiesWithCount,
  getUpcomingEvents,
  getLatestMarketplaceListings,
} from '@/lib/data/coworkings';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP, MarketplaceListing } from '@/lib/types';

export default function Home() {
  const featuredCoworkings = getFeaturedCoworkings();
  const cities = getCitiesWithCount();
  const upcomingEvents = getUpcomingEvents();
  const marketplaceListings = getLatestMarketplaceListings();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background Gradient */}
        <div className="absolute inset-0 gradient-primary opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="text-sm font-semibold">Objev svůj ideální coworking</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Najdi svůj coworking
              <br />
              <span className="text-gradient bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                v celém Česku
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Propojujeme coworkery s moderními prostory pro práci. Vybírej z 90+ coworkingů v 15+ městech a najdi si místo, kde ti bude práce létat.
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <form method="get" action="/coworkingy" className="glass-effect rounded-xl p-4 space-y-4 sm:space-y-0 sm:flex gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <select name="city" className="input-field pl-10 bg-white">
                    <option value="">Vyber město</option>
                    {cities.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Hledej coworking..."
                    className="input-field pl-10 bg-white"
                  />
                </div>
                <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Hledat</span>
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8">
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">90+</div>
                <p className="text-sm text-gray-600 mt-1">coworkingů</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">15+</div>
                <p className="text-sm text-gray-600 mt-1">měst</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600">5000+</div>
                <p className="text-sm text-gray-600 mt-1">členů</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Coworkings */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Doporučené coworkingy</h2>
              <p className="section-subtitle">Nejpopulárnější a ověřené coworkingové prostory</p>
            </div>
            <Link
              href="/coworkingy"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Zobrazit všechny
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCoworkings.map((coworking, idx) => (
              <div key={coworking.id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                <CoworkingCard coworking={coworking} />
              </div>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              href="/coworkingy"
              className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zobrazit všechny coworkingy
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Jak to funguje</h2>
            <p className="section-subtitle">3 snadné kroky k tvému ideálnímu pracovišti</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Najdi',
                description: 'Procházej naši databázi coworkingů, filtruj podle města, vybavení a ceny',
              },
              {
                icon: Calendar,
                title: 'Rezervuj',
                description: 'Vyber si den, hodinu nebo měsíc a jednoduše si zarezervuj místo',
              },
              {
                icon: Zap,
                title: 'Pracuj',
                description: 'Připoj se do komunity a pracuj produktivně s ostatními coworkery',
              },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative animate-slide-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 h-full">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>

                    {idx < 2 && (
                      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden sm:block">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          →
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Cities Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Coworkingy v tvém městě</h2>
            <p className="section-subtitle">Najdi coworkingový prostor v 15+ městech po celé České republice</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.slice(0, 12).map((city) => (
              <Link
                key={city.city}
                href={`/coworkingy?mesto=${city.city}`}
                className="group p-6 bg-white border-2 border-gray-100 rounded-xl hover:border-blue-600 hover:shadow-md transition-all text-center"
              >
                <div className="text-2xl font-bold text-blue-600 group-hover:text-orange-500 transition-colors">
                  {city.count}
                </div>
                <p className="text-gray-900 font-semibold group-hover:text-blue-600 transition-colors">
                  {city.city}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Nadcházející eventy</h2>
              <p className="section-subtitle">Setkat se s komunitu na zajímavých akcích</p>
            </div>
            <Link
              href="/udalosti"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Zobrazit všechny
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {upcomingEvents.slice(0, 6).map((event, idx) => (
              <div
                key={event.id}
                className="flex-shrink-0 w-72 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                  {event.imageUrl && (
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {event.isFree ? 'Zdarma' : `${event.price} Kč`}
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-600 font-medium mb-2">{event.coworkingName}</p>
                  <h3 className="text-sm font-bold text-gray-900 mb-3 line-clamp-2">{event.title}</h3>
                  <div className="text-xs text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('cs-CZ', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:hidden">
            <Link
              href="/udalosti"
              className="block w-full py-3 px-4 bg-blue-600 text-white text-center font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Zobrazit všechny eventy
            </Link>
          </div>
        </div>
      </section>

      {/* Marketplace Preview */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Marketplace</h2>
              <p className="section-subtitle">Nabídky práce, služby a prodej mezi coworkery</p>
            </div>
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              Zobrazit všechny
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {marketplaceListings.map((listing: MarketplaceListing, idx: number) => (
              <div
                key={listing.id}
                className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow animate-slide-up"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {listing.category === 'job_offer' && 'Nabídka práce'}
                    {listing.category === 'service_offer' && 'Nabízím služby'}
                    {listing.category === 'service_seeking' && 'Hledám služby'}
                    {listing.category === 'item_for_sale' && 'Prodej'}
                  </span>
                  {listing.price && (
                    <span className="font-bold text-blue-600 text-lg">{listing.price} Kč</span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2">{listing.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>
                <div className="text-xs text-gray-600">👤 {listing.userName}</div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Přidat inzerát
            </Link>
          </div>
        </div>
      </section>

      {/* For Coworking Spaces CTA */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Máte coworking prostor?</h2>
            <p className="section-subtitle">Zaregistrujte jej a získejte nové členy</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {PLATFORM_PRICING.map((tier, idx) => (
              <div
                key={tier.tier}
                className="bg-white rounded-xl border-2 border-gray-100 p-8 hover:border-blue-600 hover:shadow-lg transition-all"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tier.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-blue-600">{tier.monthlyPrice}</span>
                  <span className="text-gray-600"> Kč/měsíc</span>
                </div>

                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    Až {tier.maxSeats} míst
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Globe className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    {tier.includedAddresses} adresa/y
                  </li>
                  <li className="flex items-center gap-3 text-sm text-gray-600">
                    <Award className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    20% sleva na roční plán
                  </li>
                </ul>

                <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Zaregistrovat
                </button>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/pro-coworkingy"
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              Zobrazit všechny plány
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Coworker Membership */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Členství pro coworkery</h2>
            <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
              Přidej se do komunity a získej přístup k nejlepším coworkingům v České republice
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-4xl font-bold mb-2">{COWORKER_MEMBERSHIP.monthlyPrice}</div>
                <div className="text-blue-100 mb-4">Kč/měsíc</div>
                <div className="text-sm text-blue-100">
                  {COWORKER_MEMBERSHIP.freeVisitsPerMonth} bezplatná návštěva za měsíc
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                <div className="text-4xl font-bold mb-2">{COWORKER_MEMBERSHIP.yearlyPrice}</div>
                <div className="text-blue-100 mb-4">Kč/rok</div>
                <div className="text-sm text-blue-100">
                  Ušetři až 1000 Kč ročně
                </div>
              </div>
            </div>

            <Link
              href="/registrace"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Stát se členem
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
