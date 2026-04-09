'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Users, FileText, BarChart3, Settings, AlertCircle, Loader } from 'lucide-react';

interface DashboardStats {
  activeMembers: number;
  issuedInvoices: number;
  monthlyRevenue: number;
  subscriptionTier: string;
}

interface Subscription {
  id: string;
  tier: string;
  status: string;
  createdAt: string;
}

export default function COWOSPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    checkSubscription();
  }, [slug]);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cow-os/subscription?slug=${slug}`);

      if (res.status === 404) {
        setSubscription(null);
        setStats(null);
      } else if (res.ok) {
        const sub = await res.json();
        setSubscription(sub);
        await fetchStats();
      } else {
        setError('Chyba při načítání předplatného');
      }
    } catch (err) {
      setError('Chyba při připojení k serveru');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/cow-os/dashboard?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleActivate = async () => {
    try {
      setActivating(true);
      setError(null);
      const res = await fetch(`/api/cow-os/subscription?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'free' }),
      });

      if (res.ok) {
        const sub = await res.json();
        setSubscription(sub);
        await fetchStats();
      } else {
        setError('Chyba při aktivaci COW.OS');
      }
    } catch (err) {
      setError('Chyba při připojení k serveru');
    } finally {
      setActivating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Načítám COW.OS...</p>
        </div>
      </div>
    );
  }

  // No subscription - show activation screen
  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 sm:px-8 py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3">Vítejte v COW.OS</h1>
              <p className="text-gray-700 max-w-md mx-auto mb-8">
                Kompletní systém pro správu členství, fakturaci a tarifu vašeho coworkingu. Spravujte své členy, vytvářejte faktury a sledujte výnosy na jednom místě.
              </p>
            </div>

            <div className="px-6 sm:px-8 py-8 border-t border-gray-200">
              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: Users, title: 'Správa členů', desc: 'Spravujte členy a jejich předplatná' },
                  { icon: FileText, title: 'Fakturační systém', desc: 'Automatické faktury a evidence' },
                  { icon: BarChart3, title: 'Analytika', desc: 'Sledujte výnosy a metriky' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-lg text-center">
                    <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={handleActivate}
                  disabled={activating}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors inline-flex items-center gap-2"
                >
                  {activating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Aktivuji...
                    </>
                  ) : (
                    'Aktivovat COW.OS zdarma'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Has subscription - show dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">COW.OS Dashboard</h1>
          <p className="text-gray-600 mt-1">Správa vašeho coworkingu a členů</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Aktivní členové</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeMembers}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Vystavené faktury</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.issuedInvoices}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Výnos tento měsíc</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {new Intl.NumberFormat('cs-CZ').format(stats.monthlyRevenue)} Kč
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Typ předplatného</p>
                  <p className="text-lg font-bold text-gray-900 mt-2 capitalize">{stats.subscriptionTier}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              href: './cow-os/clenove',
              icon: Users,
              title: 'Členové',
              desc: 'Spravujte členy a jejich předplatná',
              emoji: '👥',
            },
            {
              href: './cow-os/fakturace',
              icon: FileText,
              title: 'Fakturace',
              desc: 'Vytvářejte a spravujte faktury',
              emoji: '📄',
            },
            {
              href: './cow-os/tarify',
              icon: BarChart3,
              title: 'Tarify',
              desc: 'Nastavte a spravujte tarifní plány',
              emoji: '🏷️',
            },
            {
              href: './cow-os/nastaveni',
              icon: Settings,
              title: 'Nastavení',
              desc: 'Fakturační údaje a nastavení',
              emoji: '⚙️',
            },
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{item.emoji}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
