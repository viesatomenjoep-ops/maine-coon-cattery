'use client';
import { useState, useRef, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Btn } from '@/components/admin';

// Losse woorden vergelijken, zodat "Amy Winehouse" en "Amy_Winehouse" matchen
// en "Bodi herplaatzer" nog steeds bij "Bodi" uitkomt.
const woorden = (s) => (s || '')
  .toLowerCase()
  .replace(/[_\-.]+/g, ' ')
  .replace(/[^a-z0-9\s]/g, '')
  .split(/\s+/)
  .filter(Boolean);

/**
 * Bepaal welk dier bij een mapnaam hoort.
 * Geeft de beste treffer terug, of null als het te onzeker is.
 */
export function matchAnimal(mapnaam, kittens) {
  const mw = woorden(mapnaam);
  if (!mw.length) return null;

  let beste = null;
  let besteScore = 0;

  for (const k of kittens) {
    const kw = woorden(k.name);
    if (!kw.length) continue;

    // Hoeveel woorden van de kattennaam komen voor in de mapnaam?
    const raak = kw.filter((w) => mw.includes(w)).length;
    if (!raak) continue;

    // Score: verhouding treffers, met bonus als de namen even lang zijn.
    const score = raak / Math.max(kw.length, 1) + (kw.length === mw.length ? 0.25 : 0);
    if (score > besteScore) { besteScore = score; beste = k; }
  }

  // Minstens de helft van de naam moet kloppen, anders liever niets.
  return besteScore >= 0.5 ? { cat: beste, score: besteScore } : null;
}

/**
 * Upload een hele map met contracten in één keer en hang elk bestand aan het
 * dier met dezelfde naam. Je ziet eerst wat er gaat gebeuren, en kunt per
 * bestand het dier nog aanpassen.
 */
export default function ContractUploader({ defaultType = 'contract', onDone }) {
  const { kittens = [], addDocumentFull, terms } = useStore();
  const [items, setItems] = useState([]);   // { file, mapnaam, catId }
  const [bezig, setBezig] = useState(false);
  const [log, setLog] = useState([]);
  const [klaar, setKlaar] = useState(false);
  const inputRef = useRef(null);

  const kies = (fileList) => {
    const files = Array.from(fileList || []).filter((f) => /\.pdf$/i.test(f.name));
    if (!files.length) {
      alert('Geen PDF-bestanden gevonden in wat je koos.');
      return;
    }
    const nieuw = files.map((f) => {
      // webkitRelativePath is bijv. "koopcontract kittens/Amy Winehouse/img180.pdf"
      const pad = f.webkitRelativePath || f.name;
      const delen = pad.split('/');
      const mapnaam = delen.length > 1 ? delen[delen.length - 2] : '';
      const treffer = matchAnimal(mapnaam, kittens);
      return { file: f, pad, mapnaam, catId: treffer?.cat?.id || '' };
    });
    setItems(nieuw);
    setKlaar(false);
    setLog([]);
  };

  const gekoppeld = useMemo(() => items.filter((i) => i.catId).length, [items]);

  const upload = async () => {
    setBezig(true); setLog([]); setKlaar(false);
    let gelukt = 0, mislukt = 0, overgeslagen = 0;

    for (const it of items) {
      if (!it.catId) { overgeslagen++; continue; }
      try {
        const fd = new FormData();
        fd.append('file', it.file);
        fd.append('folder', 'cattery_documents');
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || 'uploaden mislukt');

        const r = await addDocumentFull({
          cat_id: it.catId,
          document_type: defaultType,
          title: `Koopcontract ${it.mapnaam}`,
          file_url: data.url,
          cloudinary_public_id: data.public_id,
          mime_type: data.mime_type,
        });
        if (r?.error) throw new Error(r.error.message || 'opslaan mislukt');

        const naam = kittens.find((k) => k.id === it.catId)?.name || it.mapnaam;
        setLog((l) => [...l, `✓ ${it.file.name} → ${naam}`]);
        gelukt++;
      } catch (e) {
        setLog((l) => [...l, `✗ ${it.file.name}: ${e.message}`]);
        mislukt++;
      }
    }

    setLog((l) => [...l, '—', `Klaar: ${gelukt} gekoppeld${mislukt ? `, ${mislukt} mislukt` : ''}${overgeslagen ? `, ${overgeslagen} overgeslagen` : ''}.`]);
    setBezig(false);
    setKlaar(true);
    onDone?.();
  };

  return (
    <div>
      {items.length === 0 ? (
        <>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="application/pdf,.pdf"
            // Hiermee kun je een hele map kiezen in plaats van losse bestanden.
            webkitdirectory=""
            directory=""
            className="hidden"
            onChange={(e) => kies(e.target.files)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-forest-900/20 bg-forest-50/40 p-10 transition hover:border-brass-400 hover:bg-brass-50/40"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-forest-600 shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /></svg>
            </span>
            <span className="font-display text-xl text-forest-900">Kies de map met contracten</span>
            <span className="max-w-sm text-center text-sm leading-relaxed text-forest-500">
              Selecteer de hoofdmap. Elke submap heet naar een {terms.young}, en dat is waarop ik
              de bestanden aan het juiste dier koppel.
            </span>
          </button>
        </>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-forest-900/10 bg-white p-4">
            <span className="text-sm text-forest-700">
              <b>{items.length}</b> PDF&apos;s gevonden · <b>{gekoppeld}</b> automatisch gekoppeld
              {items.length - gekoppeld > 0 && <> · <b>{items.length - gekoppeld}</b> nog kiezen</>}
            </span>
            <button onClick={() => { setItems([]); setLog([]); }} className="ml-auto text-sm font-semibold text-forest-600 hover:underline">
              Andere map
            </button>
          </div>

          <div className="max-h-[26rem] overflow-y-auto rounded-2xl border border-forest-900/10 bg-white">
            {items.map((it, i) => (
              <div key={i} className="flex flex-wrap items-center gap-3 border-b border-forest-900/8 p-3 last:border-0">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-forest-900">{it.mapnaam || it.file.name}</span>
                  <span className="block truncate text-xs text-forest-500">{it.file.name}</span>
                </span>
                <select
                  value={it.catId}
                  onChange={(e) => setItems((l) => l.map((x, j) => (j === i ? { ...x, catId: e.target.value } : x)))}
                  className={`w-56 shrink-0 rounded-lg border px-3 py-2 text-sm outline-none ${
                    it.catId ? 'border-forest-900/15 bg-white text-forest-900' : 'border-amber-300 bg-amber-50 text-amber-800'
                  }`}
                >
                  <option value="">— kies een {terms.animal} —</option>
                  {kittens.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-forest-500">
              Bestanden zonder gekozen {terms.animal} worden overgeslagen.
            </p>
            <Btn variant="brass" onClick={upload} disabled={bezig || gekoppeld === 0}>
              {bezig ? 'Bezig met uploaden…' : `${gekoppeld} contracten koppelen`}
            </Btn>
          </div>
        </>
      )}

      {log.length > 0 && (
        <div className="mt-5 max-h-64 overflow-y-auto rounded-xl bg-forest-50/60 p-4 font-mono text-xs leading-relaxed text-forest-800">
          {log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
