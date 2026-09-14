// Het EMS-systeem (Easy Mind System) zoals Mundikat en FIFe het gebruiken.
// Deze codes zijn leidend: een ras, kleur of patroon heeft altijd één code,
// en die code hoort overal in de app te werken — ook als zoekterm.
//
// Een EMS-code leest als: RAS  kleur(en)  cijfercodes
//   MCO n 22      = Maine Coon, zwart, tabby blotched
//   MCO ns 22 03  = Maine Coon, zwart zilver, tabby blotched, bicolour
//   RAG a 04 21   = Ragdoll, blauw, mitted, agouti

// --- Rassen ---
export const BREEDS = {
  ABY: 'Abessijn',
  ACL: 'American Curl Langhaar',
  ACS: 'American Curl Korthaar',
  BAL: 'Balinees',
  BEN: 'Bengaal',
  BLH: 'Brits Langhaar',
  BML: 'Burmilla',
  BSH: 'Brits Korthaar',
  BUR: 'Burmees',
  CHA: 'Chartreux',
  CRX: 'Cornish Rex',
  CYM: 'Cymric',
  DRX: 'Devon Rex',
  DSP: 'Don Sphynx',
  EUR: 'Europees Korthaar',
  EXO: 'Exotic',
  GRX: 'German Rex',
  JBT: 'Japanse Bobtail',
  KBL: 'Kurilian Bobtail Langhaar',
  KBS: 'Kurilian Bobtail Korthaar',
  KOR: 'Korat',
  LPL: 'LaPerm Langhaar',
  LPS: 'LaPerm Korthaar',
  MAN: 'Manx',
  MAU: 'Egyptisch Mau',
  MCO: 'Maine Coon',
  NEM: 'Neva Masquerade',
  NFO: 'Noorse Boskat',
  OCI: 'Ocicat',
  OLH: 'Oosters Langhaar',
  OSH: 'Oosters Korthaar',
  PEB: 'Peterbald',
  PER: 'Pers',
  RAG: 'Ragdoll',
  RUS: 'Russisch Blauw',
  SBI: 'Heilige Birmaan',
  SIA: 'Siamees',
  SIB: 'Siberische Kat',
  SIN: 'Singapura',
  SNO: 'Snowshoe',
  SOK: 'Sokoke',
  SOM: 'Somali',
  SPH: 'Sphynx',
  SRL: 'Selkirk Rex Langhaar',
  SRS: 'Selkirk Rex Korthaar',
  THA: 'Thai',
  TUA: 'Turks Angora',
  TUV: 'Turkse Van',
  XLH: 'Niet erkende langhaar',
  XLS: 'Niet erkende korthaar',
  // Voorlopig erkend
  BOM: 'Bombay',
  LYO: 'Lykoi',
};

// Rassen die (nog) voorlopig erkend zijn — in de code gevolgd door "non".
export const PROVISIONAL = ['BOM', 'LYO'];

// --- Kleuren (letters) ---
export const COLORS = {
  n: 'Zwart, seal, wildkleur',
  a: 'Blauw',
  b: 'Chocolate',
  c: 'Lilac',
  d: 'Rood',
  e: 'Crème',
  f: 'Zwart schildpad (black tortie)',
  g: 'Blauw schildpad (blue tortie)',
  h: 'Chocolate schildpad (chocolate tortie)',
  j: 'Lilac schildpad (lilac tortie)',
  o: 'Cinnamon (sorrel bij ABY en SOM)',
  p: 'Fawn',
  q: 'Cinnamon schildpad (cinnamon tortie)',
  r: 'Fawn schildpad (fawn tortie)',
  s: 'Zilver',
  t: 'Rasspecifieke modifier, amber (bij NFO)',
  u: 'Copper, CORIN',
  w: 'Wit',
  y: 'Golden',
  x: 'Niet erkende kleur',
};

