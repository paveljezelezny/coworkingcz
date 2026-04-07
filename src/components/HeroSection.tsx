'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, Users, ShoppingBag, Building2, Calendar } from 'lucide-react';
import Link from 'next/link';
import { coworkingsData } from '@/lib/data/coworkings';

/* ─── Photo pool ─────────────────────────────────────────── */
const allPhotos = coworkingsData
  .flatMap((cw) => cw.photos.map((p) => p.url))
  .filter(Boolean);

function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── Tiles config ───────────────────────────────────────── */
// bg: dark-mode pastel; bgLight: light-mode pastel (when bg photo is bright)
const TILES = [
  {
    id: 'coworkers',
    label: 'Najdi coworkery',
    sub: 'Komunita po celém Česku',
    href: '/coworkeri',
    icon: Users,
    bg: 'bg-teal-400/25',
    bgLight: 'bg-teal-600/15',
    border: 'border-teal-300/50',
    iconColor: 'text-teal-200',
    iconColorLight: 'text-teal-800',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    sub: 'Inzeráty a nabídky',
    href: '/marketplace',
    icon: ShoppingBag,
    bg: 'bg-emerald-400/20',
    bgLight: 'bg-emerald-600/12',
    border: 'border-emerald-300/50',
    iconColor: 'text-emerald-200',
    iconColorLight: 'text-emerald-800',
  },
  {
    id: 'coworking',
    label: 'Najdi coworking',
    sub: '101+ prostorů v ČR',
    href: '/coworkingy',
    icon: Building2,
    bg: 'bg-blue-400/25',
    bgLight: 'bg-blue-600/15',
    border: 'border-blue-300/50',
    iconColor: 'text-blue-200',
    iconColorLight: 'text-blue-800',
  },
  {
    id: 'events',
    label: 'Kalendář akcí',
    sub: 'Workshopy, networking…',
    href: '/udalosti',
    icon: Calendar,
    bg: 'bg-violet-400/20',
    bgLight: 'bg-violet-600/12',
    border: 'border-violet-300/50',
    iconColor: 'text-violet-200',
    iconColorLight: 'text-violet-800',
  },
];

/* ─── Animated counter ───────────────────────────────────── */
function AnimatedCounter({
  target,
  suffix = '',
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  duration?: number;
}) {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  const formatted = value >= 1000
    ? value.toLocaleString('cs-CZ').replace(/\s/g, '\u00a0')
    : String(value);

  return <>{formatted}{suffix}</>;
}

/* ─── Stats from data ────────────────────────────────────── */
const COWORKING_COUNT = coworkingsData.length;
const CITY_COUNT = new Set(
  coworkingsData.map((cw) => (cw.city.startsWith('Praha') ? 'Praha' : cw.city))
).size;
const MEMBER_COUNT = 10_000;

/* ─── Hero tile component ────────────────────────────────── */
function HeroTile({
  tile,
  isLight,
}: {
  tile: typeof TILES[number];
  isLight: boolean;
}) {
  const Icon = tile.icon;
  const bgCls    = isLight ? tile.bgLight    : tile.bg;
  const iconCls  = isLight ? tile.iconColorLight : tile.iconColor;
  const borderCls = tile.border;

  return (
    <Link
      href={tile.href}
      className={`
        group relative flex flex-col justify-between p-5 rounded-xl
        border-2 backdrop-blur-sm
        hover:brightness-110 hover:scale-[1.02] transition-all duration-200
        ${bgCls} ${borderCls}
        min-h-[110px] sm:min-h-[120px]
      `}
    >
      <div>
        <Icon className={`w-6 h-6 mb-2 ${iconCls}`} />
        <p className={`font-bold text-base sm:text-lg leading-tight ${isLight ? 'text-gray-900' : 'text-white'}`}>
          {tile.label}
        </p>
      </div>
      <p className={`text-xs mt-1 ${isLight ? 'text-gray-700' : 'text-white/80'}`}>
        {tile.sub}
      </p>
      <span className={`
        absolute bottom-3 right-3 text-xs font-bold opacity-0 group-hover:opacity-100
        transition-opacity ${isLight ? 'text-gray-600' : 'text-white/70'}
      `}>→</span>
    </Link>
  );
}

/* ─── Main HeroSection ───────────────────────────────────── */
interface HeroSectionProps {
  cities: { city: string; count: number }[];
}

