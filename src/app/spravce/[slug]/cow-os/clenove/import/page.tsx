'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Upload, Download, AlertCircle, Loader, ChevronLeft, FileText, Check, X,
} from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  basePrice: number;
  billingInterval: string;
  isActive: boolean;
}

interface ParsedRow {
  email: string;
  name: string;
  planName?: string;
  phone?: string;
  company?: string;
  ico?: string;
  notes?: string;
  autoRenew?: boolean;
  _rowNum: number;
  _error?: string;
}

interface ImportResult {
  imported: number;
  total: number;
  remainingCapacity: number;
  skipped: { row: number; email: string; reason: string }[];
}

const REQUIRED_COLS = ['email', 'name'];
const ALL_COLS = ['email', 'name', 'planName', 'phone', 'company', 'ico', 'notes', 'autoRenew'];

/**
 * Parse a CSV/TSV string into rows of records.
 * Handles: UTF-8 BOM, comma OR semicolon delimiters (auto-detect), quoted fields, CRLF.
 */
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  // Strip BOM
  if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);

  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  // Auto-detect delimiter: pick whichever appears more in header
  const firstLine = lines[0];
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semiCount = (firstLine.match(/;/g) || []).length;
  const tabCount = (firstLine.match(/\t/g) || []).length;
  const delim = tabCount > commaCount && tabCount > semiCount
    ? '\t'
    : (semiCount > commaCount ? ';' : ',');

  function splitLine(line: string): string[] {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQuotes) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') { inQuotes = false; }
        else cur += c;
      } else {
        if (c === '"') inQuotes = true;
        else if (c === delim) { result.push(cur); cur = ''; }
        else cur += c;
      }
    }
    result.push(cur);
    return result.map(s => s.trim());
  }

  const headers = splitLine(lines[0]).map(h => h.toLowerCase().trim());
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = splitLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] || '').trim();
    });
    rows.push(row);
  }
  return { headers, rows };
}

const TEMPLATE_CSV = `email,name,planName,phone,company,ico,notes,autoRenew
jan.novak@example.com,Jan Novák,Měsíční fix desk,+420 777 123 456,Acme s.r.o.,12345678,Klient od ledna,true
marie.svoboda@example.com,Marie Svobodová,Day pass,,,,,true
`;

