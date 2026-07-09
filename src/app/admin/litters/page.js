'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { PageHead, Card, Field, Input, Select, Combobox, Btn } from '@/components/admin';
import DocumentUploader, { DocumentList } from '@/components/admin/DocumentUploader';
import LitterEditor from '@/components/admin/LitterEditor';
import FilePicker from '@/components/admin/FilePicker';

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

// Toon het geslacht altijd netjes als "Kater" of "Poes", ongeacht hoe het is opgeslagen.
const sexLabel = (g) => {
  const v = (g || '').toLowerCase();
  if (/kater|mann|\bmale\b|\bm\b/.test(v)) return 'Kater';
  if (/poes|vrouw|female|\bf\b/.test(v)) return 'Poes';
  return g || 'Onbekend';
};

const KITTEN_STATUS_META = {
  beschikbaar: { label: 'Beschikbaar', cls: 'bg-emerald-100 text-emerald-700' },
  gereserveerd: { label: 'Gereserveerd', cls: 'bg-amber-100 text-amber-700' },
  verkocht: { label: 'Verkocht', cls: 'bg-red-100 text-red-700' },
  houden: { label: 'Houden', cls: 'bg-sky-100 text-sky-700' },
};
function KittenStatusBadge({ status }) {
  const m = KITTEN_STATUS_META[norm(status)] || KITTEN_STATUS_META.beschikbaar;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${m.cls}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {m.label}
    </span>
  );
}

const EMPTY_KIT = {
  litter_id: '', name: '', sex: 'Kater', color: '', pattern: '', status: 'beschikbaar',
  chip_no: '', registration_no: '', birth_weight_g: '', ems_code: '', reserved_by: '',
  priceNL: 1250, priceBE: 1300, cover_image: '',
};

export default function LittersPage() {
  const {
    litters = [], kittens = [], documents = [],
    deleteLitter, addKitten, deleteKitten, deleteDocument,
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

  const handleUpload = async (file) => {
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

      <div className="flex flex-col">

      <div ref={formRef} className="order-2 mt-12 scroll-mt-24">
        {mode === null && (
          <>
          <h2 className="mb-4 font-display text-2xl text-forest-900">Nieuw aanmaken</h2>
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
          </>
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
                <div className="flex flex-col items-start gap-3">
                  <FilePicker
                    accept="image/*"
                    disabled={uploading}
                    onFileReady={handleUpload}
                    uploadLabel="Cover uploaden"
                    cameraLabel="Open camera"
                  />
                  {uploading && <span className="text-xs text-forest-500">Uploaden...</span>}
                  {kit.cover_image && <img src={kit.cover_image} alt="Preview" className="h-10 w-10 rounded object-cover shadow" />}
                </div>
              </Field>
            </div>
            <Btn variant="brass" onClick={saveKitten} className="mt-6 w-full sm:w-auto">Kitten toevoegen</Btn>
          </Card>
        )}
      </div>

      {/* Litters & Kittens Tree — advertenties eerst */}
      <div className="order-1 space-y-8">
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
                <div className="flex flex-wrap gap-2.5">
                  <Link href={`/admin/litters/${lit.id}`} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700">Open nestje</Link>
                  <button
                    onClick={() => {
                      if (!lit.share_token) return alert('De deel-link wordt actief zodra de database-update (share_token) is toegepast.');
                      navigator.clipboard.writeText(`${window.location.origin}/nestje/${lit.share_token}`);
                      alert('Advertentielink van dit nestje gekopieerd! Deel hem gerust via WhatsApp.');
                    }}
                    className="inline-flex items-center rounded-xl bg-forest-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-900"
                  >
                    Deel-advertentie
                  </button>
                  <Btn variant="solid" onClick={() => openLitter(lit.id)} className="!px-4 !py-2.5 !text-sm">Nestje bewerken</Btn>
                  <Btn variant="brass" onClick={() => openNewKitten(lit.id)} className="!px-4 !py-2.5 !text-sm">+ Kitten toevoegen</Btn>
                  <Btn variant="ghost" onClick={() => { if (confirm('Weet je zeker dat je dit nestje wilt verwijderen?')) deleteLitter(lit.id); }} className="!px-4 !py-2.5 !text-sm !text-red-600 hover:!bg-red-50">Verwijderen</Btn>
                </div>
              </div>

              <div className="p-0">
                {nestKittens.length === 0 ? (
                  <div className="p-5">
                    <div className="rounded-xl border border-dashed border-forest-900/15 bg-forest-50/40 p-5 text-center text-sm text-forest-600">
                      🍼 Nog geen kittens in dit nestje — voeg ze toe met “+ Kitten toevoegen”, of beheer de advertentie bij Verkoop.
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-forest-900/10 bg-white">
                    {nestKittens.map((k) => (
                      <div key={k.id} className="group relative flex flex-col gap-4 p-5 transition hover:bg-forest-50/40 sm:flex-row sm:items-center">
                        {/* Hele kaart is klikbaar -> volledig dossier */}
                        <Link href={`/admin/cats/${k.id}`} className="absolute inset-0 z-10" aria-label={`Open dossier van ${k.name}`} />

                        {/* Foto */}
                        {k.cover_image ? (
                          <img src={k.cover_image} className="relative z-0 h-24 w-24 shrink-0 rounded-xl bg-forest-100 object-cover shadow-sm sm:h-20 sm:w-20" alt={k.name} />
                        ) : (
                          <div className="relative z-0 flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-forest-100 bg-forest-50 text-[11px] text-forest-400 sm:h-20 sm:w-20">Geen foto</div>
                        )}

                        {/* Advertentie-info */}
                        <div className="relative z-0 min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h4 className="font-display text-xl text-forest-950">{k.name}</h4>
                            <KittenStatusBadge status={k.status} />
                          </div>
                          <p className="mt-1 text-sm text-forest-700">
                            {sexLabel(k.gender || k.sex)}
                            <span className="mx-2 opacity-40">|</span>
                            {[k.color, k.pattern].filter(Boolean).join(' ') || 'Vacht onbekend'}
                            <span className="mx-2 opacity-40">|</span>
                            <span className="font-medium text-forest-900">€ {k.price_nl || 0}</span>
                          </p>
                        </div>

                        {/* Acties */}
                        <div className="relative z-20 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                          <Link href={`/admin/cats/${k.id}`} className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700">Open dossier</Link>
                          <button onClick={() => { if (confirm('Weet je zeker dat je dit kitten wilt verwijderen?')) deleteKitten(k.id); }} className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50">Verwijderen</button>
                        </div>
                      </div>
                    ))}
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

      </div>
    </>
  );
}
