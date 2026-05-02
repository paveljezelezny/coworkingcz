'use client';

// Paper Diary — sdílené UI primitives (Washi, Stamp, Fastener, HandUnderline,
// NotebookPaper, PhotoPlaceholder, PaperAvatar). Portováno z pd-shared.jsx
// do TypeScriptu. Všechny komponenty používají inline style (žádné CSS-in-JS),
// protože exotický design je rychlejší napsat tak.

import React, { CSSProperties } from 'react';
import { PD, PD_FONT_HAND, PD_FONT_MONO, PD_PAPER_BG, PdTone } from './tokens';

// Deterministický pseudo-random podle seedu — stejný seed = stejný vzhled
const rng = (seed: number) => (i: number) => {
  const x = Math.sin(seed * 9301 + i * 49297) * 233280;
  return x - Math.floor(x);
};

// ── Washi tape — barevný pruh s nepravidelně potrhanými konci ───────
export interface WashiProps {
  color?: string;
  width?: number;
  height?: number;
  rotate?: number;
  top?: number;
  left?: number | string;
  opacity?: number;
  seed?: number;
}

export function Washi({
  color = PD.amber,
  width,
  height,
  rotate,
  top,
  left,
  opacity = 0.9,
  seed = 1,
}: WashiProps) {
  const r = rng(seed);
  const W  = width  ?? Math.round(52 + (r(301) - 0.5) * 40);
  const H  = height ?? (16 * (1 + (r(302) - 0.5) * 0.42));
  const Rt = rotate ?? ((r(303) - 0.5) * 28);
  const T  = top    ?? Math.round(-4 + (r(304) - 0.5) * 14);
  const L  = left   ?? `${Math.round(r(305) * 70)}%`;

  const segs = 8;
  const pts: string[] = [];
  for (let i = 0; i <= segs; i++) {
    const x = (i / segs) * 100;
    const y = r(i) * 22;
    pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  pts.push(`${(96 + r(99) * 4).toFixed(1)}% ${(78 + r(98) * 12).toFixed(1)}%`);
  for (let i = segs; i >= 0; i--) {
    const x = (i / segs) * 100;
    const y = 78 + r(i + 40) * 22;
    pts.push(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
  }
  pts.push(`${(r(200) * 4).toFixed(1)}% ${(12 + r(201) * 18).toFixed(1)}%`);

  const clip = `polygon(${pts.join(', ')})`;

  return (
    <div
      style={{
        position: 'absolute', top: T, left: L,
        width: W, height: H,
        background: color, opacity,
        transform: `rotate(${Rt}deg)`,
        clipPath: clip,
        WebkitClipPath: clip,
        filter: 'drop-shadow(0 1px 0 rgba(0,0,0,0.08))',
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Stamp — pseudo razítko ────────────────────────────────────────
export function Stamp({
  children,
  color = PD.margin,
  rotate = -4,
}: {
  children: React.ReactNode;
  color?: string;
  rotate?: number;
}) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 8px',
        border: `1.5px solid ${color}`, color,
        fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1.5,
        fontWeight: 700, textTransform: 'uppercase',
        transform: `rotate(${rotate}deg)`,
        opacity: 0.85,
      }}
    >
      {children}
    </span>
  );
}

// ── Fastener — fyzický prvek (push-pin / paperclip / binderclip / safetypin / thumbtack) ──
export type FastenerKind = 'pushpin' | 'thumbtack' | 'paperclip' | 'binderclip' | 'safetypin';

export function Fastener({
  kind = 'pushpin',
  color = '#C64B3D',
  seed = 1,
}: {
  kind?: FastenerKind;
  color?: string;
  seed?: number;
}) {
  const r = rng(seed);
  const rot   = (r(1) - 0.5) * 40;
  const right = Math.round(12 + r(2) * 60);
  const top   = -6 - Math.round(r(3) * 10);

  const common: CSSProperties = {
    position: 'absolute', top, right, zIndex: 3,
    transform: `rotate(${rot}deg)`,
    transformOrigin: 'center',
    pointerEvents: 'none',
    filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.25))',
  };

  if (kind === 'pushpin') {
    return (
      <svg width="34" height="40" viewBox="0 0 34 40" style={common}>
        <ellipse cx="17" cy="36" rx="4" ry="1.2" fill="rgba(0,0,0,0.18)" />
        <line x1="17" y1="22" x2="17" y2="38" stroke="#555" strokeWidth="1.4" strokeLinecap="round" />
        <ellipse cx="17" cy="20" rx="11" ry="4" fill="#3a0a06" />
        <path d="M 6 20 Q 6 6 17 6 Q 28 6 28 20 Z" fill={color} />
        <ellipse cx="13" cy="13" rx="4" ry="5" fill="#fff" opacity="0.45" />
        <ellipse cx="12" cy="11" rx="1.5" ry="2" fill="#fff" opacity="0.8" />
      </svg>
    );
  }
  if (kind === 'thumbtack') {
    return (
      <svg width="28" height="28" viewBox="0 0 28 28" style={common}>
        <circle cx="14" cy="14" r="11" fill={color} />
        <circle cx="14" cy="14" r="11" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.8" />
        <circle cx="14" cy="14" r="3" fill="rgba(0,0,0,0.35)" />
        <circle cx="14" cy="14" r="1.2" fill="rgba(0,0,0,0.6)" />
        <path d="M 6 10 Q 10 5 18 6" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'paperclip') {
    return (
      <svg width="22" height="44" viewBox="0 0 22 44" style={{ ...common, top: top - 6 }}>
        <path
          d="M 6 4 L 6 32 Q 6 38 11 38 Q 16 38 16 32 L 16 10 Q 16 6 12 6 Q 8 6 8 10 L 8 30"
          fill="none" stroke="#9aa0a8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        />
        <path
          d="M 6 4 L 6 32 Q 6 38 11 38 Q 16 38 16 32 L 16 10 Q 16 6 12 6 Q 8 6 8 10 L 8 30"
          fill="none" stroke="#d8dce1" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === 'binderclip') {
    return (
      <svg width="38" height="28" viewBox="0 0 38 28" style={{ ...common, top: top - 2 }}>
        <path d="M 10 4 Q 12 0 19 2 Q 26 0 28 4" fill="none" stroke="#a0a4aa" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="10" cy="4" r="1.6" fill="#d0d4d8" />
        <circle cx="28" cy="4" r="1.6" fill="#d0d4d8" />
        <path d="M 4 8 L 34 8 L 30 26 L 8 26 Z" fill="#1f2328" />
        <path d="M 4 8 L 34 8 L 30 26 L 8 26 Z" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
        <path d="M 5 9 L 33 9" stroke="#4a4f56" strokeWidth="1" />
        <path d="M 9 11 L 11 24" stroke="rgba(255,255,255,0.12)" strokeWidth="0.8" />
      </svg>
    );
  }
  if (kind === 'safetypin') {
    return (
      <svg width="46" height="22" viewBox="0 0 46 22" style={{ ...common, top: top - 2 }}>
        <circle cx="8" cy="11" r="4" fill="none" stroke="#9aa0a8" strokeWidth="1.6" />
        <circle cx="8" cy="11" r="1.6" fill="#c0c4c8" />
        <line x1="11" y1="14" x2="38" y2="14" stroke="#9aa0a8" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M 38 14 Q 42 14 42 10 Q 42 6 38 6" fill="none" stroke="#9aa0a8" strokeWidth="1.6" strokeLinecap="round" />
        <line x1="38" y1="6" x2="12" y2="8" stroke="#9aa0a8" strokeWidth="1.6" strokeLinecap="round" />
        <rect x="36" y="3" width="7" height="6" rx="1" fill={color} />
        <rect x="36" y="3" width="7" height="6" rx="1" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="0.6" />
      </svg>
    );
  }
  return null;
}

// ── Hand-drawn underline (decorace pod aktivní nav položkou) ───────
export function HandUnderline({
  color = PD.margin,
  width = '100%',
  offset = -4,
}: {
  color?: string;
  width?: number | string;
  offset?: number;
}) {
  return (
    <svg
      width={width as any} height="10" viewBox="0 0 200 10" preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, right: 0, bottom: offset, pointerEvents: 'none' }}
    >
      <path d="M2,6 Q50,2 100,5 T198,4" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

// ── NotebookPaper — hlavní wrapper s linkovaným pozadím a margin čárou ──
// Margin coral čára je viditelná jen na md+ (768px+). Na mobile by vypadala
// jako rušivá svislá čára uprostřed.
export function NotebookPaper({
  children,
  style = {},
  margin = true,
}: {
  children: React.ReactNode;
  style?: CSSProperties;
  margin?: boolean;
}) {
  return (
    <div style={{ background: PD_PAPER_BG, position: 'relative', ...style }}>
      {margin && (
        <div
          className="hidden md:block"
          style={{
            position: 'absolute', top: 0, bottom: 0, left: 56, width: 1,
            background: PD.margin, opacity: 0.6,
          }}
        />
      )}
      {children}
    </div>
  );
}

// ── PhotoPlaceholder — pruhovaný "fake foto" s popiskem ──────────
export function PhotoPlaceholder({
  label = 'foto coworkingu',
  tone = 'ink',
  style = {},
}: {
  label?: string;
  tone?: PdTone;
  style?: CSSProperties;
}) {
  const [a, b] = tone === 'amber'  ? ['#e6d9b0', '#d6c38a']
              : tone === 'moss'   ? ['#c9d4bc', '#aeb99c']
              : tone === 'coral'  ? ['#e9c4b8', '#d79b89']
              : tone === 'accent' ? ['#b8c6dc', '#8ea6c4']
              :                     ['#d9d1bf', '#b8af99'];
  return (
    <div
      style={{
        position: 'relative', overflow: 'hidden',
        background: `repeating-linear-gradient(135deg, ${a} 0 14px, ${b} 14px 28px)`,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute', bottom: 8, left: 10,
          fontFamily: PD_FONT_MONO, fontSize: 10, letterSpacing: 1,
          color: PD.ink, opacity: 0.7, textTransform: 'uppercase',
        }}
      >
        ◂ {label} ▸
      </div>
    </div>
  );
}

// ── PaperAvatar — ručně kreslený SVG avatar (24 variant: 12 f + 12 m) ──
export function guessGender(name: string): 'f' | 'm' {
  const first = (name || '').trim().split(/\s+/)[0].toLowerCase();
  if (/[aeiy]$/.test(first)) return 'f';
  return 'm';
}

export function PaperAvatar({
  gender = 'f',
  variant = 1,
  size = 56,
  color,
  bg,
}: {
  gender?: 'f' | 'm';
  variant?: number;
  size?: number;
  color?: string;
  bg?: string;
}) {
  const v = ((variant - 1) % 12 + 12) % 12;
  const skin = ['#F1D9B7', '#E6BD93', '#D5A573', '#B7855A'][v % 4];
  const hairColors = ['#2A2118', '#5C3A22', '#8E6A3F', '#C28E5D', '#E0BBA5', '#9A9A9A'];
  const hair = hairColors[(v + (gender === 'f' ? 1 : 3)) % hairColors.length];
  const accent = color || PD.coral;
  const stroke = PD.ink;
  const sw = 1.4;
  const F = v + 1;
  const isF = gender === 'f';

  const hairBackF: Record<number, string> = {
    1:  'M14,30 C10,46 12,60 18,68 L18,46 C22,38 30,32 50,32 C70,32 78,38 82,46 L82,68 C88,60 90,46 86,30 C80,16 64,12 50,12 C36,12 20,16 14,30 Z',
    2:  'M16,28 Q14,52 22,72 L22,50 Q26,40 50,38 Q74,40 78,50 L78,72 Q86,52 84,28 Q72,18 50,18 Q28,18 16,28 Z',
    3:  'M22,26 Q22,44 26,58 L26,40 Q34,34 50,34 Q66,34 74,40 L74,58 Q78,44 78,26 Q66,18 50,18 Q34,18 22,26 Z',
    4:  'M14,30 C10,52 16,70 22,76 L22,46 C26,38 36,30 50,30 C64,30 74,38 78,46 L78,76 C84,70 90,52 86,30 C80,14 60,10 50,10 C40,10 20,14 14,30 Z',
    5:  'M22,28 L22,42 Q34,30 50,30 Q66,30 78,42 L78,28 Q66,18 50,18 Q34,18 22,28 Z',
    6:  'M16,30 Q12,56 22,72 L22,52 Q26,44 50,42 Q74,44 78,52 L78,72 Q88,56 84,30 Q72,18 50,18 Q28,18 16,30 Z',
    7:  'M14,30 C10,50 14,70 20,80 L20,52 C26,44 32,42 50,42 C68,42 74,44 80,52 L80,80 C86,70 90,50 86,30 C80,12 60,8 50,8 C40,8 20,12 14,30 Z',
    8:  'M20,26 Q20,40 24,52 L24,38 Q34,32 50,32 Q66,32 76,38 L76,52 Q80,40 80,26 Q66,16 50,16 Q34,16 20,26 Z',
    9:  'M16,28 Q14,46 22,64 L22,46 Q28,38 50,38 Q72,38 78,46 L78,64 Q86,46 84,28 Q70,14 50,14 Q30,14 16,28 Z',
    10: 'M22,30 Q22,44 28,56 L28,42 Q36,34 50,34 Q64,34 72,42 L72,56 Q78,44 78,30 Q66,20 50,20 Q34,20 22,30 Z',
    11: 'M14,30 C10,50 14,66 20,74 L20,48 C24,40 30,34 50,34 C70,34 76,40 80,48 L80,74 C86,66 90,50 86,30 C80,14 62,10 50,10 C38,10 20,14 14,30 Z',
    12: 'M22,28 L22,46 Q32,38 50,38 Q68,38 78,46 L78,28 Q64,18 50,18 Q36,18 22,28 Z',
  };
  const hairBackM: Record<number, string> = {
    1:  'M22,32 L22,38 Q34,30 50,30 Q66,30 78,38 L78,32 Q66,20 50,20 Q34,20 22,32 Z',
    2:  'M20,30 L20,40 Q32,32 50,32 Q68,32 80,40 L80,30 Q66,18 50,18 Q34,18 20,30 Z',
    3:  'M22,32 L22,40 Q30,30 50,30 Q70,30 78,40 L78,32 Q66,18 50,16 Q34,18 22,32 Z',
    4:  'M18,30 L18,42 Q30,30 50,30 Q70,30 82,42 L82,30 Q68,16 50,14 Q32,16 18,30 Z',
    5:  'M22,32 Q22,42 26,48 L26,38 Q36,32 50,32 Q64,32 74,38 L74,48 Q78,42 78,32 Q66,22 50,22 Q34,22 22,32 Z',
    6:  'M22,32 L22,38 Q30,30 50,28 Q70,30 78,38 L78,32 Q66,18 50,16 Q34,18 22,32 Z',
    7:  'M22,34 L22,38 Q34,32 50,32 Q66,32 78,38 L78,34 Q66,22 50,22 Q34,22 22,34 Z',
    8:  'M22,30 Q22,46 26,52 L26,40 Q36,32 50,32 Q64,32 74,40 L74,52 Q78,46 78,30 Q66,18 50,18 Q34,18 22,30 Z',
    9:  'M22,32 L22,40 Q32,30 50,30 Q68,30 78,40 L78,32 Q66,18 50,16 Q34,18 22,32 Z',
    10: 'M24,32 L24,42 Q34,32 50,32 Q66,32 76,42 L76,32 Q66,22 50,22 Q34,22 24,32 Z',
    11: 'M22,32 Q22,40 26,48 L26,40 Q36,32 50,32 Q64,32 74,40 L74,48 Q78,40 78,32 Q66,22 50,22 Q34,22 22,32 Z',
    12: 'M22,32 L22,40 Q30,28 50,26 Q70,28 78,40 L78,32 Q66,16 50,14 Q34,16 22,32 Z',
  };
  const hairBack = isF ? (hairBackF[F] ?? '') : (hairBackM[F] ?? '');

  const wearsGlasses = isF ? [3, 7, 9].includes(F) : [2, 6, 10].includes(F);
  const beard        = !isF && [4, 8, 11].includes(F);
  const mustache     = !isF && [5, 12].includes(F);
  const earring      = isF && [2, 6, 10].includes(F);
  const headband     = isF && [12].includes(F);

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: 'block' }}>
      <circle cx="50" cy="50" r="46" fill={bg || PD.paperLt} stroke={stroke} strokeWidth={sw} />
      {hairBack && <path d={hairBack} fill={hair} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />}
      <ellipse cx="50" cy="56" rx="22" ry="26" fill={skin} stroke={stroke} strokeWidth={sw} />
      <path d="M40,80 L40,90 Q50,94 60,90 L60,80" fill={skin} stroke={stroke} strokeWidth={sw} />
      <ellipse cx="42" cy="56" rx="1.6" ry="2.2" fill={stroke} />
      <ellipse cx="58" cy="56" rx="1.6" ry="2.2" fill={stroke} />
      <path d="M38,50 Q42,48 46,50" fill="none" stroke={hair} strokeWidth={sw} strokeLinecap="round" />
      <path d="M54,50 Q58,48 62,50" fill="none" stroke={hair} strokeWidth={sw} strokeLinecap="round" />
      <path d="M50,58 Q49,64 50,66 Q51,67 52,66" fill="none" stroke={stroke} strokeWidth={sw * 0.8} strokeLinecap="round" />
      {mustache && <path d="M44,71 Q50,68 56,71" fill="none" stroke={hair} strokeWidth={sw * 1.6} strokeLinecap="round" />}
      <path d={mustache ? 'M44,74 Q50,76 56,74' : 'M44,72 Q50,76 56,72'} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      {wearsGlasses && (
        <g fill="none" stroke={stroke} strokeWidth={sw * 1.2}>
          <circle cx="42" cy="56" r="5" />
          <circle cx="58" cy="56" r="5" />
          <line x1="47" y1="56" x2="53" y2="56" />
        </g>
      )}
      {beard && (
        <path d="M30,68 Q32,84 50,88 Q68,84 70,68 Q66,76 50,78 Q34,76 30,68 Z" fill={hair} stroke={stroke} strokeWidth={sw} opacity="0.9" />
      )}
      {isF && [1, 4, 6, 7, 9, 11].includes(F) && (
        <path d="M30,38 Q40,30 50,32 Q60,30 70,38 Q66,42 50,42 Q34,42 30,38 Z" fill={hair} stroke={stroke} strokeWidth={sw} />
      )}
      {!isF && [1, 3, 5, 7, 9].includes(F) && (
        <path d="M32,38 Q42,32 50,33 Q58,32 68,38 Q62,42 50,42 Q38,42 32,38 Z" fill={hair} stroke={stroke} strokeWidth={sw} />
      )}
      {headband && <path d="M28,40 Q50,34 72,40 L72,44 Q50,38 28,44 Z" fill={accent} stroke={stroke} strokeWidth={sw} />}
      {earring && <circle cx="28" cy="62" r="1.8" fill={accent} stroke={stroke} strokeWidth="0.8" />}
      <circle cx="36" cy="64" r="2.5" fill={PD.coral} opacity="0.18" />
      <circle cx="64" cy="64" r="2.5" fill={PD.coral} opacity="0.18" />
    </svg>
  );
}

// Helper: handwritten label (Caveat font)
export function HandLabel({
  children,
  color = PD.margin,
  size = 18,
  rotate = 0,
  style = {},
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: PD_FONT_HAND, color, fontSize: size,
        display: 'inline-block', transform: `rotate(${rotate}deg)`,
        lineHeight: 1, ...style,
      }}
    >
      {children}
    </span>
  );
}
