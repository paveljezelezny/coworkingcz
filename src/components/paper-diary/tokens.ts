// Paper Diary — design tokens (single source of truth)
// Mirror of CSS proměnných v globals.css. Pro inline style v TSX.

export const PD = {
  paper:      '#efe9dc',
  paperLt:    '#f6f1e5',
  paperWhite: '#fdfbf4',
  ink:        '#1a1a1a',
  inkSoft:    '#3a3a3a',
  inkMuted:   '#6b6558',
  rule:       '#d9d1bf',
  ruleSoft:   '#e6dfcb',
  margin:     '#c76a54',
  accent:     '#2e5fa1',
  amber:      '#c59a3a',
  moss:       '#6d8862',
  coral:      '#c76a54',
} as const;

export const PD_FONT_DISPLAY = '"Inter Tight", system-ui, sans-serif';
export const PD_FONT_BODY    = '"Inter", system-ui, sans-serif';
export const PD_FONT_HAND    = '"Caveat", "Bradley Hand", cursive';
export const PD_FONT_MONO    = 'ui-monospace, "JetBrains Mono", Menlo, monospace';

export const PD_PAPER_BG = `
  repeating-linear-gradient(0deg, transparent 0 27px, rgba(0,0,0,0.03) 27px 28px),
  ${PD.paper}
`;

export type PdTone = 'ink' | 'amber' | 'moss' | 'coral' | 'accent';
export const toneColor = (t: PdTone | string | undefined): string =>
  (PD as Record<string, string>)[t ?? 'accent'] ?? PD.accent;

// Event tag → tone (single source of truth)
export const PD_EVENT_KIND_TONE: Record<string, PdTone> = {
  Workshop:   'amber',
  Meetup:     'accent',
  Networking: 'moss',
  Komunita:   'coral',
};
export const eventTone = (e: { tag?: string; tone?: PdTone }): PdTone =>
  PD_EVENT_KIND_TONE[e?.tag ?? ''] ?? e?.tone ?? 'accent';
export const eventColor = (e: { tag?: string; tone?: PdTone }): string =>
  toneColor(eventTone(e));
