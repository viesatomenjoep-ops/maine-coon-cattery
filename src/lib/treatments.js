// Gedeelde helpers voor medische behandelingen (ontworming, inenting, check)
// en hun geplande vervolgdatums / herinneringen.

export const TREATMENT_TYPES = ['Vaccinatie', 'Ontworming', 'Gezondheidscheck'];

export const treatmentIcon = (type) =>
  type === 'Vaccinatie' ? '💉' : type === 'Ontworming' ? '💊' : '🩺';

const DAY = 86400000;

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  d.setHours(0, 0, 0, 0);
  return Math.round((d - today) / DAY);
}

export function formatDate(dateStr) {
  try {
    return new Date(dateStr).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

// Bepaal urgentie + kleur + label op basis van de vervaldatum.
export function urgency(dateStr) {
  const n = daysUntil(dateStr);
  if (n === null) return null;
  if (n < 0) return { key: 'overdue', label: `${Math.abs(n)} ${Math.abs(n) === 1 ? 'dag' : 'dagen'} te laat`, cls: 'bg-red-100 text-red-700 border-red-200', days: n };
  if (n === 0) return { key: 'today', label: 'Vandaag', cls: 'bg-red-100 text-red-700 border-red-200', days: n };
  if (n <= 7) return { key: 'soon', label: `Over ${n} ${n === 1 ? 'dag' : 'dagen'}`, cls: 'bg-amber-100 text-amber-800 border-amber-200', days: n };
  if (n <= 31) return { key: 'month', label: `Over ${n} dagen`, cls: 'bg-brass-100 text-brass-700 border-brass-200', days: n };
  return { key: 'later', label: formatDate(dateStr), cls: 'bg-forest-50 text-forest-700 border-forest-900/10', days: n };
}

// Verzamel alle geplande behandelingen (met vervaldatum) over een lijst katten.
export function collectUpcoming(kittens, { includeOverdue = true, onlyCatIds = null } = {}) {
  const items = [];
  for (const k of kittens || []) {
    if (onlyCatIds && !onlyCatIds.includes(k.id)) continue;
    for (const m of k.medical || []) {
      if (!m.due) continue;
      const n = daysUntil(m.due);
      if (n === null) continue;
      if (!includeOverdue && n < 0) continue;
      items.push({ catId: k.id, catName: k.name, type: m.type, due: m.due, note: m.note, days: n, medId: m.id });
    }
  }
  return items.sort((a, b) => new Date(a.due) - new Date(b.due));
}

// Alleen de items waarvoor nu een melding relevant is (te laat of binnen 7 dagen).
export function dueSoon(kittens, opts = {}) {
  return collectUpcoming(kittens, opts).filter((i) => i.days <= 7);
}

// Per kat: de eerstvolgende geplande behandeling van een bepaald type (of elk type).
export function nextTreatment(cat, type = null) {
  const entries = (cat?.medical || [])
    .filter((m) => m.due && (!type || m.type === type))
    .map((m) => ({ ...m, days: daysUntil(m.due) }))
    .filter((m) => m.days !== null && m.days >= 0)
    .sort((a, b) => new Date(a.due) - new Date(b.due));
  return entries[0] || null;
}
