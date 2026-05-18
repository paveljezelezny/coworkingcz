'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Shield, Settings, Clock, ArrowRightLeft, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ClaimButtonProps {
  slug: string;
}

type ClaimState =
  | { kind: 'none' }
  | { kind: 'pending' }
  | { kind: 'transfer_pending' }
  | { kind: 'approved' }
  | { kind: 'rejected' };

export default function ClaimButton({ slug }: ClaimButtonProps) {
  const { data: session, status } = useSession();
  const [claimState, setClaimState] = useState<ClaimState>({ kind: 'none' });
  const [othersOwn, setOthersOwn] = useState<boolean>(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { setChecking(false); return; }

    // 1) Check this user's claim status for this slug
    // 2) Check whether someone else already owns it (CoworkingEdit exists with different userId)
    Promise.all([
      fetch('/api/claims').then((r) => (r.ok ? r.json() : { claims: [] })),
      fetch(`/api/coworking-edits?slug=${slug}`).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ])
      .then(([claimsData, ownershipData]) => {
        const myClaim = (claimsData?.claims || []).find((c: any) => c.coworkingSlug === slug);
        if (myClaim) {
          setClaimState({ kind: myClaim.status as ClaimState['kind'] });
        }
        // ownership check is best-effort — if endpoint doesn't exist, fall through silently
        if (ownershipData && ownershipData.exists && (!myClaim || myClaim.status !== 'approved')) {
          setOthersOwn(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [session, status, slug]);

  if (status === 'loading' || checking) return null;

  // === User owns this coworking ===
  if (claimState.kind === 'approved') {
    return (
      <Link
        href={`/spravce/${slug}`}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Settings className="w-5 h-5" />
        Editovat profil
      </Link>
    );
  }

  // === User has pending claim (waiting for super_admin approval) ===
  if (claimState.kind === 'pending') {
    return (
      <div className="mt-4 border-2 border-dashed border-yellow-400 bg-yellow-50 rounded-lg p-3 text-center">
        <Clock className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
        <p className="text-sm font-semibold text-yellow-800">Tvoje žádost čeká na schválení</p>
        <p className="text-xs text-yellow-700 mt-1">Administrátor obvykle odpoví do 24 hodin.</p>
      </div>
    );
  }

  // === User has transfer_pending claim (requested ownership transfer) ===
  if (claimState.kind === 'transfer_pending') {
    return (
      <div className="mt-4 border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg p-3 text-center">
        <ArrowRightLeft className="w-5 h-5 text-blue-600 mx-auto mb-1" />
        <p className="text-sm font-semibold text-blue-800">Čeká schválení převodu</p>
        <p className="text-xs text-blue-700 mt-1">Tento coworking už má aktivního správce — žádáš o převod.</p>
      </div>
    );
  }

  // === User was rejected — link to support ===
  if (claimState.kind === 'rejected') {
    return (
      <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-3 text-center">
        <p className="text-xs text-red-700 mb-1">Tvoje žádost byla zamítnuta.</p>
        <a href="mailto:info@coworkings.cz" className="text-xs text-red-700 underline">Kontaktuj nás</a>
      </div>
    );
  }

  // === Not logged in: show subtle claim prompt ===
  if (!session) {
    return (
      <div className="mt-4 border border-dashed border-gray-200 rounded-lg p-3 text-center">
        <p className="text-xs text-gray-400 mb-1">Provozuješ tento coworking?</p>
        <Link
          href={`/prihlaseni?callbackUrl=/coworking/${slug}/narokovat`}
          className="text-xs text-blue-600 hover:underline font-medium"
        >
          Přihlas se a přivlastnit si profil →
        </Link>
      </div>
    );
  }

  // === Logged in, no claim yet, someone else owns it → transfer request CTA ===
  if (othersOwn) {
    return (
      <div className="mt-4 border border-dashed border-blue-300 rounded-lg p-3 text-center">
        <Lock className="w-4 h-4 text-blue-600 mx-auto mb-1" />
        <p className="text-xs text-gray-600 mb-2">Tento coworking už má aktivního správce. Pokud jsi nový provozovatel, můžeš požádat o převod.</p>
        <Link
          href={`/coworking/${slug}/narokovat`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          Požádat o převod
        </Link>
      </div>
    );
  }

  // === Logged in, no claim, no other owner → standard claim CTA ===
  return (
    <div className="mt-4 border border-dashed border-gray-300 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-2">Jsi provozovatel tohoto coworkingu?</p>
      <Link
        href={`/coworking/${slug}/narokovat`}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors"
      >
        <Shield className="w-4 h-4" />
        Přivlastnit si coworking
      </Link>
    </div>
  );
}
