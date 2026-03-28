'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Building2, Mail, FileText, CheckCircle, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { coworkingsData } from '@/lib/data/coworkings';

interface ClaimPageProps {
  params: { slug: string };
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const coworking = coworkingsData.find((c) => c.slug === params.slug);

  const [businessEmail, setBusinessEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!coworking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Coworking nenalezen.</p>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <ShieldCheck className="w-14 h-14 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Přihlaš se nejdřív</h2>
          <p className="text-gray-600 mb-6">
            Pro přivlastnění coworkingu musíš mít účet na COWORKINGS.cz.
          </p>
          <Link
            href={`/prihlaseni?callbackUrl=/coworking/${params.slug}/narokovat`}
            className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Přihlásit se
          </Link>
          <Link
            href="/registrace"
            className="block w-full py-3 mt-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Vytvořit účet
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Hotovo!</h2>
          <p className="text-gray-600 mb-6">
            Úspěšně jsi přivlastnil <strong>{coworking.name}</strong>. Teď ho můžeš plně editovat.
          </p>
          <button
            onClick={() => router.push(`/spravce/${params.slug}`)}
            className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Otevřít správce →
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          coworkingSlug: params.slug,
          coworkingName: coworking.name,
          businessEmail,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Nepodařilo se přivlastnit coworking');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Chyba serveru. Zkus to znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto">
        <Link href={`/coworking/${params.slug}`} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Zpět na profil coworkingu
        </Link>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-8 h-8 text-blue-200" />
              <ShieldCheck className="w-8 h-8 text-blue-200" />
            </div>
            <h1 className="text-2xl font-bold mb-1">Přivlastnit coworking</h1>
            <p className="text-blue-100 text-sm">{coworking.name} · {coworking.city}</p>
          </div>

          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
              <p className="font-semibold mb-1">Co získáš přivlastněním?</p>
              <ul className="space-y-1 text-blue-700">
                <li>✓ Plná editace profilu coworkingu</li>
                <li>✓ Správa fotek, popisů, cen a otevírací doby</li>
                <li>✓ Přidávání eventů a aktualit</li>
                <li>✓ Přístup ke statistikám návštěvnosti</li>
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Přihlášen jako
                </label>
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                  {session?.user?.name} · {session?.user?.email}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Firemní / provozní email <span className="text-gray-400 font-normal">(volitelné)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="info@mujcoworking.cz"
                    className="input-field pl-12 w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Email coworkingu pro ověření vlastnictví</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Krátká zpráva <span className="text-gray-400 font-normal">(volitelné)</span>
                </label>
                <div className="relative">
                  <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Jsem provozovatel tohoto coworkingu od roku..."
                    rows={3}
                    className="input-field pl-12 w-full resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Zpracovávám...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    Přivlastnit si coworking
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
