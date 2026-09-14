'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHeader, EmptyHero } from '@/components/admin/PageShell';
import { Card, Btn } from '@/components/admin';
import WeightChart from '@/components/admin/WeightChart';
import { buildWeightTable, buildChartData, kleurVoor, leeftijdInDagen, groeiPerDag } from '@/lib/weights';
import { cap } from '@/lib/species';

const vandaag = () => new Date().toISOString().slice(0, 10);
const nlKort = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: '2-digit' });

export default function GewichtenPage() {
  const { litters = [], kittens = [], addWeight, updateWeight, deleteWeight, terms } = useStore();

  const [litterId, setLitterId] = useState('');
  const [nieuweDatum, setNieuweDatum] = useState(vandaag());
  const [invoer, setInvoer] = useState({});        // wat je nu intypt voor de nieuwe ronde
  const [bewerkt, setBewerkt] = useState({});      // gewijzigde bestaande cellen
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState('');
  const [verborgen, setVerborgen] = useState([]);

  // Begin bij het nestje waar het laatst iets mee gebeurde.
  useEffect(() => {
    if (!litterId && litters.length) {
      const gesorteerd = [...litters].sort((a, b) => (b.date_of_birth || '').localeCompare(a.date_of_birth || ''));
      setLitterId(gesorteerd[0].id);
    }
  }, [litters, litterId]);

  const litter = litters.find((l) => l.id === litterId) || null;

  // Alle jongen van dit nestje, op naam gesorteerd zodat de volgorde vast staat.
  const nest = useMemo(
    () => kittens
      .filter((k) => k.litter_id === litterId && !k.is_own_breeding_cat)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [kittens, litterId]
  );

  const rijen = useMemo(() => buildWeightTable(nest), [nest]);
  const grafiek = useMemo(() => buildChartData(nest), [nest]);

  const geboorte = litter?.date_of_birth || null;

  // Wat er al op de gekozen datum staat, zodat we niet dubbel wegen.
  const bestaandOpDatum = useMemo(
    () => rijen.find((r) => r.datum === nieuweDatum)?.cellen || {},
    [rijen, nieuweDatum]
  );

  // Het laatst bekende gewicht per dier — handig als vergelijking tijdens het wegen.
  const laatsteWeging = useMemo(() => {
    const uit = {};
    for (const k of nest) {
      const w = [...(k.weights || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).pop();
      if (w) uit[k.id] = w;
    }
    return uit;
  }, [nest]);

  // Een hele weegronde in één keer opslaan: elk gewicht gaat naar het juiste dier.
  const bewaarRonde = async () => {
    const teDoen = Object.entries(invoer).filter(([, v]) => v !== '' && v != null);
    if (!teDoen.length) return alert('Vul eerst minstens één gewicht in.');
    if (!nieuweDatum) return alert('Kies eerst een datum.');

    setBezig(true);
    let nieuw = 0, bijgewerkt = 0, mislukt = 0;
    for (const [catId, grams] of teDoen) {
      const n = parseInt(grams, 10);
      if (isNaN(n)) { mislukt++; continue; }
      // Stond er al een weging op deze dag? Dan corrigeren we die, in plaats van
      // er een tweede naast te zetten.
      const bestaand = bestaandOpDatum[catId];
      const res = bestaand
        ? await updateWeight(catId, bestaand.id, n)
        : await addWeight(catId, nieuweDatum, n);
      if (res?.error) mislukt++;
      else if (bestaand) bijgewerkt++;
      else nieuw++;
    }
    setBezig(false);
    setInvoer({});

    const delen = [];
    if (nieuw) delen.push(`${nieuw} ${nieuw === 1 ? 'gewicht' : 'gewichten'} opgeslagen`);
    if (bijgewerkt) delen.push(`${bijgewerkt} bijgewerkt`);
    if (mislukt) delen.push(`${mislukt} mislukt`);
    setMelding(`${delen.join(' · ')} op ${nlKort(nieuweDatum)}.`);
    setTimeout(() => setMelding(''), 6000);
  };

  // Een bestaande cel corrigeren.
  const bewaarCel = async (catId, weightId, waarde) => {
    const sleutel = `${catId}|${weightId}`;
    const n = parseInt(waarde, 10);
    if (isNaN(n)) return;
    await updateWeight(catId, weightId, n);
    setBewerkt((b) => { const c = { ...b }; delete c[sleutel]; return c; });
  };

  // Een hele weegronde weghalen — bijvoorbeeld als je per ongeluk de verkeerde datum koos.
  const wisRonde = async (rij) => {
    const aantal = Object.values(rij.cellen).filter(Boolean).length;
    if (!confirm(`Weging van ${nlKort(rij.datum)} verwijderen? Dat zijn ${aantal} ${aantal === 1 ? 'gewicht' : 'gewichten'}.`)) return;
    for (const [catId, cel] of Object.entries(rij.cellen)) {
      if (cel) await deleteWeight(catId, cel.id);
    }
  };

  const toggleDier = (id) =>
    setVerborgen((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  // Snelknoppen voor een datum: vandaag, of de leeftijd in weken.
  const datumKnoppen = useMemo(() => {
    if (!geboorte) return [];
    const g = new Date(geboorte);
    return [1, 2, 3, 4, 6, 8, 10, 12].map((wk) => {
      const d = new Date(g);
      d.setDate(d.getDate() + wk * 7);
      return { label: `${wk} wk`, datum: d.toISOString().slice(0, 10) };
    }).filter((x) => x.datum <= vandaag());
  }, [geboorte]);

  if (litters.length === 0) {
    return (
      <div>
        <PageHeader
          icon={<><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></>}
          title="Gewichten"
        />
        <EmptyHero
          icon={<><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></>}
          title={`Nog geen ${terms.litterPlural}`}
          desc={`Maak eerst een ${terms.litter} met ${terms.youngPlural}, dan kun je hier het hele ${terms.litter} in één tabel wegen.`}
          action={
            <Link href="/admin/litters/new" className="rounded-xl bg-forest-800 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
              {`${cap(terms.litter)} aanmaken`}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        icon={<><path d="M3 3v18h18" /><path d="m7 14 4-4 3 3 5-6" /></>}
        title="Gewichten"
        subtitle={`Weeg een heel ${terms.litter} in één keer`}
      />

      {/* Welk nestje */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-forest-900/10 bg-white p-4">
        <span className="text-sm font-semibold text-forest-700">{cap(terms.litter)}:</span>
        <select
          value={litterId}
          onChange={(e) => { setLitterId(e.target.value); setInvoer({}); setVerborgen([]); }}
          className="min-w-0 flex-1 rounded-lg border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400 sm:flex-none sm:w-80"
        >
          {litters.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}{l.date_of_birth ? ` — ${nlKort(l.date_of_birth)}` : ''}
            </option>
          ))}
        </select>
        {litter && (
          <span className="text-sm text-forest-500">
            {nest.length} {nest.length === 1 ? terms.young : terms.youngPlural}
            {geboorte && ` · geboren ${nlKort(geboorte)}`}
          </span>
        )}
        {litter && (
          <Link href={`/admin/litters/${litter.id}`} className="ml-auto shrink-0 text-sm font-semibold text-forest-600 hover:underline">
            Open {terms.litter} →
          </Link>
        )}
      </div>

      {nest.length === 0 ? (
        <EmptyHero
          icon={<><path d="M12 5v14M5 12h14" /></>}
          title={`Dit ${terms.litter} heeft nog geen ${terms.youngPlural}`}
          desc={`Voeg ze toe aan het ${terms.litter}, dan verschijnen ze hier als kolommen in de weegtabel.`}
          action={
            <Link href={`/admin/litters/new-kitten?litter=${litterId}`} className="rounded-xl bg-forest-800 px-6 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
              {`${cap(terms.young)} toevoegen`}
            </Link>
          }
        />
      ) : (
        <>
          {/* Nieuwe weegronde */}
          <Card className="mb-6">
            <div className="mb-4 flex flex-wrap items-end gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">Datum van wegen</span>
                <input
                  type="date"
                  value={nieuweDatum}
                  onChange={(e) => setNieuweDatum(e.target.value)}
                  max={vandaag()}
                  className="mt-1.5 block rounded-lg border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400"
                />
              </label>

              {datumKnoppen.length > 0 && (
                <div className="min-w-0 flex-1">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest-500">Of kies een leeftijd</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setNieuweDatum(vandaag())}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${nieuweDatum === vandaag() ? 'bg-forest-800 text-cream-50' : 'bg-forest-900/5 text-forest-700 hover:bg-forest-900/10'}`}
                    >
                      Vandaag
                    </button>
                    {datumKnoppen.map((d) => (
                      <button
                        key={d.label}
                        onClick={() => setNieuweDatum(d.datum)}
                        className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${nieuweDatum === d.datum ? 'bg-forest-800 text-cream-50' : 'bg-forest-900/5 text-forest-700 hover:bg-forest-900/10'}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alle dieren onder elkaar, één invoerveld per dier */}
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {nest.map((k, i) => {
                const al = bestaandOpDatum[k.id];
                const vorige = laatsteWeging[k.id];
                return (
                  <label
                    key={k.id}
                    className={`flex items-center gap-3 rounded-xl border bg-white p-3 ${al ? 'border-amber-300 bg-amber-50/40' : 'border-forest-900/10'}`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: kleurVoor(i) }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-forest-900">{k.name}</span>
                      <span className="block truncate text-xs text-forest-400">
                        {k.animal_no && `nr. ${k.animal_no}`}
                        {k.animal_no && (al || vorige) && ' · '}
                        {al
                          ? `al ${al.grams} g op deze dag`
                          : vorige && `laatst ${vorige.grams} g · ${nlKort(vorige.date)}`}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        value={invoer[k.id] ?? ''}
                        onChange={(e) => setInvoer((s) => ({ ...s, [k.id]: e.target.value }))}
                        placeholder={al ? String(al.grams) : '—'}
                        className="w-24 rounded-lg border border-forest-900/15 bg-white px-3 py-2 text-right text-sm tabular-nums outline-none focus:border-brass-400"
                      />
                      <span className="text-xs text-forest-400">g</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-forest-500">
                Wat je leeg laat wordt overgeslagen — je hoeft dus niet alles tegelijk te wegen.
                {Object.keys(bestaandOpDatum).some((id) => bestaandOpDatum[id]) && (
                  <span className="block text-amber-700">
                    Geel betekent: op deze datum is al gewogen. Vul je iets in, dan wordt dat gecorrigeerd.
                  </span>
                )}
              </p>
              <Btn variant="brass" onClick={bewaarRonde} disabled={bezig}>
                {bezig ? 'Opslaan…' : `Opslaan op ${nlKort(nieuweDatum)}`}
              </Btn>
            </div>

            {melding && (
              <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800">✓ {melding}</p>
            )}
          </Card>

          {/* De grafiek */}
          {grafiek.length > 0 && (
            <Card className="mb-6">
              <h2 className="mb-1 font-display text-xl text-forest-900">Groeicurve</h2>
              <p className="mb-5 text-sm text-forest-500">
                Elk {terms.young} heeft zijn eigen kleur. Klik een naam aan of uit om de grafiek rustiger te maken.
              </p>
              <WeightChart data={grafiek} kittens={nest} verborgen={verborgen} onToggle={toggleDier} />
            </Card>
          )}

          {/* De tabel met alles erin */}
          <Card className="overflow-hidden !p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-forest-900/10 p-5">
              <h2 className="font-display text-xl text-forest-900">Alle wegingen</h2>
              <span className="text-sm text-forest-500">
                {rijen.length} {rijen.length === 1 ? 'meetmoment' : 'meetmomenten'}
              </span>
            </div>

            {rijen.length === 0 ? (
              <p className="p-8 text-center text-sm text-forest-500">
                Nog niets gewogen. Vul hierboven de eerste ronde in.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[40rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-forest-900/10 bg-forest-50/50">
                      <th className="sticky left-0 z-10 bg-forest-50/50 px-5 py-3 text-left font-semibold text-forest-700">Datum</th>
                      {geboorte && <th className="px-3 py-3 text-left font-semibold text-forest-700">Leeftijd</th>}
                      {nest.map((k, i) => (
                        <th key={k.id} className="px-3 py-3 text-right font-semibold text-forest-800">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: kleurVoor(i) }} />
                            {k.name}
                          </span>
                        </th>
                      ))}
                      <th className="w-10 px-3 py-3" aria-label="Verwijderen" />
                    </tr>
                  </thead>
                  <tbody>
                    {rijen.map((rij, ri) => {
                      const dagen = leeftijdInDagen(geboorte, rij.datum);
                      return (
                        <tr key={rij.datum} className="border-b border-forest-900/6 last:border-0 hover:bg-forest-50/40">
                          <td className="sticky left-0 z-10 bg-white px-5 py-2.5 font-medium text-forest-900">
                            {nlKort(rij.datum)}
                          </td>
                          {geboorte && (
                            <td className="whitespace-nowrap px-3 py-2.5 text-forest-500">
                              {dagen != null ? `${dagen} d · ${Math.floor(dagen / 7)} wk` : '—'}
                            </td>
                          )}
                          {nest.map((k) => {
                            const cel = rij.cellen[k.id];
                            const sleutel = `${k.id}|${cel?.id}`;
                            const groei = groeiPerDag(rijen, k.id, ri);
                            return (
                              <td key={k.id} className="px-3 py-2 text-right">
                                {cel ? (
                                  <span className="inline-flex flex-col items-end">
                                    <input
                                      type="number"
                                      value={bewerkt[sleutel] ?? cel.grams}
                                      onChange={(e) => setBewerkt((b) => ({ ...b, [sleutel]: e.target.value }))}
                                      onBlur={(e) => {
                                        if (String(e.target.value) !== String(cel.grams)) bewaarCel(k.id, cel.id, e.target.value);
                                      }}
                                      className="w-20 rounded-md border border-transparent bg-transparent px-2 py-1 text-right tabular-nums text-forest-900 outline-none transition hover:border-forest-900/15 focus:border-brass-400 focus:bg-white"
                                    />
                                    {groei != null && (
                                      <span className={`pr-2 text-[11px] tabular-nums ${groei >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {groei >= 0 ? '+' : ''}{groei} g/dag
                                      </span>
                                    )}
                                  </span>
                                ) : (
                                  <span className="text-forest-300">—</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2 text-right">
                            <button
                              type="button"
                              onClick={() => wisRonde(rij)}
                              title={`Weging van ${nlKort(rij.datum)} verwijderen`}
                              className="rounded-md px-2 py-1 text-forest-300 transition hover:bg-red-50 hover:text-red-600"
                            >
                              ×
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {rijen.length > 0 && (
              <p className="border-t border-forest-900/10 px-5 py-3 text-xs text-forest-500">
                Klik in een getal om het te corrigeren; het wordt opgeslagen zodra je het veld verlaat.
                Onder elk gewicht staat de groei per dag sinds de vorige weging.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
