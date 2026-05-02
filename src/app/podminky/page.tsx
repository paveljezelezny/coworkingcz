import type { Metadata } from 'next';
import { PDLegalPage, PDLegalSection } from '@/components/paper-diary/PDLegalPage';

export const metadata: Metadata = {
  title: 'Obchodní podmínky | COWORKINGS.cz',
  description: 'Všeobecné obchodní podmínky používání platformy COWORKINGS.cz.',
  alternates: { canonical: '/podminky' },
  robots: 'index, follow',
};

export default function TermsPage() {
  return (
    <PDLegalPage
      title="Obchodní podmínky"
      handSubtitle="↘ jak to funguje formálně"
      effectiveDate="19. dubna 2026"
    >
      <PDLegalSection heading="1. Úvodní ustanovení">
        <p>
          Tyto obchodní podmínky upravují používání platformy COWORKINGS.cz, která propojuje
          uživatele (coworkery) s provozovateli coworkingových prostor v České republice.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="2. Registrace a účet">
        <p>
          Pro využívání některých funkcí je třeba registrace. Uživatel odpovídá za správnost údajů
          a za zabezpečení svých přihlašovacích údajů.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="3. Služby a rezervace">
        <p>
          Platforma zprostředkovává rezervace coworkingových prostor. Smlouva o poskytnutí prostoru
          vzniká mezi uživatelem a konkrétním coworkingem. COWORKINGS.cz vystupuje jako
          zprostředkovatel.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="4. Platební podmínky">
        <p>
          Platby jsou zpracovávány přes Stripe. Ceny jsou uvedeny včetně DPH (pokud je uplatnitelná).
          Storno podmínky se řídí pravidly konkrétního coworkingu.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="5. Práva a povinnosti">
        <p>
          Uživatel se zavazuje dodržovat pravidla konkrétního coworkingu a obecné zásady slušného
          chování. Provozovatel si vyhrazuje právo pozastavit účet porušující tyto podmínky.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="6. Odpovědnost">
        <p>
          COWORKINGS.cz neodpovídá za škody vzniklé při užívání coworkingového prostoru — tuto
          odpovědnost nese provozovatel daného prostoru.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="7. Reklamace">
        <p>
          Reklamace lze zaslat na{' '}
          <a href="mailto:info@coworkings.cz" style={{ color: '#c76a54', textDecoration: 'underline' }}>
            info@coworkings.cz
          </a>. Reklamace vyřizujeme do 30 dnů.
        </p>
      </PDLegalSection>

      <PDLegalSection heading="8. Závěrečná ustanovení">
        <p>
          Tyto podmínky se řídí právem České republiky. Jejich účinnost nastává okamžikem uveřejnění
          na webu.
        </p>
      </PDLegalSection>
    </PDLegalPage>
  );
}
