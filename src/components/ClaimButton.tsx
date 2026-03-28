'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Shield, Settings, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ClaimButtonProps {
  slug: string;
}

export default function ClaimButton({ slug }: ClaimButtonProps) {
  const { data: session, status } = useSession();
  const [ownsThis, setOwnsThis] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) { setChecking(false); return; }

    // Check if this user owns this coworking
    fetch('/api/claims')
      .then((r) => r.json())
      .then(({ claims }) => {
        const owns = (claims || []).some((c: any) => c.coworkingSlug === slug);
        setOwnsThis(owns);
      })
      .catch(() => setOwnsThis(false))
      .finally(() => setChecking(false));
  }, [session, status, slug]);

  if (status === 'loading' || checking) return null;

  // Owner: show edit button
  if (ownsThis) {
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

  // Logged in but not owner: show claim button
  if (session) {
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

  // Not logged in: show subtle claim prompt
  return (
    <div className="mt-4 border border-dashed border-gray-200 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-400 mb-1">Provozuješ tento coworking?</p>
      <Link
        href={`/prihlaseni?callbackUrl=/coworking/${slug}/narokovat`}
        className="text-xs text-blue-600 hover:underline font-medium"
      >
        Přihlaš se a přivlastnit si profil →
      </Link>
    </div>
  );
}