// Alleen voor de Noorse Boskat (NFO).
export const NFO_ONLY = {
  nt: 'Amber',
  at: 'Licht amber',
  ft: 'Zwart schildpad amber',
  gt: 'Blauw schildpad licht amber',
  dt: 'Rood gebaseerd op amber',
  et: 'Crème gebaseerd op amber',
};

// Modifiers, alleen voor de registratie.
export const MODIFIERS = {
  m: 'Modifier',
  'x am': 'Caramel gebaseerd op blauw',
  'x cm': 'Caramel gebaseerd op lilac',
  'x pm': 'Caramel gebaseerd op fawn',
  'x em': 'Abrikoos gebaseerd op crème',
};

// --- Cijfercodes, gegroepeerd zoals op de officiële kaart ---
export const NUMERIC_GROUPS = [
  {
    key: 'piebald',
    label: 'Witaftekening (piebald)',
    codes: {
      '01': 'Van',
      '02': 'Harlekijn',
      '03': 'Bicolour',
      '04': 'Mitted (alleen RAG)',
      '05': 'Snowshoe (alleen SNO)',
      '09': 'Ongedefinieerd wit',
    },
  },
  {
    key: 'agouti',
    label: 'Tekening (agouti)',
    codes: {
      '11': 'Shaded',
      '12': 'Shell',
      '14': 'Charcoal (BEN)',
      '21': 'Agouti',
      '22': 'Tabby blotched',
      '23': 'Tabby mackerel',
      '24': 'Tabby spotted',
      '25': 'Tabby ticked',
    },
  },
  {
    key: 'points',
    label: 'Points',
    codes: {
      '31': 'Burmees gekleurd',
      '32': 'Tonkanees gekleurd',
      '33': 'Points (siamese aftekening)',
    },
  },
  {
    key: 'staart',
    label: 'Staart',
    codes: {
      '51': 'Rumpy',
      '52': 'Rumpy riser',
      '53': 'Stumpy (max. 3 cm)',
      '54': 'Longie',
    },
  },
  {
    key: 'ogen',
    label: 'Oogkleur',
    codes: {
      '61': 'Blauwe ogen',
      '62': 'Gouden (oranje, amber) ogen',
      '63': 'Odd eyed (twee verschillende kleuren)',
      '64': 'Groene ogen',
      '65': 'Burmese oogkleur',
      '66': 'Tonkanese oogkleur',
      '67': 'Siamese oogkleur',
    },
  },
  {
    key: 'oren',
    label: 'Oren',
    codes: {
      '71': 'Rechte oren (alleen ACL en ACS)',
      '72': 'Gekrulde oren (alleen ACL en ACS)',
    },
  },
  {
    key: 'vacht',
    label: 'Haarlengte / structuur',
    codes: {
      '81': 'Langharig (alleen DSP en PEB)',
      '82': 'Kortharig (alleen DSP en PEB)',
      '83': 'Brush (alleen DSP en PEB)',
      '84': 'Straight (alleen LPL/LPS en SRL/SRS)',
    },
  },
];

// Alle cijfercodes plat, voor snel opzoeken.
export const NUMERIC = NUMERIC_GROUPS.reduce((acc, g) => {
  for (const [code, label] of Object.entries(g.codes)) acc[code] = { label, group: g.key, groupLabel: g.label };
  return acc;
}, {});

const norm = (s) => (s || '').toString().trim();

/** Zoek een ras op code óf op naam. "ABY" en "abessijn" geven hetzelfde. */
export function findBreed(term) {
  const t = norm(term);
  if (!t) return null;
  const boven = t.toUpperCase();
  if (BREEDS[boven]) return { code: boven, name: BREEDS[boven] };
  const klein = t.toLowerCase();
  const treffer = Object.entries(BREEDS).find(([, naam]) => naam.toLowerCase() === klein);
  return treffer ? { code: treffer[0], name: treffer[1] } : null;
}

