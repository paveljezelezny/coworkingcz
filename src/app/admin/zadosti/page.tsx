'use client';

import { useState, useEffect } from 'react';
import { Building2, Users, Tag, Calendar, ClipboardList, Check, X, Clock, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Claim {
  id: string;
  coworkingSlug: string;
  coworkingName: string;
  businessEmail: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
  };
}

const STATUS_FILTER_OPTIONS = [
  { value: 'pending', label: 'Čekající', color: 'text-yellow-700 bg-yellow-100' },
  { value: 'approved', label: 'Schválené', color: 'text-green-700 bg-green-100' },
  { value: 'rejected', label: 'Zamítnuté', color: 'text-red-700 bg-red-100' },
  { value: 'all', label: 'Vše', color: 'text-gray-700 bg-gray-100' },
];

function statusBadge(status: string) {
  if (status === 'pending') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 inline-flex items-center gap-1"><Clock className="w-3 h-3" />Čekající</span>;
  if (status === 'approved') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 inline-flex items-center gap-1"><Check className="w-3 h-3" />Schváleno</span>;
  if (status === 'rejected') return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 inline-flex items-center gap-1"><X className="w-3 h-3" />Zamítnuto</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">{status}</span>;
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  async function fetchClaims(status: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/claims?status=${status}`);
      const data = await res.json();
      setClaims(Array.isArray(data.claims) ? data.claims : []);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchClaims(statusFilter);
  }, [statusFilter]);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAction(claimId: string, action: 'approve' | 'reject') {
    setActionLoading(claimId + action);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error ?? 'Chyba', 'error');
        return;
      }
      showToast(action === 'approve' ? 'Žádost schválena ✓' : 'Žádost zamítnuta', action === 'approve' ? 'success' : 'error');
      fetchClaims(statusFilter);
    } catch {
      showToast('Chyba serveru', 'error');
    } finally {
      setActionLoading(null);
    }
  }

  const NAV = [
    { href: '/admin', icon: <Building2 className="w-4 h-4" />, label: 'Coworkingy' },
    { href: '/admin/uzivatele', icon: <Users className="w-4 h-4" />, label: 'Uživatelé' },
    { href: '/admin/zadosti', icon: <ClipboardList className="w-4 h-4" />, label: 'Žádosti', active: true },
    { href: '/admin/inzeraty', icon: <Tag className="w-4 h-4" />, label: 'Inzeráty' },
    { href: '/admin/eventy', icon: <Calendar className="w-4 h-4" />, label: 'Eventy' },
  ];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Žádosti o správu coworkingů</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Super Admin
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium flex items-center gap-2 transition-colors ${
                  item.active
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                statusFilter === opt.value ? opt.color + ' ring-2 ring-offset-1 ring-current' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-500">Načítám...</div>
        ) : claims.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
            <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Žádné žádosti v tomto filtru.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {claims.map((claim) => (
              <div key={claim.id} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row sm:items-start gap-5">
                {/* User avatar */}
                <div className="flex-shrink-0">
                  {claim.user.image ? (
                    <Image src={claim.user.image} alt={claim.user.name ?? ''} width={44} height={44} className="rounded-full" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                      {(claim.user.name ?? claim.user.email ?? '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{claim.user.name ?? claim.user.email}</span>
                    {statusBadge(claim.status)}
                    <span className="text-xs text-gray-400">{new Date(claim.createdAt).toLocaleDateString('cs-CZ')}</span>
                  </div>

                  <div className="text-sm text-gray-500 mb-3">
                    <span className="text-gray-700 font-medium">{claim.user.email}</span>
                  </div>

                  <div className="mb-2 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="font-medium text-gray-800">{claim.coworkingName}</span>
                    <Link
                      href={`/coworking/${claim.coworkingSlug}`}
                      target="_blank"
                      className="text-blue-500 hover:text-blue-700"
                      title="Zobrazit stránku coworkingu"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {claim.businessEmail && (
                    <div className="text-sm text-gray-600 flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      {claim.businessEmail}
                    </div>
                  )}

                  {claim.message && (
                    <div className="text-sm text-gray-600 flex items-start gap-2 mt-2 bg-gray-50 rounded-lg px-3 py-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <span>{claim.message}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {claim.status === 'pending' && (
                  <div className="flex flex-row sm:flex-col gap-2 sm:items-end flex-shrink-0">
                    <button
                      onClick={() => handleAction(claim.id, 'approve')}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Schválit
                    </button>
                    <button
                      onClick={() => handleAction(claim.id, 'reject')}
                      disabled={!!actionLoading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-red-300 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-50 disabled:opacity-60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Zamítnout
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
