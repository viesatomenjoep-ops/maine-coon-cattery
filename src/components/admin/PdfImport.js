'use client';
import { useState, useRef } from 'react';
import { useStore } from '@/context/StoreContext';
import { scanPdf } from '@/lib/pdfExtract';
import { DOC_TYPES } from '@/components/admin/DocumentUploader';
import { Select } from '@/components/admin';

const ZEKERHEID = {
  hoog:   { label: 'Zeker',       cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  middel: { label: 'Waarschijnlijk', cls: 'bg-amber-50 text-amber-800 border-amber-200' },
  laag:   { label: 'Gok',         cls: 'bg-forest-50 text-forest-600 border-forest-900/15' },
};

// Welke gevonden gegevens kunnen we in het dossier zetten, en onder welke naam.
const VELD_LABEL = {
  chip_number: 'Chipnummer',
  date_of_birth: 'Geboortedatum',
  ems_code: 'EMS-code',
  registration_no: 'Stamboomnummer',
  name: 'Naam',
  breed: 'Ras',
};

const toonWaarde = (sleutel, waarde) => {
  if (sleutel === 'date_of_birth') {
    const d = new Date(waarde);
    return isNaN(d) ? waarde : d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
  }
  return waarde;
};

/**
 * Lees een PDF in, laat zien wat erin gevonden is, en neem alleen over wat
 * de fokker zelf aanvinkt. Het bestand wordt daarna gewoon bij het dier
 * opgeslagen, net als bij een normale upload.
 */
export default function PdfImport({ catId, litterId, currentValues = {}, onApply, onClose }) {
  const { addDocumentFull, terms } = useStore();
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [chosen, setChosen] = useState({});     // welke velden wil je overnemen
  const [docType, setDocType] = useState('overig');
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const pick = async (f) => {
    if (!f) return;
    setError(''); setResult(null); setChosen({});
    if (!/\.pdf$/i.test(f.name) && f.type !== 'application/pdf') {
      setError('Kies een PDF-bestand. Foto’s en scans kan ik (nog) niet uitlezen.');
      return;
    }
    setFile(f);
    setBusy(true);
    try {
      const r = await scanPdf(f);
      setResult(r);
      setDocType(r.docType || 'overig');
      // Zet standaard alles aan wat we met redelijke zekerheid vonden én
      // wat nog niet is ingevuld in het dossier.
      const start = {};
      for (const [k, v] of Object.entries(r.fields)) {
        if (k.startsWith('_')) continue;
        const leeg = !currentValues[k];
        start[k] = leeg && (v.confidence === 'hoog' || v.confidence === 'middel');
      }
      setChosen(start);
    } catch (e) {
      console.error(e);
      setError('Deze PDF kon ik niet lezen: ' + (e.message || 'onbekende fout'));
    }
    setBusy(false);
  };

  const velden = result ? Object.entries(result.fields).filter(([k]) => !k.startsWith('_')) : [];
  const aantalGekozen = Object.values(chosen).filter(Boolean).length;

  const bevestig = async () => {
    setSaving(true);
    try {
      // 1. Het bestand zelf bij het dier opslaan.
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'cattery_documents');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'Uploaden mislukt');

      await addDocumentFull({
        cat_id: catId || null,
        litter_id: litterId || null,
        document_type: docType || 'overig',
        title: file.name,
        file_url: data.url,
        cloudinary_public_id: data.public_id,
        mime_type: data.mime_type,
      });

      // 2. De aangevinkte gegevens doorgeven aan het formulier.
      const patch = {};
      for (const [k, aan] of Object.entries(chosen)) {
        if (aan && result.fields[k]) patch[k] = result.fields[k].value;
      }
      if (onApply && Object.keys(patch).length) onApply(patch);

      onClose?.();
    } catch (e) {
      alert('Er ging iets mis: ' + (e.message || e));
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-end justify-center bg-ink/45 p-4 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-3xl bg-white shadow-lux" onClick={(e) => e.stopPropagation()}>

        <div className="flex items-start justify-between gap-3 border-b border-forest-900/10 p-6">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight text-forest-950">PDF inlezen</h3>
            <p className="mt-1 text-sm text-forest-500">
              Ik lees de tekst uit en stel voor wat ik herken. Jij bepaalt wat er wordt overgenomen.
            </p>
          </div>
          <button onClick={onClose} aria-label="Sluiten" className="shrink-0 rounded-full p-1.5 text-forest-400 transition hover:bg-forest-50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          {/* Stap 1: bestand kiezen */}
          {!result && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => pick(e.target.files?.[0])}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); pick(e.dataTransfer.files?.[0]); }}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-forest-900/20 bg-forest-50/40 p-10 transition hover:border-brass-400 hover:bg-brass-50/40 disabled:opacity-60"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-forest-600 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></svg>
                </span>
                <span className="font-display text-xl text-forest-900">
                  {busy ? 'Bezig met lezen…' : 'Kies of sleep een PDF'}
                </span>
                <span className="max-w-xs text-center text-sm leading-relaxed text-forest-500">
                  Werkt op PDF’s uit een computer, zoals een dierenartsrapport of stamboomcertificaat.
                </span>
              </button>

              {error && <p className="mt-4 text-sm font-semibold text-red-700">{error}</p>}

              <p className="mt-5 text-xs leading-relaxed text-forest-500">
                Het lezen gebeurt op je eigen apparaat — er gaat niets naar een server om te worden geanalyseerd.
                Pas als je op bevestigen klikt wordt het bestand opgeslagen.
              </p>
            </>
          )}

          {/* Stap 2: wat vonden we */}
          {result && (
            <>
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-forest-900/10 bg-forest-50/50 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-forest-600 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-5 w-5"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2Z" /><path d="M13 2v6h6" /></svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-forest-900">{file?.name}</p>
                  <p className="text-xs text-forest-500">
                    {result.pageCount} {result.pageCount === 1 ? 'pagina' : "pagina's"}
                    {result.readPages < result.pageCount ? ` · eerste ${result.readPages} gelezen` : ''}
                  </p>
                </div>
              </div>

              {result.looksScanned ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <p className="font-semibold text-amber-900">Hier staat geen leesbare tekst in</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-amber-800/80">
                    Dit lijkt een scan of foto van een papieren document. Daar zit geen tekstlaag in, dus ik kan er
                    niets uit overnemen. Je kunt het bestand wel gewoon bij {terms.theAnimal} bewaren.
                  </p>
                </div>
              ) : velden.length === 0 ? (
                <div className="rounded-2xl border border-forest-900/10 bg-forest-50/50 p-5">
                  <p className="font-semibold text-forest-900">Niets herkenbaars gevonden</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-forest-600">
                    Ik kon wel tekst lezen, maar geen chipnummer, datum of code herkennen. Je kunt het bestand
                    gewoon bewaren en de gegevens zelf invullen.
                  </p>
                </div>
              ) : (
                <>
                  <p className="mb-3 text-sm font-semibold text-forest-800">
                    Gevonden — vink aan wat je wilt overnemen
                  </p>
                  <div className="space-y-2">
                    {velden.map(([sleutel, v]) => {
                      const z = ZEKERHEID[v.confidence] || ZEKERHEID.laag;
                      const bestaat = currentValues[sleutel];
                      const aan = !!chosen[sleutel];
                      return (
                        <label
                          key={sleutel}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                            aan ? 'border-brass-400 bg-brass-50/40' : 'border-forest-900/10 bg-white hover:border-forest-900/20'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={aan}
                            onChange={(e) => setChosen((c) => ({ ...c, [sleutel]: e.target.checked }))}
                            className="mt-1 h-5 w-5 shrink-0 rounded accent-brass-500"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-semibold uppercase tracking-wide text-forest-500">
                                {VELD_LABEL[sleutel] || v.label || sleutel}
                              </span>
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${z.cls}`}>{z.label}</span>
                            </span>
                            <span className="mt-1 block break-words font-semibold text-forest-900">
                              {toonWaarde(sleutel, v.value)}
                            </span>
                            {bestaat && (
                              <span className="mt-1 block text-xs text-amber-700">
                                Let op: hier staat nu al “{toonWaarde(sleutel, bestaat)}” — dat wordt overschreven.
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="mt-6">
                <span className="text-xs font-medium uppercase tracking-wide text-forest-700">Bewaren als</span>
                <div className="mt-1.5">
                  <Select value={docType} onChange={(e) => setDocType(e.target.value)}>
                    {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </Select>
                </div>
                <p className="mt-1.5 text-xs text-forest-500">Zo komt het bestand in de juiste map van het dossier.</p>
              </div>
            </>
          )}
        </div>

        {result && (
          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-forest-900/10 p-5">
            <button
              onClick={() => { setResult(null); setFile(null); setChosen({}); }}
              className="rounded-xl border border-forest-900/15 bg-white px-5 py-2.5 text-sm font-semibold text-forest-700 transition hover:bg-forest-50"
            >
              Ander bestand
            </button>
            <button
              onClick={bevestig}
              disabled={saving}
              className="rounded-xl bg-forest-800 px-6 py-2.5 text-sm font-semibold text-cream-50 transition hover:bg-forest-900 disabled:opacity-60"
            >
              {saving ? 'Bezig…' : aantalGekozen > 0 ? `Bewaren en ${aantalGekozen} overnemen` : 'Alleen bewaren'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
