'use client';

import { useState, useEffect } from 'react';

const TABS = [
  { label: 'Přehled', id: 'sekce-prehled' },
  { label: 'Vybavení', id: 'sekce-vybaveni' },
  { label: 'Ceny', id: 'sekce-ceny' },
  { label: 'Eventy', id: 'sekce-eventy' },
];

export default function CoworkingTabs({ hasEvents }: { hasEvents: boolean }) {
  const [active, setActive] = useState('sekce-prehled');

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Offset for sticky navbar (~72px) + a little breathing room
    const navbarHeight = 80;
    const y = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
    window.scrollTo({ top: y, behavior: 'smooth' });
    setActive(id);
  };

  // Track active section on scroll via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    TABS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const visibleTabs = hasEvents ? TABS : TABS.filter((t) => t.id !== 'sekce-eventy');

  return (
    <div className="border-b border-gray-200 mb-8 overflow-x-auto sticky top-16 bg-white z-30 shadow-sm">
      <div className="flex gap-6 sm:gap-8">
        {visibleTabs.map(({ label, id }) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className={`py-4 px-1 font-semibold border-b-2 whitespace-nowrap transition-colors ${
              active === id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-500 border-transparent hover:text-gray-900 hover:border-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
