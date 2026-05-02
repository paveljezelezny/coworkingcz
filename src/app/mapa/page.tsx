'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { coworkingsData } from '@/lib/data/coworkings';
import { CoworkingSpace } from '@/lib/types';
import { getMarkerCoords } from '@/components/GoogleMap';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from '@/components/paper-diary/tokens';
import { Stamp, PhotoPlaceholder } from '@/components/paper-diary/primitives';

// Google Maps musí načíst client-side (žádné SSR)
const GoogleMap = dynamic(() => import('@/components/GoogleMap'), { ssr: false });

const TONE_BY_CITY: Record<string, 'amber' | 'moss' | 'coral' | 'accent' | 'ink'> = {
  Praha: 'accent', Brno: 'moss', Ostrava: 'coral', Plzeň: 'amber',
};

export default function MapaPage() {
  const [coworkings, setCoworkings] = useState<CoworkingSpace[]>(coworkingsData);
  const [selectedCoworking, setSelectedCoworking] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetch('/api/admin/coworkings')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCoworkings(data); })
      .catch(() => { /* fallback to static */ });
  }, []);

  const cities = Array.from(new Set(coworkings.map((cw) => cw.city))).sort();
  const filtered = coworkings.filter((cw) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || cw.name.toLowerCase().includes(q) || cw.city.toLowerCase().includes(q);
    const matchCity = !selectedCity || cw.city.toLowerCase().includes(selectedCity.toLowerCase());
    return matchSearch && matchCity;
  });

  const mapMarkers = filtered
    .map((cw) => {
      const coords = getMarkerCoords(cw.latitude, cw.longitude, cw.city);
      if (!coords) return null;
      return {
        id: cw.id, name: cw.name, city: cw.city,
        address: cw.address ?? '',
        lat: coords.lat, lng: coords.lng,
        slug: cw.slug,
        prices: cw.prices, capacity: cw.capacity,
        isVerified: cw.isVerified,
        photoUrl: cw.photos?.[0]?.url,
      };
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      {/* Header */}
      <div style={{ padding: '24px 20px 18px', borderBottom: `1.5px solid ${PD.ink}`, background: PD.paperLt }} className="md:!pl-24 md:!pr-14 md:!py-7">
        <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.accent, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
          ↘ kde tě čekají
        </div>
        <h1 className="text-[32px] md:text-[44px]" style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.95, fontWeight: 500, margin: '0 0 14px', color: PD.ink }}>
          Mapa coworkingů
        </h1>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row" style={{ gap: 10, alignItems: 'stretch' }}>
          <input
            type="text"
            placeholder="Hledej coworking nebo město…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperWhite, fontFamily: 'inherit', fontSize: 14, outline: 'none', color: PD.ink }}
          />
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ padding: '11px 14px', border: `1.5px solid ${PD.ink}`, background: PD.paperWhite, fontFamily: 'inherit', fontSize: 14, outline: 'none', color: PD.ink, minWidth: 160 }}
          >
            <option value="">Všechna města</option>
            {cities.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
          {(searchQuery || selectedCity) && (
            <button
              onClick={() => { setSearchQuery(''); setSelectedCity(''); }}
              style={{ padding: '11px 18px', background: 'transparent', color: PD.margin, border: `1.5px solid ${PD.margin}`, fontFamily: PD_FONT_HAND, fontSize: 18, cursor: 'pointer' }}
            >
              ✕ vymazat
            </button>
          )}
        </div>
      </div>

      {/* Content: map + sidebar */}
      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 240px)', minHeight: 540 }}>
        {/* Map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: 360 }}>
          <GoogleMap
            markers={mapMarkers}
            selectedId={selectedCoworking}
            onSelect={setSelectedCoworking}
          />
        </div>

        {/* Sidebar */}
        <aside style={{ width: '100%', maxWidth: '100%', background: PD.paperLt, borderLeft: `1.5px solid ${PD.ink}`, display: 'flex', flexDirection: 'column' }} className="lg:!w-[400px] lg:!max-w-[400px]">
          <div style={{ padding: '12px 16px', borderBottom: `1px dashed ${PD.rule}`, background: PD.paperWhite, flexShrink: 0 }}>
            <span style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.5, color: PD.inkMuted, textTransform: 'uppercase' }}>
              Nalezeno <b style={{ color: PD.ink, fontFamily: PD_FONT_DISPLAY, fontSize: 18, letterSpacing: '-0.015em' }}>{filtered.length}</b>{' '}
              {filtered.length === 1 ? 'coworking' : (filtered.length >= 2 && filtered.length <= 4 ? 'coworkingy' : 'coworkingů')}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontFamily: PD_FONT_HAND, fontSize: 28, color: PD.inkMuted, marginBottom: 6, transform: 'rotate(-2deg)', display: 'inline-block' }}>
                  ¯\_(ツ)_/¯
                </div>
                <div style={{ fontSize: 13, color: PD.inkSoft }}>Žádné výsledky</div>
              </div>
            ) : filtered.map((cw, i) => {
              const isSelected = selectedCoworking === cw.id;
              const tone = TONE_BY_CITY[cw.city] || 'ink';
              return (
                <div
                  key={cw.id}
                  onClick={() => setSelectedCoworking(isSelected ? null : cw.id)}
                  style={{
                    background: PD.paperWhite,
                    border: `1.5px solid ${isSelected ? PD.margin : PD.rule}`,
                    padding: 12, position: 'relative', cursor: 'pointer',
                    transform: `rotate(${(i % 2 === 0 ? -0.3 : 0.3)}deg)`,
                    boxShadow: isSelected ? `4px 4px 0 ${PD.margin}` : '2px 3px 0 rgba(0,0,0,0.06)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                  }}
                >
                  {cw.isVerified && (
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}>
                      <Stamp rotate={4}>ověřeno</Stamp>
                    </div>
                  )}
                  {cw.photos && cw.photos[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cw.photos[0].url} alt={cw.name} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <PhotoPlaceholder label={cw.name.toLowerCase()} tone={tone} style={{ height: 110 }} />
                  )}
                  <div style={{ padding: '10px 4px 4px' }}>
                    <div style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 16, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink, marginBottom: 2 }}>
                      {cw.name}
                    </div>
                    <div style={{ fontSize: 12, color: PD.inkMuted, marginBottom: 6 }}>
                      📍 {cw.city}
                    </div>
                    {cw.shortDescription && (
                      <p style={{ fontSize: 12, color: PD.inkSoft, lineHeight: 1.4, margin: '0 0 8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {cw.shortDescription}
                      </p>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 11, color: PD.inkMuted, fontFamily: PD_FONT_MONO, marginBottom: 8 }}>
                      {cw.capacity && <span>👥 {cw.capacity} míst</span>}
                      {(cw as any).prices?.dayPass?.enabled && (cw as any).prices.dayPass.from && (
                        <span>od {(cw as any).prices.dayPass.from} Kč/den</span>
                      )}
                    </div>
                    <Link
                      href={`/coworking/${cw.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'inline-block', padding: '6px 14px', background: PD.ink, color: PD.paperWhite, fontSize: 12, fontWeight: 600, textDecoration: 'none' }}
                    >
                      Detail →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
