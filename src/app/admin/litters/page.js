'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Combobox, Btn } from '@/components/admin';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';

const SEXES = ['Kater', 'Poes'];
const PATTERNS = [
  'Classic Tabby', 'Mackerel Tabby', 'Spotted Tabby', 'Ticked Tabby',
  'Solid (Effen)', 'Smoke', 'Shaded', 'Shell/Chinchilla',
  'Bicolor', 'Harlequin', 'Van', 'Tortie (Schildpad)', 'Torbie',
];
const COLORS = [
  'Black (Zwart)', 'Blue (Blauw)', 'Red (Rood)', 'Cream (Crème)',
  'White (Wit)', 'Black Tortie', 'Blue Tortie',
];
const LITTER_STATUSES = [
  { value: 'verwacht', label: 'Verwacht' },
  { value: 'geboren', label: 'Geboren' },
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'afgerond', label: 'Afgerond' },
];
const KITTEN_STATUSES = [
  { value: 'beschikbaar', label: 'Beschikbaar' },
  { value: 'gereserveerd', label: 'Gereserveerd' },
  { value: 'verkocht', label: 'Verkocht' },
  { value: 'houden', label: 'Houden' },
];
const norm = (s) => (s || '').toLowerCase();

const EMPTY_LITTER = {
  name: '', breed: 'Maine Coon (MCO)', status: 'verwacht', expected_count: '',
  sire_id: '', sire_name: '', dam_id: '', dam_name: '',
  born: '', description: '', cover_image_url: '',
};
const EMPTY_KIT = {
  litter_id: '', name: '', sex: 'Kater', color: '', pattern: '', status: 'beschikbaar',
  chip_no: '', registration_no: '', birth_weight_g: '', ems_code: '', reserved_by: '',
  priceNL: 1250, priceBE: 1300, cover_image: '',
};

