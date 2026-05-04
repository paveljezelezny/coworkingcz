'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CoworkingSpace } from '@/lib/types';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { Stamp } from '@/components/paper-diary/primitives';

interface CoworkingWithOverride extends CoworkingSpace {
  deleted?: boolean;
}

export default function AdminDashboard() {
  const [coworkings, setCoworkings] = useState<CoworkingWithOverride[]>([]);
  const [filteredCoworkings, setFilteredCoworkings] = useState<CoworkingWithOverride[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'city' | 'capacity'>('name');
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoworkings = async () => {
      try {
        const response = await fetch('/api/admin/coworkings');
        const data = await response.json();
        setCoworkings(data);
        setFilteredCoworkings(data);
      } catch (error) {
        console.error('Failed to fetch coworkings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCoworkings();
  }, []);

  useEffect(() => {
    let results = coworkings.filter((c) => !c.deleted);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (c.description && c.description.toLowerCase().includes(q))
      );
    }
    results.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'city') return a.city.localeCompare(b.city);
      if (sortBy === 'capacity') return (b.capacity || 0) - (a.capacity || 0);
      return 0;
    });
    setFilteredCoworkings(results);
  }, [coworkings, searchQuery, sortBy]);

  const handleDelete = async (slug: string) => {
    try {
      const response = await fetch(`/api/admin/coworkings/${slug}`, { method: 'DELETE' });
      if (!response.ok) {
        let reason = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          if (payload?.error) reason = payload.error;
        } catch {}
        throw new Error(reason);
      }
      const freshResponse = await fetch('/api/admin/coworkings');
      const data = await freshResponse.json();
      setCoworkings(data);
      setShowDeleteConfirm(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'neznámá chyba';
      alert(`Chyba při mazání: ${message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 320, fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
        ↻ načítám…
      </div>
    );
  }

  return (
    <div>
      {/* Sub-header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 20, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
          ↘ celá platforma
        </div>
        <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <h2 style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, margin: 0 }}>
            Coworkingy
          </h2>
          <Stamp color={PD.accent} rotate={4}>{filteredCoworkings.length} prostorů</Stamp>
        </div>
      </div>

      {/* Search + Add bar */}
      <div className="flex flex-col md:flex-row" style={{ gap: 10, marginBottom: 18, alignItems: 'stretch' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="🔍 Vyhledat coworking…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperWhite, fontFamily: PD_FONT_BODY, fontSize: 14, outline: 'none', color: PD.ink }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'city' | 'capacity')}
          style={{ padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperWhite, fontFamily: PD_FONT_BODY, fontSize: 13, outline: 'none', color: PD.ink, minWidth: 150 }}
        >
          <option value="name">Seřadit: Název</option>
          <option value="city">Seřadit: Město</option>
          <option value="capacity">Seřadit: Kapacita</option>
        </select>
        <Link
          href="/admin/pridat"
          style={{ padding: '11px 18px', background: PD.ink, color: PD.paperWhite, fontFamily: PD_FONT_BODY, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: `2px 2px 0 ${PD.margin}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          + Přidat
        </Link>
      </div>

      {/* List */}
      <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}>
        {/* Header row */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: '2fr 1fr 80px 100px 1fr 140px', padding: '10px 14px', borderBottom: `1.5px solid ${PD.ink}`, background: PD.paperLt, fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', color: PD.inkMuted, fontWeight: 700 }}>
          <div>Název</div>
          <div>Město</div>
          <div>Kapacita</div>
          <div>Plán</div>
          <div>Status</div>
          <div style={{ textAlign: 'right' }}>Akce</div>
        </div>

        {/* Rows */}
        {filteredCoworkings.length === 0 ? (
          <div style={{ padding: '40px 14px', textAlign: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
            ¯\_(ツ)_/¯ žádné coworkingy nebyly nalezeny
          </div>
        ) : filteredCoworkings.map((cw) => {
          const cap = cw.capacity || 0;
          let planLabel = '—';
          let planColor: string = PD.inkMuted;
          if (cap > 0 && cap < 30) { planLabel = 'Malý'; planColor = PD.inkSoft; }
          else if (cap > 0 && cap <= 60) { planLabel = 'Střední'; planColor = PD.accent; }
          else if (cap > 60) { planLabel = 'Velký'; planColor = PD.coral; }

          return (
            <div
              key={cw.id}
              className="grid grid-cols-1 md:grid-cols-[2fr_1fr_80px_100px_1fr_140px]"
              style={{ padding: '12px 14px', borderBottom: `1px dashed ${PD.ruleSoft}`, alignItems: 'center', gap: 8 }}
            >
              <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 16, fontWeight: 500, letterSpacing: '-0.01em', color: PD.ink }}>
                {cw.name}
              </div>
              <div style={{ fontSize: 13, color: PD.inkSoft }}>{cw.city}</div>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 13, color: PD.ink }}>
                {cw.capacity || '—'}
              </div>
              <div>
                {planLabel !== '—' ? (
                  <span style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1, padding: '2px 8px', border: `1px solid ${planColor}`, color: planColor, textTransform: 'uppercase', fontWeight: 700 }}>
                    {planLabel}
                  </span>
                ) : (
                  <span style={{ color: PD.inkMuted }}>—</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {cw.isVerified && <Stamp color={PD.moss} rotate={-4}>ověřeno</Stamp>}
                {cw.isFeatured && <Stamp color={PD.amber} rotate={3}>featured</Stamp>}
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Link
                  href={`/admin/${cw.slug}`}
                  style={{ fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.ink, textDecoration: 'none' }}
                >
                  ✎ upravit
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(cw.slug)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.coral }}
                >
                  ✕ smazat
                </button>
              </div>

              {/* Delete confirmation modal */}
              {showDeleteConfirm === cw.slug && (
                <div
                  onClick={() => setShowDeleteConfirm(null)}
                  style={{ position: 'fixed', inset: 0, background: 'rgba(20,15,5,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: 16 }}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '6px 6px 0 rgba(0,0,0,0.18)', padding: '24px 22px', maxWidth: 380, width: '100%' }}
                  >
                    <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.coral, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                      ↘ pozor
                    </div>
                    <h3 style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink, margin: '4px 0 8px' }}>
                      Smazat „{cw.name}"?
                    </h3>
                    <p style={{ fontSize: 13, color: PD.inkSoft, margin: '0 0 18px' }}>
                      Tuto akci nelze vrátit zpět.
                    </p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        style={{ flex: 1, padding: '10px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontFamily: PD_FONT_BODY, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                      >
                        Zrušit
                      </button>
                      <button
                        onClick={() => handleDelete(cw.slug)}
                        style={{ flex: 1, padding: '10px', background: PD.coral, color: '#fff', border: 'none', fontFamily: PD_FONT_BODY, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: `2px 2px 0 ${PD.ink}` }}
                      >
                        ✕ smazat
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
