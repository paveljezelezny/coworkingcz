// Paper Diary — server-safe utility helpers.
// Tyto funkce jsou volané ze server components (app/page.tsx atd.) i klientů,
// proto NEMOHOU žít v 'use client' modulu.

export type PdMarketplaceKind = 'Nabídka' | 'Poptávka';

export function listingKindFromCategory(category: string): {
  kind: PdMarketplaceKind;
  tone: 'amber' | 'moss';
  label: string;
} {
  // service_offer/job_offer/item_for_sale → Nabídka (amber)
  // service_seeking/job_seeking/item_wanted → Poptávka (moss)
  const isOffer = /(_offer|for_sale)$/i.test(category);
  const labelMap: Record<string, string> = {
    job_offer: 'Nabídka práce',
    job_seeking: 'Hledám práci',
    service_offer: 'Nabízím služby',
    service_seeking: 'Hledám služby',
    item_for_sale: 'Prodám',
    item_wanted: 'Koupím',
  };
  return {
    kind: isOffer ? 'Nabídka' : 'Poptávka',
    tone: isOffer ? 'amber' : 'moss',
    label: labelMap[category] || category,
  };
}

export function ageLabelFromDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  const ms = Date.now() - date.getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return 'právě teď';
  if (h < 24) return `${h} h`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} d`;
  return `${Math.floor(days / 30)} měs`;
}
