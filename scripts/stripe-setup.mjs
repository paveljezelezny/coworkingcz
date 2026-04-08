/**
 * Stripe Setup Script — spusť jednou lokálně
 * Vytvoří všechny produkty a ceny v Stripe Test modu
 *
 * Spuštění:
 *   node scripts/stripe-setup.mjs
 *
 * Výstup: price IDs které zkopíruješ do .env.local
 */

import Stripe from 'stripe';

const SK = process.env.STRIPE_SECRET_KEY;
if (!SK) {
  console.error('❌ Chybí STRIPE_SECRET_KEY v prostředí.');
  console.error('   Spusť: STRIPE_SECRET_KEY=sk_test_... node scripts/stripe-setup.mjs');
  process.exit(1);
}

const stripe = new Stripe(SK, { apiVersion: '2024-06-20' });

async function main() {
  console.log('🚀 Vytvářím Stripe produkty a ceny...\n');

  // ── Coworker — Měsíční (99 Kč/měs) ─────────────────────────────────────
  const monthlyProduct = await stripe.products.create({
    name: 'Členství coworkera — Měsíční',
    description: 'Flexibilní členství bez závazků. 1 bezplatná návštěva měsíčně v libovolném coworku.',
    metadata: { plan: 'coworker_monthly' },
  });
  const monthlyPrice = await stripe.prices.create({
    product: monthlyProduct.id,
    unit_amount: 9900, // 99 Kč v haléřích
    currency: 'czk',
    recurring: { interval: 'month' },
    nickname: 'Coworker měsíční 99 Kč',
    metadata: { plan: 'coworker_monthly' },
  });
  console.log(`✅ Měsíční plán:     ${monthlyPrice.id}`);

  // ── Coworker — Roční (590 Kč/rok) ───────────────────────────────────────
  const yearlyProduct = await stripe.products.create({
    name: 'Členství coworkera — Roční',
    description: 'Roční členství za nejlepší cenu. Ušetříš 598 Kč oproti měsíčnímu plánu.',
    metadata: { plan: 'coworker_yearly' },
  });
  const yearlyPrice = await stripe.prices.create({
    product: yearlyProduct.id,
    unit_amount: 59000, // 590 Kč v haléřích
    currency: 'czk',
    recurring: { interval: 'year' },
    nickname: 'Coworker roční 590 Kč',
    metadata: { plan: 'coworker_yearly' },
  });
  console.log(`✅ Roční plán:       ${yearlyPrice.id}`);

  // ── Coworking — Malý (490 Kč/měs) ───────────────────────────────────────
  const smallProduct = await stripe.products.create({
    name: 'Coworking listing — Malý',
    description: 'Profil coworkingu do 20 míst.',
    metadata: { plan: 'coworking_small' },
  });
  const smallPrice = await stripe.prices.create({
    product: smallProduct.id,
    unit_amount: 49000,
    currency: 'czk',
    recurring: { interval: 'month' },
    nickname: 'Coworking malý 490 Kč/měs',
    metadata: { plan: 'coworking_small' },
  });
  console.log(`✅ Coworking malý:   ${smallPrice.id}`);

  // ── Coworking — Střední (990 Kč/měs) ────────────────────────────────────
  const mediumProduct = await stripe.products.create({
    name: 'Coworking listing — Střední',
    description: 'Profil coworkingu do 100 míst. Rezervační systém, Event management.',
    metadata: { plan: 'coworking_medium' },
  });
  const mediumPrice = await stripe.prices.create({
    product: mediumProduct.id,
    unit_amount: 99000,
    currency: 'czk',
    recurring: { interval: 'month' },
    nickname: 'Coworking střední 990 Kč/měs',
    metadata: { plan: 'coworking_medium' },
  });
  console.log(`✅ Coworking střední: ${mediumPrice.id}`);

  // ── Coworking — Velký (1900 Kč/měs) ─────────────────────────────────────
  const largeProduct = await stripe.products.create({
    name: 'Coworking listing — Velký',
    description: 'Profil coworkingu bez limitu. Analytics, dedikovaný account manager.',
    metadata: { plan: 'coworking_large' },
  });
  const largePrice = await stripe.prices.create({
    product: largeProduct.id,
    unit_amount: 190000,
    currency: 'czk',
    recurring: { interval: 'month' },
    nickname: 'Coworking velký 1900 Kč/měs',
    metadata: { plan: 'coworking_large' },
  });
  console.log(`✅ Coworking velký:  ${largePrice.id}`);

  // ── Výstup env vars ──────────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────────────────');
  console.log('📋 Zkopíruj toto do .env.local:\n');
  console.log(`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_DOPLŇ`);
  console.log(`STRIPE_SECRET_KEY=${SK}`);
  console.log(`STRIPE_WEBHOOK_SECRET=whsec_DOPLŇ_PO_NASTAVENI_WEBHHOOKU`);
  console.log(`STRIPE_PRICE_COWORKER_MONTHLY=${monthlyPrice.id}`);
  console.log(`STRIPE_PRICE_COWORKER_YEARLY=${yearlyPrice.id}`);
  console.log(`STRIPE_PRICE_COWORKING_SMALL=${smallPrice.id}`);
  console.log(`STRIPE_PRICE_COWORKING_MEDIUM=${mediumPrice.id}`);
  console.log(`STRIPE_PRICE_COWORKING_LARGE=${largePrice.id}`);
  console.log('─────────────────────────────────────────────────────');
  console.log('\n✅ Hotovo! Stejné hodnoty nastav v Vercel → Settings → Environment Variables.');
}

main().catch((err) => {
  console.error('❌ Chyba:', err.message);
  process.exit(1);
});
