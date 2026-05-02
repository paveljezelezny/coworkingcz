'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Search, X, Plus, Edit2, Trash2, AlertCircle, Loader, ChevronLeft, ChevronRight,
} from 'lucide-react';

interface Member {
  id: string;
  email: string;
  name: string;
  phone?: string;
  company?: string;
  ico?: string;
  planId: string;
  planName: string;
  status: 'active' | 'trial' | 'expired' | 'cancelled';
  membershipStart: string;
  nextRenewalDate: string;
  autoRenew: boolean;
}

interface Plan {
  id: string;
  name: string;
}

interface MemberForm {
  name: string;
  email: string;
  phone: string;
  company: string;
  ico: string;
  planId: string;
  notes: string;
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-blue-100 text-blue-700',
  expired: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Aktivní',
  trial: 'Trial',
  expired: 'Vypršelo',
  cancelled: 'Zrušeno',
};

function MemberModal({
  member,
  plans,
  onClose,
  onSave,
  loading,
}: {
  member?: Member;
  plans: Plan[];
  onClose: () => void;
  onSave: (data: MemberForm) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<MemberForm>({
    name: member?.name ?? '',
    email: member?.email ?? '',
    phone: member?.phone ?? '',
    company: member?.company ?? '',
    ico: member?.ico ?? '',
    planId: member?.planId ?? '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{member ? 'Upravit člena' : 'Přidat člena'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Jméno</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Telefon</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Společnost</label>
            <input
              type="text"
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">IČO</label>
            <input
              type="text"
              value={form.ico}
              onChange={e => setForm({ ...form, ico: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Tarif</label>
            <select
              required
              value={form.planId}
              onChange={e => setForm({ ...form, planId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vyberte tarif</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Poznámky</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium"
            >
              Zrušit
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Ukládám...
                </>
              ) : (
                'Uložit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired' | 'cancelled'>('all');
  const [modalMember, setModalMember] = useState<Member | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    if (slug) {
      fetchMembers();
      fetchPlans();
    }
  }, [slug, statusFilter, page]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/cow-os/members?slug=${slug}&page=${page}&limit=${pageSize}${status}`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      } else {
        setError('Chyba při načítání členů');
      }
    } catch (err) {
      setError('Chyba při připojení k serveru');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await fetch(`/api/cow-os/plans?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  const handleOpenCreate = () => {
    setModalMember(undefined);
    setShowModal(true);
  };

  const handleOpenEdit = (member: Member) => {
    setModalMember(member);
    setShowModal(true);
  };

  const handleSaveMember = async (form: MemberForm) => {
    try {
      setSaving(true);
      setError(null);

      if (modalMember) {
        // Update
        const res = await fetch(`/api/cow-os/members?slug=${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modalMember.id, ...form }),
        });
        if (!res.ok) throw new Error('Chyba při úpravě člena');
      } else {
        // Create
        const res = await fetch(`/api/cow-os/members?slug=${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Chyba při vytvoření člena');
      }

      setShowModal(false);
      setPage(1);
      await fetchMembers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tohoto člena?')) return;
    try {
      const res = await fetch(`/api/cow-os/members?slug=${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Chyba při smazání');
      await fetchMembers();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {showModal && (
        <MemberModal
          member={modalMember}
          plans={plans}
          onClose={() => setShowModal(false)}
          onSave={handleSaveMember}
          loading={saving}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href={`/spravce/${slug}/cow-os`} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm mb-2">
              <ChevronLeft className="w-4 h-4" />
              Zpět na dashboard
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Členové</h1>
            <p className="text-gray-600 mt-1">{members.length} celkem</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Přidat člena
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat podle jména nebo emailu..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Všechny statusy</option>
            <option value="active">Aktivní</option>
            <option value="trial">Trial</option>
            <option value="expired">Vypršelo</option>
            <option value="cancelled">Zrušeno</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Jméno</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Email</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Tarif</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Členství od</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Příští obnova</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Auto-prodloužení</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filtered.map(member => (
                      <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{member.name}</p>
                          <p className="text-xs text-gray-400 sm:hidden">{member.email}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{member.email}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{member.planName}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[member.status]}`}>
                            {STATUS_LABELS[member.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                          {new Date(member.membershipStart).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                          {new Date(member.nextRenewalDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <input
                            type="checkbox"
                            checked={member.autoRenew}
                            readOnly
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(member)}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                              title="Upravit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(member.id)}
                              className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-700 transition-colors"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filtered.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-600">
                  Žádní členové nenalezeni
                </div>
              )}

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                <p className="text-xs text-gray-600">Stránka {page}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={filtered.length < pageSize}
                    className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
