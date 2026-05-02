'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO, toneColor, eventColor, eventTone, PD_EVENT_KIND_TONE } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi } from '@/components/paper-diary/primitives';

interface DbEvent {
  id: string;
  coworkingSlug: string;
  title: string;
  description?: string | null;
  eventType?: string | null;
  startDate: string;
  endDate?: string | null;
  isAllDay: boolean;
  isFree: boolean;
  price?: number | null;
  maxAttendees?: number | null;
  location?: string | null;
  externalUrl?: string | null;
  imageUrl?: string | null;
}

interface CoworkingItem {
  slug: string;
  name: string;
  city: string;
}

const EVENT_TYPE_TO_TAG: Record<string, keyof typeof PD_EVENT_KIND_TONE> = {
  workshop: 'Workshop',
  meetup: 'Meetup',
  networking: 'Networking',
  conference: 'Meetup',
  party: 'Komunita',
  community: 'Komunita',
  other: 'Workshop',
};

const WEEKDAY = ['NE', 'PO', 'ÚT', 'ST', 'ČT', 'PÁ', 'SO'];
const MONTH = ['LED', 'ÚNO', 'BŘE', 'DUB', 'KVĚ', 'ČER', 'ČVC', 'SRP', 'ZÁŘ', 'ŘÍJ', 'LIS', 'PRO'];
const MONTH_FULL = ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'];

function pluralEvents(n: number): string {
  if (n === 1) return 'událost';
  if (n >= 2 && n <= 4) return 'události';
  return 'událostí';
}

