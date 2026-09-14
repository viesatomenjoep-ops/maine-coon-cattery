// Alles rond gewichten van een heel nestje tegelijk: een kleur per dier,
// een tabel van datums × dieren, en het rekenwerk voor de groeigrafiek.

// Vaste kleurenreeks. Elk dier in een nestje krijgt zijn eigen kleur, en die
// blijft hetzelfde in de tabel en in de grafiek — zo blijf je ze herkennen.
export const KITTEN_KLEUREN = [
  '#c4893a', // brons
  '#457c55', // bosgroen
  '#ce6b4c', // terracotta
  '#4b7fa8', // staalblauw
  '#9b5fa8', // paars
  '#c2456b', // framboos
  '#6b8f3a', // mosgroen
  '#d4a017', // oker
  '#3f8f8a', // teal
  '#8a6b4f', // taupe
  '#7a5fd4', // indigo
  '#b8562f', // roest
];

export const kleurVoor = (index) => KITTEN_KLEUREN[index % KITTEN_KLEUREN.length];

// De moeder krijgt bewust een kleur buiten het palet: donker en dik, zodat haar
// lijn (die veel hoger loopt) niet met een jong verward wordt.
export const MOEDER_KLEUR = '#24402e';

/**
 * De kolommen van het weegblad: eerst de jongen, daarna eventueel de moeder.
 * Elke kolom krijgt hier zijn vaste kleur mee, zodat tabel en grafiek altijd
 * dezelfde kleur tonen.
 */
export function buildColumns(jongen, moeder, vanafDatum) {
  const kolommen = jongen.map((k, i) => ({ ...k, kleur: kleurVoor(i) }));
  if (moeder) {
    // Alleen de wegingen vanaf de dekking horen bij dit nestje; daarvoor was ze
    // niet drachtig en zegt haar gewicht hier niets.
    const weights = (moeder.weights || []).filter((w) => !vanafDatum || iso(w.date) >= vanafDatum);
    kolommen.push({ ...moeder, weights, kleur: MOEDER_KLEUR, isMoeder: true });
  }
  return kolommen;
}

const iso = (d) => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date) ? null : date.toISOString().slice(0, 10);
};

/**
 * Zet de losse wegingen van een groep dieren om naar een tabel:
 * één rij per datum, één kolom per dier.
 */
export function buildWeightTable(kittens) {
  const datums = new Set();
  for (const k of kittens) {
    for (const w of k.weights || []) {
      const d = iso(w.date);
      if (d) datums.add(d);
    }
  }

  const rijen = [...datums].sort().map((datum) => {
    const cellen = {};
    for (const k of kittens) {
      const treffer = (k.weights || []).find((w) => iso(w.date) === datum);
      cellen[k.id] = treffer ? { id: treffer.id, grams: treffer.grams } : null;
    }
    return { datum, cellen };
  });

  return rijen;
}

/**
 * Gegevens voor de groeigrafiek: per datum één punt met alle dieren erin,
 * zodat de lijnen naast elkaar te lezen zijn.
 */
export function buildChartData(kittens) {
  const rijen = buildWeightTable(kittens);
  return rijen.map(({ datum, cellen }) => {
    const punt = { datum, label: new Date(datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }) };
    for (const k of kittens) {
      const c = cellen[k.id];
      if (c && c.grams != null) punt[k.id] = c.grams;
    }
    return punt;
  });
}

/** Hoeveel dagen oud was het dier op de dag van wegen? */
export function leeftijdInDagen(geboorte, datum) {
  if (!geboorte || !datum) return null;
  const g = new Date(geboorte);
  const d = new Date(datum);
  if (isNaN(g) || isNaN(d)) return null;
  return Math.round((d - g) / 86400000);
}

/**
 * Groei ten opzichte van de vorige weging, in gram per dag.
 * Handig om te zien of een dier achterblijft.
 */
export function groeiPerDag(rijen, catId, index) {
  if (index <= 0) return null;
  const nu = rijen[index].cellen[catId];
  // Zoek de laatste eerdere weging van dit dier.
  for (let i = index - 1; i >= 0; i--) {
    const eerder = rijen[i].cellen[catId];
    if (nu?.grams != null && eerder?.grams != null) {
      const dagen = Math.max(1, Math.round((new Date(rijen[index].datum) - new Date(rijen[i].datum)) / 86400000));
      return Math.round((nu.grams - eerder.grams) / dagen);
    }
  }
  return null;
}
