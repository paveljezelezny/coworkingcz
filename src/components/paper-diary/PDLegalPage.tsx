// PDLegalPage — sdílený wrapper pro statické legal stránky (podminky, soukromi, cookies).
// Server component. Bere title, hand subtitle, effective date a children (sekce).

import React from 'react';
import { PD, PD_FONT_DISPLAY, PD_FONT_BODY, PD_FONT_HAND, PD_FONT_MONO } from './tokens';
import { NotebookPaper } from './primitives';

export function PDLegalPage({
  title,
  handSubtitle,
  effectiveDate,
  children,
}: {
  title: string;
  handSubtitle: string;
  effectiveDate: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', background: PD.paper, fontFamily: PD_FONT_BODY }}>
      <NotebookPaper style={{ padding: '40px 20px 60px' }}>
        <div className="md:!pl-24 md:!pr-14 md:!pt-12">
          <article style={{ maxWidth: 720 }}>
            <div style={{ fontFamily: PD_FONT_HAND, fontSize: 22, color: PD.margin, marginBottom: 4, transform: 'rotate(-1deg)', display: 'inline-block' }}>
              {handSubtitle}
            </div>
            <h1
              className="text-[36px] md:text-[56px]"
              style={{ fontFamily: PD_FONT_DISPLAY, letterSpacing: '-0.025em', lineHeight: 0.98, fontWeight: 500, margin: '4px 0 8px', color: PD.ink }}
            >
              {title}
            </h1>
            <p style={{ fontFamily: PD_FONT_MONO, fontSize: 11, letterSpacing: 1.2, color: PD.inkMuted, textTransform: 'uppercase', margin: '0 0 28px' }}>
              Účinné od: {effectiveDate}
            </p>
            <div style={{ fontSize: 15, lineHeight: 1.65, color: PD.inkSoft }}>
              {children}
            </div>
          </article>
        </div>
      </NotebookPaper>
    </div>
  );
}

// Helper section — for use inside PDLegalPage children
export function PDLegalSection({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <section style={{ marginTop: 28 }}>
      <h2 style={{ fontFamily: PD_FONT_DISPLAY, fontSize: 22, fontWeight: 500, letterSpacing: '-0.015em', color: PD.ink, margin: '0 0 8px' }}>
        {heading}
      </h2>
      <div>{children}</div>
    </section>
  );
}