export default function UdalostiPage() {
  const [events, setEvents] = useState<DbEvent[]>([]);
  const [coworkings, setCoworkings] = useState<CoworkingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>('Vše');
  const [cityFilter, setCityFilter] = useState<string>('Vše');
  const [kindFilter, setKindFilter] = useState<string>('Vše');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/events').then((r) => r.json()).catch(() => ({ events: [] })),
      fetch('/api/coworkings').then((r) => r.json()).catch(() => []),
    ]).then(([evRes, cwRes]) => {
      if (!mounted) return;
      const list = Array.isArray(cwRes) ? cwRes : (cwRes?.coworkings || []);
      setEvents((evRes?.events || []).filter((e: DbEvent) => new Date(e.startDate) >= new Date(Date.now() - 86400000)));
      setCoworkings(list);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const slugToCoworking = useMemo(() => {
    const m = new Map<string, CoworkingItem>();
    coworkings.forEach((cw) => m.set(cw.slug, cw));
    return m;
  }, [coworkings]);

  // Build options
  const availableMonths = useMemo(() => {
    const set = new Set<number>();
    events.forEach((e) => set.add(new Date(e.startDate).getMonth()));
    return Array.from(set).sort((a, b) => a - b);
  }, [events]);

  const availableCities = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => {
      const cw = slugToCoworking.get(e.coworkingSlug);
      if (cw?.city) set.add(cw.city);
    });
    return Array.from(set).sort();
  }, [events, slugToCoworking]);

  const filtered = useMemo(() => {
    return events.filter((e) => {
      const d = new Date(e.startDate);
      if (monthFilter !== 'Vše' && d.getMonth() !== Number(monthFilter)) return false;
      const cw = slugToCoworking.get(e.coworkingSlug);
      if (cityFilter !== 'Vše' && cw?.city !== cityFilter) return false;
      if (kindFilter !== 'Vše') {
        const tag = EVENT_TYPE_TO_TAG[(e.eventType || '').toLowerCase()] || 'Workshop';
        if (tag !== kindFilter) return false;
      }
      return true;
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [events, monthFilter, cityFilter, kindFilter, slugToCoworking]);

  const activeFilters = (monthFilter !== 'Vše' ? 1 : 0) + (cityFilter !== 'Vše' ? 1 : 0) + (kindFilter !== 'Vše' ? 1 : 0);
  const reset = () => { setMonthFilter('Vše'); setCityFilter('Vše'); setKindFilter('Vše'); };

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '32px 20px 50px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-10">
          {/* Header */}
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.amber, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            šuplík II. ↘
          </div>
          <h1 className="text-[40px] md:text-[64px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: 0, color: PD.ink }}>
            Události
          </h1>
          <p style={{ fontSize: 14, color: PD.inkSoft, marginTop: 10, marginBottom: 24, maxWidth: 500 }}>
            {events.length} nadcházejících akcí. Workshopy, meetupy, networking, komunitní akce.
          </p>

          {/* Add event CTA */}
          <div style={{ marginBottom: 24 }}>
            <Link href="/udalosti/nova-udalost" style={{ display: 'inline-block', padding: '10px 18px', background: PD.amber, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: `2px 2px 0 ${PD.ink}` }}>
              + Přidat událost
            </Link>
          </div>

          {/* Filter panel */}
          <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', marginBottom: 28 }}>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderBottom: `1.5px solid ${PD.ink}` }}>
              {/* Month */}
              <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }} className="md:!border-b-0 md:!border-r md:!border-r-[var(--pd-rule)] md:!border-dashed">
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>Měsíc</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <button onClick={() => setMonthFilter('Vše')} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${monthFilter === 'Vše' ? PD.amber : PD.rule}`, background: monthFilter === 'Vše' ? PD.amber : PD.paperLt, color: monthFilter === 'Vše' ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>Vše</button>
                  {availableMonths.map((m) => (
                    <button key={m} onClick={() => setMonthFilter(String(m))} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${monthFilter === String(m) ? PD.amber : PD.rule}`, background: monthFilter === String(m) ? PD.amber : PD.paperLt, color: monthFilter === String(m) ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>
                      {MONTH_FULL[m]}
                    </button>
                  ))}
                </div>
              </div>
              {/* City */}
              <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }} className="md:!border-b-0 md:!border-r md:!border-r-[var(--pd-rule)] md:!border-dashed">
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>Město</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <button onClick={() => setCityFilter('Vše')} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${cityFilter === 'Vše' ? PD.accent : PD.rule}`, background: cityFilter === 'Vše' ? PD.accent : PD.paperLt, color: cityFilter === 'Vše' ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>Vše</button>
                  {availableCities.slice(0, 8).map((c) => (
                    <button key={c} onClick={() => setCityFilter(c)} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${cityFilter === c ? PD.accent : PD.rule}`, background: cityFilter === c ? PD.accent : PD.paperLt, color: cityFilter === c ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>{c}</button>
                  ))}
                </div>
              </div>
              {/* Kind */}
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>Typ</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  <button onClick={() => setKindFilter('Vše')} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${kindFilter === 'Vše' ? PD.moss : PD.rule}`, background: kindFilter === 'Vše' ? PD.moss : PD.paperLt, color: kindFilter === 'Vše' ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>Vše</button>
                  {Object.keys(PD_EVENT_KIND_TONE).map((k) => {
                    const c = toneColor(PD_EVENT_KIND_TONE[k]);
                    return (
                      <button key={k} onClick={() => setKindFilter(k)} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${kindFilter === k ? c : PD.rule}`, background: kindFilter === k ? c : PD.paperLt, color: kindFilter === k ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>{k}</button>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="flex flex-col md:flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: PD.paperLt, gap: 8 }}>
              <div style={{ fontSize: 13 }}>
                <b style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 20, letterSpacing: '-0.015em' }}>{filtered.length}</b>
                <span style={{ color: PD.inkSoft, marginLeft: 6 }}>
                  {pluralEvents(filtered.length)}
                  {activeFilters > 0 ? ` · ${activeFilters} filtrů aktivních` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {activeFilters > 0 && (
                  <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.margin }}>
                    vymazat filtry ✕
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>↻ načítám…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 36, color: PD.inkMuted, marginBottom: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>
                žádné akce ¯\_(ツ)_/¯
              </div>
              <div style={{ fontSize: 16, color: PD.inkSoft }}>V této kombinaci filtrů nic nemáme.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 18 }}>
              {filtered.map((e, i) => {
                const tag = EVENT_TYPE_TO_TAG[(e.eventType || '').toLowerCase()] || 'Workshop';
                const c = eventColor({ tag });
                const cw = slugToCoworking.get(e.coworkingSlug);
                const d = new Date(e.startDate);
                const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                const linkTarget = e.externalUrl || (cw ? `/coworking/${cw.slug}` : `/coworking/${e.coworkingSlug}`);
                return (
                  <a
                    key={e.id}
                    href={linkTarget}
                    target={e.externalUrl ? '_blank' : undefined}
                    rel={e.externalUrl ? 'noreferrer' : undefined}
                    style={{
                      display: 'grid', gridTemplateColumns: '80px 1fr', gap: 16, padding: 16,
                      background: PD.paperWhite, border: `1.5px solid ${c}`,
                      transform: `rotate(${(i % 2 ? 0.4 : -0.4)}deg)`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.06)', position: 'relative',
                      textDecoration: 'none', color: 'inherit',
                    }}
                  >
                    <Washi color={c} seed={100 + i * 7} />
                    <div style={{ textAlign: 'center', background: PD.paperLt, border: `1.5px solid ${c}`, padding: '8px 0', alignSelf: 'start' }}>
                      <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1, color: c, fontWeight: 700 }}>{WEEKDAY[d.getDay()]}</div>
                      <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 30, fontWeight: 600, lineHeight: 1, color: PD.ink }}>{d.getDate()}</div>
                      <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1, color: PD.inkMuted }}>{MONTH[d.getMonth()]}</div>
                    </div>
                    <div>
                      <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.2, color: c, textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>{tag}</div>
                      <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', marginBottom: 4, color: c }}>{e.title}</div>
                      <div style={{ fontSize: 12, color: PD.inkMuted, marginBottom: 8 }}>
                        {cw?.name || e.coworkingSlug}{cw?.city ? ` · ${cw.city}` : ''} · {time}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: `1px dashed ${PD.ruleSoft}` }}>
                        <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.inkSoft }}>
                          {e.isFree ? 'zdarma ✦' : (e.price ? `${e.price} Kč` : 'cena na dotaz')}
                        </span>
                        <span style={{ fontSize: 12, color: PD.ink, fontWeight: 600 }}>Detail →</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </NotebookPaper>
    </div>
  );
}
