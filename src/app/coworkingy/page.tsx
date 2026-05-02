'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { coworkingsData } from '@/lib/data/coworkings';
import { AMENITY_LABELS, type CoworkingSpace } from '@/lib/types';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO, toneColor } from '@/components/paper-diary/tokens';
import { NotebookPaper, Stamp, PhotoPlaceholder } from '@/components/paper-diary/primitives';

const QUICK_CITIES = ['Vše', 'Praha', 'Brno', 'Ostrava', 'Plzeň', 'Olomouc', 'Liberec'];
const TOP_AMENITIES = ['wifi', 'meeting_rooms', '24h_access', 'parking', 'kitchen', 'reception', 'events', 'phone_booth', 'printer', 'lounge', 'terrace', 'kids_zone'];
const TONE_BY_CITY: Record<string, 'amber' | 'moss' | 'coral' | 'accent' | 'ink'> = {
  Praha: 'accent', Brno: 'moss', Ostrava: 'coral', Plzeň: 'amber',
  Olomouc: 'moss', Liberec: 'accent',
};

function pluralize(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;
  if (n >= 2 && n <= 4) return few;
  return many;
}

function CoworkingyPageInner() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [cityText, setCityText] = useState(searchParams.get('city') ?? '');
  const [cityChip, setCityChip] = useState('Vše');
  const [dayMax, setDayMax] = useState(1000);
  const [monthMax, setMonthMax] = useState(15000);
  const [minCapacity, setMinCapacity] = useState(0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/coworkings', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => mounted && setCoworkings(Array.isArray(d) ? d : coworkingsData))
      .catch(() => mounted && setCoworkings(coworkingsData))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const cities = useMemo(() => {
    const counts: Record<string, number> = {};
    coworkings.forEach((cw) => { counts[cw.city] = (counts[cw.city] || 0) + 1; });
    return Object.entries(counts).map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count);
  }, [coworkings]);

  const filtered = useMemo(() => {
    let r = coworkings;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      r = r.filter((cw) => cw.name.toLowerCase().includes(q) || (cw.shortDescription || '').toLowerCase().includes(q) || cw.city.toLowerCase().includes(q));
    }
    const cityFilter = cityText.trim() || (cityChip !== 'Vše' ? cityChip : '');
    if (cityFilter) r = r.filter((cw) => cw.city.toLowerCase().includes(cityFilter.toLowerCase()));
    if (dayMax < 1000) r = r.filter((cw) => !cw.prices?.dayPass?.from || cw.prices.dayPass.from <= dayMax);
    if (monthMax < 15000) r = r.filter((cw) => !cw.prices?.openSpace?.from || cw.prices.openSpace.from <= monthMax);
    if (minCapacity > 0) r = r.filter((cw) => !cw.capacity || cw.capacity >= minCapacity);
    if (selectedAmenities.length > 0) r = r.filter((cw) => selectedAmenities.every((a) => (cw.amenities || []).includes(a)));
    // featured first
    return r.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }, [coworkings, searchQuery, cityText, cityChip, dayMax, monthMax, minCapacity, selectedAmenities]);

  const toggleAmenity = (a: string) => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const reset = () => {
    setSearchQuery(''); setCityText(''); setCityChip('Vše');
    setDayMax(1000); setMonthMax(15000); setMinCapacity(0); setSelectedAmenities([]);
  };
  const activeFilters = (searchQuery ? 1 : 0) + (cityText ? 1 : 0) + (cityChip !== 'Vše' ? 1 : 0) +
    (dayMax < 1000 ? 1 : 0) + (monthMax < 15000 ? 1 : 0) + (minCapacity > 0 ? 1 : 0) + selectedAmenities.length;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '32px 20px 50px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24, gap: 8 }}>
            <div>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                šuplík I. ↘
              </div>
              <h1 className="text-[40px] md:text-[64px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: 0, color: PD.ink }}>
                Coworkingy v ČR
              </h1>
              <p style={{ fontSize: 14, color: PD.inkSoft, marginTop: 10, maxWidth: 500 }}>
                {coworkings.length} prostorů ve {cities.length} městech. Seřazeno dle doporučení redakce.
              </p>
            </div>
            <div className="hidden md:block" style={{ fontFamily: PD_FONT_HAND, fontSize: 17, color: PD.inkMuted }}>
              ↘ str. 12 / Vol. VII
            </div>
          </div>

          {/* Filter block */}
          <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', marginBottom: 24 }}>
            {/* Row 1: search + city + toggle */}
            <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto]" style={{ borderBottom: `1px dashed ${PD.rule}` }}>
              <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }} className="md:!border-b-0 md:!border-r md:!border-r-[var(--pd-rule)] md:!border-dashed">
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Název coworkingu
                </div>
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Locus, Impact Hub, Opero…" style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, outline: 'none', color: PD.ink }} />
              </div>
              <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }} className="md:!border-b-0 md:!border-r md:!border-r-[var(--pd-rule)] md:!border-dashed">
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                  Město / lokalita
                </div>
                <input value={cityText} onChange={(e) => { setCityText(e.target.value); setCityChip('Vše'); }} placeholder="Praha 3, Vinohrady, Brno…" style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, outline: 'none', color: PD.ink }} />
              </div>
              <button onClick={() => setExpanded(!expanded)} style={{ padding: '14px 22px', background: expanded ? PD.ink : 'transparent', color: expanded ? PD.paperWhite : PD.ink, border: 'none', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {expanded ? 'Skrýt filtr' : 'Více filtrů'}
                {activeFilters > 0 && (
                  <span style={{ background: PD.margin, color: '#fff', borderRadius: 99, fontSize: 11, padding: '1px 7px', fontFamily: PD_FONT_MONO }}>
                    {activeFilters}
                  </span>
                )}
                <span style={{ fontSize: 11, opacity: 0.7 }}>{expanded ? '▲' : '▼'}</span>
              </button>
            </div>

            {/* City chips */}
            <div style={{ display: 'flex', gap: 6, padding: '10px 16px', flexWrap: 'wrap', alignItems: 'center', borderBottom: expanded ? `1px dashed ${PD.rule}` : 'none' }}>
              <span style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.inkMuted, marginRight: 4 }}>rychle:</span>
              {QUICK_CITIES.map((c) => {
                const active = cityChip === c && !cityText;
                return (
                  <button key={c} onClick={() => { setCityChip(c); setCityText(''); }} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${active ? PD.ink : PD.rule}`, background: active ? PD.ink : PD.paperWhite, color: active ? PD.paperWhite : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>
                    {c}
                  </button>
                );
              })}
            </div>

            {/* Expanded filters */}
            {expanded && (
              <div style={{ padding: '18px 18px 18px' }}>
                <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24, marginBottom: 18 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: PD.inkMuted, textTransform: 'uppercase' }}>Day pass</span>
                      <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 16, fontWeight: 500 }}>{dayMax < 1000 ? `do ${dayMax} Kč` : 'bez limitu'}</span>
                    </div>
                    <input type="range" min="100" max="1000" step="50" value={dayMax} onChange={(e) => setDayMax(+e.target.value)} style={{ width: '100%', accentColor: PD.margin }} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                      <span style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: PD.inkMuted, textTransform: 'uppercase' }}>Měsíc</span>
                      <span style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 16, fontWeight: 500 }}>{monthMax < 15000 ? `do ${monthMax.toLocaleString('cs')} Kč` : 'bez limitu'}</span>
                    </div>
                    <input type="range" min="2000" max="15000" step="500" value={monthMax} onChange={(e) => setMonthMax(+e.target.value)} style={{ width: '100%', accentColor: PD.margin }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>Kapacita (počet lidí)</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {[{ v: 0, l: 'libovolná' }, { v: 1, l: '1' }, { v: 4, l: '2–4' }, { v: 8, l: '5–8' }, { v: 20, l: '9–20' }, { v: 50, l: '20+' }].map((c) => (
                        <button key={c.v} onClick={() => setMinCapacity(c.v)} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${minCapacity === c.v ? PD.ink : PD.rule}`, background: minCapacity === c.v ? PD.ink : PD.paperLt, color: minCapacity === c.v ? PD.paperWhite : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>{c.l}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 8 }}>Vybavení</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {TOP_AMENITIES.map((a) => {
                      const on = selectedAmenities.includes(a);
                      return (
                        <button key={a} onClick={() => toggleAmenity(a)} style={{ padding: '5px 12px', fontSize: 12, border: `1.5px solid ${on ? PD.moss : PD.rule}`, background: on ? PD.moss : PD.paperLt, color: on ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 10, opacity: on ? 1 : 0.4 }}>{on ? '✓' : '+'}</span>
                          {AMENITY_LABELS[a] || a}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col md:flex-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderTop: `1.5px solid ${PD.ink}`, background: PD.paperLt, gap: 8 }}>
              <div style={{ fontSize: 13 }}>
                <b style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 20, letterSpacing: '-0.015em' }}>{filtered.length}</b>
                <span style={{ color: PD.inkSoft, marginLeft: 6 }}>
                  {pluralize(filtered.length, 'coworking nalezen', 'coworkingy nalezeny', 'coworkingů nalezeno')}
                  {activeFilters > 0 ? ` · ${activeFilters} aktivních filtrů` : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontSize: 13, flexWrap: 'wrap' }}>
                {activeFilters > 0 && (
                  <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.margin }}>
                    vymazat filtry ✕
                  </button>
                )}
                <Link href="/mapa" style={{ color: PD.inkMuted, textDecoration: 'none' }}>Zobrazit na mapě →</Link>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>
              ↻ načítám…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 36, color: PD.inkMuted, marginBottom: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>
                ¯\_(ツ)_/¯
              </div>
              <div style={{ fontSize: 16, color: PD.inkSoft }}>Nic jsme nenašli. Zkus zmírnit filtry.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 22 }}>
              {filtered.map((s, i) => {
                const photo = s.photos?.find((p) => p.isPrimary)?.url ?? s.photos?.[0]?.url;
                const tone = TONE_BY_CITY[s.city] || 'ink';
                const fromHourly = s.prices?.hourly?.from;
                const fromDay = s.prices?.dayPass?.from;
                const fromMonth = s.prices?.openSpace?.from;
                return (
                  <Link key={s.id} href={`/coworking/${s.slug}`} style={{ background: PD.paperWhite, border: `1px solid ${PD.rule}`, padding: 10, transform: `rotate(${(i % 3 - 1) * 0.4}deg)`, boxShadow: '3px 4px 0 rgba(0,0,0,0.07)', position: 'relative', textDecoration: 'none', display: 'block' }}>
                    {s.isVerified && (
                      <div style={{ position: 'absolute', top: 14, right: 14, zIndex: 2 }}>
                        <Stamp rotate={6}>ověřeno</Stamp>
                      </div>
                    )}
                    {photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={photo} alt={s.name} style={{ width: '100%', height: 170, objectFit: 'cover', display: 'block' }} />
                    ) : (
                      <PhotoPlaceholder label={s.name.toLowerCase()} tone={tone} style={{ height: 170 }} />
                    )}
                    <div style={{ padding: '12px 8px 4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 18, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink }}>
                          {s.name}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: PD.inkMuted, marginBottom: 8 }}>{s.city}</div>
                      {s.amenities && s.amenities.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
                          {s.amenities.slice(0, 4).map((t) => (
                            <span key={t} style={{ fontSize: 10, padding: '2px 7px', border: `1px solid ${selectedAmenities.includes(t) ? PD.moss : PD.rule}`, borderRadius: 99, color: selectedAmenities.includes(t) ? PD.moss : PD.inkSoft, fontFamily: PD_FONT_MONO, fontWeight: selectedAmenities.includes(t) ? 700 : 400 }}>
                              {AMENITY_LABELS[t] || t}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8, borderTop: `1px dashed ${PD.ruleSoft}`, fontSize: 11, color: PD.inkMuted, gap: 4, flexWrap: 'wrap' }}>
                        <span>
                          {fromHourly != null && <>od <b style={{ color: PD.ink, fontSize: 13 }}>{fromHourly}</b>/h</>}
                          {fromHourly == null && fromDay != null && <>den od <b style={{ color: PD.ink, fontSize: 13 }}>{fromDay} Kč</b></>}
                          {fromHourly == null && fromDay == null && fromMonth != null && <>měsíc od <b style={{ color: PD.ink, fontSize: 13 }}>{fromMonth} Kč</b></>}
                          {fromHourly == null && fromDay == null && fromMonth == null && <>cena na vyžádání</>}
                        </span>
                        <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin }}>zobrazit →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </NotebookPaper>
    </div>
  );
}

export default function CoworkingyPage() {
  return (
    <Suspense fallback={<div style={{ padding: 80, textAlign: 'center', fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.inkMuted }}>↻ načítám…</div>}>
      <CoworkingyPageInner />
    </Suspense>
  );
}
