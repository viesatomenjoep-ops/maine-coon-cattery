'use client';
import { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHeader } from '@/components/admin/PageShell';
import { Card, Btn } from '@/components/admin';
import ContractUploader from '@/components/admin/ContractUploader';
import { cap } from '@/lib/species';

// Eenmalige invoer van oude koopcontracten. Je plakt de uitgelezen gegevens,
// controleert ze, en zet ze daarna in één keer in het systeem. Bestaande
// dieren worden overgeslagen, zodat je dit gerust twee keer kunt draaien.

const norm = (s) => (s || '').toString().trim().toLowerCase();

function Regel({ r, bestaat, gekozen, onToggle }) {
  const waarschuwing = r.twijfel || (r.chipnummer && r.chipnummer.replace(/\D/g, '').length !== 15);
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 border-b border-forest-900/8 p-4 transition ${
        bestaat ? 'bg-forest-50/40 opacity-60' : gekozen ? 'bg-brass-50/40' : 'bg-white hover:bg-forest-50/40'
      }`}
    >
      <input
        type="checkbox"
        checked={gekozen}
        disabled={bestaat}
        onChange={(e) => onToggle(e.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded accent-brass-500 disabled:opacity-40"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-display text-lg text-forest-950">{r.kitten_naam || '(naamloos)'}</span>
          {r.geslacht && <span className="text-sm text-forest-500">{r.geslacht}</span>}
          {r.status && r.status !== 'Verkocht' && (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-bold uppercase text-stone-700">{r.status}</span>
          )}
          {bestaat && <span className="rounded-full bg-forest-200 px-2 py-0.5 text-[11px] font-bold text-forest-700">STAAT AL IN HET SYSTEEM</span>}
        </span>
        <span className="mt-1 block text-sm text-forest-600">
          {[r.kleur, r.chipnummer, r.geboortedatum].filter(Boolean).join(' · ') || 'geen details'}
        </span>
        {(r.vader || r.moeder) && (
          <span className="mt-0.5 block text-sm text-forest-500">
            Ouders: {r.vader || '?'} × {r.moeder || '?'}
          </span>
        )}
        {r.koper_naam && (
          <span className="mt-0.5 block text-sm text-forest-500">
            Koper: {r.koper_naam}{r.koper_postcode_plaats ? ` · ${r.koper_postcode_plaats}` : ''}
          </span>
        )}
        {waarschuwing && (
          <span className="mt-2 block rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-800">
            ⚠ {r.twijfel || 'Chipnummer heeft niet 15 cijfers — controleer dit.'}
          </span>
        )}
      </span>
      <span className="shrink-0 text-xs text-forest-400">{r.map}</span>
    </label>
  );
}

export default function ImportPage() {
  const { kittens = [], litters = [], customers = [], addKitten, addLitter, addCustomer, terms } = useStore();
  const [stap, setStap] = useState('gegevens');
  const [ruw, setRuw] = useState('');
  const [rijen, setRijen] = useState(null);
  const [fout, setFout] = useState('');
  const [gekozen, setGekozen] = useState({});
  const [bezig, setBezig] = useState(false);
  const [log, setLog] = useState([]);
  const [klaar, setKlaar] = useState(false);

  const lees = () => {
    setFout('');
    try {
      const data = JSON.parse(ruw);
      if (!Array.isArray(data)) throw new Error('Ik verwacht een lijst (array).');
      setRijen(data);
      // Standaard alles aanvinken wat nog niet bestaat.
      const start = {};
      data.forEach((r, i) => { start[i] = !bestaatAl(r); });
      setGekozen(start);
    } catch (e) {
      setFout('Kon de gegevens niet lezen: ' + e.message);
    }
  };

  // Bestaat dit dier al? We kijken naar chipnummer, anders naar de naam.
  function bestaatAl(r) {
    const chip = (r.chipnummer || '').replace(/\D/g, '');
    if (chip && kittens.some((k) => (k.chip_number || '').replace(/\D/g, '') === chip)) return true;
    if (r.kitten_naam && kittens.some((k) => norm(k.name) === norm(r.kitten_naam))) return true;
    return false;
  }

  const teDoen = useMemo(
    () => (rijen || []).map((r, i) => ({ r, i })).filter(({ i }) => gekozen[i]),
    [rijen, gekozen]
  );

  const schrijf = (tekst) => setLog((l) => [...l, tekst]);

  const importeer = async () => {
    setBezig(true); setLog([]); setKlaar(false);

    // 1. Nestjes: groepeer op ouderpaar + geboortedatum.
    const nestSleutel = (r) => `${norm(r.vader)}|${norm(r.moeder)}|${r.geboortedatum || ''}`;
    const nestCache = {};
    for (const l of litters) {
      nestCache[`${norm(l.sire_name)}|${norm(l.dam_name)}|${l.date_of_birth || ''}`] = l.id;
    }

    // 2. Klanten: op naam, zodat dezelfde koper niet dubbel komt.
    const klantCache = {};
    for (const c of customers) klantCache[norm(c.name)] = c.id;

    let nieuweNesten = 0, nieuweKlanten = 0, nieuweDieren = 0, mislukt = 0;

    for (const { r } of teDoen) {
      try {
        // --- nestje ---
        let litterId = null;
        if (r.vader || r.moeder) {
          const sleutel = nestSleutel(r);
          if (nestCache[sleutel]) {
            litterId = nestCache[sleutel];
          } else {
            const jaar = r.geboortedatum ? r.geboortedatum.slice(0, 4) : '';
            const naam = `${r.vader || '?'} × ${r.moeder || '?'}${jaar ? ` ${jaar}` : ''}`;
            const res = await addLitter({
              name: naam,
              born: r.geboortedatum || null,
              sire_name: r.vader || null,
              dam_name: r.moeder || null,
              status: 'afgerond',
            });
            if (res?.data) { litterId = res.data.id; nestCache[sleutel] = litterId; nieuweNesten++; schrijf(`Nestje aangemaakt: ${naam}`); }
          }
        }

        // --- klant ---
        let customerId = null;
        if (r.koper_naam) {
          const sleutel = norm(r.koper_naam);
          if (klantCache[sleutel]) {
            customerId = klantCache[sleutel];
          } else {
            const adres = [r.koper_adres, r.koper_postcode_plaats, r.koper_land].filter(Boolean).join('\n');
            const c = await addCustomer({
              name: r.koper_naam,
              email: r.koper_email || null,
              whatsapp_number: r.koper_telefoon || null,
              address: adres || null,
            });
            if (c?.id) { customerId = c.id; klantCache[sleutel] = customerId; nieuweKlanten++; schrijf(`Klant aangemaakt: ${r.koper_naam}`); }
          }
        }

        // --- het dier ---
        const res = await addKitten({
          name: r.kitten_naam || 'Naamloos',
          litter_id: litterId,
          gender: r.geslacht || null,
          color: r.kleur || null,
          chip_no: (r.chipnummer || '').replace(/\D/g, '') || null,
          date_of_birth: r.geboortedatum || null,
          // De status uit de gegevens gaat voor; anders gaan we uit van verkocht.
          status: r.status || 'Verkocht',
          price_nl: r.prijs ?? null,
          customer_id: customerId,
          reserved_by: r.koper_naam || null,
        });
        if (res?.error) throw new Error(res.error.message);
        nieuweDieren++;
        schrijf(`✓ ${r.kitten_naam}`);
      } catch (e) {
        mislukt++;
        schrijf(`✗ ${r.kitten_naam || r.map}: ${e.message}`);
      }
    }

    schrijf(`—`);
    schrijf(`Klaar: ${nieuweDieren} ${terms.animalPlural}, ${nieuweNesten} ${terms.litterPlural}, ${nieuweKlanten} klanten${mislukt ? `, ${mislukt} mislukt` : ''}.`);
    setBezig(false);
    setKlaar(true);
  };

  const aantalNieuw = rijen ? rijen.filter((r) => !bestaatAl(r)).length : 0;
  const aantalBestaat = rijen ? rijen.length - aantalNieuw : 0;

  return (
    <div>
      <PageHeader
        icon={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5M12 15V3" /></>}
        title="Contracten invoeren"
        subtitle="Eenmalig oude koopcontracten in het systeem zetten"
      />

      {/* Twee stappen: eerst de gegevens, daarna de bestanden zelf. */}
      <div className="mb-6 flex gap-1.5 rounded-2xl bg-forest-900/[0.04] p-1.5">
        {[
          { key: 'gegevens', label: '1. Gegevens invoeren' },
          { key: 'bestanden', label: '2. Contract-PDF\u2019s koppelen' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setStap(t.key)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              stap === t.key ? 'bg-forest-800 text-cream-50 shadow-sm' : 'bg-white text-forest-600 hover:bg-forest-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {stap === 'bestanden' && (
        <Card>
          <h2 className="mb-2 font-display text-xl text-forest-900">Contract-PDF&apos;s koppelen</h2>
          <p className="mb-5 text-sm leading-relaxed text-forest-600">
            Kies de map waarin de contracten staan. Elke submap heet naar een {terms.young}, en daarop
            koppel ik de bestanden automatisch aan het juiste dier. Wat niet vanzelf klopt kies je zelf,
            en niets wordt geüpload voordat je bevestigt.
          </p>
          <ContractUploader />
        </Card>
      )}

      {stap === 'gegevens' && (
      <>

      {!rijen && (
        <Card className="max-w-3xl">
          <h2 className="mb-2 font-display text-xl text-forest-900">Plak de uitgelezen gegevens</h2>
          <p className="mb-4 text-sm leading-relaxed text-forest-600">
            Plak hieronder de lijst met contractgegevens. Je krijgt daarna eerst een overzicht te zien,
            zodat je kunt controleren wat er wordt aangemaakt. Niets wordt opgeslagen voordat je bevestigt.
          </p>
          <textarea
            value={ruw}
            onChange={(e) => setRuw(e.target.value)}
            rows={10}
            placeholder='[ { "kitten_naam": "...", "chipnummer": "...", ... } ]'
            className="w-full rounded-xl border border-forest-900/15 bg-white p-4 font-mono text-xs leading-relaxed outline-none focus:border-brass-400"
          />
          {fout && <p className="mt-3 text-sm font-semibold text-red-700">{fout}</p>}
          <div className="mt-4">
            <Btn variant="brass" onClick={lees} disabled={!ruw.trim()}>Inlezen en controleren</Btn>
          </div>
        </Card>
      )}

      {rijen && !klaar && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-forest-900/10 bg-white p-4">
            <span className="text-sm text-forest-700">
              <b>{rijen.length}</b> contracten gelezen · <b>{aantalNieuw}</b> nieuw
              {aantalBestaat > 0 && <> · <b>{aantalBestaat}</b> staat al in het systeem</>}
            </span>
            <span className="ml-auto flex gap-2">
              <button onClick={() => setGekozen(Object.fromEntries(rijen.map((r, i) => [i, !bestaatAl(r)])))} className="text-sm font-semibold text-brass-600 hover:underline">Alles nieuw</button>
              <span className="text-forest-300">·</span>
              <button onClick={() => setGekozen({})} className="text-sm font-semibold text-forest-600 hover:underline">Niets</button>
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-forest-900/10 bg-white">
            {rijen.map((r, i) => (
              <Regel
                key={i}
                r={r}
                bestaat={bestaatAl(r)}
                gekozen={!!gekozen[i]}
                onToggle={(aan) => setGekozen((g) => ({ ...g, [i]: aan }))}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => { setRijen(null); setLog([]); }} className="rounded-xl border border-forest-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-50">
              Terug
            </button>
            <button
              onClick={importeer}
              disabled={bezig || teDoen.length === 0}
              className="rounded-xl bg-forest-800 px-7 py-3 text-sm font-semibold text-cream-50 transition hover:bg-forest-900 disabled:opacity-50"
            >
              {bezig ? 'Bezig met invoeren…' : `${teDoen.length} invoeren`}
            </button>
          </div>
        </>
      )}

      </>
      )}

      {stap === 'gegevens' && log.length > 0 && (
        <Card className="mt-6">
          <h2 className="mb-3 font-display text-xl text-forest-900">Wat er gebeurde</h2>
          <div className="max-h-80 overflow-y-auto rounded-xl bg-forest-50/60 p-4 font-mono text-xs leading-relaxed text-forest-800">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
          {klaar && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/admin/cats" className="rounded-xl bg-forest-800 px-5 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-900">
                {`Naar je ${terms.animalPlural}`}
              </Link>
              <button onClick={() => { setRijen(null); setRuw(''); setLog([]); setKlaar(false); }} className="rounded-xl border border-forest-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-50">
                Nog een lijst invoeren
              </button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
