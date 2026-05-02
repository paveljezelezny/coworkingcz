'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO, toneColor } from '@/components/paper-diary/tokens';
import { NotebookPaper, Washi } from '@/components/paper-diary/primitives';

type Category = 'all' | 'job_offer' | 'job_seeking' | 'service_offer' | 'service_seeking' | 'item_for_sale' | 'item_wanted';

interface ListingMeta {
  tags?: string[];
  workType?: string | null;
  experienceLevel?: string | null;
  externalUrl?: string | null;
}

interface Listing {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tags: ListingMeta;
  price: number | null;
  priceType: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  createdAt: string;
  userName: string;
  userImage: string | null;
}

const CATEGORY_LABEL: Record<string, { label: string; kind: 'Nabídka' | 'Poptávka'; tone: 'amber' | 'moss' }> = {
  job_offer:       { label: 'Nabídka práce',     kind: 'Nabídka',  tone: 'amber' },
  job_seeking:     { label: 'Hledám práci',      kind: 'Poptávka', tone: 'moss' },
  service_offer:   { label: 'Nabízím služby',    kind: 'Nabídka',  tone: 'amber' },
  service_seeking: { label: 'Hledám služby',     kind: 'Poptávka', tone: 'moss' },
  item_for_sale:   { label: 'Prodám / pronajmu', kind: 'Nabídka',  tone: 'amber' },
  item_wanted:     { label: 'Koupím / přijmu',   kind: 'Poptávka', tone: 'moss' },
};

const CATEGORIES: { v: Category; l: string }[] = [
  { v: 'all',             l: 'Vše' },
  { v: 'job_offer',       l: 'Nabídka práce' },
  { v: 'job_seeking',     l: 'Hledám práci' },
  { v: 'service_offer',   l: 'Nabízím služby' },
  { v: 'service_seeking', l: 'Hledám služby' },
  { v: 'item_for_sale',   l: 'Prodám' },
  { v: 'item_wanted',     l: 'Koupím' },
];

function ageLabel(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return 'právě teď';
  if (h < 24) return `${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} d`;
  return `${Math.floor(days / 30)} měs`;
}