export default function LittersPage() {
  const {
    litters = [], kittens = [], breedingCats = [], documents = [],
    addLitter, deleteLitter, addKitten, updateKitten, deleteKitten, deleteDocument,
  } = useStore();

  const sireOptions = breedingCats.filter((c) => c.gender === 'male');
  const damOptions = breedingCats.filter((c) => c.gender === 'female');

  const [mode, setMode] = useState(null); // null = tegelkeuze, 'litter' of 'kitten'
  const [litter, setLitter] = useState(EMPTY_LITTER);
  const [sireManual, setSireManual] = useState(false);
  const [damManual, setDamManual] = useState(false);
  const [kit, setKit] = useState({ ...EMPTY_KIT, litter_id: litters[0]?.id || '' });
  const [uploading, setUploading] = useState(false);
  const [litterUploading, setLitterUploading] = useState(false);
  const [lastLitterId, setLastLitterId] = useState('');

  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cattery_media');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setKit((k) => ({ ...k, cover_image: data.url }));
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const handleLitterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLitterUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'cattery_litters');
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.url) setLitter((l) => ({ ...l, cover_image_url: data.url }));
    } catch (err) {
      console.error(err);
    }
    setLitterUploading(false);
  };

  const onSireChange = (val) => {
    if (val === '__manual__') { setSireManual(true); setLitter((l) => ({ ...l, sire_id: '' })); }
    else if (val === '') { setSireManual(false); setLitter((l) => ({ ...l, sire_id: '', sire_name: '' })); }
    else { setSireManual(false); const cat = sireOptions.find((c) => c.id === val); setLitter((l) => ({ ...l, sire_id: val, sire_name: cat?.name || '' })); }
  };
  const onDamChange = (val) => {
    if (val === '__manual__') { setDamManual(true); setLitter((l) => ({ ...l, dam_id: '' })); }
    else if (val === '') { setDamManual(false); setLitter((l) => ({ ...l, dam_id: '', dam_name: '' })); }
    else { setDamManual(false); const cat = damOptions.find((c) => c.id === val); setLitter((l) => ({ ...l, dam_id: val, dam_name: cat?.name || '' })); }
  };

  const saveLitter = async () => {
    if (!litter.name.trim()) {
      alert('Vul a.u.b. een naam in voor het nestje.');
      return;
    }
    const res = await addLitter({ ...litter, born: litter.born || null });
    if (res?.error) {
      alert('Fout bij opslaan nestje: ' + res.error.message);
      return;
    }
    setLastLitterId(res.data.id);
    setLitter(EMPTY_LITTER);
    setSireManual(false);
    setDamManual(false);
  };

  const continueWithKittens = () => {
    if (!lastLitterId) return;
    setKit((k) => ({ ...k, litter_id: lastLitterId }));
    setMode('kitten');
    scrollToForm();
  };

  const addKittenToLitter = (litterId) => {
    setKit((k) => ({ ...k, litter_id: litterId }));
    setMode('kitten');
    scrollToForm();
  };

  const saveKitten = async () => {
    if (!kit.litter_id) {
      alert('Selecteer a.u.b. een nestje om dit kitten aan toe te voegen.');
      return;
    }
    if (!kit.name.trim()) {
      alert('Vul a.u.b. een naam in voor het kitten.');
      return;
    }
    const res = await addKitten({
      ...kit,
      gender: kit.sex,
      price_nl: kit.priceNL,
      price_be: kit.priceBE,
    });
    if (res?.error) {
      alert('Fout bij opslaan kitten: ' + res.error.message);
      return;
    }
    setKit((k) => ({ ...EMPTY_KIT, litter_id: k.litter_id }));
    alert('Het kitten is succesvol toegevoegd en opgeslagen.');
  };

  const sireSelectValue = sireManual ? '__manual__' : (litter.sire_id || '');
  const damSelectValue = damManual ? '__manual__' : (litter.dam_id || '');

  return (
    <>
      <PageHead label="Fokkerij" title="Nestjes & Kittens" />

      <div ref={formRef} className="scroll-mt-24">
        {mode === null && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode('litter')}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5a3 3 0 0 1 6 0v5" /></svg>
              </span>
              <div>
                <h2 className="font-display text-xl text-forest-900">Nieuw nestje aanmaken</h2>
                <p className="mt-1 text-sm text-forest-600">Registreer een nieuw nestje met ouders, ras, status en cover-afbeelding.</p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
            </button>

            <button
              type="button"
              onClick={() => { setKit((k) => ({ ...k, litter_id: k.litter_id || litters[0]?.id || '' })); setMode('kitten'); }}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.5 0 7-2.5 7-6 0-2-1-3.5-2.5-4.5C16 8 15 6 12 6S8 8 7.5 10.5C6 11.5 5 13 5 15c0 3.5 2.5 6 7 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 5.5 8 8.5M17.5 5.5 16 8.5M9.5 14h.01M14.5 14h.01" /></svg>
              </span>
              <div>
                <h2 className="font-display text-xl text-forest-900">Kitten toevoegen</h2>
                <p className="mt-1 text-sm text-forest-600">Voeg een kitten toe aan een bestaand nestje, met alle details.</p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
            </button>
          </div>
        )}

        {/* New litter */}
        {mode === 'litter' && (
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-forest-900">Nieuw nestje aanmaken</h2>
            <Btn variant="ghost" onClick={() => setMode(null)} className="!px-3 !py-1.5 !text-xs">← Terug</Btn>
          </div>
          <div className="grid flex-1 gap-4">
            <Field label="Naam nestje"><Input value={litter.name} onChange={(e) => setLitter({ ...litter, name: e.target.value })} placeholder="Bijv. Noorderlicht" /></Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Vader (Sire)">
                <Select value={sireSelectValue} onChange={(e) => onSireChange(e.target.value)}>
                  <option value="">Selecteer fokdier…</option>
                  {sireOptions.map((c) => <option key={c.id} value={c.id}>{c.name}{c.ems_code ? ` (${c.ems_code})` : ''}</option>)}
                  <option value="__manual__">Anders / handmatig invoeren…</option>
                </Select>
                {sireManual && (
                  <div className="mt-2"><Input value={litter.sire_name} onChange={(e) => setLitter({ ...litter, sire_name: e.target.value })} placeholder="Naam vader (vrije tekst)" /></div>
                )}
              </Field>
              <Field label="Moeder (Dam)">
                <Select value={damSelectValue} onChange={(e) => onDamChange(e.target.value)}>
                  <option value="">Selecteer fokdier…</option>
                  {damOptions.map((c) => <option key={c.id} value={c.id}>{c.name}{c.ems_code ? ` (${c.ems_code})` : ''}</option>)}
                  <option value="__manual__">Anders / handmatig invoeren…</option>
                </Select>
                {damManual && (
                  <div className="mt-2"><Input value={litter.dam_name} onChange={(e) => setLitter({ ...litter, dam_name: e.target.value })} placeholder="Naam moeder (vrije tekst)" /></div>
                )}
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Ras"><Input value={litter.breed} onChange={(e) => setLitter({ ...litter, breed: e.target.value })} /></Field>
              <Field label="Status"><Select value={litter.status} onChange={(e) => setLitter({ ...litter, status: e.target.value })}>{LITTER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
              <Field label="Verwacht aantal"><Input type="number" min="0" value={litter.expected_count} onChange={(e) => setLitter({ ...litter, expected_count: e.target.value })} placeholder="Optioneel" /></Field>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Geboortedatum"><Input type="date" value={litter.born} onChange={(e) => setLitter({ ...litter, born: e.target.value })} /></Field>
              <Field label="Cover Afbeelding (Optioneel)">
                <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <input type="file" accept="image/*" onChange={handleLitterUpload} className="w-full text-sm file:mb-2 file:mr-4 file:w-full file:rounded-xl file:border-0 file:bg-forest-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest-700 hover:file:bg-forest-100 sm:file:mb-0 sm:file:w-auto" />
                  {litterUploading && <span className="text-xs text-forest-500">Uploaden...</span>}
                  {litter.cover_image_url && <img src={litter.cover_image_url} alt="Preview" className="h-10 w-10 rounded object-cover shadow" />}
                </div>
              </Field>
            </div>

            <Field label="Beschrijving (Wervende tekst)">
              <textarea value={litter.description} onChange={(e) => setLitter({ ...litter, description: e.target.value })} className="min-h-[80px] w-full rounded-xl border-forest-900/20 bg-white/50 p-3 text-sm focus:border-forest-500 focus:ring-forest-500" placeholder="Vertel iets leuks over dit nestje..." />
            </Field>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Btn variant="brass" onClick={saveLitter} className="w-full sm:w-auto">Nestje toevoegen</Btn>
            {lastLitterId && (
              <Btn variant="solid" onClick={continueWithKittens} className="w-full sm:w-auto">Ga door met kittens toevoegen →</Btn>
            )}
          </div>
        </Card>
        )}

        {/* New kitten */}
        {mode === 'kitten' && (
        <Card className="flex flex-col">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-forest-900">Kitten toevoegen</h2>
            <Btn variant="ghost" onClick={() => setMode(null)} className="!px-3 !py-1.5 !text-xs">← Terug</Btn>
          </div>
          <div className="grid flex-1 gap-4">
            <Field label="Nestje">
              <Select value={kit.litter_id} onChange={(e) => setKit({ ...kit, litter_id: e.target.value })}>
                <option value="">Selecteer nestje...</option>
                {litters.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
              </Select>
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Naam"><Input value={kit.name} onChange={(e) => setKit({ ...kit, name: e.target.value })} placeholder="Bijv. Orion" /></Field>
              <Field label="Geslacht"><Select value={kit.sex} onChange={(e) => setKit({ ...kit, sex: e.target.value })}>{SEXES.map((s) => <option key={s} value={s}>{s}</option>)}</Select></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Kleurslag (Color)">
                <Combobox id="colorsList" options={COLORS} value={kit.color} onChange={(e) => setKit({ ...kit, color: e.target.value })} placeholder="Bijv. Black Solid" />
              </Field>
              <Field label="Patroon (Pattern)">
                <Combobox id="patternsList" options={PATTERNS} value={kit.pattern} onChange={(e) => setKit({ ...kit, pattern: e.target.value })} placeholder="Bijv. Classic Tabby" />
              </Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="EMS-code"><Input value={kit.ems_code} onChange={(e) => setKit({ ...kit, ems_code: e.target.value })} placeholder="Bijv. MCO n 22" /></Field>
              <Field label="Stamboomnummer"><Input value={kit.registration_no} onChange={(e) => setKit({ ...kit, registration_no: e.target.value })} placeholder="Registratienummer" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Chipnummer"><Input value={kit.chip_no} onChange={(e) => setKit({ ...kit, chip_no: e.target.value })} /></Field>
              <Field label="Geboortegewicht (g)"><Input type="number" min="0" value={kit.birth_weight_g} onChange={(e) => setKit({ ...kit, birth_weight_g: e.target.value })} placeholder="Bijv. 110" /></Field>
              <Field label="Gereserveerd door"><Input value={kit.reserved_by} onChange={(e) => setKit({ ...kit, reserved_by: e.target.value })} placeholder="Naam klant (optioneel)" /></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Status"><Select value={kit.status} onChange={(e) => setKit({ ...kit, status: e.target.value })}>{KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</Select></Field>
              <Field label="Prijs NL (€)"><Input type="number" value={kit.priceNL} onChange={(e) => setKit({ ...kit, priceNL: Number(e.target.value) })} /></Field>
              <Field label="Prijs BE (€)"><Input type="number" value={kit.priceBE} onChange={(e) => setKit({ ...kit, priceBE: Number(e.target.value) })} /></Field>
            </div>
            <Field label="Cover Afbeelding (Optioneel)">
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <input type="file" accept="image/*" onChange={handleUpload} className="w-full text-sm file:mb-2 file:mr-4 file:w-full file:rounded-xl file:border-0 file:bg-forest-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-forest-700 hover:file:bg-forest-100 sm:file:mb-0 sm:file:w-auto" />
                {uploading && <span className="text-xs text-forest-500">Uploaden...</span>}
                {kit.cover_image && <img src={kit.cover_image} alt="Preview" className="h-10 w-10 rounded object-cover shadow" />}
              </div>
            </Field>
          </div>
          <Btn variant="brass" onClick={saveKitten} className="mt-6 w-full sm:w-auto">Kitten toevoegen</Btn>
        </Card>
        )}
      </div>

      {/* Litters & Kittens Tree */}
      <div className="mt-12 space-y-8">
        <h2 className="font-display text-2xl text-forest-900">Overzicht Fokbestand</h2>

        {litters.length === 0 && <p className="text-forest-700">Geen nestjes gevonden. Voeg er bovenaan eentje toe.</p>}

        {litters.map((lit) => {
          const nestKittens = kittens.filter((k) => k.litter_id === lit.id && !k.is_own_breeding_cat);
          const litterDocs = documents.filter((d) => d.litter_id === lit.id);
          const statusLabel = LITTER_STATUSES.find((s) => s.value === norm(lit.status))?.label;
          return (
            <Card key={lit.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-900/10 bg-forest-900/5 p-5">
                <div>
                  <h3 className="font-display text-xl text-forest-950">
                    {lit.name}
                    {statusLabel && <span className="ml-3 rounded-full bg-brass-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brass-700 align-middle">{statusLabel}</span>}
                  </h3>
                  <p className="mt-1 text-sm text-forest-700">
                    {lit.sire_name || 'Onbekende vader'} x {lit.dam_name || 'Onbekende moeder'}
                    <span className="mx-2 opacity-50">|</span>
                    {lit.date_of_birth ? new Date(lit.date_of_birth).toLocaleDateString('nl-NL') : 'Datum onbekend'}
                    {lit.expected_count ? <><span className="mx-2 opacity-50">|</span>Verwacht: {lit.expected_count}</> : null}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Btn variant="brass" onClick={() => addKittenToLitter(lit.id)} className="!px-3 !py-1.5 !text-xs">+ Kitten toevoegen</Btn>
                  <Btn variant="ghost" onClick={() => { if (confirm('Weet je zeker dat je dit nestje wilt verwijderen?')) deleteLitter(lit.id); }} className="!px-3 !py-1.5 !text-xs !text-red-600 hover:!bg-red-50">Nestje verwijderen</Btn>
                </div>
              </div>

              <div className="p-0">
                {nestKittens.length === 0 ? (
                  <p className="p-5 text-sm italic text-forest-600">Nog geen kittens in dit nestje.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-forest-900/5 bg-white text-left text-xs uppercase tracking-wide text-forest-600/60">
                          <th className="w-12 py-3 pl-5 pr-4">Foto</th>
                          <th className="pr-4">Kitten Naam</th>
                          <th className="pr-4">Geslacht</th>
                          <th className="pr-4">Vacht (Kleur & Patroon)</th>
                          <th className="pr-4">Status</th>
                          <th className="pr-4 text-right">Prijs (NL)</th>
                          <th className="pr-5 text-right">Acties</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {nestKittens.map((k) => (
                          <tr key={k.id} className="border-b border-forest-900/5 transition last:border-none hover:bg-forest-50/50">
                            <td className="py-2 pl-5 pr-4">
                              {k.cover_image ? (
                                <img src={k.cover_image} className="h-10 w-10 rounded bg-forest-100 object-cover" alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded border border-forest-100 bg-forest-50" />
                              )}
                            </td>
                            <td className="pr-4 font-semibold text-forest-900">{k.name}</td>
                            <td className="pr-4 text-forest-700">{k.gender || k.sex}</td>
                            <td className="pr-4 text-forest-700">{[k.color, k.pattern].filter(Boolean).join(' ') || 'Onbekend'}</td>
                            <td className="pr-4">
                              <Select value={norm(k.status)} onChange={(e) => updateKitten(k.id, { status: e.target.value })} className="!cursor-pointer !border-none !bg-transparent !px-0 !py-1 !text-xs font-medium text-brass-700">
                                {KITTEN_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                              </Select>
                            </td>
                            <td className="pr-4 text-right text-forest-800">€ {k.price_nl || 0}</td>
                            <td className="flex h-auto flex-col items-start justify-end gap-2 py-2 pr-5 text-right sm:h-[57px] sm:flex-row sm:items-center sm:gap-3 sm:py-0">
                              <Link href={`/admin/cats/${k.id}`} className="text-xs font-medium text-emerald-600 transition hover:text-emerald-800">Open Dossier</Link>
                              <button onClick={() => { if (confirm('Weet je zeker dat je dit kitten wilt verwijderen?')) deleteKitten(k.id); }} className="text-xs text-red-500 underline transition hover:text-red-700">Verwijder</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Nestje-documenten */}
                <div className="border-t border-forest-900/10 p-5">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-forest-700">Documenten bij dit nestje</h4>
                  <DocumentUploader litterId={lit.id} folder={`cattery_documents/litter_${lit.id}`} />
                  <div className="mt-4">
                    <DocumentList documents={litterDocs} onDelete={deleteDocument} />
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
