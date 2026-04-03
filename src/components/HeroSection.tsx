'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search } from 'lucide-react';
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

/* ─── Stats from data ────────────────────────────────────── */
const COWORKING_COUNT = coworkingsData.length; // 101
const CITY_COUNT = new Set(
  coworkingsData.map((cw) => (cw.city.startsWith('Praha') ? 'Praha' : cw.city))
).size; // 36
const MEMBER_COUNT = 10_000;

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
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  /* Format with Czech non-breaking space thousands separator */
  const formatted = value >= 1000
    ? value.toLocaleString('cs-CZ').replace(/\s/g, '\u00a0')
    : String(value);

  return <>{formatted}{suffix}</>;
}

/* ─── Main HeroSection ───────────────────────────────────── */
interface HeroSectionProps {
  cities: { city: string; count: number }[];
}

export default function HeroSection({ cities }: HeroSectionProps) {
  /* Photo rotation state */
  const [photos] = useState<string[]>(() => shuffle(allPhotos));
  const idxRef = useRef(0);
  const [bottomIdx, setBottomIdx] = useState(0);
  const [topIdx, setTopIdx] = useState(photos.length > 1 ? 1 : 0);
  const [fading, setFading] = useState(false);

  /* Brightness detection state */
  const [isLightBg, setIsLightBg] = useState(false);

  /* Detect brightness from a loaded <img> element via canvas */
  const detectBrightness = useCallback((img: HTMLImageElement) => {
    try {
      const W = 60, H = 60;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, W, H);
      // Sample centre region (skip outer 15%)
      const margin = Math.floor(W * 0.15);
      const d = ctx.getImageData(margin, margin, W - margin * 2, H - margin * 2).data;
      let total = 0;
      for (let i = 0; i < d.length; i += 4) {
        total += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      }
      const avg = total / (d.length / 4);
      setIsLightBg(avg > 155);
    } catch {
      // CORS or other failure → keep current value
    }
  }, []);

  /* Photo rotation interval */
  useEffect(() => {
    if (photos.length < 2) return;
    const DISPLAY_MS = 10_000;
    const FADE_MS = 1_200;

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

  /* Derived text/overlay classes based on background brightness */
  const headlineClass = isLightBg
    ? 'text-gray-900 drop-shadow-sm'
    : 'text-white drop-shadow-lg';
  const subtitleClass = isLightBg
    ? 'text-gray-700 drop-shadow-sm'
    : 'text-white/85 drop-shadow';
  const statsTextClass = isLightBg ? 'text-gray-900' : 'text-white drop-shadow';
  const statsSubClass = isLightBg ? 'text-gray-600' : 'text-white/75';
  const gradientSpanClass = isLightBg
    ? 'text-blue-700'
    : 'bg-gradient-to-r from-blue-300 to-orange-300 bg-clip-text text-transparent';
  const overlayClass = isLightBg
    ? 'absolute inset-0 bg-gradient-to-b from-white/25 via-white/15 to-white/35'
    : 'absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">

      {/* ── Photo background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Bottom layer – always fully visible */}
        <img
          key={`bottom-${bottomIdx}`}
          src={photos[bottomIdx]}
          alt=""
          aria-hidden
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={(e) => detectBrightness(e.currentTarget)}
        />

        {/* Top layer – fades in over bottom */}
        <img
          key={`top-${topIdx}`}
          src={photos[topIdx]}
          alt=""
          aria-hidden
          crossOrigin="anonymous"
          style={{ transition: 'opacity 1200ms ease-in-out' }}
          className={`absolute inset-0 w-full h-full object-cover ${fading ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Adaptive gradient overlay */}
        <div className={overlayClass} style={{ transition: 'background 800ms ease' }} />
      </div>

      {/* ── Hero content ── */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="text-center animate-fade-in">

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight transition-colors duration-700 ${headlineClass}`}
          >
            Najdi svůj coworking
            <br />
            <span className={`transition-colors duration-700 ${gradientSpanClass}`}>
              v celém Česku
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-lg sm:text-xl mb-8 max-w-2xl mx-auto transition-colors duration-700 ${subtitleClass}`}>
            Propojujeme coworkery s moderními prostory pro práci. Vybírej ze{' '}
            <strong>{COWORKING_COUNT}+</strong> coworkingů v{' '}
            <strong>{CITY_COUNT}+</strong> městech a najdi si místo, kde ti bude práce létat.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <form
              method="get"
              action="/coworkingy"
              className="bg-white/10 backdrop-blur-md border border-white/25 rounded-xl p-4 space-y-4 sm:space-y-0 sm:flex gap-4 shadow-2xl"
            >
              {/* City dropdown */}
              <div className="flex-1 relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <select
                  name="city"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                >
                  <option value="">Vyber město</option>
                  {cities.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city} ({c.count})
                    </option>
                  ))}
                </select>
              </div>

              {/* Text search */}
              <div className="flex-1 relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <input
                  type="text"
                  name="q"
                  placeholder="Hledej coworking..."
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Hledat</span>
              </button>
            </form>
          </div>

          {/* Stats with animated counters */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
              <div className={`text-3xl sm:text-4xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                <AnimatedCounter target={COWORKING_COUNT} suffix="+" duration={1800} />
              </div>
              <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>coworkingů</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className={`text-3xl sm:text-4xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                <AnimatedCounter target={CITY_COUNT} suffix="+" duration={1800} />
              </div>
              <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>měst</p>
            </div>
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <div className={`text-3xl sm:text-4xl font-bold transition-colors duration-700 ${statsTextClass}`}>
                <AnimatedCounter target={MEMBER_COUNT} suffix="+" duration={2200} />
              </div>
              <p className={`text-sm mt-1 transition-colors duration-700 ${statsSubClass}`}>coworkerů</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
