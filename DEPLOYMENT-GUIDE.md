# COWORKINGS.cz — Deployment & Setup Guide

---

## FÁZE 1: Push na GitHub

### Krok 1: Vytvoř GitHub repo

1. Jdi na https://github.com/new
2. Název: `coworkings-cz`
3. Popis: "Platforma pro coworkingové prostory v ČR"
4. Zvol **Private** (nebo Public)
5. NEKLIKEJ na "Add README" — to už máme
6. Klikni **Create repository**

### Krok 2: Push z lokálu

```bash
cd /cesta/k/tvemu/coworkings-cz

# Přidej všechny soubory (node_modules a .env jsou v .gitignore)
git add .
git commit -m "Initial commit: COWORKINGS.cz platform"

# Napoj na GitHub
git remote add origin https://github.com/TVUJ-USERNAME/coworkings-cz.git
git push -u origin main
```

---

## FÁZE 2: Hosting na Vercel (doporučeno)

### Proč Vercel?
- Nativní podpora Next.js (jsou tvůrci Next.js)
- Free tier pro hobby projekty
- Automatický deploy z GitHub
- Edge CDN, preview deployments, analytics

### Setup:

1. Jdi na https://vercel.com a přihlaš se přes GitHub
2. Klikni **"Add New Project"**
3. Importuj `coworkings-cz` repo
4. Vercel automaticky detekuje Next.js
5. V **Environment Variables** přidej:
   ```
   NEXTAUTH_SECRET = vygeneruj-silne-heslo-min-32-znaku
   NEXTAUTH_URL = https://coworkings.cz (nebo tvoje Vercel URL)
   ```
6. Klikni **Deploy**

### Custom doména coworkings.cz:
1. V Vercel dashboardu → Settings → Domains
2. Přidej `coworkings.cz` a `www.coworkings.cz`
3. U svého registrátora domény nastav DNS:
   - Typ: `A` → `76.76.21.21`
   - Typ: `CNAME` → `cname.vercel-dns.com` (pro www)
4. Vercel automaticky vystaví SSL certifikát

### Alternativa: Cloudflare Pages
```bash
# Build command:
npm run build

# Output directory:
.next
```
- Jdi na https://dash.cloudflare.com → Pages → Create project
- Napoj GitHub repo, nastav build příkazy výše

---

## FÁZE 3: Databáze (když budeš chtít real data)

### Aktuální stav:
Aplikace teď běží na **JSON datech** v `src/lib/data/coworkings.ts`.
To je perfektní pro MVP/demo. Všechno funguje, deploy je instant.

### Pro produkci doporučuji: **Neon** (PostgreSQL)

#### Proč Neon?
- Serverless PostgreSQL — platíš jen za to, co používáš
- Free tier: 0.5 GB storage, 3 GB transfer
- Branching (jako git pro databázi!)
- Nativní integrace s Vercel

#### Setup Neon:

1. Jdi na https://neon.tech a vytvoř účet
2. Klikni **Create Project** → Region: `eu-central-1` (Frankfurt)
3. Zkopíruj **connection string**:
   ```
   postgresql://user:password@ep-xxxxx.eu-central-1.aws.neon.tech/coworkings_cz?sslmode=require
   ```
4. V Vercel Environment Variables přidej:
   ```
   DATABASE_URL = tvoje-neon-connection-string
   ```

#### Migrace na Prisma + Neon:

1. Uprav `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"    // změn z "sqlite" na "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. Nainstaluj Prisma:
   ```bash
   npm install prisma @prisma/client
   npx prisma generate
   npx prisma db push
   ```

3. Vytvoř seed script a naplň databázi daty z `coworkings.ts`

4. Uprav API routes aby četly z Prisma místo JSON

### Alternativy databáze:

| Služba | Typ | Free tier | Ideální pro |
|--------|-----|-----------|-------------|
| **Neon** | PostgreSQL | 0.5 GB | Doporučeno - nejlepší DX |
| **Supabase** | PostgreSQL + Auth + Storage | 500 MB | Pokud chceš all-in-one |
| **PlanetScale** | MySQL | 5 GB | Velké objemy dat |
| **Turso** | SQLite (edge) | 9 GB | Ultra rychlé čtení |
| **Railway** | PostgreSQL | $5 kredit | Rychlý setup |

---

## FÁZE 4: Autentizace (NextAuth)

Aplikace má NextAuth.js připravený. Pro aktivaci:

### 1. Google OAuth:
```bash
# V .env přidej:
GOOGLE_CLIENT_ID=tvoje-google-client-id
GOOGLE_CLIENT_SECRET=tvoje-google-client-secret
```
- Jdi na https://console.cloud.google.com
- APIs & Services → Credentials → Create OAuth Client
- Authorized redirect: `https://coworkings.cz/api/auth/callback/google`

### 2. LinkedIn OAuth:
```bash
LINKEDIN_CLIENT_ID=tvoje-linkedin-id
LINKEDIN_CLIENT_SECRET=tvoje-linkedin-secret
```
- Jdi na https://developer.linkedin.com
- Create App → Products → Sign In with LinkedIn

### 3. Vytvoř API route:
Soubor `src/app/api/auth/[...nextauth]/route.ts` — to je další krok vývoje.

---

## FÁZE 5: Platební brána (Stripe)

Pro příjem plateb za členství coworkingů a coworkerů:

1. Vytvoř účet na https://stripe.com
2. Přidej API klíče:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. V Stripe dashboardu vytvoř Products:
   - Malý cowork: 490 Kč/měsíc
   - Střední cowork: 990 Kč/měsíc
   - Velký cowork: 1900 Kč/měsíc
   - Coworker Premium: 250 Kč/měsíc nebo 1900 Kč/rok

---

## FÁZE 6: Další služby pro produkci

### Email (transakční):
- **Resend** (https://resend.com) — free tier 100 emails/den
- Nebo **Postmark** — spolehlivější pro business

### File Storage (fotky coworkingů):
- **Cloudflare R2** — S3-kompatibilní, bez egress poplatků
- Nebo **Uploadthing** — jednoduchý upload v Next.js

### Analytics:
- **Vercel Analytics** — zabudované
- **Plausible** — privacy-first alternativa ke Google Analytics

### Monitoring:
- **Sentry** (https://sentry.io) — error tracking, free tier

### SEO:
- Sitemap: Přidej `src/app/sitemap.ts`
- robots.txt: Přidej do `public/robots.txt`

---

## Checklist před spuštěním

- [ ] GitHub repo vytvořen a pushed
- [ ] Vercel deployment funkční
- [ ] Custom doména nastavená (DNS)
- [ ] SSL certifikát aktivní
- [ ] Environment variables nastavené
- [ ] Databáze připojená (Neon/Supabase)
- [ ] Autentizace funkční (Google/LinkedIn)
- [ ] Stripe platby nastavené
- [ ] Email notifikace
- [ ] Analytics zapnuté
- [ ] Error monitoring (Sentry)
- [ ] Sitemap + robots.txt
- [ ] Open Graph obrázky
- [ ] Testování na mobilu

---

## Pořadí kroků (co dělat teď)

1. **HNED**: Push na GitHub → Deploy na Vercel → Máš živý web
2. **TENTO TÝDEN**: Kup doménu coworkings.cz, napoj DNS
3. **PŘÍŠTÍ TÝDEN**: Setup Neon databáze, migrace dat
4. **DO MĚSÍCE**: Auth (Google/LinkedIn), Stripe platby
5. **ONGOING**: Fotky, SEO, marketing, oslovování coworkingů