export default function HeroSection({ cities }: HeroSectionProps) {
  const [photos] = useState<string[]>(() => shuffle(allPhotos));
  const idxRef = useRef(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  const [topIdx, setTopIdx] = useState(photos.length > 1 ? 1 : 0);
  const [fading, setFading] = useState(false);
  const [isLightBg, setIsLightBg] = useState(false);

  const detectBrightness = useCallback((img: HTMLImageElement) => {
    try {
      const W = 60, H = 60;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      const margin = Math.floor(W * 0.15);
      const d = ctx.getImageData(margin, margin, W - margin * 2, H - margin * 2).data;
      let total = 0;
      for (let i = 0; i < d.length; i += 4) {
        total += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      setIsLightBg(total / (d.length / 4) > 155);
    } catch { /* CORS */ }
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const DISPLAY_MS = 20_000;
    const FADE_MS = 2_500;
    const tick = () => {
      const next = (idxRef.current + 1) % photos.length;
      setTopIdx(next);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFading(true);
          setTimeout(() => {
            idxRef.current = next;
            setBottomIdx(next);
            setFading(false);
          }, FADE_MS);
        });
      });
    };
    const interval = setInterval(tick, DISPLAY_MS);
    return () => clearInterval(interval);
  }, [photos]);

  const headlineClass = isLightBg ? 'text-gray-900 drop-shadow-sm' : 'text-white drop-shadow-lg';
  const statsTextClass = isLightBg ? 'text-gray-900' : 'text-white drop-shadow';
  const statsSubClass = isLightBg ? 'text-gray-600' : 'text-white/75';
  const overlayClass = isLightBg
    ? 'absolute inset-0 bg-gradient-to-b from-white/25 via-white/15 to-white/35'
    : 'absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* ── Photo background ── */}
      <div className="absolute inset-0 -z-10">
        <img
          key={`bottom-${bottomIdx}`}
          src={photos[bottomIdx]}
          alt=""
          aria-hidden
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={(e) => detectBrightness(e.currentTarget)}
        />
        <img
          key={`top-${topIdx}`}
          src={photos[topIdx]}
          alt=""
          aria-hidden
          crossOrigin="anonymous"
          style={{ transition: 'opacity 2500ms ease-in-out' }}
          className={`absolute inset-0 w-full h-full object-cover ${fading ? 'opacity-100' : 'opacity-0'}`}
        />
        <div className={overlayClass} style={{ transition: 'background 800ms ease' }} />
      </div>

      {/* ── Hero content ── */}
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

        {/* Headline */}
        <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-10 text-center leading-tight transition-colors duration-700 ${headlineClass}`}>
          Největší coworkingový portál v ČR
        </h1>

        {/* ── Desktop: [tiles left] [search center] [tiles right] ── */}
        {/* ── Mobile:  [4 tiles full] then [search] ── */}

        {/* Mobile tiles (2×2 grid, shown below sm) */}
        <div className="grid grid-cols-2 gap-3 mb-6 sm:hidden">
          {TILES.map(tile => (
            <HeroTile key={tile.id} tile={tile} isLight={isLightBg} />
          ))}
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden sm:block">

          {/* Row 1: tiles | form | tiles — all same height via items-stretch */}
          <div className="flex items-stretch gap-4 mb-5">

            {/* Left tiles */}
            <div className="flex flex-col gap-3 w-52 lg:w-60 flex-shrink-0">
              <HeroTile tile={TILES[0]} isLight={isLightBg} />
              <HeroTile tile={TILES[1]} isLight={isLightBg} />
            </div>

            {/* Center: form fills full height of tiles */}
            <div className="flex-1">
              <form
                method="get"
                action="/coworkingy"
                className="h-full bg-white/10 backdrop-blur-md border border-white/25 rounded-xl p-4 shadow-2xl flex flex-col justify-between gap-3"
              >
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <select
                    name="city"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    <option value="">Vyber město</option>
                    {cities.map((c) => (
                      <option key={c.city} value={c.city}>
                        {c.city} ({c.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Hledej coworking…"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Hledat coworking
                </button>
              </form>
            </div>

            {/* Right tiles */}
            <div className="flex flex-col gap-3 w-52 lg:w-60 flex-shrink-0">
              <HeroTile tile={TILES[2]} isLight={isLightBg} />
              <HeroTile tile={TILES[3]} isLight={isLightBg} />
            </div>
          </div>

          {/* Row 2: stats only below center search, spacers align with tiles */}
          <div className="flex gap-4">
            <div className="w-52 lg:w-60 flex-shrink-0" />
            <div className="flex-1 grid grid-cols-3 gap-4 text-center">
              <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                <div className={`text-3xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                  <AnimatedCounter target={COWORKING_COUNT} suffix="+" duration={1800} />
                </div>
                <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>coworkingů</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                <div className={`text-3xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                  <AnimatedCounter target={CITY_COUNT} suffix="+" duration={1800} />
                </div>
                <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>měst</p>
              </div>
              <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
                <div className={`text-3xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                  <AnimatedCounter target={MEMBER_COUNT} suffix="+" duration={2200} />
                </div>
                <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>coworkerů</p>
              </div>
            </div>
            <div className="w-52 lg:w-60 flex-shrink-0" />
          </div>

        </div>

        {/* ── Mobile: search + stats ── */}
        <div className="sm:hidden mb-4">
          <form
            method="get"
            action="/coworkingy"
            className="bg-white/10 backdrop-blur-md border border-white/25 rounded-xl p-4 space-y-3 shadow-2xl mb-6"
          >
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <select
                name="city"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              >
                <option value="">Vyber město</option>
                {cities.map((c) => (
                  <option key={c.city} value={c.city}>
                    {c.city} ({c.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                type="text"
                name="q"
                placeholder="Hledej coworking…"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Hledat coworking
            </button>
          </form>

          {/* Mobile stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className={`text-2xl font-bold ${statsTextClass}`}>
                <AnimatedCounter target={COWORKING_COUNT} suffix="+" duration={1800} />
              </div>
              <p className={`text-xs mt-1 ${statsSubClass}`}>coworkingů</p>
            </div>
            <div>
              <div className={`text-2xl font-bold ${statsTextClass}`}>
                <AnimatedCounter target={CITY_COUNT} suffix="+" duration={1800} />
              </div>
              <p className={`text-xs mt-1 ${statsSubClass}`}>měst</p>
            </div>
            <div>
              <div className={`text-2xl font-bold ${statsTextClass}`}>
                <AnimatedCounter target={MEMBER_COUNT} suffix="+" duration={2200} />
              </div>
              <p className={`text-xs mt-1 ${statsSubClass}`}>coworkerů</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
