'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Combobox, Btn } from '@/components/admin';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';
import LitterEditor from '@/components/admin/LitterEditor';

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

const EMPTY_KIT = {
  litter_id: '', name: '', sex: 'Kater', color: '', pattern: '', status: 'beschikbaar',
  chip_no: '', registration_no: '', birth_weight_g: '', ems_code: '', reserved_by: '',
  priceNL: 1250, priceBE: 1300, cover_image: '',
};

export default function LittersPage() {
  const {
    litters = [], kittens = [], documents = [],
    deleteLitter, addKitten, updateKitten, deleteKitten, deleteDocument,
  } = useStore();

  const [mode, setMode] = useState(null); // null = tegelkeuze, 'litter' of 'kitten'
  const [editingLitterId, setEditingLitterId] = useState(null);
  const [kit, setKit] = useState({ ...EMPTY_KIT, litter_id: litters[0]?.id || '' });
  const [uploading, setUploading] = useState(false);
  const formRef = useRef(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  useEffect(() => {
    const create = new URLSearchParams(window.location.search).get('create');
    if (create === 'litter' || create === 'kitten') setMode(create);
  }, []);

  const openNewLitter = () => { setEditingLitterId(null); setMode('litter'); scrollToForm(); };
  const openLitter = (id) => { setEditingLitterId(id); setMode('litter'); scrollToForm(); };
  const openNewKitten = (litterId) => {
    setKit((k) => ({ ...k, litter_id: litterId || k.litter_id || litters[0]?.id || '' }));
    setMode('kitten');
    scrollToForm();
  };
  const closeForm = () => { setMode(null); setEditingLitterId(null); };

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

  const saveKitten = async () => {
    if (!kit.litter_id) {
      alert('Selecteer a.u.b. een nestje om dit kitten aan toe te voegen.');
      return;
    }
    if (!kit.name.trim()) {
      alert('Vul a.u.b. een naam in voor het kitten.');
      return;
    }
    const res = await addKitten({ ...kit, gender: kit.sex, price_nl: kit.priceNL, price_be: kit.priceBE });
    if (res?.error) {
      alert('Fout bij opslaan kitten: ' + res.error.message);
      return;
    }
    setKit((k) => ({ ...EMPTY_KIT, litter_id: k.litter_id }));
    alert('Het kitten is succesvol toegevoegd en opgeslagen.');
  };

  return (
    <>
      <PageHead label="Fokkerij" title="Nestjes & Kittens" />

      <div ref={formRef} className="scroll-mt-24">
        {mode === null && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={openNewLitter}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 4l9 6.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 9.5V20h14V9.5" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 20v-5a3 3 0 0 1 6 0v5" /></svg>
              </span>
              <div>
                <h2 className="font-display text-xl text-forest-900">Nieuw nestje</h2>
                <p className="mt-1 text-sm text-forest-600">Registreer een nieuw nestje met ouders, ras, status, documenten en kittens.</p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
            </button>

            <button
              type="button"
              onClick={() => openNewKitten()}
              className="group flex flex-col items-start gap-4 rounded-3xl border border-forest-900/10 bg-white/70 p-8 text-left shadow-sm transition hover:-translate-y-1 hover:border-brass-400/60 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brass-500"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-50 text-forest-700 transition group-hover:bg-brass-100 group-hover:text-brass-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.5 0 7-2.5 7-6 0-2-1-3.5-2.5-4.5C16 8 15 6 12 6S8 8 7.5 10.5C6 11.5 5 13 5 15c0 3.5 2.5 6 7 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6.5 5.5 8 8.5M17.5 5.5 16 8.5M9.5 14h.01M14.5 14h.01" /></svg>
              </span>
              <div>
                <h2 className="font-display text-xl text-forest-900">Nieuwe kitten</h2>
                <p className="mt-1 text-sm text-forest-600">Voeg snel een kitten toe aan een bestaand nestje.</p>
              </div>
              <span className="mt-auto text-sm font-semibold text-brass-700">Openen →</span>
            </button>
          </div>
        )}

        {mode === 'litter' && (
          <LitterEditor initialLitterId={editingLitterId} onClose={closeForm} />
        )}

        {mode === 'kitten' && (
          <Card className="flex flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-display text-xl text-forest-900">Kitten toevoegen</h2>
              <Btn variant="ghost" onClick={closeForm} className="!px-3 !py-1.5 !text-xs">← Terug</Btn>
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-forest-900">Nestjes overzicht</h2>
          <Btn variant="solid" onClick={openNewLitter} className="!px-4 !py-2 !text-sm">+ Nieuw nestje</Btn>
        </div>

        {litters.length === 0 && <p className="text-forest-700">Geen nestjes gevonden. Maak er bovenaan eentje aan.</p>}

        {litters.map((lit) => {
          const nestKittens = kittens.filter((k) => k.litter_id === lit.id && !k.is_own_breeding_cat);
          const litterDocs = documents.filter((d) => d.litter_id === lit.id);
          const statusLabel = LITTER_STATUSES.find((s) => s.value === norm(lit.status))?.label;
          return (
            <Card key={lit.id} className="overflow-hidden p-0">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-forest-900/10 bg-forest-900/5 p-5">
                <div className="flex items-center gap-4">
                  {lit.cover_image_url ? (
                    <img src={lit.cover_image_url} alt={lit.name} className="h-16 w-16 shrink-0 rounded-xl object-cover shadow" />
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 text-forest-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-5-5L5 21" /></svg>
                    </div>
                  )}
                  <div>
                    <h3 className="font-display text-xl text-forest-950">
                      {lit.name}
                      {statusLabel && <span className="ml-3 rounded-full bg-brass-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-brass-700 align-middle">{statusLabel}</span>}
                    </h3>
                    <p className="mt-1 text-sm text-forest-700">
                      {lit.sire_name || 'Onbekende vader'} x {lit.dam_name || 'Onbekende moeder'}
                      <span className="mx-2 opacity-50">|</span>
                      {lit.date_of_birth ? new Date(lit.date_of_birth).toLocaleDateString('nl-NL') : 'Datum onbekend'}
                      <span className="mx-2 opacity-50">|</span>
                      {nestKittens.length} {nestKittens.length === 1 ? 'kitten' : 'kittens'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/admin/litters/${lit.id}`} className="inline-flex items-center rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700">Open nestje</Link>
                  <Btn variant="solid" onClick={() => openLitter(lit.id)} className="!px-3 !py-1.5 !text-xs">Nestje bewerken</Btn>
                  <Btn variant="brass" onClick={() => openNewKitten(lit.id)} className="!px-3 !py-1.5 !text-xs">+ Kitten toevoegen</Btn>
                  <Btn variant="ghost" onClick={() => { if (confirm('Weet je zeker dat je dit nestje wilt verwijderen?')) deleteLitter(lit.id); }} className="!px-3 !py-1.5 !text-xs !text-red-600 hover:!bg-red-50">Verwijderen</Btn>
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
