'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, X, AlertCircle, Loader, ChevronLeft, Edit2, Trash2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  billingInterval: 'monthly' | 'yearly';
  freeResourceHours: number;
  isActive: boolean;
  sortOrder: number;
  memberCount: number;
}

interface PlanForm {
  name: string;
  description: string;
  basePrice: number;
  billingInterval: 'monthly' | 'yearly';
  freeResourceHours: number;
  sortOrder: number;
}

function PlanModal({
  plan,
  onClose,
  onSave,
  loading,
}: {
  plan?: Plan;
  onClose: () => void;
  onSave: (data: PlanForm) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<PlanForm>({
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    basePrice: plan?.basePrice ?? 0,
    billingInterval: plan?.billingInterval ?? 'monthly',
    freeResourceHours: plan?.freeResourceHours ?? 0,
    sortOrder: plan?.sortOrder ?? 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="font-bold text-gray-900">{plan ? 'Upravit tarif' : 'Nový tarif'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Název</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="např. Startupový tarif"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Popis</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Popis tarifu pro členy..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Cena</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  required
                  value={form.basePrice}
                  onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) })}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1000"
                  step="0.01"
                />
                <span className="text-sm text-gray-600">Kč</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Interval</label>
              <select
                value={form.billingInterval}
                onChange={e => setForm({ ...form, billingInterval: e.target.value as 'monthly' | 'yearly' })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">Měsíčně</option>
                <option value="yearly">Ročně</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Volné hodiny prostředků</label>
            <input
              type="number"
              value={form.freeResourceHours}
              onChange={e => setForm({ ...form, freeResourceHours: parseFloat(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              step="0.5"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Pořadí</label>
            <input
              type="number"
              value={form.sortOrder}
              onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
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

export default function TariffsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalPlan, setModalPlan] = useState<Plan | undefined>(undefined);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPlans();
    }
  }, [slug]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/cow-os/plans?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        setPlans(data || []);
      } else {
        setError('Chyba při načítání tarifů');
      }
    } catch (err) {
      setError('Chyba při připojení k serveru');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setModalPlan(undefined);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: Plan) => {
    setModalPlan(plan);
    setShowModal(true);
  };

  const handleSavePlan = async (form: PlanForm) => {
    try {
      setSaving(true);
      setError(null);

      if (modalPlan) {
        // Update
        const res = await fetch(`/api/cow-os/plans?slug=${slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: modalPlan.id, ...form }),
        });
        if (!res.ok) throw new Error('Chyba při úpravě tarifu');
      } else {
        // Create
        const res = await fetch(`/api/cow-os/plans?slug=${slug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Chyba při vytvoření tarifu');
      }

      setShowModal(false);
      await fetchPlans();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Opravdu chcete deaktivovat tento tarif?')) return;
    try {
      const plan = plans.find(p => p.id === id);
      if (!plan) return;

      const res = await fetch(`/api/cow-os/plans?slug=${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: false }),
      });
      if (!res.ok) throw new Error('Chyba');
      await fetchPlans();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Opravdu chcete smazat tento tarif? Tuto akci nelze vrátit.')) return;
    try {
      const res = await fetch(`/api/cow-os/plans?slug=${slug}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Chyba');
      await fetchPlans();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div>
      {showModal && (
        <PlanModal
          plan={modalPlan}
          onClose={() => setShowModal(false)}
          onSave={handleSavePlan}
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
            <h1 className="text-3xl font-bold text-gray-900">Tarify</h1>
            <p className="text-gray-600 mt-1">{plans.length} tarifů</p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nový tarif
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                    </div>
                    {!plan.isActive && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Neaktivní
                      </span>
                    )}
                  </div>

                  <div className="text-3xl font-bold text-gray-900 mt-4">
                    {new Intl.NumberFormat('cs-CZ').format(plan.basePrice)} Kč
                    <span className="text-xs text-gray-600 font-normal block mt-1">
                      / {plan.billingInterval === 'monthly' ? 'měsíc' : 'rok'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volné hodiny:</span>
                    <span className="font-medium text-gray-900">{plan.freeResourceHours} h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Členové:</span>
                    <span className="font-medium text-gray-900">{plan.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pořadí:</span>
                    <span className="font-medium text-gray-900">{plan.sortOrder}</span>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 py-2 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                  >
                    <Edit2 className="w-4 h-4" />
                    Upravit
                  </button>
                  <button
                    onClick={() => {
                      if (plan.isActive) {
                        handleDeactivate(plan.id);
                      } else {
                        handleDelete(plan.id);
                      }
                    }}
                    className="flex-1 py-2 flex items-center justify-center gap-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    {plan.isActive ? 'Deaktivovat' : 'Smazat'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && plans.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Žádné tarify nenalezeny</p>
          </div>
        )}
      </div>
    </div>
  );
}