/** Alle rassen die bij een zoekterm passen — op code of op naam. */
export function searchBreeds(term) {
  const t = norm(term).toLowerCase();
  const alles = Object.entries(BREEDS).map(([code, name]) => ({ code, name }));
  if (!t) return alles;
  return alles.filter((b) => b.code.toLowerCase().includes(t) || b.name.toLowerCase().includes(t));
}

/**
 * Lees een EMS-code en leg uit wat er staat.
 * Geeft altijd een resultaat terug; onbekende delen komen in `onbekend`.
 */
export function parseEms(code) {
  const delen = norm(code).split(/\s+/).filter(Boolean);
  const uit = { breed: null, colors: [], numerics: [], onbekend: [], input: norm(code) };
  if (!delen.length) return uit;

  let i = 0;

  // 1. Eerste deel is het ras, als we het herkennen.
  const eerste = delen[0].toUpperCase();
  if (BREEDS[eerste]) {
    uit.breed = { code: eerste, name: BREEDS[eerste] };
    i = 1;
    // "non" na een voorlopig erkend ras hoort erbij.
    if (norm(delen[1]).toLowerCase() === 'non') i = 2;
  }

  // 2. Daarna letters (kleur) en cijfers (tekening) door elkaar.
  for (; i < delen.length; i++) {
    const deel = delen[i];
    const klein = deel.toLowerCase();

    if (/^\d{2}$/.test(deel)) {
      if (NUMERIC[deel]) uit.numerics.push({ code: deel, ...NUMERIC[deel] });
      else uit.onbekend.push(deel);
      continue;
    }

    // Alleen voor de Noorse Boskat gelden deze tweeletterige codes.
    if (NFO_ONLY[klein]) { uit.colors.push({ code: klein, label: NFO_ONLY[klein] }); continue; }

    if (/^[a-z]+$/.test(klein)) {
      // Een kleurdeel kan meerdere letters hebben, bijv. "ns" = zwart zilver.
      let herkend = true;
      const letters = [];
      for (const letter of klein) {
        if (COLORS[letter]) letters.push({ code: letter, label: COLORS[letter] });
        else { herkend = false; break; }
      }
      if (herkend) uit.colors.push(...letters);
      else uit.onbekend.push(deel);
      continue;
    }

    uit.onbekend.push(deel);
  }

  return uit;
}

/** Zet een gelezen EMS-code om naar één leesbare zin. */
export function describeEms(code) {
  const p = parseEms(code);
  const stukken = [];
  if (p.breed) stukken.push(p.breed.name);
  if (p.colors.length) stukken.push(p.colors.map((c) => c.label.split(' (')[0].toLowerCase()).join(', '));
  if (p.numerics.length) stukken.push(p.numerics.map((n) => n.label.split(' (')[0].toLowerCase()).join(', '));
  if (!stukken.length) return null;
  return stukken.join(' · ');
}

/** Klopt deze code helemaal? Handig om een waarschuwing te tonen. */
export function isValidEms(code) {
  const p = parseEms(code);
  return p.onbekend.length === 0 && (p.breed !== null || p.colors.length > 0);
}

/**
 * Maak zoektermen voor een dier, zodat zoeken op "ABY" én "Abessijn" werkt.
 * We geven zowel de codes als de uitgeschreven namen terug.
 */
export function emsSearchTerms(emsCode, breed) {
  const termen = new Set();
  const p = parseEms(emsCode);
  if (p.breed) { termen.add(p.breed.code); termen.add(p.breed.name); }
  p.colors.forEach((c) => { termen.add(c.code); termen.add(c.label); });
  p.numerics.forEach((n) => { termen.add(n.code); termen.add(n.label); });
  const b = findBreed(breed);
  if (b) { termen.add(b.code); termen.add(b.name); }
  else if (breed) termen.add(breed);
  return [...termen].filter(Boolean);
}
