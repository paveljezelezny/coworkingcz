'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, User, Building2, Search, X, Check, Edit2, Tag, Calendar, Zap, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface CoworkingClaim {
  coworkingSlug: string;
  coworkingName: string;
  status: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  membershipTier: string | null;
  membershipStart: string | null;
  membershipEnd: string | null;
  coworkingClaims: CoworkingClaim[];
  hasCoworkingOwnership: boolean;
  effectiveMembership: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  coworker: 'Uživatel',
  coworking_admin: 'Správce',
  super_admin: 'Super Admin',
};
const ROLE_COLORS: Record<string, string> = {
  coworker: 'bg-gray-100 text-gray-700',
  coworking_admin: 'bg-blue-100 text-blue-700',
  super_admin: 'bg-purple-100 text-purple-700',
};

function tierLabel(tier: string | null) {
  if (!tier || tier === 'free') return 'Zdarma';
  if (tier === 'owner') return 'Vlastník';
  if (tier.startsWith('trial')) return 'Trial 30 dní';
  const map: Record<string, string> = { monthly: 'Měsíční', yearly: 'Roční', corporate: 'Firemní' };
  return map[tier] ?? tier;
}
function tierColor(tier: string | null) {
  if (!tier || tier === 'free') return 'bg-gray-100 text-gray-500';
  if (tier === 'owner') return 'bg-orange-100 text-orange-700';
  if (tier.startsWith('trial')) return 'bg-teal-100 text-teal-700';
  const map: Record<string, string> = {
    monthly: 'bg-green-100 text-green-700',
    yearly: 'bg-blue-100 text-blue-700',
    corporate: 'bg-amber-100 text-amber-700',
  };
  return map[tier] ?? 'bg-gray-100 text-gray-500';
}

