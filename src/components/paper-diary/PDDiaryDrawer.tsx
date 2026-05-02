'use client';

// PDDiaryDrawer — slide-in panel ("můj dnešek") s hodinovým rozvrhem.
// Pavel explicitně chtěl: timeline NENÍ stále viditelný, otevírá se z navu.

import React, { useEffect } from 'react';
import { PD, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO, PD_PAPER_BG } from './tokens';

const SAMPLE_SCHEDULE: Record<number, { tag: string; label: string; note: string; tone: string }> = {
  9:  { tag: 'PROSTOR', label: 'Locus Workspace · Vinohrady',  note: '→ hluboká práce, tichá zóna', tone: 'accent' },
  12: { tag: 'UDÁLOST', label: 'Freelance Friday · Daně 2026', note: '→ 34 jde, oběd zdarma',        tone: 'amber'  },
  15: { tag: 'KÁVA',    label: 'Káva s Eliškou N. · brand',     note: '→ doporučil Tomáš',             tone: 'coral'  },
  18: { tag: 'MEETUP',  label: 'Brno.js #47 · online',          note: '→ attend remote',                tone: 'moss'   },
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export function PDDiaryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Esc to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.4)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 220ms ease',
        }}
      />
      {/* Drawer */}
      <aside
        aria-hidden={!open}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 70,
          width: 'min(420px, 92vw)',
          background: PD_PAPER_BG,
          borderLeft: `2px solid ${PD.ink}`,
          boxShadow: open ? '-12px 0 30px rgba(0,0,0,0.18)' : 'none',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)',
          fontFamily: PD_FONT_BODY,
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'sticky', top: 0,
            background: PD.paperLt,
            borderBottom: `1.5px solid ${PD.ink}`,
            padding: '18px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 2, color: PD.inkMuted, textTransform: 'uppercase' }}>
              Šuplík I.
            </div>
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 28, color: PD.ink, lineHeight: 1.1 }}>
              Můj dnešek
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Zavřít"
            style={{
              background: 'none', border: `1.5px solid ${PD.ink}`,
              width: 36, height: 36, cursor: 'pointer',
              fontSize: 16, color: PD.ink,
            }}
          >
            ✕
          </button>
        </div>

        {/* Schedule timeline */}
        <div style={{ padding: '20px 24px 40px', position: 'relative' }}>
          <div
            style={{
              position: 'absolute', top: 20, bottom: 40, left: 64, width: 1,
              background: PD.margin, opacity: 0.5,
            }}
          />
          {HOURS.map(h => {
            const slot = SAMPLE_SCHEDULE[h];
            const toneCol = slot ? (PD as Record<string, string>)[slot.tone] : null;
            return (
              <div
                key={h}
                style={{
                  display: 'grid', gridTemplateColumns: '46px 1fr', gap: 12,
                  padding: '10px 0', borderBottom: `1px dashed ${PD.ruleSoft}`,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontFamily: PD_FONT_MONO, fontSize: 11, color: PD.inkMuted, paddingTop: 2 }}>
                  {h}:00
                </div>
                {slot ? (
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontFamily: PD_FONT_MONO, fontSize: 9, letterSpacing: 1.5,
                          padding: '2px 6px', border: `1px solid ${toneCol}`, color: toneCol!,
                          textTransform: 'uppercase', fontWeight: 700,
                        }}
                      >
                        {slot.tag}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: PD.ink }}>
                        {slot.label}
                      </span>
                    </div>
                    <div style={{ fontFamily: PD_FONT_HAND, fontSize: 16, color: PD.inkMuted, marginTop: 4 }}>
                      {slot.note}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 13, color: PD.inkMuted, opacity: 0.5, fontStyle: 'italic', paddingTop: 2 }}>
                    volno
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '0 24px 30px' }}>
          <p style={{ fontFamily: PD_FONT_HAND, fontSize: 18, color: PD.inkMuted, margin: 0 }}>
            Toto je ukázka. Skutečný rozvrh propojíme s tvými rezervacemi a událostmi.
          </p>
        </div>
      </aside>
    </>
  );
}
