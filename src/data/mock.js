// Mock data modeled to mirror the future Supabase schema.
// Each export maps to a planned table. Swap these for Supabase queries on migration.

// ---- table: news_posts ----
export const newsPosts = [
  {
    id: 'n1',
    title: 'Nieuw nestje verwacht!',
    body: 'Onze prachtige Freya is drachtig van Aslan. We verwachten de kittens begin volgende maand. Houd dit blok in de gaten voor de eerste beelden.',
    cover: null,
    tag: 'Aankondiging',
    published_at: '2026-05-28T09:00:00Z',
    author: 'Cattery beheer',
  },
  {
    id: 'n2',
    title: 'Kittens 4 weken oud',
    body: 'Het nestje van Luna groeit als kool. De kleintjes zetten hun eerste wankele stapjes en ontdekken de speelhoek.',
    cover: null,
    tag: 'Update',
    published_at: '2026-05-20T14:30:00Z',
    author: 'Cattery beheer',
  },
  {
    id: 'n3',
    title: 'Eerste vaccinatieronde voltooid',
    body: 'Alle kittens van het nestje "Sterrenregen" hebben hun eerste enting gekregen. De dierenarts is zeer tevreden over hun ontwikkeling.',
    cover: null,
    tag: 'Medisch',
    published_at: '2026-05-12T11:00:00Z',
    author: 'Cattery beheer',
  },
  {
    id: 'n4',
    title: 'Stamboomtitels behaald',
    body: 'Onze fokkater Aslan heeft op de internationale show opnieuw uitstekend gescoord. Trots op deze prachtige Maine Coon!',
    cover: null,
    tag: 'Show',
    published_at: '2026-04-30T16:00:00Z',
    author: 'Cattery beheer',
  },
];

// ---- table: cats (ouderdieren) ----
export const parents = [
  {
    id: 'p1', name: 'Aslan van Maelduin', role: 'Vader (Sire)', color: 'Brown Tabby',
    hcm: 'Negatief (DNA)', sma: 'Negatief (DNA)', pkdef: 'Negatief (DNA)',
    titles: 'Int. Champion', born: '2022-03-11',
  },
  {
    id: 'p2', name: 'Freya van Maelduin', role: 'Moeder (Dam)', color: 'Silver Tabby',
    hcm: 'Negatief (Echo)', sma: 'Negatief (DNA)', pkdef: 'Negatief (DNA)',
    titles: 'Champion', born: '2022-07-22',
  },
  {
    id: 'p3', name: 'Luna van Maelduin', role: 'Moeder (Dam)', color: 'Black Smoke',
    hcm: 'Negatief (Echo)', sma: 'Negatief (DNA)', pkdef: 'Negatief (DNA)',
    titles: 'Premior', born: '2021-11-05',
  },
];

// ---- table: litters ----
export const litters = [
  {
    id: 'l1', name: 'Sterrenregen', sire_id: 'p1', dam_id: 'p2',
    born: '2026-03-15', expected: false,
  },
  {
    id: 'l2', name: 'Noorderlicht', sire_id: 'p1', dam_id: 'p3',
    born: null, expected: true, expected_date: '2026-07-10',
  },
];

// ---- table: kittens ----
export const kittens = [
  {
    id: 'k1', litter_id: 'l1', name: 'Castor', sex: 'Reu', color: 'Brown Tabby',
    pattern: 'Classic Tabby', status: 'Beschikbaar', price: 1450, published: true,
    born: '2026-03-15', chip: '528210002345678',
    weights: [
      { week: 0, g: 118 }, { week: 1, g: 195 }, { week: 2, g: 290 },
      { week: 4, g: 510 }, { week: 6, g: 780 }, { week: 8, g: 1080 },
    ],
    medical: [
      { date: '2026-04-26', type: 'Ontworming', note: 'Milbemax — 6 wkn' },
      { date: '2026-05-12', type: 'Vaccinatie', note: 'Eerste enting (Nobivac)' },
      { date: '2026-05-12', type: 'Gezondheidscheck', note: 'Dierenarts: uitstekend' },
    ],
  },
  {
    id: 'k2', litter_id: 'l1', name: 'Pollux', sex: 'Reu', color: 'Brown Tabby',
    pattern: 'Mackerel', status: 'Gereserveerd', price: 1450, published: true,
    born: '2026-03-15', chip: '528210002345679',
    weights: [
      { week: 0, g: 124 }, { week: 1, g: 205 }, { week: 2, g: 305 },
      { week: 4, g: 540 }, { week: 6, g: 810 }, { week: 8, g: 1120 },
    ],
    medical: [
      { date: '2026-04-26', type: 'Ontworming', note: 'Milbemax — 6 wkn' },
      { date: '2026-05-12', type: 'Vaccinatie', note: 'Eerste enting (Nobivac)' },
    ],
  },
  {
    id: 'k3', litter_id: 'l1', name: 'Lyra', sex: 'Poes', color: 'Silver Tabby',
    pattern: 'Classic Tabby', status: 'Verkocht', price: 1550, published: true,
    born: '2026-03-15', chip: '528210002345680',
    weights: [
      { week: 0, g: 110 }, { week: 1, g: 180 }, { week: 2, g: 270 },
      { week: 4, g: 480 }, { week: 6, g: 730 }, { week: 8, g: 1010 },
    ],
    medical: [
      { date: '2026-04-26', type: 'Ontworming', note: 'Milbemax — 6 wkn' },
      { date: '2026-05-12', type: 'Vaccinatie', note: 'Eerste enting (Nobivac)' },
    ],
  },
  {
    id: 'k4', litter_id: 'l1', name: 'Vega', sex: 'Poes', color: 'Silver Tabby',
    pattern: 'Mackerel', status: 'Beschikbaar', price: 1550, published: true,
    born: '2026-03-15', chip: '528210002345681',
    weights: [
      { week: 0, g: 115 }, { week: 1, g: 188 }, { week: 2, g: 280 },
      { week: 4, g: 495 }, { week: 6, g: 760 }, { week: 8, g: 1040 },
    ],
    medical: [
      { date: '2026-04-26', type: 'Ontworming', note: 'Milbemax — 6 wkn' },
      { date: '2026-05-12', type: 'Vaccinatie', note: 'Eerste enting (Nobivac)' },
    ],
  },
];

// ---- table: customers (Private Access accounts) ----
export const customers = [
  { id: 'c1', email: 'klant@voorbeeld.nl', name: 'Familie de Vries', kitten_id: 'k2' },
];

// ---- helper lookups ----
export const getParent = (id) => parents.find((p) => p.id === id);
export const getLitter = (id) => litters.find((l) => l.id === id);
export const getKitten = (id) => kittens.find((k) => k.id === id);