function MembershipModal({ user, onClose, onSave }: {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, data: { membershipTier: string; membershipEnd: string; membershipStart: string }) => Promise<void>;
}) {
  const [tier, setTier] = useState(user.membershipTier ?? 'free');
  const [start, setStart] = useState(
    user.membershipStart ? user.membershipStart.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [end, setEnd] = useState(user.membershipEnd ? user.membershipEnd.slice(0, 10) : '');
  const [saving, setSaving] = useState(false);

  const handleTierChange = (t: string) => {
    setTier(t);
    if (t !== 'free' && !end) {
      const d = new Date();
      if (t === 'monthly' || t.startsWith('trial')) d.setMonth(d.getMonth() + 1);
      else d.setFullYear(d.getFullYear() + 1);
      setEnd(d.toISOString().slice(0, 10));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(user.id, { membershipTier: tier === 'free' ? '' : tier, membershipEnd: end, membershipStart: start });
    setSaving(false);
    onClose();
  };

  const TIERS = [
    { id: 'free', label: 'Zdarma' },
    { id: 'trial_monthly', label: 'Trial 30d' },
    { id: 'monthly', label: 'Měsíční' },
    { id: 'yearly', label: 'Roční' },
    { id: 'corporate', label: 'Firemní' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="font-bold text-gray-900">Upravit členství</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-900">{user.name || user.email}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id}</p>
          </div>

          {user.hasCoworkingOwnership && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
              <div className="font-medium mb-1">⚡ Vlastník coworkingu</div>
              <div className="text-xs text-orange-600">
                {user.coworkingClaims.map(c => c.coworkingName).join(', ')}
              </div>
              <div className="text-xs text-orange-500 mt-1">Jako vlastník má automaticky plný přístup. Tady nastavuješ manuální override.</div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Typ členství</label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map(t => (
                <button key={t.id} onClick={() => handleTierChange(t.id)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                    tier === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Začátek</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Expirace</label>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)}
                disabled={tier === 'free'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-gray-200">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">Zrušit</button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? 'Ukládám…' : <><Check className="w-4 h-4" /> Uložit</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingMembership, setEditingMembership] = useState<AdminUser | null>(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (!searchQuery) { setFiltered(users); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.name?.toLowerCase().includes(q) ?? false) ||
      u.coworkingClaims.some(c => c.coworkingName.toLowerCase().includes(q))
    ));
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users?limit=500');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const list: AdminUser[] = Array.isArray(data) ? data : (data.users ?? []);
      setUsers(list); setFiltered(list);
    } catch { setError('Chyba při načítání uživatelů'); }
    finally { setLoading(false); }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingId(userId); setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      setSuccessId(userId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Chyba');
    } finally { setSavingId(null); }
  };

  const handleMembershipSave = async (userId: string, data: { membershipTier: string; membershipEnd: string; membershipStart: string }) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, ...data }),
    });
    if (res.ok) {
      setUsers(prev => prev.map(u => u.id === userId
        ? {
            ...u,
            membershipTier: data.membershipTier || null,
            membershipEnd: data.membershipEnd || null,
            membershipStart: data.membershipStart || null,
            effectiveMembership: u.hasCoworkingOwnership ? 'owner' : (data.membershipTier || null),
          }
        : u
      ));
    }
  };

  // Sync ownership → give full yearly membership
  const handleSyncOwnerMembership = async (userId: string) => {
    setSavingId(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, syncOwnerMembership: true }),
      });
      if (res.ok) {
        const result = await res.json();
        const end = new Date(result.end).toISOString();
        setUsers(prev => prev.map(u => u.id === userId
          ? { ...u, membershipTier: 'yearly', membershipEnd: end, effectiveMembership: 'owner' }
          : u
        ));
        setSuccessId(userId);
        setTimeout(() => setSuccessId(null), 2000);
      }
    } finally { setSavingId(null); }
  };

  const counts = {
    total: users.length,
    super_admin: users.filter(u => u.role === 'super_admin').length,
    owners: users.filter(u => u.hasCoworkingOwnership).length,
    coworker: users.filter(u => u.role === 'coworker').length,
    paid: users.filter(u => u.membershipTier && u.membershipTier !== 'free').length,
  };

  if (loading) return (
    <div className="flex items-center justify-center" style={{minHeight:320}}>
      <div className="text-gray-600">Načítám uživatele...</div>
    </div>
  );

  return (
    <div>
      {editingMembership && (
        <MembershipModal user={editingMembership} onClose={() => setEditingMembership(null)} onSave={handleMembershipSave} />
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Správa uživatelů</p>
          </div>
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            <Shield className="w-4 h-4" /> Super Admin
          </span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100">
            <Link href="/admin" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Coworkingy
            </Link>
            <Link href="/admin/uzivatele" className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2">
              <Users className="w-4 h-4" /> Uživatelé
            </Link>
            <Link href="/admin/zadosti" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" /> Žádosti
            </Link>
            <Link href="/admin/inzeraty" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Inzeráty
            </Link>
            <Link href="/admin/eventy" className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Eventy
            </Link>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Celkem', value: counts.total, color: 'text-gray-900' },
            { label: 'Super Admin', value: counts.super_admin, color: 'text-purple-600' },
            { label: 'Vlastníci coworkingů', value: counts.owners, color: 'text-orange-600' },
            { label: 'Uživatelé', value: counts.coworker, color: 'text-gray-600' },
            { label: 'Platící členství', value: counts.paid, color: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Hledat podle jména, emailu nebo coworkingu..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Uživatel</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    <span className="flex items-center gap-1">Členství <span className="text-xs font-normal text-gray-400">(osobní)</span></span>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Expirace</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-orange-500" />Cowork tier</span>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((user) => {
                  const expired = user.membershipEnd && new Date(user.membershipEnd) < new Date();
                  const needsSync = user.hasCoworkingOwnership && (!user.membershipTier || user.membershipTier === 'free');
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.hasCoworkingOwnership ? 'bg-orange-50/30' : ''}`}>
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.image
                            ? <img src={user.image} alt={user.name || user.email} className="w-8 h-8 rounded-full object-cover" />
                            : <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"><User className="w-4 h-4 text-gray-500" /></div>
                          }
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name || '—'}</p>
                            <p className="text-xs text-gray-400 font-mono hidden sm:block">{user.id.slice(0, 14)}…</p>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">{user.email}</td>

                      {/* Personal membership */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tierColor(user.membershipTier)} ${expired ? 'opacity-50' : ''}`}>
                            {tierLabel(user.membershipTier)}{expired ? ' ⚠' : ''}
                          </span>
                          <button onClick={() => setEditingMembership(user)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors" title="Upravit členství">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="px-4 py-3 text-sm hidden lg:table-cell">
                        {user.membershipEnd
                          ? <span className={expired ? 'text-red-500 font-medium' : 'text-gray-600'}>{new Date(user.membershipEnd).toLocaleDateString('cs-CZ')}</span>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>

                      {/* Cowork tier */}
                      <td className="px-4 py-3">
                        {user.hasCoworkingOwnership ? (
                          <div className="space-y-1">
                            {user.coworkingClaims.map(claim => (
                              <div key={claim.coworkingSlug} className="flex items-center gap-1.5">
                                <Link
                                  href={`/coworking/${claim.coworkingSlug}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
                                  title={claim.coworkingSlug}
                                >
                                  <Building2 className="w-3 h-3" />
                                  {claim.coworkingName.length > 18 ? claim.coworkingName.slice(0, 18) + '…' : claim.coworkingName}
                                </Link>
                                {needsSync && (
                                  <button
                                    onClick={() => handleSyncOwnerMembership(user.id)}
                                    disabled={savingId === user.id}
                                    className="p-1 rounded bg-orange-100 hover:bg-orange-200 text-orange-600 transition-colors"
                                    title="Přiřadit roční členství (vlastník coworkingu)"
                                  >
                                    {savingId === user.id
                                      ? <span className="text-xs">…</span>
                                      : <Zap className="w-3 h-3" />
                                    }
                                  </button>
                                )}
                              </div>
                            ))}
                            {successId === user.id && (
                              <span className="text-xs text-green-600 font-medium">✓ Sync hotov</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                          <select value={user.role} disabled={savingId === user.id}
                            onChange={e => handleRoleChange(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
                            <option value="coworker">Uživatel</option>
                            <option value="coworking_admin">Správce</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center"><p className="text-gray-600">Žádní uživatelé nenalezeni</p></div>
          )}
        </div>

        <div className="mt-4 flex items-start gap-6 text-xs text-gray-400">
          <p>Změna role se projeví při příštím přihlášení uživatele (JWT refresh).</p>
          <p className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-400" /> = vlastník coworkingu bez osobního členství — klikni pro automatický sync na roční tier.</p>
        </div>
      </div>
    </div>
  );
}
