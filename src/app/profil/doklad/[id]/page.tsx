'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Printer, ArrowLeft, Download } from 'lucide-react';

// ── Typování faktury ────────────────────────────────────────────────────────

interface InvoiceData {
  id: string;
  number: string | null;
  amount: number;        // haléře
  currency: string;
  status: string;
  date: number;          // unix
  periodStart: number;
  periodEnd: number;
  description: string | null;
  pdfUrl: string | null;
  customerName: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
}

// ── Firma (dodavatel) ─────────────────────────────────────────────────────────
const SUPPLIER = {
  name:    'Cokoliv s.r.o.',
  ico:     '10696199',
  address: 'Vlkova 2725/34a',
  city:    'Praha 3 – Žižkov',
  zip:     '130 00',
  email:   'info@coworkings.cz',
  court:   'Městský soud v Praze, oddíl C, vložka 346789',
};

function formatAmount(amount: number, currency: string): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DokladPage() {
  const params  = useParams();
  const router  = useRouter();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!invoiceId) return;
    fetch(`/api/stripe/invoice-detail?id=${encodeURIComponent(invoiceId)}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setInvoice(d);
      })
      .catch(() => setError('Chyba při načítání dokladu'))
      .finally(() => setLoading(false));
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error || 'Doklad nenalezen'}</p>
        <button onClick={() => router.back()} className="text-blue-600 underline">Zpět</button>
      </div>
    );
  }

  const docNumber = invoice.number ?? invoice.id.slice(-8).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar — skrytý při tisku */}
      <div className="print:hidden bg-white border-b px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" /> Zpět
        </button>
        <div className="ml-auto flex items-center gap-3">
          {invoice.pdfUrl && (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" /> Stáhnout PDF (Stripe)
            </a>
          )}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Printer className="w-4 h-4" /> Tisk / Uložit PDF
          </button>
        </div>
      </div>

      {/* Doklad — A4 layout */}
      <div className="max-w-[794px] mx-auto my-8 print:my-0 print:max-w-none">
        <div className="bg-white shadow-sm print:shadow-none p-12 print:p-10 min-h-[1123px]">

          {/* Hlavička */}
          <div className="flex justify-between items-start mb-12">
            {/* Dodavatel */}
            <div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{SUPPLIER.name}</div>
              <div className="text-sm text-gray-600 space-y-0.5">
                <div>{SUPPLIER.address}</div>
                <div>{SUPPLIER.zip} {SUPPLIER.city}</div>
                <div className="mt-1">IČO: {SUPPLIER.ico}</div>
                <div className="text-xs text-gray-400 mt-1">{SUPPLIER.court}</div>
              </div>
            </div>

            {/* Číslo dokladu */}
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">DOKLAD</div>
              <div className="text-lg font-semibold text-gray-800">#{docNumber}</div>
              <div className="text-sm text-gray-500 mt-2">Datum: {formatDate(invoice.date)}</div>
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  Zaplaceno
                </span>
              </div>
            </div>
          </div>

          {/* Oddělovač */}
          <div className="border-t-2 border-gray-200 mb-10" />

          {/* Odběratel */}
          <div className="mb-10">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Odběratel</div>
            <div className="text-sm text-gray-700 space-y-0.5">
              {invoice.customerName && <div className="font-semibold text-gray-900">{invoice.customerName}</div>}
              <div>{invoice.customerEmail}</div>
              {invoice.customerAddress && <div className="text-gray-500">{invoice.customerAddress}</div>}
            </div>
          </div>

          {/* Položky */}
          <table className="w-full mb-10">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-widest pb-3">Popis</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest pb-3">Období</th>
                <th className="text-right text-xs font-semibold text-gray-400 uppercase tracking-widest pb-3">Částka</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-4 text-sm text-gray-800">
                  {invoice.description ?? 'Předplatné COWORKINGS.cz'}
                </td>
                <td className="py-4 text-right text-sm text-gray-500">
                  {formatDate(invoice.periodStart)} – {formatDate(invoice.periodEnd)}
                </td>
                <td className="py-4 text-right text-sm font-semibold text-gray-900">
                  {formatAmount(invoice.amount, invoice.currency)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Celková částka */}
          <div className="flex justify-end mb-12">
            <div className="w-64">
              <div className="flex justify-between py-2 text-sm text-gray-600">
                <span>Mezisoučet</span>
                <span>{formatAmount(invoice.amount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm text-gray-500">
                <span>DPH</span>
                <span>Nejsme plátci DPH</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-gray-900 text-base font-bold text-gray-900">
                <span>Celkem</span>
                <span>{formatAmount(invoice.amount, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Patička */}
          <div className="border-t border-gray-200 pt-6 text-xs text-gray-400 text-center space-y-1">
            <div>{SUPPLIER.name} · IČO {SUPPLIER.ico} · {SUPPLIER.address}, {SUPPLIER.zip} {SUPPLIER.city}</div>
            <div>{SUPPLIER.court}</div>
            <div className="mt-2 text-gray-300">Doklad vygenerován platformou COWORKINGS.cz</div>
          </div>

        </div>
      </div>
    </div>
  );
}
