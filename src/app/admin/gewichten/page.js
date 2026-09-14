'use client';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHeader, EmptyHero } from '@/components/admin/PageShell';
import { Card, Btn } from '@/components/admin';
import WeightChart from '@/components/admin/WeightChart';
import {
  buildWeightTable, buildChartData, buildColumns,
  leeftijdInDagen, groeiPerDag, MOEDER_KLEUR,
} from '@/lib/weights';
import { cap } from '@/lib/species';

const vandaag = () => new Date().toISOString().slice(0, 10);
const nlKort = (d) => new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: '2-digit' });
// Boven de kilo lees je kilo's makkelijker dan vier cijfers grammen.
const toonGewicht = (g) => (g >= 1000 ? `${(g / 1000).toFixed(2).replace('.', ',')} kg` : `${g} g`);

// Zolang een jong nog geen naam heeft, is zijn nummer zijn naam — precies zoals
// het op het weegblad staat: 1, 2, 3, 4.
const kolomNaam = (k) => {
  const naam = (k.name || '').trim();
  if (naam && naam.toLowerCase() !== 'naamloos') return naam;
  return k.animal_no ? `Nr. ${k.animal_no}` : 'Naamloos';
};

export default function GewichtenPage() {
  const {
    litters = [], kittens = [], terms,
    addWeight, updateWeight, deleteWeight, addKitten,
    weightNotes = [], saveWeightNote,
  } = useStore();

  const [litterId, setLitterId] = useState('');
  const [nieuweDatum, setNieuweDatum] = useState(vandaag());
  const [invoer, setInvoer] = useState({});        // wat je nu intypt voor de nieuwe ronde
  const [rondeNotitie, setRondeNotitie] = useState('');
  const [bewerkt, setBewerkt] = useState({});      // gewijzigde bestaande cellen
  const [toonMoeder, setToonMoeder] = useState(true);
  const [bezig, setBezig] = useState(false);
  const [melding, setMelding] = useState('');
  const [verborgen, setVerborgen] = useState([]);
  const [aantalNieuw, setAantalNieuw] = useState('');

  // Begin bij het nestje waar het laatst iets mee gebeurde.
  useEffect(() => {
    if (!litterId && litters.length) {
      const gesorteerd = [...litters].sort((a, b) =>
        (b.date_of_birth || b.mating_date || '').localeCompare(a.date_of_birth || a.mating_date || ''));
      setLitterId(gesorteerd[0].id);
    }
  }, [litters, litterId]);

  const litter = litters.find((l) => l.id === litterId) || null;

  // Alle jongen van dit nestje, op nummer en daarna op naam, zodat de volgorde
  // van de kolommen hetzelfde blijft als op papier.
  const nest = useMemo(
    () => kittens
      .filter((k) => k.litter_id === litterId && !k.is_own_breeding_cat)
      .sort((a, b) => {
        const na = parseInt(a.animal_no, 10), nb = parseInt(b.animal_no, 10);
        if (!isNaN(na) && !isNaN(nb) && na !== nb) return na - nb;
        if (!isNaN(na) !== !isNaN(nb)) return isNaN(na) ? 1 : -1;
        return (a.name || '').localeCompare(b.name || '');
      }),
    [kittens, litterId]
  );

  // De moeder hoort op hetzelfde blad: zij wordt vanaf de dekking gewogen.
  const moeder = useMemo(
    () => (litter?.dam_id ? kittens.find((k) => k.id === litter.dam_id) : null) || null,
    [kittens, litter]
  );

  // De kolomnaam wordt hier vastgelegd, zodat tabel, grafiek en legenda allemaal
  // hetzelfde tonen — ook bij jongen die nog alleen een nummer hebben.
  const kolommen = useMemo(
    () => buildColumns(nest, toonMoeder ? moeder : null, litter?.mating_date || null)
      .map((k) => ({ ...k, name: kolomNaam(k) })),
    [nest, moeder, toonMoeder, litter]
  );

  const rijen = useMemo(() => buildWeightTable(kolommen), [kolommen]);
  const grafiek = useMemo(() => buildChartData(kolommen), [kolommen]);

  const geboorte = litter?.date_of_birth || null;

  // Notities bij dit nestje, op datum opzoekbaar.
  const notities = useMemo(() => {
    const uit = {};
    for (const n of weightNotes) if (n.litter_id === litterId) uit[n.note_date] = n.note;
    return uit;
  }, [weightNotes, litterId]);

  // Als je van datum wisselt, laat dan zien wat er al bij die dag genoteerd staat.
  useEffect(() => { setRondeNotitie(notities[nieuweDatum] || ''); }, [nieuweDatum, notities]);

  // Wat er al op de gekozen datum staat, zodat we niet dubbel wegen.
  const bestaandOpDatum = useMemo(
    () => rijen.find((r) => r.datum === nieuweDatum)?.cellen || {},
    [rijen, nieuweDatum]
  );

  // Het laatst bekende gewicht per dier — handig als vergelijking tijdens het wegen.
  const laatsteWeging = useMemo(() => {
    const uit = {};
    for (const k of kolommen) {
      const w = [...(k.weights || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).pop();
      if (w) uit[k.id] = w;
    }
    return uit;
  }, [kolommen]);

  // Een hele weegronde in één keer opslaan: elk gewicht gaat naar het juiste dier.
  const bewaarRonde = async () => {
    const teDoen = Object.entries(invoer).filter(([, v]) => v !== '' && v != null);
    if (!teDoen.length && rondeNotitie === (notities[nieuweDatum] || '')) {
      return alert('Vul eerst minstens één gewicht of een aantekening in.');
    }
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

    let notitieFout = false;
    if (rondeNotitie !== (notities[nieuweDatum] || '')) {
      const res = await saveWeightNote(litterId, nieuweDatum, rondeNotitie);
      if (res?.error) notitieFout = true;
    }

    setBezig(false);
    setInvoer({});

    const delen = [];
    if (nieuw) delen.push(`${nieuw} ${nieuw === 1 ? 'gewicht' : 'gewichten'} opgeslagen`);
    if (bijgewerkt) delen.push(`${bijgewerkt} bijgewerkt`);
    if (mislukt) delen.push(`${mislukt} mislukt`);
    if (notitieFout) delen.push('aantekening mislukt');
    else if (rondeNotitie) delen.push('aantekening bewaard');
    setMelding(`${delen.join(' · ') || 'Niets gewijzigd'} op ${nlKort(nieuweDatum)}.`);
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
    await saveWeightNote(litterId, rij.datum, '');
  };

  // Vlak na de geboorte hebben de jongen nog geen naam, alleen een nummer.
  // Hiermee zet je ze in één keer klaar zodat je meteen kunt wegen.
  const maakGenummerd = async () => {
    const n = parseInt(aantalNieuw, 10);
    if (isNaN(n) || n < 1 || n > 20) return alert('Vul een aantal in tussen 1 en 20.');
    if (!confirm(`${n} ${n === 1 ? terms.young : terms.youngPlural} aanmaken, genummerd 1 t/m ${n}? Namen kun je later invullen.`)) return;

    setBezig(true);
    const start = nest.length;
    for (let i = 1; i <= n; i++) {
      const nummer = String(start + i);
      await addKitten({
        litter_id: litterId,
        name: `${cap(terms.young)} ${nummer}`,
        animal_no: nummer,
        status: 'beschikbaar',
        date_of_birth: geboorte || null,
        breed: litter?.breed || null,
      });
    }
    setBezig(false);
    setAantalNieuw('');
    setMelding(`${n} ${n === 1 ? terms.young : terms.youngPlural} aangemaakt, genummerd ${start + 1} t/m ${start + n}.`);
    setTimeout(() => setMelding(''), 6000);
  };

  const toggleDier = (id) =>
    setVerborgen((v) => (v.includes(id) ? v.filter((x) => x !== id) : [...v, id]));

  // Snelknoppen voor een datum: vandaag, of de leeftijd in weken. Voor de
  // geboorte tellen we vanaf de dekking, want dan weeg je de moeder.
  const datumKnoppen = useMemo(() => {
    const basis = geboorte || litter?.mating_date;
    if (!basis) return [];
    const eenheid = geboorte ? 'wk' : 'wk dracht';
    const b = new Date(basis);
    return [1, 2, 3, 4, 6, 8, 10, 12].map((wk) => {
      const d = new Date(b);
      d.setDate(d.getDate() + wk * 7);
      return { label: `${wk} ${eenheid}`, datum: d.toISOString().slice(0, 10) };
    }).filter((x) => x.datum <= vandaag());
  }, [geboorte, litter]);

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
          desc={`Maak eerst een ${terms.litter} aan. Daarna weeg je hier de moeder tijdens de dracht en alle ${terms.youngPlural} tegelijk.`}
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
        subtitle={`Weeg een heel ${terms.litter} in één keer, de moeder erbij`}
      />

      {/* Welk nestje */}
      <div className="mb-6 rounded-2xl border border-forest-900/10 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
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
            <Link href={`/admin/litters/${litter.id}`} className="ml-auto shrink-0 text-sm font-semibold text-forest-600 hover:underline">
              Open {terms.litter} →
            </Link>
          )}
        </div>

        {litter && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-forest-900/8 pt-3 text-sm text-forest-500">
            <span>{nest.length} {nest.length === 1 ? terms.young : terms.youngPlural}</span>
            {litter.mating_date && (
              <span>
                gedekt {nlKort(litter.mating_date)}
                {litter.mating_time && ` om ${litter.mating_time}`}
                {litter.sire_name && ` door ${litter.sire_name}`}
              </span>
            )}
            {geboorte && <span>geboren {nlKort(geboorte)}</span>}
            {moeder && (
              <label className="ml-auto inline-flex cursor-pointer items-center gap-2 font-medium text-forest-700">
                <input type="checkbox" checked={toonMoeder} onChange={(e) => setToonMoeder(e.target.checked)} className="h-4 w-4 accent-forest-800" />
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: MOEDER_KLEUR }} />
                  Moeder {kolomNaam(moeder)} meewegen
                </span>
              </label>
            )}
          </div>
        )}
      </div>

      {kolommen.length === 0 ? (
        <EmptyHero
          icon={<><path d="M12 5v14M5 12h14" /></>}
          title={`Nog niets om te wegen in dit ${terms.litter}`}
          desc={
            moeder
              ? `Vink hierboven "moeder meewegen" aan om haar dracht te volgen, of maak de ${terms.youngPlural} aan zodra ze geboren zijn.`
              : `Koppel een moeder aan het ${terms.litter} om haar dracht te volgen, of maak de ${terms.youngPlural} aan zodra ze geboren zijn.`
          }
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
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-forest-500">
                    Of kies een leeftijd
                  </span>
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
              {kolommen.map((k) => {
                const al = bestaandOpDatum[k.id];
                const vorige = laatsteWeging[k.id];
                return (
                  <label
                    key={k.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      al ? 'border-amber-300 bg-amber-50/40' : k.isMoeder ? 'border-forest-900/25 bg-forest-50/50' : 'border-forest-900/10 bg-white'
                    }`}
                  >
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: k.kleur }} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-forest-900">
                        {kolomNaam(k)}{k.isMoeder && <span className="font-normal text-forest-400"> · moeder</span>}
                      </span>
                      <span className="block truncate text-xs text-forest-400">
                        {al
                          ? `al ${toonGewicht(al.grams)} op deze dag`
                          : vorige
                            ? `laatst ${toonGewicht(vorige.grams)} · ${nlKort(vorige.date)}`
                            : 'nog nooit gewogen'}
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

            {/* De kantlijn van het papieren blad: wat viel er op deze dag op? */}
            <label className="mt-4 block">
              <span className="text-xs font-semibold uppercase tracking-wide text-forest-700">
                Aantekening bij deze dag (optioneel)
              </span>
              <input
                value={rondeNotitie}
                onChange={(e) => setRondeNotitie(e.target.value)}
                placeholder="Bijv. voeding extra, eerste ontworming, kleur bepaald"
                className="mt-1.5 w-full rounded-lg border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-forest-500">
                Wat je leeg laat wordt overgeslagen — je hoeft dus niet alles tegelijk te wegen.
                {Object.values(bestaandOpDatum).some(Boolean) && (
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
                {`Elk ${terms.young} heeft zijn eigen kleur. Klik een naam aan of uit om de grafiek rustiger te maken.`}
                {toonMoeder && moeder && ' De moeder loopt gestippeld, met haar eigen schaal rechts in kilo’s.'}
              </p>
              <WeightChart data={grafiek} kittens={kolommen} verborgen={verborgen} onToggle={toggleDier} />
            </Card>
          )}

          {/* De tabel met alles erin */}
          <Card className="mb-6 overflow-hidden !p-0">
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
                <table className="w-full min-w-[44rem] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-forest-900/10 bg-forest-50/50">
                      <th className="sticky left-0 z-10 bg-forest-50/50 px-5 py-3 text-left font-semibold text-forest-700">Datum</th>
                      {geboorte && <th className="px-3 py-3 text-left font-semibold text-forest-700">Leeftijd</th>}
                      {kolommen.map((k) => (
                        <th key={k.id} className="px-3 py-3 text-right font-semibold text-forest-800">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ background: k.kleur }} />
                            {kolomNaam(k)}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-3 text-left font-semibold text-forest-700">Aantekening</th>
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
                              {dagen == null ? '—' : dagen < 0 ? `${-dagen} d dracht` : `${dagen} d · ${Math.floor(dagen / 7)} wk`}
                            </td>
                          )}
                          {kolommen.map((k) => {
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
                          <td className="max-w-[16rem] px-3 py-2.5 text-forest-600">
                            {notities[rij.datum] || <span className="text-forest-300">—</span>}
                          </td>
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
                Een aantekening pas je aan door die datum hierboven te kiezen.
              </p>
            )}
          </Card>

          {/* Vlak na de geboorte: snel genummerde jongen klaarzetten */}
          <Card>
            <h2 className="mb-1 font-display text-xl text-forest-900">{`${cap(terms.youngPlural)} snel toevoegen`}</h2>
            <p className="mb-4 text-sm text-forest-500">
              {`Net geboren en nog geen namen? Zet ze hier in één keer klaar als ${terms.young} 1, 2, 3… zodat je meteen kunt wegen. Namen, geslacht en kleur vul je later in.`}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="number"
                min="1"
                max="20"
                value={aantalNieuw}
                onChange={(e) => setAantalNieuw(e.target.value)}
                placeholder="Aantal"
                className="w-28 rounded-lg border border-forest-900/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-brass-400"
              />
              <Btn variant="ghost" onClick={maakGenummerd} disabled={bezig || !aantalNieuw}>
                {`Aanmaken vanaf nr. ${nest.length + 1}`}
              </Btn>
              <Link href={`/admin/litters/new-kitten?litter=${litterId}`} className="text-sm font-semibold text-forest-600 hover:underline">
                Of één {terms.young} met alle gegevens →
              </Link>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
