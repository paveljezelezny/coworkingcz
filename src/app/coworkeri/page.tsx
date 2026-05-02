'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { NotebookPaper, PaperAvatar, guessGender, Stamp, Washi } from '@/components/paper-diary/primitives';

interface Coworker {
  id: string;
  name: string;
  profession: string;
  bio: string;
  skills: string[];
  avatarUrl: string | null;
  linkedinUrl: string;
  websiteUrl: string;
  homeCoworkingSlug: string | null;
  phone: string | null;
  email: string | null;
  allowContact: boolean;
  membershipTier: string | null;
}

interface CoworkingInfo {
  slug: string;
  name: string;
  city: string;
}

// Avatar variant from string id (deterministic)
function variantFromId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  return Math.abs(hash) % 12 + 1;
}

export default function CoworkeriPage() {
  const [coworkers, setCoworkers] = useState<Coworker[]>([]);
  const [coworkings, setCoworkings] = useState<CoworkingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState<string>('Vše');
  const [view, setView] = useState<'cards' | 'list'>('cards');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetch('/api/coworkers').then((r) => r.json()).catch(() => []),
      fetch('/api/coworkings').then((r) => r.json()).catch(() => []),
    ]).then(([cwr, cw]) => {
      if (!mounted) return;
      setCoworkers(Array.isArray(cwr) ? cwr : (cwr?.coworkers || []));
      setCoworkings(Array.isArray(cw) ? cw : (cw?.coworkings || []));
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const slugToCw = useMemo(() => {
    const m = new Map<string, CoworkingInfo>();
    coworkings.forEach((x) => m.set(x.slug, x));
    return m;
  }, [coworkings]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    coworkers.forEach((c) => {
      const cw = slugToCw.get(c.homeCoworkingSlug || '');
      if (cw?.city) set.add(cw.city);
    });
    return Array.from(set).sort();
  }, [coworkers, slugToCw]);

  const filtered = useMemo(() => {
    return coworkers.filter((c) => {
      if (city !== 'Vše') {
        const cw = slugToCw.get(c.homeCoworkingSlug || '');
        if (cw?.city !== city) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = [c.name, c.profession, c.bio, ...(c.skills || [])].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [coworkers, city, search, slugToCw]);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '32px 20px 50px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-10">
          {/* Header */}
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.coral, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
            šuplík IV. ↘
          </div>
          <h1 className="text-[40px] md:text-[64px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: 0, color: PD.ink }}>
            Coworkeři
          </h1>
          <p style={{ fontSize: 14, color: PD.inkSoft, marginTop: 10, marginBottom: 24, maxWidth: 500 }}>
            {coworkers.length} lidí v komunitě. Designéři, vývojáři, marketéři, freelanceři.
          </p>

          {/* Filter panel */}
          <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)', marginBottom: 24 }}>
            <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}` }}>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 4 }}>
                Hledat
              </div>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Jméno, povolání, dovednosti…"
                style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: 16, outline: 'none', color: PD.ink }}
              />
            </div>
            <div style={{ padding: '10px 16px', borderBottom: `1.5px solid ${PD.ink}` }}>
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase', marginBottom: 6 }}>
                Město
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <button onClick={() => setCity('Vše')} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${city === 'Vše' ? PD.coral : PD.rule}`, background: city === 'Vše' ? PD.coral : PD.paperLt, color: city === 'Vše' ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>Vše</button>
                {cities.slice(0, 10).map((c) => (
                  <button key={c} onClick={() => setCity(c)} style={{ padding: '4px 10px', fontSize: 12, border: `1.5px solid ${city === c ? PD.coral : PD.rule}`, background: city === c ? PD.coral : PD.paperLt, color: city === c ? '#fff' : PD.inkSoft, fontFamily: 'inherit', cursor: 'pointer', borderRadius: 99 }}>{c}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: PD.paperLt, gap: 8, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 13 }}>
                <b style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 20, letterSpacing: '-0.015em' }}>{filtered.length}</b>
                <span style={{ color: PD.inkSoft, marginLeft: 6 }}>
                  {filtered.length === 1 ? 'coworker' : (filtered.length >= 2 && filtered.length <= 4 ? 'coworkeři' : 'coworkerů')}
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
                nikdo tu není ¯\_(ツ)_/¯
              </div>
              <div style={{ fontSize: 16, color: PD.inkSoft }}>Zkus zmírnit filtry.</div>
            </div>
          ) : view === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 18 }}>
              {filtered.map((c, i) => {
                const cw = slugToCw.get(c.homeCoworkingSlug || '');
                const gender = guessGender(c.name);
                const variant = variantFromId(c.id);
                const isExpanded = expandedId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setExpandedId(isExpanded ? null : c.id)}
                    style={{
                      gridColumn: isExpanded ? '1 / -1' : 'auto',
                      background: PD.paperWhite, border: `1.5px solid ${PD.rule}`,
                      padding: 16, transform: isExpanded ? 'none' : `rotate(${(i % 3 - 1) * 0.4}deg)`,
                      boxShadow: '3px 3px 0 rgba(0,0,0,0.07)', position: 'relative', cursor: 'pointer',
                      transition: 'transform 0.32s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {c.membershipTier && c.membershipTier !== 'free' && (
                      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 2 }}>
                        <Stamp rotate={4} color={PD.amber}>{c.membershipTier}</Stamp>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 10 }}>
                      {c.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.avatarUrl} alt={c.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${PD.ink}` }} />
                      ) : (
                        <PaperAvatar gender={gender} variant={variant} size={64} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink, lineHeight: 1.15 }}>
                          {c.name || '(bez jména)'}
                        </div>
                        {c.profession && (
                          <div style={{ fontSize: 13, color: PD.inkMuted, marginTop: 2 }}>{c.profession}</div>
                        )}
                        {cw && (
                          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.inkSoft, marginTop: 4 }}>
                            → {cw.name}, {cw.city}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Skills jako inline text, NE chips */}
                    {c.skills && c.skills.length > 0 && (
                      <div style={{ fontSize: 13, color: PD.inkSoft, lineHeight: 1.4, marginBottom: 8 }}>
                        <span style={{ fontFamily: PD_FONT_MONO, fontSize: 10, color: PD.inkMuted, letterSpacing: 1, textTransform: 'uppercase', marginRight: 6 }}>skills:</span>
                        {c.skills.join(' · ')}
                      </div>
                    )}

                    {isExpanded && c.bio && (
                      <div style={{ fontSize: 17, color: PD.inkSoft, lineHeight: 1.5, marginTop: 10, paddingTop: 10, borderTop: `1px dashed ${PD.ruleSoft}`, fontFamily: PD_FONT_HAND }}>
                        "{c.bio}"
                      </div>
                    )}

                    {isExpanded && c.allowContact && (
                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {c.email && (
                          <a href={`mailto:${c.email}`} onClick={(e) => e.stopPropagation()} style={{ padding: '7px 12px', background: PD.ink, color: PD.paperWhite, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            ✉ napsat
                          </a>
                        )}
                        {c.linkedinUrl && (
                          <a href={c.linkedinUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ padding: '7px 12px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            in
                          </a>
                        )}
                        {c.websiteUrl && (
                          <a href={c.websiteUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ padding: '7px 12px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                            web
                          </a>
                        )}
                      </div>
                    )}

                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px dashed ${PD.ruleSoft}`, textAlign: 'right' }}>
                      <span style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.margin }}>
                        {isExpanded ? '← zavřít' : 'profil →'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ background: PD.paperWhite, border: `1.5px solid ${PD.ink}`, boxShadow: '4px 4px 0 rgba(0,0,0,0.08)' }}>
              {filtered.map((c) => {
                const cw = slugToCw.get(c.homeCoworkingSlug || '');
                const gender = guessGender(c.name);
                const variant = variantFromId(c.id);
                return (
                  <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 12, padding: '10px 14px', borderBottom: `1px dashed ${PD.ruleSoft}`, alignItems: 'center' }}>
                    {c.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.avatarUrl} alt={c.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <PaperAvatar gender={gender} variant={variant} size={44} />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: PD.ink }}>{c.name || '(bez jména)'}</div>
                      <div style={{ fontSize: 12, color: PD.inkMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {c.profession}{cw ? ` · ${cw.city}` : ''}
                      </div>
                    </div>
                    {c.skills && c.skills.length > 0 && (
                      <div style={{ fontSize: 12, color: PD.inkSoft, fontFamily: PD_FONT_MONO, textAlign: 'right', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="hidden sm:block">
                        {c.skills.slice(0, 3).join(' · ')}
                      </div>
                    )}
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
