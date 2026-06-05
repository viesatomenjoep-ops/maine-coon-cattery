# Maelduin — Maine Coon Cattery Platform (Prototype)

High-end prototype voor een Maine Coon-fokker. Drie omgevingen in één Next.js-app:
publieke landingspagina, afgeschermd klantenportaal en een volledig Admin CMS-dashboard.

## Tech stack
- **Next.js 14** (App Router) + **React 18**
- **Tailwind CSS** met een luxe, op maat ontworpen designsysteem (forest / brass / cream)
- Voorbereid op **Supabase** (Auth & Database) en **Cloudinary** (Image Hosting)

## Starten
```bash
npm install
npm run dev          # http://localhost:3000
# of productie:
npm run build && npm run start
```

## Demo-inloggegevens
| Rol   | E-mail                | Wachtwoord |
|-------|-----------------------|------------|
| Klant | klant@voorbeeld.nl    | kitten     |
| Admin | admin@maelduin.nl     | admin      |

De loginpagina heeft knoppen om deze velden automatisch in te vullen.

## Structuur
```
src/
├── app/
│   ├── (public)/            # Deel 1 — publieke landingspagina
│   │   ├── layout.js        #   nav + footer
│   │   └── page.js          #   hero, over het ras, live nieuwsfeed, CTA
│   ├── login/               # gedeelde login (rol-gebaseerde redirect)
│   ├── portal/              # Deel 2 — Private Access (klant)
│   │   ├── layout.js        #   auth-guard + header
│   │   ├── page.js          #   kitten-overzicht (advertenties)
│   │   └── kitten/[id]/     #   kitten-dossier (groei, medisch, stamboom, fase)
│   └── admin/               # Deel 3 — Admin CMS
│       ├── layout.js        #   sidebar + admin-guard + StoreProvider
│       ├── page.js          #   dashboard-overzicht
│       ├── news/            #   Nieuws Editor (rich text)
│       ├── litters/         #   Nestjes & Kittens CRUD
│       ├── medical/         #   Medisch Dashboard (groepsbehandelingen)
│       ├── sales/           #   Advertentie & Sales Beheer
│       └── media/           #   Media Sync (Cloudinary-prep)
├── components/              # UI-primitieven, nav, grafiek, admin-formulieren
├── context/                 # AuthContext (mock auth) + StoreContext (live CRUD)
└── data/mock.js             # dummy-data, gemodelleerd naar de Supabase-schema's
```

## Migratie naar de Viesa Automations Stack
De code is bewust opgesplitst zodat migratie soepel verloopt:

- **`src/data/mock.js`** — elke export (`newsPosts`, `litters`, `kittens`, `parents`,
  `customers`) komt overeen met een geplande Supabase-tabel. Vervang deze door
  Supabase-queries.
- **`src/context/AuthContext.js`** — vervang `login`/`logout` door
  `supabase.auth.signInWithPassword` / `signOut`. De sessievorm (`{ user: { role } }`)
  is al compatibel.
- **`src/context/StoreContext.js`** — de setters (`addNews`, `addKitten`,
  `updateKitten`, `addMedical`, …) worden Supabase `insert` / `update` / `delete`.
- **`ImageSlot`** (in `components/ui.js`) — placeholder voor afbeeldingen; vervang door
  de Cloudinary upload-widget / `<Image>` met Cloudinary-URLs.

## Functionaliteit
**Publiek** — sfeervolle hero, "Over het ras", live nieuwsfeed (max. 20 recente
updates uit het CMS), duidelijke Private Access CTA.

**Portaal** — afgeschermd kitten-overzicht met prijs, status en foto's; per kitten een
dossier met gewichtscurve, medisch dossier (vaccinaties, ontworming, chipnummer),
stamboom + genetica van de ouders (HCM, SMA, PKDef) en de aankoopfase.

**Admin CMS** — dashboard met statistieken, Nieuws Editor (rich text + media),
Nestjes & Kittens CRUD, Medisch Dashboard (groepsvaccinaties gekoppeld aan kittens),
Advertentie & Sales Beheer (publiceren, prijs, status — direct zichtbaar voor de klant)
en Media Sync voor de Cloudinary-koppeling.

> Wijzigingen in het Admin CMS zijn live binnen de admin-sessie (via `StoreContext`).
> Na migratie naar Supabase worden ze persistent en zichtbaar over alle omgevingen.
