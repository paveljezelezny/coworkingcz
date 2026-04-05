import { Search, Users, Zap, Award, Globe, ArrowRight, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import CoworkingCard from '@/components/CoworkingCard';
import HeroSection from '@/components/HeroSection';
import {
  getFeaturedCoworkings,
  getCitiesWithCount,
  getUpcomingEvents,
  getLatestMarketplaceListings,
} from '@/lib/data/coworkings';
import { PLATFORM_PRICING, COWORKER_MEMBERSHIP, MarketplaceListing } from '@/lib/types';

// force-dynamic so the random 8 coworkings reshuffle on each request
export const dynamic = 'force-dynamic';

export default function Home() {
  const featuredCoworkings = getFeaturedCoworkings();
  const cities = getCitiesWithCount();
  const upcomingEvents = getUpcomingEvents();
  const marketplaceListings = getLatestMarketplaceListings();

  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection cities={cities} />

      {/* Featured Coworkings */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Doporučené coworkingy</h2>
              <p className="section-subtitle">Nejpopulárnější coworkingové prostory v České republice</p>
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

      {/* === Upcoming Events (moved up from below) === */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="section-title">Nadcházející eventy</h2>
              <p className="section-subtitle">Setkat se s komunitou na zajímavých akcích</p>
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

      {/*
        === JAK TO FUNGUJE — skryto, ponecháno v kódu pro budoucí použití ===
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="section-title">Jak to funguje</h2>
              <p className="section-subtitle">3 snadné kroky k tvému ideálnímu pracovišti</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              Najdi → Rezervuj → Pracuj steps...
            </div>
          </div>
        </section>
      */}

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
              href="/ceniky"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl font-bold mb-1">{COWORKER_MEMBERSHIP.monthlyPrice} Kč</div>
                <div className="text-blue-100 text-sm mb-3">měsíčně</div>
                <div className="text-xs text-blue-200">Flexibilní, bez závazků</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-6 ring-2 ring-white/40">
                <div className="text-xs font-bold text-orange-300 mb-1 tracking-widest">NEJLEPŠÍ VOLBA</div>
                <div className="text-3xl font-bold mb-1">{COWORKER_MEMBERSHIP.yearlyPrice} Kč</div>
                <div className="text-blue-100 text-sm mb-2">ročně</div>
                <div className="text-xs text-green-300 font-medium">
                  Ušetříš {COWORKER_MEMBERSHIP.yearlyMonthlySaving} Kč ročně
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-6">
                <div className="text-3xl font-bold mb-1">{COWORKER_MEMBERSHIP.teamYearlyPrice} Kč</div>
                <div className="text-blue-100 text-sm mb-3">ročně / tým</div>
                <div className="text-xs text-blue-200">Až {COWORKER_MEMBERSHIP.teamMaxMembers} lidí z jedné firmy</div>
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
