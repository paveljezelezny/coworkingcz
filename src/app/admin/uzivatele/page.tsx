'use client';

import { useState, useEffect } from 'react';
import { Users, Shield, User, Building2, Search } from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  createdAt: string;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filtered, setFiltered] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFiltered(users);
      return;
    }
    const q = searchQuery.toLowerCase();
    setFiltered(users.filter(u =>
      u.email.toLowerCase().includes(q) ||
      (u.name && u.name.toLowerCase().includes(q))
    ));
  }, [users, searchQuery]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Nepodařilo se načíst uživatele');
      const data = await res.json();
      setUsers(data);
      setFiltered(data);
    } catch (err) {
      setError('Chyba při načítání uživatelů');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSavingId(userId);
    setError(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Chyba při ukládání');
      }

      const updated = await res.json();
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
      setSuccessId(userId);
      setTimeout(() => setSuccessId(null), 2000);
    } catch (err: any) {
      setError(err.message || 'Chyba při ukládání role');
    } finally {
      setSavingId(null);
    }
  };

  const counts = {
    total: users.length,
    super_admin: users.filter(u => u.role === 'super_admin').length,
    coworking_admin: users.filter(u => u.role === 'coworking_admin').length,
    coworker: users.filter(u => u.role === 'coworker').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Načítám uživatele...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
            <p className="text-sm text-gray-600 mt-1">Správa uživatelů</p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
            Super Admin
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 border-t border-gray-100 pt-0">
            <Link
              href="/admin"
              className="px-4 py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              Coworkingy
            </Link>
            <Link
              href="/admin/uzivatele"
              className="px-4 py-3 text-sm font-medium text-blue-600 border-b-2 border-blue-600 flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Uživatelé
            </Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
            <div className="text-sm text-gray-500 mt-1">Celkem uživatelů</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-purple-600">{counts.super_admin}</div>
            <div className="text-sm text-gray-500 mt-1">Super Admin</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-blue-600">{counts.coworking_admin}</div>
            <div className="text-sm text-gray-500 mt-1">Správci</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-600">{counts.coworker}</div>
            <div className="text-sm text-gray-500 mt-1">Uživatelé</div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Hledat podle jména nebo emailu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Uživatel</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Registrace</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {user.name || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role] || 'bg-gray-100 text-gray-700'}`}>
                          {successId === user.id ? '✓ Uloženo' : ROLE_LABELS[user.role] || user.role}
                        </span>
                        <select
                          value={user.role}
                          disabled={savingId === user.id}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-wait"
                        >
                          <option value="coworker">Uživatel</option>
                          <option value="coworking_admin">Správce</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-gray-600">Žádní uživatelé nenalezeni</p>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs text-gray-400">
          Změna role se projeví při příštím přihlášení uživatele (JWT refresh).
        </p>
      </div>
    </div>
  );
}
