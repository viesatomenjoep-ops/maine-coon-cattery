// Woordenboek per diersoort. De hele app haalt hier zijn woorden vandaan, zodat
// een hondenfokker "pup" en "kennel" ziet waar een kattenfokker "kitten" en
// "cattery" ziet. Nooit hardcoderen in schermen — altijd via useTerms().

export const SPECIES_KEYS = ['katten', 'honden', 'vogels', 'duiven', 'knaagdieren', 'anders'];

const BASE = {
  // Losse dieren
  animal: 'dier',
  animalPlural: 'dieren',
  theAnimal: 'het dier',
  // Jonge dieren
  young: 'jong',
  youngPlural: 'jongen',
  // Ouderdieren
  female: 'moederdier',
  male: 'vaderdier',
  femalePlural: 'moederdieren',
  malePlural: 'vaderdieren',
  // De fokkerij zelf
  facility: 'fokkerij',
  // Nest
  litter: 'nestje',
  litterPlural: 'nestjes',
  // Draagtijd in dagen — voor het berekenen van een verwachte werpdatum
  gestationDays: null,
};

const DICT = {
  katten: {
    ...BASE,
    animal: 'kat', animalPlural: 'katten', theAnimal: 'de kat',
    young: 'kitten', youngPlural: 'kittens',
    female: 'poes', male: 'kater', femalePlural: 'poezen', malePlural: 'katers',
    facility: 'cattery',
    gestationDays: 65,
  },
  honden: {
    ...BASE,
    animal: 'hond', animalPlural: 'honden', theAnimal: 'de hond',
    young: 'pup', youngPlural: 'pups',
    female: 'teef', male: 'reu', femalePlural: 'teven', malePlural: 'reuen',
    facility: 'kennel',
    gestationDays: 63,
  },
  vogels: {
    ...BASE,
    animal: 'vogel', animalPlural: 'vogels', theAnimal: 'de vogel',
    young: 'jong', youngPlural: 'jongen',
    female: 'pop', male: 'man', femalePlural: 'poppen', malePlural: 'mannen',
    facility: 'volière',
    litter: 'broedsel', litterPlural: 'broedsels',
  },
  duiven: {
    ...BASE,
    animal: 'duif', animalPlural: 'duiven', theAnimal: 'de duif',
    young: 'jong', youngPlural: 'jongen',
    female: 'duivin', male: 'doffer', femalePlural: 'duivinnen', malePlural: 'doffers',
    facility: 'duivenhok',
    litter: 'broedsel', litterPlural: 'broedsels',
  },
  knaagdieren: {
    ...BASE,
    animal: 'dier', animalPlural: 'dieren', theAnimal: 'het dier',
    young: 'jong', youngPlural: 'jongen',
    female: 'voedster', male: 'ram', femalePlural: 'voedsters', malePlural: 'rammen',
    facility: 'fokkerij',
    gestationDays: 31,
  },
  anders: { ...BASE },
};

// Normaliseer wat er ook in de database staat naar een bekende sleutel.
export function normalizeSpecies(value) {
  const v = (value || '').toString().trim().toLowerCase();
  if (!v) return 'katten';
  if (SPECIES_KEYS.includes(v)) return v;
  if (/kat|cat|feline/.test(v)) return 'katten';
  if (/hond|dog|canine|pup/.test(v)) return 'honden';
  if (/duif|duiv|pigeon/.test(v)) return 'duiven';
  if (/vogel|bird/.test(v)) return 'vogels';
  if (/knaag|konijn|cavia|rabbit|rodent/.test(v)) return 'knaagdieren';
  return 'anders';
}

export function termsFor(species) {
  return DICT[normalizeSpecies(species)] || DICT.katten;
}

// Zet de eerste letter van een woord in hoofdletters, voor gebruik in koppen.
export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Geslachtslabel op basis van wat er is opgeslagen én de diersoort.
export function sexLabel(gender, species) {
  const t = termsFor(species);
  const v = (gender || '').toString().trim().toLowerCase();
  if (/kater|reu|doffer|ram|mann|male|\bm\b/.test(v)) return cap(t.male);
  if (/poes|teef|duivin|pop|voedster|vrouw|female|\bf\b/.test(v)) return cap(t.female);
  return gender || 'Onbekend';
}