export default function BulkImportPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [plans, setPlans] = useState<Plan[]>([]);
  const [defaultPlanId, setDefaultPlanId] = useState<string>('');
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/cow-os/plans?slug=${slug}`)
      .then(r => r.ok ? r.json() : [])
      .then(setPlans)
      .catch(() => setPlans([]));
  }, [slug]);

  const handleFile = async (file: File) => {
    setError(null);
    setResult(null);
    setFileName(file.name);
    try {
      const text = await file.text();
      const { headers: hdrs, rows } = parseCsv(text);

      // Validate required columns present
      const missing = REQUIRED_COLS.filter(c => !hdrs.includes(c));
      if (missing.length > 0) {
        setError(`Chybí povinné sloupce: ${missing.join(', ')}. Stáhněte si šablonu níže.`);
        setParsed(null);
        setHeaders([]);
        return;
      }

      const parsedRows: ParsedRow[] = rows.map((r, i) => ({
        email: r.email || '',
        name: r.name || '',
        planName: r.planname || r['plan'] || r['planname'] || undefined,
        phone: r.phone || undefined,
        company: r.company || undefined,
        ico: r.ico || undefined,
        notes: r.notes || undefined,
        autoRenew: r.autorenew === 'false' || r.autorenew === '0' ? false : true,
        _rowNum: i + 2, // +2 because: +1 for header, +1 for 1-indexed
      }));

      // Client-side preview validation (visual only — server is the source of truth)
      const planNames = new Set(plans.map(p => p.name.toLowerCase()));
      parsedRows.forEach(row => {
        if (!row.email || !row.name) {
          row._error = 'Chybí email nebo jméno';
        } else if (!row.email.includes('@')) {
          row._error = 'Neplatný email';
        } else if (row.planName && !planNames.has(row.planName.toLowerCase()) && !defaultPlanId) {
          row._error = `Plán "${row.planName}" nenalezen — nastavte výchozí plán`;
        }
      });

      setParsed(parsedRows);
      setHeaders(hdrs);
    } catch (err) {
      setError('Chyba při čtení souboru: ' + ((err as Error).message || 'unknown'));
    }
  };

  const handleImport = async () => {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`/api/cow-os/members/bulk-import?slug=${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: parsed.map(r => ({
            email: r.email,
            name: r.name,
            planName: r.planName,
            phone: r.phone,
            company: r.company,
            ico: r.ico,
            notes: r.notes,
            autoRenew: r.autoRenew,
          })),
          defaultPlanId: defaultPlanId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Chyba při importu');
        return;
      }
      setResult(data);
    } catch (err) {
      setError('Chyba sítě: ' + ((err as Error).message || 'unknown'));
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob(['﻿' + TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cow-os-clenove-sablona.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const preview = parsed?.slice(0, 10) || [];
  const errorCount = parsed?.filter(r => r._error).length || 0;
  const okCount = (parsed?.length || 0) - errorCount;

  return (
    <div>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href={`/spravce/${slug}/cow-os/clenove`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="w-4 h-4" />
          Zpět na členy
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Upload className="w-7 h-7 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Hromadný import členů</h1>
        </div>
        <p className="text-gray-600 mb-8">
          Naimportuj všechny své existující coworkery najednou z CSV nebo Excel exportu. Maximum 500 řádků na jeden import.
        </p>

        {/* Step 1: Template */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Krok 1 — Stáhni šablonu</h2>
              <p className="text-sm text-gray-600">
                Otevři v Excelu nebo Google Sheets, vyplň své členy, ulož jako CSV (UTF-8). Povinné sloupce: <code className="bg-gray-100 px-1 rounded">email</code>, <code className="bg-gray-100 px-1 rounded">name</code>.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium flex items-center gap-2 flex-shrink-0"
            >
              <Download className="w-4 h-4" />
              Stáhnout šablonu
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-3">
            Sloupce: {ALL_COLS.map(c => (
              <span key={c} className="inline-block mr-2">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded">{c}</code>
                {REQUIRED_COLS.includes(c) && <span className="text-red-600 ml-0.5">*</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Step 2: Default plan */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Krok 2 — Výchozí plán (nepovinné)</h2>
          <p className="text-sm text-gray-600 mb-3">
            Pokud řádek v CSV nemá vyplněný <code className="bg-gray-100 px-1 rounded">planName</code>, použije se tento plán. Pokud máš v CSV vyplněné planName, tato volba se ignoruje.
          </p>
          <select
            value={defaultPlanId}
            onChange={e => setDefaultPlanId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">— bez výchozího plánu —</option>
            {plans.filter(p => p.isActive).map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.basePrice} Kč / {p.billingInterval === 'yearly' ? 'rok' : 'měsíc'})
              </option>
            ))}
          </select>
          {plans.filter(p => p.isActive).length === 0 && (
            <p className="text-sm text-amber-700 mt-2">
              ⚠️ Žádné aktivní plány. Nejdřív vytvoř <Link href={`/spravce/${slug}/cow-os/tarify`} className="underline">v sekci Tarify</Link>.
            </p>
          )}
        </div>

        {/* Step 3: Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">Krok 3 — Nahraj soubor</h2>
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={e => { e.preventDefault(); }}
            onDrop={e => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
          >
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-700">
              {fileName ? `Vybráno: ${fileName}` : 'Klikni nebo přetáhni CSV soubor'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Excel ulož jako "CSV UTF-8 (oddělený čárkami)"</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            accept=".csv,text/csv"
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
            className="hidden"
          />
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Preview */}
        {parsed && parsed.length > 0 && !result && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Krok 4 — Náhled ({parsed.length} řádků)
              </h2>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-green-700">
                  <Check className="w-4 h-4" /> {okCount} v pořádku
                </span>
                {errorCount > 0 && (
                  <span className="flex items-center gap-1 text-red-700">
                    <X className="w-4 h-4" /> {errorCount} s chybou
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto mb-4 max-h-96 border rounded">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Jméno</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Plán</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Firma</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-700">Stav</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map(row => (
                    <tr key={row._rowNum} className={row._error ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-500">{row._rowNum}</td>
                      <td className="px-3 py-2">{row.email}</td>
                      <td className="px-3 py-2">{row.name}</td>
                      <td className="px-3 py-2">{row.planName || (defaultPlanId ? '(výchozí)' : <span className="text-red-600">—</span>)}</td>
                      <td className="px-3 py-2">{row.company || ''}</td>
                      <td className="px-3 py-2">
                        {row._error ? (
                          <span className="text-red-700 text-xs">{row._error}</span>
                        ) : (
                          <span className="text-green-700 text-xs">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.length > 10 && (
              <p className="text-xs text-gray-500 mb-4">Zobrazeno prvních 10 řádků z {parsed.length}.</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleImport}
                disabled={importing || okCount === 0}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg font-medium flex items-center gap-2"
              >
                {importing ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {importing ? 'Importuji…' : `Importovat ${okCount} členů`}
              </button>
              <button
                onClick={() => { setParsed(null); setFileName(''); setHeaders([]); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Zrušit
              </button>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-6 h-6 text-green-700" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Import dokončen</h2>
                <p className="text-sm text-gray-600">
                  Naimportováno {result.imported} z {result.total} řádků. Zbývající kapacita: {result.remainingCapacity}.
                </p>
              </div>
            </div>

            {result.skipped.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Přeskočeno ({result.skipped.length}):</h3>
                <div className="max-h-64 overflow-y-auto border rounded">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">#</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Email</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-700">Důvod</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.skipped.map((s, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2 text-gray-500">{s.row}</td>
                          <td className="px-3 py-2">{s.email}</td>
                          <td className="px-3 py-2 text-red-700">{s.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <Link
                href={`/spravce/${slug}/cow-os/clenove`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Zobrazit členy →
              </Link>
              <button
                onClick={() => { setResult(null); setParsed(null); setFileName(''); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              >
                Naimportovat další dávku
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