function priceLabel(l: Listing): string {
  if (!l.priceType) return l.price ? `${l.price.toLocaleString('cs-CZ')} Kč` : 'Dohodou';
  if (l.priceType === 'free') return 'Zdarma';
  if (l.priceType === 'negotiable') return 'Dohodou';
  if (l.price) {
    const fmt = l.price.toLocaleString('cs-CZ');
    if (l.priceType === 'hourly') return `${fmt} Kč/h`;
    if (l.priceType === 'monthly') return `${fmt} Kč/měs`;
    return `${fmt} Kč`;
  }
  return 'Dohodou';
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/marketplace/listings')
      .then((r) => r.json())
      .then((d) => { if (mounted) setListings(Array.isArray(d) ? d : (d?.listings || [])); })
      .catch(() => mounted && setListings([]))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (category !== 'all' && l.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!l.title.toLowerCase().includes(q) && !(l.description || '').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [listings, category, search]);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '32px 20px 50px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row" style={{ alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 16, gap: 8 }}>
            <div>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.moss, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
                šuplík III. ↘
              </div>
              <h1 className="text-[40px] md:text-[64px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: 0, color: PD.ink }}>
                Marketplace
              </h1>
              <p style={{ fontSize: 14, color: PD.inkSoft, marginTop: 10, maxWidth: 500 }}>
                {listings.length} aktivních nabídek a poptávek od coworkerů.
              </p>
            </div>
            <Link href="/marketplace/nova-nabidka" style={{ padding: '10px 18px', background: PD.moss, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', boxShadow: `2px 2px 0 ${PD.ink}` }}>
              + Přidat inzerát
            </Link>
          </div>

          {/* Filter panel */}
          <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', marginBottom: 24 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }}>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Hledat
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Klíčová slova, dovednosti, lokalita…"
                style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, outline: 'none', color: PD.ink }}
              />
            </div>
            <div style={{ padding: '10px 16px', borderBottom: `1.5px solid ${PD.ink}` }}>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 8 }}>
                Kategorie
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.map((c) => {
                  const active = category === c.v;
                  const tone = c.v === 'all' ? PD.ink : (CATEGORY_LABEL[c.v]?.tone === 'moss' ? PD.moss : PD.amber);
                  return (
                    <button key={c.v} onClick={() => setCategory(c.v)} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${active ? tone : PD.rule}`, background: active ? tone : PD.paperLt, color: active ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>
                      {c.l}
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: PD.paperLt, gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13 }}>
                <b style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 20, letterSpacing: '-0.015em' }}>{filtered.length}</b>
                <span style={{ color: PD.inkSoft, marginLeft: 6 }}>
                  {filtered.length === 1 ? 'inzerát' : (filtered.length >= 2 && filtered.length <= 4 ? 'inzeráty' : 'inzerátů')}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setView('cards')} style={{ padding: '4px 12px', fontSize: 12, border: `1.5px solid ${view === 'cards' ? PD.ink : PD.rule}`, background: view === 'cards' ? PD.ink : PD.paperWhite, color: view === 'cards' ? PD.paperWhite : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer' }}>▦ karty</button>
                <button onClick={() => setView('list')} style={{ padding: '4px 12px', fontSize: 12, border: `1.5px solid ${view === 'list' ? PD.ink : PD.rule}`, background: view === 'list' ? PD.ink : PD.paperWhite, color: view === 'list' ? PD.paperWhite : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer' }}>≡ list</button>
              </div>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.inkMuted }}>↻ načítám…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ fontFamily: PD_FONT_HAND, fontSize: 36, color: PD.inkMuted, marginBottom: 8, transform: 'rotate(-2deg)', display: 'inline-block' }}>
                marketplace je tichý ¯\_(ツ)_/¯
              </div>
              <div style={{ fontSize: 16, color: PD.inkSoft }}>Buď první. Přidej inzerát nahoře.</div>
            </div>
          ) : view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 18 }}>
              {filtered.map((l, i) => {
                const cfg = CATEGORY_LABEL[l.category] || { label: l.category, kind: 'Nabídka' as const, tone: 'amber' as const };
                const c = toneColor(cfg.tone);
                const isExpanded = expandedId === l.id;
                return (
                  <div
                    key={l.id}
                    onClick={() => setExpandedId(isExpanded ? null : l.id)}
                    style={{
                      gridColumn: isExpanded ? '1 / -1' : 'auto',
                      background: PD.paperWhite, border: `1.5px solid ${PD.rule}`,
                      padding: 16, transform: isExpanded ? 'none' : `rotate(${(i % 3 - 1) * 0.4}deg)`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.07)', position: 'relative', cursor: 'pointer',
                    }}
                  >
                    <Washi color={c} seed={200 + i * 11} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 8 }}>
                      <span style={{ fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1.2, fontWeight: 700, padding: '2px 6px', border: `1px solid ${c}`, color: c, textTransform: 'uppercase' }}>
                        {cfg.kind}
                      </span>
                      <span style={{ fontFamily: PD_FONT_MONO, fontSize: 10, color: PD.inkMuted }}>{ageLabel(l.createdAt)}</span>
                    </div>
                    <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink, marginBottom: 4, lineHeight: 1.2 }}>
                      {l.title}
                    </div>
                    <div style={{ fontSize: 12, color: PD.inkMuted, marginBottom: 8 }}>
                      {l.userName}{l.location ? ` · ${l.location}` : ''}
                    </div>
                    {isExpanded && l.description && (
                      <div style={{ fontSize: 14, color: PD.inkSoft, lineHeight: 1.5, marginBottom: 12, paddingTop: 10, borderTop: `1px dashed ${PD.ruleSoft}`, whiteSpace: 'pre-line' }}>
                        {l.description}
                      </div>
                    )}
                    {isExpanded && (l.contactEmail || l.contactPhone) && (
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                        {l.contactEmail && (
                          <a href={`mailto:${l.contactEmail}`} onClick={(e) => e.stopPropagation()} style={{ padding: '8px 14px', background: PD.ink, color: PD.paperWhite, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            ✉ {l.contactEmail}
                          </a>
                        )}
                        {l.contactPhone && (
                          <a href={`tel:${l.contactPhone}`} onClick={(e) => e.stopPropagation()} style={{ padding: '8px 14px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            📞 {l.contactPhone}
                          </a>
                        )}
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 8, borderTop: `1px dashed ${PD.ruleSoft}` }}>
                      <span style={{ fontFamily: PD_FONT_MONO, fontSize: 13, color: PD.ink, fontWeight: 600 }}>{priceLabel(l)}</span>
                      <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin }}>{isExpanded ? '← zavřít' : 'detail →'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}>
              {filtered.map((l) => {
                const cfg = CATEGORY_LABEL[l.category] || { label: l.category, kind: 'Nabídka' as const, tone: 'amber' as const };
                const c = toneColor(cfg.tone);
                return (
                  <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 14, padding: '12px 14px', borderBottom: `1px dashed ${PD.ruleSoft}`, alignItems: 'center' }}>
                    <span style={{ fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1.2, fontWeight: 700, padding: '4px 0', textAlign: 'center', color: c, border: `1px solid ${c}`, textTransform: 'uppercase' }}>
                      {cfg.kind}
                    </span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: PD.ink, marginBottom: 2 }}>{l.title}</div>
                      <div style={{ fontSize: 12, color: PD.inkMuted }}>{l.userName}{l.location ? ` · ${l.location}` : ''} · {ageLabel(l.createdAt)}</div>
                    </div>
                    <div style={{ fontFamily: PD_FONT_MONO, fontSize: 12, color: PD.ink, textAlign: 'right', whiteSpace: 'nowrap' }}>{priceLabel(l)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </NotebookPaper>
    </div>
  );
}
