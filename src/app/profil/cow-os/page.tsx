'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface CowOsInvoice {
  id: string;
  coworkingSlug: string;
  memberId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  paidDate: string | null;
  status: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  currency: string;
  items: InvoiceItem[];
  supplierName: string;
  supplierIco: string;
  supplierDic: string | null;
  supplierAddress: string;
  recipientName: string;
  recipientIco: string | null;
  recipientAddress: string | null;
  bankAccount: string | null;
  iban: string | null;
  variableSymbol: string;
  qrPaymentCode: string | null;
  notes: string | null;
  memberName?: string;
  memberEmail?: string;
}

interface PaginatedResponse {
  invoices: CowOsInvoice[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ── Formatting helpers ─────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatCurrency(amount: number): string {
  return `${new Intl.NumberFormat('cs-CZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}\u00a0Kč`;
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function CowOsMembershipsPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<CowOsInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/cow-os/invoices?member=true')
      .then((r) => r.json())
      .then((d: PaginatedResponse) => {
        if (d.invoices) {
          setInvoices(d.invoices);
        } else {
          setError('Chyba při načítání faktur');
        }
      })
      .catch(() => setError('Chyba při připojení k serveru'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  // Group invoices by coworkingSlug
  const groupedByCoworking: Record<string, CowOsInvoice[]> = {};
  invoices.forEach((invoice) => {
    const slug = invoice.coworkingSlug;
    if (!groupedByCoworking[slug]) {
      groupedByCoworking[slug] = [];
    }
    groupedByCoworking[slug].push(invoice);
  });

  const coworkingSlugs = Object.keys(groupedByCoworking);
  const hasInvoices = coworkingSlugs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Moje členství v coworkingech 🏢
          </h1>
          <p className="text-gray-600 mt-2">Sledujte své faktury a předplatná</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {!hasInvoices ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Zatím nejste členem žádného coworkingu přes COW.OS.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {coworkingSlugs.map((slug) => {
              const coworkingInvoices = groupedByCoworking[slug];
              // Get coworking name from first invoice (all have same supplier/coworking)
              const firstInvoice = coworkingInvoices[0];
              const coworkingName = firstInvoice.supplierName || slug;

              return (
                <div key={slug} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-200">
                    <h2 className="text-xl font-bold text-gray-900">{coworkingName}</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {coworkingInvoices.length} {coworkingInvoices.length === 1 ? 'faktura' : 'faktur'}
                    </p>
                  </div>

                  {/* Invoices Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Číslo
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Datum
                          </th>
                          <th className="text-left text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Splatnost
                          </th>
                          <th className="text-right text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Částka
                          </th>
                          <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Stav
                          </th>
                          <th className="text-center text-xs font-semibold text-gray-600 uppercase tracking-widest px-6 py-4">
                            Akce
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coworkingInvoices.map((invoice) => {
                          const isPaid = invoice.status === 'paid';
                          return (
                            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                {invoice.invoiceNumber}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(invoice.issueDate)}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {formatDate(invoice.dueDate)}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                                {formatCurrency(invoice.total)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span
                                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                                    isPaid
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {isPaid ? 'Zaplaceno' : 'Čeká se'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() =>
                                    router.push(`/profil/cow-os/doklad/${invoice.id}`)
                                  }
                                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                                >
                                  <FileText className="w-4 h-4" />
                                  Doklad
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
