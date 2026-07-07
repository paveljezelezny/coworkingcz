# Replan Lessons Learned

> Curated guidance. Both /replan and /recheck inject this file into every subagent prompt
> (wrapped with context-marking tags). Keep entries short and concrete. Remove entries that
> no longer apply.

---

## Prisma migrace a RLS na Supabase
Prisma migrate nezapíná RLS na nově vytvořených tabulkách — Supabase je pak flagne jako kriticky exponované přes PostgREST (anon klíč). Po každé Prisma migraci, která přidává tabulku, spustit Supabase security advisors a zapnout RLS bez policies (projektový pattern pro Prisma-only přístup; Prisma se připojuje jako owner role a RLS ho neomezuje).

> Added 2026-06-10 after /recheck on plan 628e70b found rls_disabled_in_public on ClaimAuditLog + Invitation.

## Idempotenční abort ≠ chyba
Když transakce abortuje kvůli idempotenci (replay, dvojklik, e-mail prefetch — např. token claim vrátí count 0), NEmapovat na generickou error hlášku. Uživatel opakující už úspěšnou akci má vidět úspěch/informaci, ne "selhalo". V catch bloku rozlišit chybu podle typu/message.

> Added 2026-07-07 after /recheck on plan 8726470 found double-click UX bug in accept-transfer.

## Existence-check jedné tabulky jako proxy schématu
Runtime DDL runner, který early-returnuje na existenci jedné tabulky, nikdy nespustí později přidané CREATE/ALTER statementy na existující DB. Nové DDL musí vždy i do explicitní migrace; při review runtime DDL runnerů zkontrolovat, co early-return přeskakuje.

> Added 2026-07-07 after /recheck on plan 8726470 found ensure-tables.ts timebomb.
