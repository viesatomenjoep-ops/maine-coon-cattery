// Alles wat op de agenda hoort, afgeleid uit wat er al in de fokkerij staat.
// Zo hoef je niks dubbel in te voeren: een geplande enting of een verwachte
// werpdatum verschijnt vanzelf.

import { termsFor } from '@/lib/species';

// De soorten gebeurtenissen, elk met een eigen kleur in de kalender.
export const EVENT_TYPES = {
  behandeling: { label: 'Behandeling', dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  geboorte:    { label: 'Geboren',     dot: 'bg-brass-500',   chip: 'bg-brass-50 text-brass-800 border-brass-200' },
  verwacht:    { label: 'Verwacht',    dot: 'bg-brass-300',   chip: 'bg-brass-50/60 text-brass-700 border-brass-200' },
  verjaardag:  { label: 'Verjaardag',  dot: 'bg-terracotta-400', chip: 'bg-terracotta-50 text-terracotta-800 border-terracotta-200' },
  overdracht:  { label: 'Overdracht',  dot: 'bg-sky-500',     chip: 'bg-sky-50 text-sky-800 border-sky-200' },
  eigen:       { label: 'Eigen notitie', dot: 'bg-forest-700', chip: 'bg-forest-50 text-forest-800 border-forest-900/15' },
};

const iso = (d) => {
  if (!d) return null;
  const date = d instanceof Date ? d : new Date(d);
  return isNaN(date) ? null : date.toISOString().slice(0, 10);
};

// Zet een geboortedatum om naar de eerstvolgende verjaardag (dit of volgend jaar).
function nextBirthday(dateStr, referenceYear) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  const y = referenceYear;
  const candidate = new Date(Date.UTC(y, d.getMonth(), d.getDate()));
  return iso(candidate);
}

/**
 * Bouw de complete lijst gebeurtenissen.
 * `year` bepaalt in welk jaar terugkerende dingen (verjaardagen) vallen.
 */
export function buildEvents({ kittens = [], litters = [], customEvents = [], species, year }) {
  const terms = termsFor(species);
  const out = [];
  const jaar = year || new Date().getFullYear();

  // 1. Geplande behandelingen uit de dossiers.
  for (const k of kittens) {
    for (const m of k.medical || []) {
      if (!m.due || m.completed) continue;
      const date = iso(m.due);
      if (!date) continue;
      out.push({
        id: `med-${m.id || `${k.id}-${m.due}-${m.type}`}`,
        date,
        type: 'behandeling',
        title: m.type || 'Behandeling',
        subtitle: k.name,
        href: '/admin/medical',
        readOnly: true,
      });
    }
  }

  // 2. Nestjes: geboren of nog verwacht.
  for (const l of litters) {
    const date = iso(l.date_of_birth);
    if (!date) continue;
    const isExpected = (l.status || '').toLowerCase() === 'verwacht';
    out.push({
      id: `litter-${l.id}`,
      date,
      type: isExpected ? 'verwacht' : 'geboorte',
      title: isExpected ? `${l.name} verwacht` : `${l.name} geboren`,
      subtitle: [l.sire_name, l.dam_name].filter(Boolean).join(' × ') || null,
      href: `/admin/litters/${l.id}`,
      readOnly: true,
    });
  }

  // 3. Verjaardagen van je eigen fokdieren — handig voor de planning.
  for (const k of kittens) {
    if (!k.is_own_breeding_cat || !k.date_of_birth) continue;
    const date = nextBirthday(k.date_of_birth, jaar);
    if (!date) continue;
    const born = new Date(k.date_of_birth);
    const leeftijd = jaar - born.getFullYear();
    out.push({
      id: `bday-${k.id}-${jaar}`,
      date,
      type: 'verjaardag',
      title: `${k.name} wordt ${leeftijd}`,
      subtitle: cap(terms.animal),
      href: `/admin/cats/${k.id}`,
      readOnly: true,
    });
  }

  // 4. Eigen afspraken die je zelf hebt ingevoerd.
  for (const e of customEvents) {
    const date = iso(e.event_date);
    if (!date) continue;
    out.push({
      id: `custom-${e.id}`,
      rawId: e.id,
      date,
      type: e.type && EVENT_TYPES[e.type] ? e.type : 'eigen',
      title: e.title,
      subtitle: e.note || null,
      readOnly: false,
    });
  }

  return out.sort((a, b) => a.date.localeCompare(b.date));
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// ---- Kalender-rekenwerk (maandraster, weken, dagen) ----

export const DAY_NAMES = ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo'];
export const MONTH_NAMES = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

// Maandag als eerste dag van de week — zo kijkt Nederland naar een kalender.
function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = maandag
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Alle dagen die in een maandweergave passen (inclusief de rand-dagen).
export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const start = startOfWeekMonday(first);
  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(d);
  }
  // Laat de laatste rij weg als die volledig in de volgende maand valt.
  const trimmed = days.slice(0, 35);
  const needsSixth = days[34].getMonth() === month;
  return needsSixth ? days : trimmed;
}

export function weekGrid(date) {
  const start = startOfWeekMonday(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export const toKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const isSameDay = (a, b) => toKey(a) === toKey(b);
