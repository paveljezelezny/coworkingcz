# COWORKINGS.cz

Webová platforma pro coworkingové prostory a jejich členy v České republice.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, custom CSS utilities
- **Icons**: Lucide React
- **Data**: JSON data layer (připraveno pro migraci na databázi)
- **Auth**: NextAuth.js (připraveno)
- **Hosting**: Vercel / Cloudflare Pages

## Rychlý start (lokální vývoj)

```bash
# 1. Naklonuj repo
git clone https://github.com/TVUJ-USERNAME/coworkings-cz.git
cd coworkings-cz

# 2. Nainstaluj závislosti
npm install

# 3. Zkopíruj env soubor
cp .env.example .env

# 4. Spusť dev server
npm run dev
```

Otevři http://localhost:3000

## Struktura projektu

```
coworkings-cz/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── coworkingy/         # Seznam coworkingů + filtry
│   │   ├── coworking/[slug]/   # Detail coworkingu (100+ stránek)
│   │   ├── mapa/               # Mapový přehled
│   │   ├── udalosti/           # Kalendář eventů
│   │   ├── marketplace/        # Burza práce a služeb
│   │   ├── pro-coworkingy/     # Cenové plány
│   │   ├── prihlaseni/         # Login
│   │   ├── registrace/         # Registrace
│   │   ├── admin/              # Admin dashboard
│   │   └── profil/             # Profil coworkera
│   ├── components/             # Sdílené komponenty
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── CoworkingCard.tsx
│   └── lib/
│       ├── types.ts            # TypeScript typy + pricing konstanty
│       └── data/
│           └── coworkings.ts   # 100+ coworkingů, eventy, marketplace
├── prisma/
│   └── schema.prisma           # DB schéma (pro budoucí migraci)
├── public/                     # Statické soubory
├── tailwind.config.ts
├── next.config.js
└── package.json
```
