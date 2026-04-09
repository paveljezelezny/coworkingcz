'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Settings, LogOut, Plus, ExternalLink, Clock, User } from 'lucide-react';

interface Claim {
  coworkingSlug: string;
  coworkingName: string;
  status: string;
  createdAt: string;
}

export default function SprvcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [cowOsActive, setCowOsActive] = useState<Record<string, boolean>>({});
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/prihlaseni?callbackUrl=/spravce');
      return;
    }
    if (status === 'authenticated') {
      fetchClaims();
    }
  }, [status]);

  const fetchClaims = async () => {
    try {
      const res = await fetch('/api/claims');
      if (res.ok) {
        const data = await res.json();
        const allClaims = data.claims || [];
        const approvedClaims = allClaims.filter((c: Claim) => c.status === 'approved');
        setPendingClaims(allClaims.filter((c: Claim) => c.status === 'pending'));
        setClaims(approvedClaims);
        // Check COW.OS subscription status for each coworking in parallel
        const checks = approvedClaims.map(async (claim: Claim) => {
          try {
            const r = await fetch(`/api/cow-os/subscription?slug=${claim.coworkingSlug}`);
            if (r.ok) {
              const sub = await r.json();
              return { slug: claim.coworkingSlug, active: !!sub?.id };
            }
          } catch {}
          return { slug: claim.coworkingSlug, active: false };
        });
        const results = await Promise.all(checks);
        const map: Record<string, boolean> = {};
        results.forEach((r) => { map[r.slug] = r.active; });
        setCowOsActive(map);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
            <div>
              <span className="font-bold text-gray-900">COWORKINGS.cz</span>
              <span className="ml-2 text-sm text-gray-500">/ Správce</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{session?.user?.name || session?.user?.email}</span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Odhlásit</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Správce coworkingů</h1>
          <p className="text-gray-600">Spravuj profily svých coworkingů a udržuj informace aktuální.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Moje coworkingy</p>
            <p className="text-3xl font-bold text-gray-900">{claims.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Role</p>
            <p className="text-lg font-bold text-blue-600 capitalize">{(session?.user as any)?.role?.replace('_', ' ')}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-gray-900 truncate">{session?.user?.email}</p>
          </div>
        </div>

        {/* Coworkings list */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Moje coworkingy</h2>
          <Link
            href="/coworkingy"
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
          >
            <Plus className="w-4 h-4" />
            Přivlastnit další
          </Link>
        </div>

        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
            <Building2 className="w-14 h-14 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Zatím žádné coworkingy</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Najdi svůj coworking v adresáři a klikni na tlačítko "Přivlastnit si coworking" na jeho profilu.
            </p>
            <Link
              href="/coworkingy"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Najít svůj coworking
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {claims.map((claim) => (
              <div
                key={claim.coworkingSlug}
                className="bg-white rounded-xl border border-gray-200 p-6 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {claim.coworkingName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{claim.coworkingName}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      Přivlastněno {new Date(claim.createdAt).toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/spravce/${claim.coworkingSlug}/cow-os`}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      cowOsActive[claim.coworkingSlug]
                        ? 'text-white bg-emerald-600 hover:bg-emerald-700'
                        : 'text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    🐄
                    <span className="hidden sm:inline">{cowOsActive[claim.coworkingSlug] ? 'Vstoupit do COW.OS' : 'COW.OS'}</span>
                  </Link>
                  <Link
                    href={`/coworking/${claim.coworkingSlug}`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Zobrazit</span>
                  </Link>
                  <Link
                    href={`/spravce/${claim.coworkingSlug}`}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden sm:inline">Editovat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending claims */}
        {pendingClaims.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Čekající žádosti</h3>
            <div className="space-y-3">
              {pendingClaims.map((c) => (
                <div key={c.coworkingSlug} className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-800 font-medium">{c.coworkingName}</span>
                  </div>
                  <span className="text-xs font-semibold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full">Čeká na schválení</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help box */}
        <div className="mt-10 p-5 bg-blue-50 border border-blue-200 rounded-xl">
          <h4 className="font-bold text-blue-900 mb-1">Potřebuješ pomoc?</h4>
          <p className="text-sm text-blue-700">
            Pokud tvůj coworking v adresáři není, kontaktuj nás na{' '}
            <a href="mailto:info@coworkings.cz" className="font-semibold underline">info@coworkings.cz</a>{' '}
            a přidáme ho ručně.
          </p>
        </div>
      </div>
    </div>
  );
}
