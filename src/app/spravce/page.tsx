'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Building2, Settings, LogOut, Plus, ExternalLink, Clock, User, CheckCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

/** Isolated component that reads searchParams — must be inside Suspense */
function TransferBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get('transfer') !== 'accepted') return null;
  return (
    <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
      <p className="text-green-800 font-medium">Převod administrace úspěšně přijat! Coworking najdete v seznamu níže.</p>
    </div>
  );
}

interface Claim {
  coworkingSlug: string;
  coworkingName: string;
  status: string;
  createdAt: string;
}

interface OnboardingState {
  hasCowOs: boolean;
  hasBillingProfile: boolean;
  planCount: number;
  memberCount: number;
}

export default function SprvcePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [cowOsActive, setCowOsActive] = useState<Record<string, boolean>>({});
  const [pendingClaims, setPendingClaims] = useState<Claim[]>([]);
  const [onboarding, setOnboarding] = useState<Record<string, OnboardingState>>({});

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
        // For each approved coworking, gather onboarding state in parallel:
        // cow.os subscription, billing profile, plan count, member count.
        // This drives the per-coworking onboarding checklist.
        const checks = approvedClaims.map(async (claim: Claim) => {
          const state: OnboardingState = { hasCowOs: false, hasBillingProfile: false, planCount: 0, memberCount: 0 };
          try {
            const [subR, billR, dashR] = await Promise.all([
              fetch(`/api/cow-os/subscription?slug=${claim.coworkingSlug}`).catch(() => null),
              fetch(`/api/cow-os/billing-profile?slug=${claim.coworkingSlug}`).catch(() => null),
              fetch(`/api/cow-os/dashboard?slug=${claim.coworkingSlug}`).catch(() => null),
            ]);
            if (subR && subR.ok) {
              const sub = await subR.json();
              state.hasCowOs = !!sub?.id;
            }
            if (billR && billR.ok) {
              const bill = await billR.json();
              state.hasBillingProfile = !!bill?.companyName;
            }
            if (dashR && dashR.ok) {
              const dash = await dashR.json();
              state.planCount = Number(dash?.detail?.activePlans ?? 0);
              state.memberCount = Number(dash?.activeMembers ?? 0);
            }
          } catch {}
          return { slug: claim.coworkingSlug, state };
        });
        const results = await Promise.all(checks);
        const subMap: Record<string, boolean> = {};
        const onMap: Record<string, OnboardingState> = {};
        results.forEach((r) => {
          subMap[r.slug] = r.state.hasCowOs;
          onMap[r.slug] = r.state;
        });
        setCowOsActive(subMap);
        setOnboarding(onMap);
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 320, fontFamily: '"Caveat", cursive', fontSize: 22, color: '#6b6558' }}>
        ↻ načítám…
      </div>
    );
  }

  return (
    <div>
      {/* Topbar removed — PDAdminLayout poskytuje vrchní nav i sekci. */}
      {false && (
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
      )}

      <div className="max-w-6xl mx-auto">
        {/* Transfer accepted banner */}
        <Suspense fallback={null}>
          <TransferBanner />
        </Suspense>

        {/* Header */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: '"Caveat", cursive', fontSize: 19, color: '#c76a54', marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            ↘ tvoje portfolio
          </div>
          <h2 style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0 }}>
            Správce coworkingů
          </h2>
          <p style={{ fontSize: 13, color: '#6b6558', marginTop: 4 }}>Spravuj profily svých coworkingů a udržuj informace aktuální.</p>
        </div>

        {/* Stats row — PD style */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 14, marginBottom: 28 }}>
          <div style={{ background: '#fdfbf4', border: '1.5px solid #2e5fa1', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)', padding: '12px 16px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: '#2e5fa1', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Moje coworkingy</div>
            <div style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', color: '#1a1a1a', lineHeight: 1 }}>{claims.length}</div>
          </div>
          <div style={{ background: '#fdfbf4', border: '1.5px solid #c59a3a', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)', padding: '12px 16px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: '#c59a3a', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Role</div>
            <div style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', color: '#1a1a1a', textTransform: 'capitalize' }}>{(session?.user as any)?.role?.replace('_', ' ') || '—'}</div>
          </div>
          <div style={{ background: '#fdfbf4', border: '1.5px solid #6d8862', boxShadow: '2px 3px 0 rgba(0,0,0,0.06)', padding: '12px 16px' }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: '#6d8862', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Email</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session?.user?.email}</div>
          </div>
        </div>

        {/* Coworkings list header */}
        <div className="flex items-center justify-between" style={{ marginBottom: 14, gap: 12 }}>
          <h3 style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: '#1a1a1a', margin: 0 }}>
            Moje coworkingy
          </h3>
          <Link
            href="/spravce/coworkingy"
            style={{ fontFamily: '"Caveat", cursive', fontSize: 19, color: '#c76a54', textDecoration: 'none' }}
          >
            + přivlastnit další →
          </Link>
        </div>

        {claims.length === 0 ? (
          <div style={{ background: '#fdfbf4', border: '1.5px dashed #d9d1bf', padding: '36px 20px', textAlign: 'center' }}>
            <div style={{ fontFamily: '"Caveat", cursive', fontSize: 32, color: '#6b6558', marginBottom: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>
              ¯\_(ツ)_/¯
            </div>
            <h4 style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 18, fontWeight: 500, color: '#1a1a1a', margin: '0 0 6px' }}>
              Zatím žádné coworkingy
            </h4>
            <p style={{ fontSize: 13, color: '#6b6558', margin: '0 auto 18px', maxWidth: 380 }}>
              Najdi svůj coworking v adresáři a klikni na tlačítko „Přivlastnit si coworking" na jeho profilu.
            </p>
            <Link
              href="/spravce/coworkingy"
              style={{ display: 'inline-block', padding: '12px 22px', background: '#1a1a1a', color: '#fdfbf4', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: '3px 3px 0 #c76a54' }}
            >
              Najít svůj coworking →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 18 }}>
            {claims.map((claim, i) => {
              const ob = onboarding[claim.coworkingSlug];
              const stepsTotal = 4;
              const stepsDone = ob ? [ob.hasCowOs, ob.hasBillingProfile, ob.planCount > 0, ob.memberCount > 0].filter(Boolean).length : 0;
              const showChecklist = ob && stepsDone < stepsTotal;
              return (
              <div key={claim.coworkingSlug} style={{ display: 'grid', gap: 0 }}>
              <div
                style={{
                  background: '#fdfbf4', border: '1.5px solid #d9d1bf', padding: '16px 18px',
                  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                  transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)`,
                  boxShadow: '3px 4px 0 rgba(0,0,0,0.06)',
                  borderBottom: showChecklist ? 'none' : '1.5px solid #d9d1bf',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: '1 1 240px', minWidth: 0 }}>
                  <div style={{ width: 44, height: 44, background: '#2e5fa1', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Inter Tight", sans-serif', fontWeight: 600, fontSize: 18, flexShrink: 0 }}>
                    {claim.coworkingName.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', color: '#1a1a1a' }}>
                      {claim.coworkingName}
                    </div>
                    <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: '#6b6558', marginTop: 2 }}>
                      přivlastněno {new Date(claim.createdAt).toLocaleDateString('cs-CZ')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <Link
                    href={`/spravce/${claim.coworkingSlug}/cow-os`}
                    style={{
                      padding: '7px 12px', fontSize: 12, fontWeight: 600,
                      background: cowOsActive[claim.coworkingSlug] ? '#6d8862' : '#fdfbf4',
                      color: cowOsActive[claim.coworkingSlug] ? '#fff' : '#c59a3a',
                      border: `1.5px solid ${cowOsActive[claim.coworkingSlug] ? '#6d8862' : '#c59a3a'}`,
                      textDecoration: 'none',
                      fontFamily: 'Inter, sans-serif',
                    }}
                  >
                    🐄 <span className="hidden sm:inline">{cowOsActive[claim.coworkingSlug] ? 'Vstoupit COW.OS' : 'COW.OS'}</span>
                  </Link>
                  <Link
                    href={`/coworking/${claim.coworkingSlug}`}
                    target="_blank"
                    style={{ padding: '7px 12px', fontSize: 12, color: '#3a3a3a', border: '1.5px solid #d9d1bf', background: '#fdfbf4', textDecoration: 'none', fontFamily: 'Inter, sans-serif' }}
                  >
                    ↗ <span className="hidden sm:inline">zobrazit</span>
                  </Link>
                  <Link
                    href={`/spravce/${claim.coworkingSlug}`}
                    style={{ padding: '7px 12px', fontSize: 12, fontWeight: 600, background: '#1a1a1a', color: '#fdfbf4', textDecoration: 'none', fontFamily: 'Inter, sans-serif', boxShadow: '2px 2px 0 #c76a54' }}
                  >
                    ⚙ <span className="hidden sm:inline">editovat</span>
                  </Link>
                </div>
              </div>
              {showChecklist && ob && (
                <div style={{
                  background: '#fffaee', border: '1.5px solid #d9d1bf', borderTop: 'none',
                  padding: '14px 18px',
                  transform: `rotate(${i % 2 === 0 ? -0.3 : 0.3}deg)`,
                  boxShadow: '3px 4px 0 rgba(0,0,0,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1.5, color: '#c59a3a', textTransform: 'uppercase', fontWeight: 700 }}>
                      ↘ Nastav cow.os ({stepsDone}/{stepsTotal})
                    </span>
                    <div style={{ flex: 1, height: 4, background: '#f0e6d0', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${(stepsDone / stepsTotal) * 100}%`, height: '100%', background: '#6d8862', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: 6 }}>
                    {/* Step 1: cow.os subscription */}
                    {ob.hasCowOs ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6d8862' }}>
                        <CheckCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>1. Aktivovat COW.OS</span>
                      </div>
                    ) : (
                      <Link href={`/spravce/${claim.coworkingSlug}/cow-os`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1a1a1a', textDecoration: 'none' }}>
                        <span style={{ width: 16, height: 16, border: '1.5px solid #c59a3a', borderRadius: 2, flexShrink: 0 }} />
                        <span><b>1. Aktivovat COW.OS</b> — vytvoř si subscription pro tento coworking →</span>
                      </Link>
                    )}
                    {/* Step 2: billing profile */}
                    {ob.hasBillingProfile ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6d8862' }}>
                        <CheckCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>2. Vyplnit fakturační údaje</span>
                      </div>
                    ) : (
                      <Link href={`/spravce/${claim.coworkingSlug}/cow-os/nastaveni`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ob.hasCowOs ? '#1a1a1a' : '#a09886', textDecoration: 'none', pointerEvents: ob.hasCowOs ? 'auto' : 'none' }}>
                        <span style={{ width: 16, height: 16, border: '1.5px solid #c59a3a', borderRadius: 2, flexShrink: 0 }} />
                        <span><b>2. Vyplnit fakturační údaje</b> — IČO, banka, prefix faktur →</span>
                      </Link>
                    )}
                    {/* Step 3: at least 1 plan */}
                    {ob.planCount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6d8862' }}>
                        <CheckCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>3. Vytvořit alespoň 1 tarif</span>
                      </div>
                    ) : (
                      <Link href={`/spravce/${claim.coworkingSlug}/cow-os/tarify`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ob.hasCowOs ? '#1a1a1a' : '#a09886', textDecoration: 'none', pointerEvents: ob.hasCowOs ? 'auto' : 'none' }}>
                        <span style={{ width: 16, height: 16, border: '1.5px solid #c59a3a', borderRadius: 2, flexShrink: 0 }} />
                        <span><b>3. Vytvořit tarify</b> — měsíční membership, day pass, ... →</span>
                      </Link>
                    )}
                    {/* Step 4: at least 1 member */}
                    {ob.memberCount > 0 ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6d8862' }}>
                        <CheckCircle className="w-4 h-4" style={{ flexShrink: 0 }} />
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>4. Přidat členy ({ob.memberCount})</span>
                      </div>
                    ) : (
                      <Link href={`/spravce/${claim.coworkingSlug}/cow-os/clenove/import`} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: ob.hasCowOs ? '#1a1a1a' : '#a09886', textDecoration: 'none', pointerEvents: ob.hasCowOs ? 'auto' : 'none' }}>
                        <span style={{ width: 16, height: 16, border: '1.5px solid #c59a3a', borderRadius: 2, flexShrink: 0 }} />
                        <span><b>4. Naimportovat členy</b> — hromadný CSV import →</span>
                      </Link>
                    )}
                  </div>
                </div>
              )}
              </div>
              );
            })}
          </div>
        )}

        {/* Pending claims */}
        {pendingClaims.length > 0 && (
          <div style={{ marginTop: 26 }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, letterSpacing: 1.5, color: '#6b6558', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
              — Čekající žádosti
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {pendingClaims.map((c) => (
                <div key={c.coworkingSlug} style={{ background: '#f6e8c8', border: '1.5px dashed #c59a3a', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>⏳</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1a1a1a' }}>{c.coworkingName}</span>
                  </div>
                  <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: 1, padding: '2px 8px', border: '1px solid #c59a3a', color: '#c59a3a', textTransform: 'uppercase', fontWeight: 700 }}>
                    čeká na schválení
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Help box */}
        <div style={{ marginTop: 30, padding: '16px 20px', background: '#e6edf5', border: '1.5px dashed #2e5fa1' }}>
          <div style={{ fontFamily: '"Inter Tight", sans-serif', fontSize: 16, fontWeight: 600, color: '#2e5fa1', marginBottom: 4 }}>
            💡 Potřebuješ pomoc?
          </div>
          <p style={{ fontSize: 13, color: '#3a3a3a', margin: 0 }}>
            Pokud tvůj coworking v adresáři není, kontaktuj nás na{' '}
            <a href="mailto:info@coworkings.cz" style={{ color: '#c76a54', fontWeight: 600 }}>info@coworkings.cz</a>{' '}
            a přidáme ho ručně.
          </p>
        </div>
      </div>
    </div>
  );
}
