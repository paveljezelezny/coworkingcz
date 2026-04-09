'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, Loader, ChevronLeft, Save, Check } from 'lucide-react';

interface BillingProfile {
  id: string;
  companyName: string;
  ico: string;
  dic: string;
  address: string;
  city: string;
  zip: string;
  bankAccount: string;
  iban: string;
  isVatPayer: boolean;
  invoicePrefix: string;
  courtRegistration?: string;
}

interface Subscription {
  tier: string;
  status: string;
  maxMembers: number;
}

interface DashboardStats {
  activeMembers: number;
}

export default function SettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [billingProfile, setBillingProfile] = useState<BillingProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState<Partial<BillingProfile>>({});

  useEffect(() => {
    if (slug) {
      fetchBillingProfile();
      fetchSubscription();
      fetchStats();
    }
  }, [slug]);

  const fetchBillingProfile = async () => {
    try {
      const res = await fetch(`/api/cow-os/billing-profile?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBillingProfile(data);
        setForm(data);
      } else {
        setBillingProfile(null);
      }
    } catch (err) {
      console.error('Error fetching billing profile:', err);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch(`/api/cow-os/subscription?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
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

  const calculateIban = (bankAccount: string): string => {
    // Simplified IBAN calculation for CZ bank accounts
    // Real implementation would use proper IBAN calculation
    if (!bankAccount) return '';
    return `CZ${bankAccount.slice(-16)}`;
  };

  const handleSaveBillingProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const res = await fetch(`/api/cow-os/billing-profile?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          iban: calculateIban(form.bankAccount || ''),
        }),
      });

      if (!res.ok) throw new Error('Chyba při ukládání');

      const updated = await res.json();
      setBillingProfile(updated);
      setSuccess('Fakturační údaje uloženy');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={`/spravce/${slug}/cow-os`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mb-2">
            <ChevronLeft className="w-4 h-4" />
            Zpět na dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nastavení</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm flex items-start gap-3">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Section 1: Billing Profile */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Fakturační údaje</h2>
            <p className="text-sm text-gray-600 mt-1">Informace používané na fakturách</p>
          </div>

          <form onSubmit={handleSaveBillingProfile} className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Název společnosti</label>
                <input
                  type="text"
                  value={form.companyName || ''}
                  onChange={e => setForm({ ...form, companyName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">IČO</label>
                <input
                  type="text"
                  value={form.ico || ''}
                  onChange={e => setForm({ ...form, ico: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">DIČ</label>
                <input
                  type="text"
                  value={form.dic || ''}
                  onChange={e => setForm({ ...form, dic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Adresa</label>
                <input
                  type="text"
                  value={form.address || ''}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Město</label>
                <input
                  type="text"
                  value={form.city || ''}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">PSČ</label>
                <input
                  type="text"
                  value={form.zip || ''}
                  onChange={e => setForm({ ...form, zip: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Bankovní účet</label>
                <input
                  type="text"
                  value={form.bankAccount || ''}
                  onChange={e => setForm({ ...form, bankAccount: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890/0100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">IBAN</label>
                <input
                  type="text"
                  value={form.bankAccount ? calculateIban(form.bankAccount) : ''}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Prefix faktur</label>
                <input
                  type="text"
                  value={form.invoicePrefix || ''}
                  onChange={e => setForm({ ...form, invoicePrefix: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="FV"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Registrace u soudu</label>
                <input
                  type="text"
                  value={form.courtRegistration || ''}
                  onChange={e => setForm({ ...form, courtRegistration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isVatPayer || false}
                  onChange={e => setForm({ ...form, isVatPayer: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Jsem plátce DPH</span>
              </label>
            </div>

            <div className="border-t border-gray-200 pt-6 flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Ukládám...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Uložit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Subscription */}
        {subscription && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Předplatné COW.OS</h2>
              <p className="text-sm text-gray-600 mt-1">Informace o vašem předplatném a limitech</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Typ předplatného</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{subscription.tier}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{subscription.status}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Maximální počet členů</p>
                  <p className="text-2xl font-bold text-gray-900">{subscription.maxMembers}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Aktuálně členů</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeMembers ?? 0}</p>
                </div>
              </div>

              {subscription.tier === 'free' && stats && stats.activeMembers >= 5 && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-3">
                    Chcete více než 5 členů?
                  </p>
                  <p className="text-sm text-blue-800 mb-3">
                    Upgradujte na Standard tarif za 750 Kč/měsíc a získejte neomezený počet členů.
                  </p>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    Upgradovat na Standard
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
