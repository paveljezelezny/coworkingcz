'use client';

// PDCoworkingDetail — Paper Diary detail coworkingu.
// Bere object coworkingu z server stránky (resolved + DB overrides aplikované)
// a vyrenderuje hero / amenities / popis / ceník / kontakt / mapa.
// Improvizuje doplňky, které mockup nepokrývá: foto galerie, popis, mapa.

import React, { useState } from 'react';
import Link from 'next/link';
import { AMENITY_LABELS } from '@/lib/types';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from './tokens';
import { NotebookPaper, Washi, Stamp, PhotoPlaceholder } from './primitives';

export interface PDDetailCoworking {
  name: string;
  slug: string;
  city: string;
  address?: string | null;
  zipCode?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  isVerified?: boolean;
  isFeatured?: boolean;
  capacity?: number | null;
  areaM2?: number | null;
  amenities?: string[];
  photos?: Array<{ id: string; url: string; caption?: string; isPrimary?: boolean }>;
  prices?: {
    hourly?: { enabled?: boolean; from?: number | null };
    dayPass?: { enabled?: boolean; from?: number | null };
    openSpace?: { enabled?: boolean; from?: number | null };
    fixDesk?: { enabled?: boolean; from?: number | null };
    office?: { enabled?: boolean; from?: number | null };
  };
  openingHours?: Record<string, string>;
  location?: { lat: number; lng: number };
}

const TONE_BY_CITY: Record<string, 'amber' | 'moss' | 'coral' | 'accent' | 'ink'> = {
  Praha: 'accent', Brno: 'moss', Ostrava: 'coral', Plzeň: 'amber',
  Olomouc: 'moss', Liberec: 'accent',
};

const DAY_LABEL: Record<string, string> = {
  mon: 'Po', tue: 'Út', wed: 'St', thu: 'Čt', fri: 'Pá', sat: 'So', sun: 'Ne',
};

