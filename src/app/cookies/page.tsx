import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zásady používání cookies | COWORKINGS.cz',
  description: 'Jaké cookies COWORKINGS.cz používá a jak je můžete spravovat.',
  alternates: { canonical: '/cookies' },
  robots: 'index, follow',
};

export default function CookiesPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">Zásady používání cookies</h1>
      <p className="text-sm text-gray-500 mb-8">Účinné od: 19. dubna 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Co jsou cookies</h2>
      <p>
        Cookies jsou malé textové soubory, které se ukládají do vašeho zařízení při návštěvě webu.
        Pomáhají nám rozpoznat vás a zapamatovat si vaše nastavení.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Jaké cookies používáme</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>
          <strong>Nezbytné</strong> – přihlášení (NextAuth), CSRF ochrana, bez těchto web nefunguje.
        </li>
        <li>
          <strong>Funkční</strong> – zapamatování preferencí (např. filtrů vyhledávání).
        </li>
        <li>
          <strong>Analytické</strong> – Vercel Analytics a Speed Insights, agregovaná data bez
          osobní identifikace.
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Třetí strany</h2>
      <p>
        Při platbě skrze Stripe a při zobrazení Google Maps mohou být nastaveny cookies těchto
        služeb. Více viz jejich zásady:{' '}
        <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
          Stripe
        </a>
        ,{' '}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Google
        </a>
        .
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Jak cookies spravovat</h2>
      <p>
        Cookies můžete spravovat v nastavení svého prohlížeče – povolit, blokovat nebo smazat.
        Blokování nezbytných cookies může omezit funkčnost webu.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Kontakt</h2>
      <p>
        Dotazy směřujte na <a href="mailto:info@coworkings.cz">info@coworkings.cz</a>.
      </p>
    </article>
  );
}
