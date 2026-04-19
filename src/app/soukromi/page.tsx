import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů | COWORKINGS.cz',
  description:
    'Jak na COWORKINGS.cz zpracováváme osobní údaje, cookies, marketing a práva subjektů údajů dle GDPR.',
  alternates: { canonical: '/soukromi' },
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">Zásady ochrany osobních údajů</h1>
      <p className="text-sm text-gray-500 mb-8">Účinné od: 19. dubna 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Správce údajů</h2>
      <p>
        Správcem osobních údajů je provozovatel webu <strong>COWORKINGS.cz</strong>,
        kontakt: <a href="mailto:info@coworkings.cz">info@coworkings.cz</a>.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Jaké údaje zpracováváme</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>identifikační a kontaktní údaje (jméno, e-mail, telefon),</li>
        <li>údaje o přihlášení a aktivitě v aplikaci,</li>
        <li>fakturační údaje a údaje o platbách (zpracovávané přes Stripe),</li>
        <li>technická data – IP adresa, typ prohlížeče, cookies,</li>
        <li>analytická data (Vercel Analytics, bez osobní identifikace).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Účely zpracování</h2>
      <p>
        Údaje zpracováváme za účelem plnění smlouvy (poskytování služby), vedení uživatelského
        účtu, fakturace, komunikace, zlepšování produktu a plnění zákonných povinností.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Právní tituly</h2>
      <p>
        Plnění smlouvy (čl. 6 odst. 1 písm. b GDPR), oprávněný zájem (zabezpečení a rozvoj služby),
        zákonná povinnost (účetnictví) a souhlas (marketingová komunikace, volitelné cookies).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Předávání třetím stranám</h2>
      <ul className="list-disc pl-6 space-y-1">
        <li>Vercel Inc. (hosting a analytika),</li>
        <li>Supabase (databáze a autentizace),</li>
        <li>Stripe (platby),</li>
        <li>Google Maps Platform (mapy).</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Doba uchování</h2>
      <p>
        Údaje uchováváme po dobu trvání uživatelského účtu a dále po dobu stanovenou zákonem
        (zejména zákon o účetnictví, 10 let u daňových dokladů).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Vaše práva</h2>
      <p>
        Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost a vznesení
        námitky. Stížnost lze podat u Úřadu pro ochranu osobních údajů (www.uoou.cz).
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Kontakt</h2>
      <p>
        S dotazy ohledně ochrany údajů se obracejte na{' '}
        <a href="mailto:info@coworkings.cz">info@coworkings.cz</a>.
      </p>
    </article>
  );
}
