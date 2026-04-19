import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obchodní podmínky | COWORKINGS.cz',
  description: 'Všeobecné obchodní podmínky používání platformy COWORKINGS.cz.',
  alternates: { canonical: '/podminky' },
  robots: 'index, follow',
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold mb-6">Obchodní podmínky</h1>
      <p className="text-sm text-gray-500 mb-8">Účinné od: 19. dubna 2026</p>

      <h2 className="text-xl font-semibold mt-8 mb-3">1. Úvodní ustanovení</h2>
      <p>
        Tyto obchodní podmínky upravují používání platformy COWORKINGS.cz, která propojuje uživatele
        (coworkery) s provozovateli coworkingových prostor v České republice.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">2. Registrace a účet</h2>
      <p>
        Pro využívání některých funkcí je třeba registrace. Uživatel odpovídá za správnost údajů a
        za zabezpečení svých přihlašovacích údajů.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">3. Služby a rezervace</h2>
      <p>
        Platforma zprostředkovává rezervace coworkingových prostor. Smlouva o poskytnutí prostoru
        vzniká mezi uživatelem a konkrétním coworkingem. COWORKINGS.cz vystupuje jako
        zprostředkovatel.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">4. Platební podmínky</h2>
      <p>
        Platby jsou zpracovávány přes Stripe. Ceny jsou uvedeny včetně DPH (pokud je uplatnitelná).
        Storno podmínky se řídí pravidly konkrétního coworkingu.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">5. Práva a povinnosti</h2>
      <p>
        Uživatel se zavazuje dodržovat pravidla konkrétního coworkingu a obecné zásady slušného
        chování. Provozovatel si vyhrazuje právo pozastavit účet porušující tyto podmínky.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">6. Odpovědnost</h2>
      <p>
        COWORKINGS.cz neodpovídá za škody vzniklé při užívání coworkingového prostoru – tuto
        odpovědnost nese provozovatel daného prostoru.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">7. Reklamace</h2>
      <p>
        Reklamace lze zaslat na <a href="mailto:info@coworkings.cz">info@coworkings.cz</a>.
        Reklamace vyřizujeme do 30 dnů.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">8. Závěrečná ustanovení</h2>
      <p>
        Tyto podmínky se řídí právem České republiky. Jejich účinnost nastává okamžikem uveřejnění
        na webu.
      </p>
    </article>
  );
}
