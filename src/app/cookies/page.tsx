import type { Metadata } from 'next';
import { PDLegalPage, PDLegalSection } from '@/components/paper-diary/PDLegalPage';

export const metadata: Metadata = {
  title: 'Zásady používání cookies | COWORKINGS.cz',
  description: 'Jaké cookies COWORKINGS.cz používá a jak je můžete spravovat.',
  alternates: { canonical: '/cookies' },
  robots: 'index, follow',
};

export default function CookiesPage() {
  const linkStyle = { color: '#c76a54', textDecoration: 'underline' };
  return (
    <PDLegalPage
      title="Zásady používání cookies"
      handSubtitle="↘ jaké drobky pekáme"
      effectiveDate="19. dubna 2026"
    >
      <PDLegalSection heading="1. Co jsou cookies">
        <p>
          Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webu.
          Pomáhají nám rozpoznat vás a zapamatovat si vaše nastavení.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="2. Jaké cookies používáme">
        <ul style={{ paddingLeft: 20, margin: '8px 0', lineHeight: 1.7 }}>
          <li>
            <strong>Nezbytné</strong> — přihlášení (NextAuth), CSRF ochrana, bez těchto web nefunguje.
          </li>
          <li>
            <strong>Funkční</strong> — zapamatování preferencí (např. filtrů vyhledávání).
          </li>
          <li>
            <strong>Analytické</strong> — Vercel Analytics a Speed Insights, agregovaná data bez
            osobní identifikace.
          </li>
        </ul>
      </PDLegalSection>

      <PDLegalSection heading="3. Třetí strany">
        <p>
          Při platbě skrze Stripe a při zobrazení Google Maps mohou být nastaveny cookies těchto
          služeb. Více viz jejich zásady:{' '}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Stripe
          </a>
          ,{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Google
          </a>
          .
        </p>
      </PDLegalSection>

      <PDLegalSection heading="4. Jak cookies spravovat">
        <p>
          Cookies můžete spravovat v nastavení svého prohlížeče — povolit, blokovat nebo smazat.
          Blokování nezbytných cookies může omezit funkčnost webu.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="5. Kontakt">
        <p>
          Dotazy směřujte na{' '}
          <a href="mailto:info@coworkings.cz" style={linkStyle}>
            info@coworkings.cz
          </a>.
        </p>
      </PDLegalSection>
    </PDLegalPage>
  );
}
