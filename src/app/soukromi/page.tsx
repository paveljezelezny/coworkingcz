import type { Metadata } from 'next';
import { PDLegalPage, PDLegalSection } from '@/components/paper-diary/PDLegalPage';

export const metadata: Metadata = {
  title: 'Zásady ochrany osobních údajů | COWORKINGS.cz',
  description:
    'Jak na COWORKINGS.cz zpracováváme osobní údaje, cookies, marketing a práva subjektů údajů dle GDPR.',
  alternates: { canonical: '/soukromi' },
  robots: 'index, follow',
};

export default function PrivacyPage() {
  return (
    <PDLegalPage
      title="Zásady ochrany osobních údajů"
      handSubtitle="↘ tvoje data, naše pravidla"
      effectiveDate="19. dubna 2026"
    >
      <PDLegalSection heading="1. Správce údajů">
        <p>
          Správcem osobních údajů je provozovatel webu <strong>COWORKINGS.cz</strong>, kontakt:{' '}
          <a href="mailto:info@coworkings.cz" style={{ color: '#c76a54', textDecoration: 'underline' }}>
            info@coworkings.cz
          </a>.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="2. Jaké údaje zpracováváme">
        <ul style={{ paddingLeft: 20, margin: '8px 0', lineHeight: 1.7 }}>
          <li>identifikační a kontaktní údaje (jméno, e-mail, telefon),</li>
          <li>údaje o přihlášení a aktivitě v aplikaci,</li>
          <li>fakturační údaje a údaje o platbách (zpracovávané přes Stripe),</li>
          <li>technická data – IP adresa, typ prohlížeče, cookies,</li>
          <li>analytická data (Vercel Analytics, bez osobní identifikace).</li>
        </ul>
      </PDLegalSection>

      <PDLegalSection heading="3. Účely zpracování">
        <p>
          Údaje zpracováváme za účelem plnění smlouvy (poskytování služby), vedení uživatelského
          účtu, fakturace, komunikace, zlepšování produktu a plnění zákonných povinností.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="4. Právní tituly">
        <p>
          Plnění smlouvy (čl. 6 odst. 1 písm. b GDPR), oprávněný zájem (zabezpečení a rozvoj služby),
          zákonná povinnost (účetnictví) a souhlas (marketingová komunikace, volitelné cookies).
        </p>
      </PDLegalSection>

      <PDLegalSection heading="5. Předávání třetím stranám">
        <ul style={{ paddingLeft: 20, margin: '8px 0', lineHeight: 1.7 }}>
          <li>Vercel Inc. (hosting a analytika),</li>
          <li>Supabase (databáze a autentizace),</li>
          <li>Stripe (platby),</li>
          <li>Google Maps Platform (mapy).</li>
        </ul>
      </PDLegalSection>

      <PDLegalSection heading="6. Doba uchování">
        <p>
          Údaje uchováváme po dobu trvání uživatelského účtu a dále po dobu stanovenou zákonem
          (zejména zákon o účetnictví, 10 let u daňových dokladů).
        </p>
      </PDLegalSection>

      <PDLegalSection heading="7. Vaše práva">
        <p>
          Máte právo na přístup k údajům, opravu, výmaz, omezení zpracování, přenositelnost a
          vznesení námitky. Stížnost lze podat u Úřadu pro ochranu osobních údajů (www.uoou.cz).
        </p>
      </PDLegalSection>

      <PDLegalSection heading="8. Kontakt">
        <p>
          S dotazy ohledně ochrany údajů se obracejte na{' '}
          <a href="mailto:info@coworkings.cz" style={{ color: '#c76a54', textDecoration: 'underline' }}>
            info@coworkings.cz
          </a>.
        </p>
      </PDLegalSection>
    </PDLegalPage>
  );
}