export function PDCoworkingDetail({ cw }: { cw: PDDetailCoworking }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const tone = TONE_BY_CITY[cw.city] || 'ink';
  const photos = cw.photos || [];
  const mainPhoto = photos.find((p) => p.isPrimary) || photos[0];
  const otherPhotos = photos.filter((p) => p !== mainPhoto).slice(0, 4);

  const priceRows: Array<{ l: string; v: string | null }> = [
    { l: 'Hodina', v: cw.prices?.hourly?.from != null ? `${cw.prices.hourly.from} Kč` : null },
    { l: 'Day pass', v: cw.prices?.dayPass?.from != null ? `${cw.prices.dayPass.from} Kč` : null },
    { l: 'Open space', v: cw.prices?.openSpace?.from != null ? `${cw.prices.openSpace.from} Kč/měs` : null },
    { l: 'Fix desk', v: cw.prices?.fixDesk?.from != null ? `${cw.prices.fixDesk.from} Kč/měs` : null },
    { l: 'Kancelář', v: cw.prices?.office?.from != null ? `${cw.prices.office.from} Kč/měs` : null },
  ].filter((p) => p.v);

  const websiteUrl = cw.website?.startsWith('http') ? cw.website : (cw.website ? `https://${cw.website}` : null);
  const mapsUrl = cw.location ? `https://www.google.com/maps/search/?api=1&query=${cw.location.lat},${cw.location.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([cw.address, cw.city].filter(Boolean).join(', '))}`;

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paperLt, fontFamily: PD_FONT_BODY }}>
      {/* Breadcrumb */}
      <div style={{ padding: '12px 24px', fontFamily: PD_FONT_MONO, fontSize: 11, color: PD.inkMuted, letterSpacing: 1, textTransform: 'uppercase', borderBottom: `1px dashed ${PD.rule}` }} className="md:!px-14">
        <Link href="/coworkingy" style={{ color: PD.inkMuted, textDecoration: 'none' }}>← coworkingy</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: PD.ink }}>{cw.name}</span>
      </div>

      {/* Hero */}
      <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr]" style={{ minHeight: 380 }}>
        <div style={{ position: 'relative', minHeight: 280 }} className="md:!min-h-[420px]">
          {mainPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainPhoto.url} alt={cw.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 280 }} />
          ) : (
            <PhotoPlaceholder label={cw.name.toLowerCase()} tone={tone} style={{ minHeight: 280, height: '100%' }} />
          )}
        </div>
        <div style={{ padding: '28px 24px', position: 'relative', background: PD.paperLt }} className="md:!px-12 md:!py-9">
          <Washi color={PD.amber} seed={700} />
          {cw.isVerified && (
            <div style={{ position: 'absolute', top: 18, right: 22, zIndex: 4 }}>
              <Stamp rotate={4}>ověřeno</Stamp>
            </div>
          )}
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5, color: PD.inkMuted, marginBottom: 6 }}>
            COWORKING · {cw.city.split('·')[0].trim().toUpperCase()}
          </div>
          <h1 className="text-[34px] md:text-[52px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 1.02, fontWeight: 500, margin: '0 0 6px', color: PD.ink }}>
            {cw.name}
          </h1>
          <div style={{ fontSize: 13, color: PD.inkSoft, marginBottom: 14 }}>
            {[cw.address, cw.city].filter(Boolean).join(' · ')}
          </div>
          {cw.shortDescription && (
            <p style={{ fontFamily: PD_FONT_HAND, fontSize: 20, color: PD.ink, margin: '0 0 18px', lineHeight: 1.25 }}>
              "{cw.shortDescription}"
            </p>
          )}

          {/* Prices table */}
          {priceRows.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: 8, marginBottom: 18 }}>
              {priceRows.slice(0, 3).map((p) => (
                <div key={p.l} style={{ border: `1.5px solid ${PD.rule}`, background: PD.paperWhite, padding: '8px 12px' }}>
                  <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, color: PD.inkMuted, letterSpacing: 1, textTransform: 'uppercase' }}>{p.l}</div>
                  <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 19, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink }}>{p.v}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {websiteUrl && (
              <a href={websiteUrl} target="_blank" rel="noreferrer" style={{ padding: '12px 20px', background: PD.ink, color: PD.paperWhite, fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: `3px 3px 0 ${PD.margin}`, display: 'inline-block' }}>
                Web →
              </a>
            )}
            {cw.phone && (
              <a href={`tel:${cw.phone}`} style={{ padding: '12px 20px', background: PD.paperWhite, color: PD.ink, border: `1.5px solid ${PD.ink}`, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
                📞 {cw.phone}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Photo strip (additional) */}
      {otherPhotos.length > 0 && (
        <div style={{ padding: '14px 24px', background: PD.paper, borderTop: `1px solid ${PD.rule}` }} className="md:!px-14">
          <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 10 }}>
            {otherPhotos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p.id ?? i} src={p.url} alt={p.caption || cw.name} style={{ width: '100%', height: 130, objectFit: 'cover', display: 'block', border: `1px solid ${PD.rule}`, transform: `rotate(${(i % 2 === 0 ? -0.4 : 0.4)}deg)`, boxShadow: '2px 3px 0 rgba(0,0,0,0.07)' }} />
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {cw.description && (
        <div style={{ padding: '32px 24px', background: PD.paper, borderTop: `1px solid ${PD.rule}`, position: 'relative' }} className="md:!pl-24 md:!pr-14 md:!py-10">
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 56, width: 1, background: PD.margin, opacity: 0.6 }} className="hidden md:block" />
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, marginBottom: 10, textTransform: 'uppercase' }}>— O prostoru</div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: PD.inkSoft, margin: 0, maxWidth: 720, whiteSpace: 'pre-line' }}>
            {cw.description}
          </p>
        </div>
      )}

      {/* Amenities + opening hours */}
      <div className="grid grid-cols-1 md:grid-cols-2" style={{ borderTop: `1px solid ${PD.rule}` }}>
        {cw.amenities && cw.amenities.length > 0 && (
          <NotebookPaper style={{ padding: '24px' }}>
            <div className="md:!pl-20 md:!pr-10 md:!py-6">
              <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, marginBottom: 10, textTransform: 'uppercase' }}>— Vybavení</div>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 4 }}>
                {cw.amenities.map((a) => (
                  <div key={a} style={{ fontSize: 13, color: PD.ink, padding: '5px 0', borderBottom: `1px dotted ${PD.ruleSoft}` }}>
                    <span style={{ color: PD.moss, marginRight: 6 }}>✓</span>
                    {AMENITY_LABELS[a] || a}
                  </div>
                ))}
                {cw.capacity && (
                  <div style={{ fontSize: 13, color: PD.ink, padding: '5px 0', borderBottom: `1px dotted ${PD.ruleSoft}` }}>
                    <span style={{ color: PD.accent, marginRight: 6 }}>👥</span>
                    Kapacita: {cw.capacity} míst
                  </div>
                )}
                {cw.areaM2 && (
                  <div style={{ fontSize: 13, color: PD.ink, padding: '5px 0', borderBottom: `1px dotted ${PD.ruleSoft}` }}>
                    <span style={{ color: PD.accent, marginRight: 6 }}>📐</span>
                    Plocha: {cw.areaM2} m²
                  </div>
                )}
              </div>
            </div>
          </NotebookPaper>
        )}

        <div style={{ padding: '24px', background: PD.paperLt }} className="md:!pl-10 md:!pr-14 md:!py-6">
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, marginBottom: 10, textTransform: 'uppercase' }}>— Otevírací doba & kontakt</div>
          {cw.openingHours && Object.keys(cw.openingHours).length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', fontSize: 13, rowGap: 3, marginBottom: 16 }}>
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((d) => {
                const h = cw.openingHours?.[d];
                if (!h) return null;
                return (
                  <React.Fragment key={d}>
                    <div style={{ color: PD.inkMuted }}>{DAY_LABEL[d]}</div>
                    <div style={{ color: PD.ink }}>{h}</div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <div style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.inkSoft, lineHeight: 1.45 }}>
            {[cw.address, cw.zipCode, cw.city].filter(Boolean).join(', ')}
            {cw.phone && <><br />{cw.phone}</>}
            {cw.email && <><br />{cw.email}</>}
          </div>
          <div style={{ marginTop: 14 }}>
            <a href={mapsUrl} target="_blank" rel="noreferrer" style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.margin, textDecoration: 'none' }}>
              → otevřít v mapách
            </a>
          </div>
        </div>
      </div>

      {/* Full pricing if more rows */}
      {priceRows.length > 3 && (
        <div style={{ padding: '24px', background: PD.paper, borderTop: `1px solid ${PD.rule}` }} className="md:!pl-24 md:!pr-14 md:!py-8">
          <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, marginBottom: 10, textTransform: 'uppercase' }}>— Kompletní ceník</div>
          <div className="grid grid-cols-2 md:grid-cols-5" style={{ gap: 10 }}>
            {priceRows.map((p) => (
              <div key={p.l} style={{ border: `1.5px solid ${PD.rule}`, background: PD.paperWhite, padding: '10px 12px' }}>
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, color: PD.inkMuted, letterSpacing: 1, textTransform: 'uppercase' }}>{p.l}</div>
                <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', color: PD.ink }}>{p.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA bottom */}
      <div style={{ padding: '40px 24px', background: PD.ink, color: PD.paperLt, textAlign: 'center' }} className="md:!py-14">
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 24, color: PD.margin, marginBottom: 8 }}>chceš to vyzkoušet?</div>
        <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 18 }} className="md:!text-[36px]">
          Napiš jim a domluv si návštěvu
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {websiteUrl && (
            <a href={websiteUrl} target="_blank" rel="noreferrer" style={{ padding: '14px 24px', background: PD.paperWhite, color: PD.ink, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              Otevřít web →
            </a>
          )}
          {cw.email && (
            <a href={`mailto:${cw.email}`} style={{ padding: '14px 24px', background: PD.margin, color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>
              ✉ Napsat
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
