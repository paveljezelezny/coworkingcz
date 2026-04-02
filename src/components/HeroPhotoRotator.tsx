'use client';

import { useState, useEffect, useRef } from 'react';
import { coworkingsData } from '@/lib/data/coworkings';

// Collect all available photo URLs across all coworkings
const allPhotos = coworkingsData
  .flatMap((cw) => cw.photos.map((p) => p.url))
  .filter(Boolean);

// Seeded shuffle so photos stay in consistent random order per session
function shuffle(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function HeroPhotoRotator() {
  // Shuffled once on first render; stable via useState initialiser
  const [photos] = useState<string[]>(() => shuffle(allPhotos));

  // Index of the photo currently shown at the "bottom" layer
  const idxRef = useRef(0);
  const [bottomIdx, setBottomIdx] = useState(0);

  // Index of the photo being faded-in on the "top" layer
  const [topIdx, setTopIdx] = useState(photos.length > 1 ? 1 : 0);

  // When true: top layer transitions opacity 0 → 1 (new photo fades in)
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (photos.length < 2) return;

    const DISPLAY_MS = 10_000; // how long each photo stays
    const FADE_MS = 1_200;     // crossfade duration (must match CSS transition)

    const tick = () => {
      const next = (idxRef.current + 1) % photos.length;

      // Stage the next photo in the (currently invisible) top layer
      setTopIdx(next);

      // Trigger fade-in on the next tick so the browser paints the new src first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setFading(true);

          // After fade completes: swap bottom to the new photo, hide top again
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

  if (photos.length === 0) return null;

  return (
    /* Absolutely fills its parent — the hero section must have `relative` + `overflow-hidden` */
    <div className="absolute inset-0 -z-10">
      {/* Bottom layer: current photo — always fully visible */}
      <img
        key={`bottom-${bottomIdx}`}
        src={photos[bottomIdx]}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Top layer: incoming photo — fades in over the bottom */}
      <img
        key={`top-${topIdx}`}
        src={photos[topIdx]}
        alt=""
        aria-hidden
        style={{ transition: 'opacity 1200ms ease-in-out' }}
        className={`absolute inset-0 w-full h-full object-cover ${fading ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Dark gradient overlay so text stays legible on any photo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
    </div>
  );
}
