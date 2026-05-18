'use client';

// Karta "Změna hesla" pro profil. Otevírá inline formulář s current + new + new2.
// Volá POST /api/profile/change-password. Při úspěchu vyresetuje formulář a hodí toast.

import { useState, FormEvent } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

export default function ChangePasswordCard() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [next2, setNext2] = useState('');
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  function reset() {
    setCurrent(''); setNext(''); setNext2(''); setShow(false);
    setStatus('idle'); setMsg(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (next.length < 8) { setMsg('Nové heslo musí mít aspoň 8 znaků.'); setStatus('error'); return; }
    if (next !== next2)   { setMsg('Hesla se neshodují.'); setStatus('error'); return; }
    if (current === next) { setMsg('Nové heslo musí být jiné než to současné.'); setStatus('error'); return; }

    setStatus('sending');
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setStatus('error'); setMsg(data?.error ?? 'Nepodařilo se uložit nové heslo.'); return; }
      setStatus('done');
      setMsg('Heslo bylo změněno. Potvrzovací email letí na cestě.');
      setCurrent(''); setNext(''); setNext2('');
      setTimeout(() => { setOpen(false); reset(); }, 2200);
    } catch {
      setStatus('error');
      setMsg('Síťová chyba. Zkus to znovu.');
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-gray-500" /> Heslo
      </h3>

      {!open ? (
        <div className="text-sm">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 w-full py-2 px-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium"
          >
            Změnit heslo
          </button>
          <p className="text-xs text-gray-400 mt-2 px-3">
            Pokud heslo neznáš, použij{' '}
            <a href="/prihlaseni/zapomenute-heslo" className="underline text-orange-500">zapomenuté heslo</a>.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Současné heslo</label>
            <div className="relative">
              <input
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                value={current}
                onChange={e => setCurrent(e.target.value)}
                required
                disabled={status === 'sending'}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                aria-label="Zobrazit hesla"
              >
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nové heslo (aspoň 8 znaků)</label>
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={8}
              value={next}
              onChange={e => setNext(e.target.value)}
              required
              disabled={status === 'sending'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nové heslo znovu</label>
            <input
              type={show ? 'text' : 'password'}
              autoComplete="new-password"
              minLength={8}
              value={next2}
              onChange={e => setNext2(e.target.value)}
              required
              disabled={status === 'sending'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          </div>

          {msg && (
            <p className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{msg}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="flex-1 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {status === 'sending' ? 'Ukládám…' : 'Uložit'}
            </button>
            <button
              type="button"
              onClick={() => { setOpen(false); reset(); }}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Zrušit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
