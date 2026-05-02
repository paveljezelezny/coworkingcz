'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft } from 'lucide-react';

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

export default function CowOsInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<CowOsInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !slug) return;

    fetch(`/api/cow-os/invoices/${encodeURIComponent(id)}?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error);
        } else {
          // Parse items if they come as a JSON string from the DB
          if (typeof d.items === 'string') {
            try { d.items = JSON.parse(d.items); } catch { d.items = []; }
          }
          // Ensure each item has a computed total
          if (Array.isArray(d.items)) {
            d.items = d.items.map((item: any) => ({
              ...item,
              total: item.total ?? (item.quantity * item.unitPrice),
            }));
          }
          setInvoice(d);
        }
      })
      .catch(() => setError('Chyba při načítání faktury'))
      .finally(() => setLoading(false));
  }, [id, slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{minHeight:320}}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center gap-4" style={{minHeight:320}}>
        <p className="text-red-600">{error || 'Faktura nenalezena'}</p>
        <button
          onClick={() => router.push(`/spravce/${slug}/cow-os/fakturace`)}
          className="text-blue-600 underline"
        >
          Zpět na fakturaci
        </button>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div>
      {/* Toolbar — hidden on print */}
      <div className="print:hidden bg-white border-b px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => router.push(`/spravce/${slug}/cow-os/fakturace`)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Zpět
        </button>
        <div className="ml-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Tisk
          </button>
        </div>
      </div>

      {/* Invoice — A4 layout */}
      <div className="max-w-[210mm] mx-auto my-8 print:my-0 print:max-w-none">
        <div className="bg-white shadow-sm print:shadow-none p-12 print:p-10 min-h-[297mm]">

          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            {/* Supplier (left) */}
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-2">{invoice.supplierName}</div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <div>IČO: {invoice.supplierIco}</div>
                {invoice.supplierDic && <div>DIČ: {invoice.supplierDic}</div>}
                <div className="mt-1">{invoice.supplierAddress}</div>
              </div>
            </div>

            {/* Document title (right) */}
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900 mb-2">FAKTURA</div>
              <div className="text-xl font-semibold text-gray-700">{invoice.invoiceNumber}</div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-300 mb-10" />

          {/* Two-column info section */}
          <div className="grid grid-cols-2 gap-12 mb-10">
            {/* Dodavatel (Supplier) */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Dodavatel</div>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="font-semibold text-gray-900">{invoice.supplierName}</div>
                <div>IČO: {invoice.supplierIco}</div>
                {invoice.supplierDic && <div>DIČ: {invoice.supplierDic}</div>}
                <div className="text-gray-600">{invoice.supplierAddress}</div>
                {invoice.bankAccount && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="text-xs text-gray-500">Bankovní účet:</div>
                    <div className="font-mono text-sm">{invoice.bankAccount}</div>
                  </div>
                )}
                {invoice.iban && (
                  <div className="mt-1">
                    <div className="text-xs text-gray-500">IBAN:</div>
                    <div className="font-mono text-sm">{invoice.iban}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Odběratel (Recipient) */}
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Odběratel</div>
              <div className="text-sm text-gray-700 space-y-1">
                <div className="font-semibold text-gray-900">{invoice.recipientName}</div>
                {invoice.recipientIco && <div>IČO: {invoice.recipientIco}</div>}
                {invoice.recipientAddress && <div className="text-gray-600">{invoice.recipientAddress}</div>}
              </div>
            </div>
          </div>

          {/* Invoice metadata */}
          <div className="grid grid-cols-4 gap-4 mb-10 p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Datum vystavení</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(invoice.issueDate)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Datum splatnosti</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(invoice.dueDate)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Variabilní symbol</div>
              <div className="text-sm font-semibold text-gray-900">{invoice.variableSymbol}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-gray-400 uppercase mb-1">Stav</div>
              <div>
                <span
                  className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                    isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {isPaid ? 'Zaplaceno' : 'Čeká se na zaplacení'}
                </span>
              </div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-widest pb-3">
                  Popis
                </th>
                <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-widest pb-3">
                  Množství
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-widest pb-3">
                  Cena za kus
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-widest pb-3">
                  Celkem
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100">
                  <td className="py-4 text-sm text-gray-800">{item.description}</td>
                  <td className="py-4 text-center text-sm text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-right text-sm text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-4 text-right text-sm font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals section */}
          <div className="flex justify-end mb-12">
            <div className="w-80">
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Základ:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between py-2 text-sm text-gray-600">
                  <span>DPH ({(invoice.taxRate * 100).toFixed(0)}%):</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t-2 border-gray-900 text-lg font-bold text-gray-900">
                <span>Celkem:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {/* QR Code section */}
          {invoice.qrPaymentCode && (
            <div className="flex justify-center mb-12">
              <div className="text-center">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">QR platba</div>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                    invoice.qrPaymentCode
                  )}`}
                  alt="QR Code"
                  className="w-48 h-48 border border-gray-300 p-2"
                />
                <p className="text-xs text-gray-500 mt-3">Naskenujte QR kód v mobilní bankovní aplikaci</p>
              </div>
            </div>
          )}

          {/* Paid stamp */}
          {isPaid && (
            <div className="mb-12 text-center">
              <div className="inline-block border-4 border-green-600 text-green-600 px-8 py-3 text-xl font-bold uppercase rotate-12">
                Zaplaceno
              </div>
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-gray-700">
                <strong>Poznámka:</strong> {invoice.notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 text-center space-y-1">
            <div>Vystaveno systémem COW.OS na platformě Coworkings.cz</div>
          </div>

        </div>
      </div>
    </div>
  );
}
