'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  FileText, Search, X, Plus, AlertCircle, Loader, ChevronLeft, ChevronRight, Eye, Check, Trash2,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  memberId: string;
  memberName: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled';
  paidDate?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  issued: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-400 line-through',
};

const STATUS_LABELS: Record<string, string> = {
  draft: 'Koncept',
  issued: 'Vystaveno',
  paid: 'Zaplaceno',
  overdue: 'Po splatnosti',
  cancelled: 'Storno',
};

function InvoiceModal({
  members,
  onClose,
  onSave,
  loading,
}: {
  members: Member[];
  onClose: () => void;
  onSave: (data: { memberId: string; items?: any; notes: string }) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState({
    memberId: '',
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
          <h2 className="font-bold text-gray-900">Vystavit fakturu</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Příjemce</label>
            <select
              required
              value={form.memberId}
              onChange={e => setForm({ ...form, memberId: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vyberte člena</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Poznámky</label>
            <textarea
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Volitelné poznámky k faktuře..."
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
                  Vytvářím...
                </>
              ) : (
                'Vystavit fakturu'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InvoicingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingProfileExists, setBillingProfileExists] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled'>('issued');
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    if (slug) {
      fetchInvoices();
      fetchMembers();
      checkBillingProfile();
    }
  }, [slug, statusFilter, page]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const status = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
      const res = await fetch(`/api/cow-os/invoices?slug=${slug}&page=${page}&limit=${pageSize}${status}`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      } else {
        setError('Chyba při načítání faktur');
      }
    } catch (err) {
      setError('Chyba při připojení k serveru');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch(`/api/cow-os/members?slug=${slug}&status=active`);
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  const checkBillingProfile = async () => {
    try {
      const res = await fetch(`/api/cow-os/billing-profile?slug=${slug}`);
      setBillingProfileExists(res.ok);
    } catch (err) {
      setBillingProfileExists(false);
    }
  };

  const handleCreateInvoice = async (form: { memberId: string; items?: any; notes: string }) => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/cow-os/invoices?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Chyba při vytvoření faktury');
      setShowModal(false);
      setPage(1);
      await fetchInvoices();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/cow-os/invoices?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'paid', paidDate: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Chyba');
      await fetchInvoices();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Opravdu chcete zrušit tuto fakturu?')) return;
    try {
      const res = await fetch(`/api/cow-os/invoices?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Chyba');
      await fetchInvoices();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showModal && (
        <InvoiceModal
          members={members}
          onClose={() => setShowModal(false)}
          onSave={handleCreateInvoice}
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
            <h1 className="text-3xl font-bold text-gray-900">Fakturace</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Vystavit fakturu
          </button>
        </div>

        {!billingProfileExists && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Nastavte fakturační údaje</p>
              <p className="text-xs mt-1">
                Pro vystavování faktur musíte nejdříve nastavit fakturační údaje.
                <Link href={`/spravce/${slug}/cow-os/nastaveni`} className="underline hover:no-underline ml-1">
                  Přejít na nastavení
                </Link>
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mb-4">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Všechny statusy</option>
            <option value="draft">Koncept</option>
            <option value="issued">Vystaveno</option>
            <option value="paid">Zaplaceno</option>
            <option value="overdue">Po splatnosti</option>
            <option value="cancelled">Storno</option>
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
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Číslo faktury</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden sm:table-cell">Příjemce</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden md:table-cell">Vystaveno</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 hidden lg:table-cell">Splatnost</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Částka</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Akce</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map(invoice => (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden sm:table-cell">{invoice.memberName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden md:table-cell">
                          {new Date(invoice.issuedDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 hidden lg:table-cell">
                          {new Date(invoice.dueDate).toLocaleDateString('cs-CZ')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {new Intl.NumberFormat('cs-CZ').format(invoice.amount)} Kč
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[invoice.status]}`}>
                            {STATUS_LABELS[invoice.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/spravce/${slug}/cow-os/doklad/${invoice.id}`}
                              className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700 transition-colors"
                              title="Zobrazit"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {invoice.status === 'issued' && (
                              <button
                                onClick={() => handleMarkPaid(invoice.id)}
                                className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-green-700 transition-colors"
                                title="Zaplatit"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                              <button
                                onClick={() => handleCancel(invoice.id)}
                                className="p-1.5 hover:bg-red-50 rounded text-gray-400 hover:text-red-700 transition-colors"
                                title="Zrušit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invoices.length === 0 && (
                <div className="px-6 py-12 text-center text-gray-600">
                  Žádné faktury nenalezeny
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
                    disabled={invoices.length < pageSize}
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
